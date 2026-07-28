import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {
    PublicBoardCategory,
    PublicBoardItem,
    PublicBoardResponse,
    fetchPublicMenuBoardApiCall,
} from "@/features/business/menuBoards/service";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

const DEFAULT_INTERVAL_MS = 8000;

// useLayoutEffect is a no-op (with a console warning) during SSR - this page is
// rendered per-request (dynamic @token route), so fall back to useEffect there.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Gap/spacing constants shared between the real render and the hidden measurer
// below, so the pagination math always matches what's actually on screen -
// no guessing pixel values from Tailwind class names.
const ITEM_GAP = 12;
const ITEM_GAP_LARGE = 24;
const HEADER_GAP = 16;
const HEADER_GAP_LARGE = 32;
const COLUMN_GAP = 32;

function getColumnCount(width: number) {
    if (width >= 1280) return 3;
    if (width >= 640) return 2;
    return 1;
}

type Chunk = {
    category: PublicBoardCategory;
    items: PublicBoardItem[];
    part: number;
    totalParts: number;
    height: number;
};

/**
 * Splits one category's items into as few chunks as possible so each chunk's
 * rendered height (header + its items) fits within `maxHeight`. This is what
 * lets a long category ("50 wines") continue across several screens instead
 * of ever needing to scroll. A single oversized item is still placed alone
 * rather than dropped - there's no better option once it doesn't fit solo.
 */
function chunkCategory(
    category: PublicBoardCategory,
    itemHeights: number[],
    headerHeight: number,
    headerGap: number,
    itemGap: number,
    maxHeight: number,
): Chunk[] {
    const raw: { items: PublicBoardItem[]; height: number }[] = [];
    let currentItems: PublicBoardItem[] = [];
    let currentItemsHeight = 0;

    category.items.forEach((item, i) => {
        const h = itemHeights[i] ?? 0;
        const gap = currentItems.length > 0 ? itemGap : 0;
        const wouldBeHeight = headerHeight + headerGap + currentItemsHeight + gap + h;

        if (currentItems.length > 0 && wouldBeHeight > maxHeight) {
            raw.push({ items: currentItems, height: headerHeight + headerGap + currentItemsHeight });
            currentItems = [item];
            currentItemsHeight = h;
        } else {
            currentItems.push(item);
            currentItemsHeight += h + gap;
        }
    });

    raw.push({ items: currentItems, height: headerHeight + headerGap + currentItemsHeight });

    return raw.map((chunk, i) => ({
        category,
        items: chunk.items,
        part: i,
        totalParts: raw.length,
        height: chunk.height,
    }));
}

type GridScreen = Chunk[][]; // one array of chunks per column

/**
 * Greedy shortest-column-first bin packing: walks chunks in order, placing
 * each into whichever column has room and ends up shortest, closing the
 * current screen and starting a new one whenever a chunk fits nowhere.
 */
function packIntoScreens(
    chunks: Chunk[],
    columns: number,
    availableHeight: number,
    gap: number,
): GridScreen[] {
    const screens: GridScreen[] = [];
    let colHeights = new Array(columns).fill(0);
    let colChunks: Chunk[][] = Array.from({ length: columns }, () => []);

    const flush = () => {
        if (colChunks.some((c) => c.length > 0)) screens.push(colChunks);
        colHeights = new Array(columns).fill(0);
        colChunks = Array.from({ length: columns }, () => []);
    };

    chunks.forEach((chunk) => {
        const candidates: { col: number; resultHeight: number }[] = [];
        for (let i = 0; i < columns; i++) {
            if (colChunks[i].length === 0) {
                candidates.push({ col: i, resultHeight: chunk.height });
            } else {
                const resultHeight = colHeights[i] + gap + chunk.height;
                if (resultHeight <= availableHeight) candidates.push({ col: i, resultHeight });
            }
        }

        if (candidates.length === 0) {
            flush();
            colChunks[0].push(chunk);
            colHeights[0] = chunk.height;
            return;
        }

        const best = candidates.reduce((a, b) => (b.resultHeight < a.resultHeight ? b : a));
        colChunks[best.col].push(chunk);
        colHeights[best.col] = best.resultHeight;
    });

    flush();
    return screens;
}

const containerVariants: Variants = {
    hidden: { transition: { when: "afterChildren", staggerChildren: 0.05, staggerDirection: -1 } },
    visible: { transition: { when: "beforeChildren", staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24, transition: { duration: 0.3, ease: "easeIn" } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function MenuBoardDisplayPage() {
    const { t } = useTranslation("menu_board");
    const { routeParams } = usePageContext();
    const token = routeParams.token as string;

    const [data, setData] = useState<PublicBoardResponse | null>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [screenIndex, setScreenIndex] = useState(0);
    const [gridScreens, setGridScreens] = useState<GridScreen[]>([]);
    const [carouselScreens, setCarouselScreens] = useState<Chunk[]>([]);

    const mainRef = useRef<HTMLElement | null>(null);
    const measurerRef = useRef<HTMLDivElement | null>(null);
    const headerRefs = useRef<Record<string, HTMLElement | null>>({});
    const itemRefs = useRef<Record<string, HTMLElement | null>>({});

    useEffect(() => {
        if (!token) return;
        fetchPublicMenuBoardApiCall(token)
            .then((res) => {
                setData(res);
                setStatus("ready");
            })
            .catch(() => setStatus("error"));
    }, [token]);

    const isCarousel = data?.board.displayMode === "CAROUSEL";
    const isDark = data?.board.theme === "dark";
    const currency = data?.business?.currency ?? "USD";

    const intervalMs = useMemo(() => {
        const seconds = data?.board.presentationConfig?.intervalSeconds;
        return seconds ? Number(seconds) * 1000 : DEFAULT_INTERVAL_MS;
    }, [data]);

    // Paginate into screens guaranteed to fit, by measuring real rendered
    // heights via the hidden measurer below - content never needs to scroll,
    // since nobody's there on a TV/kiosk to actually scroll it.
    useIsomorphicLayoutEffect(() => {
        const mainEl = mainRef.current;
        const measurerEl = measurerRef.current;
        if (!data || !mainEl || !measurerEl) return;

        const compute = () => {
            const mainCs = getComputedStyle(mainEl);
            const contentWidth =
                mainEl.clientWidth - parseFloat(mainCs.paddingLeft) - parseFloat(mainCs.paddingRight);
            const availableHeight =
                mainEl.clientHeight - parseFloat(mainCs.paddingTop) - parseFloat(mainCs.paddingBottom);
            if (contentWidth <= 0 || availableHeight <= 0) return;

            const columns = isCarousel ? 1 : getColumnCount(window.innerWidth);
            const targetWidth = isCarousel
                ? contentWidth
                : (contentWidth - COLUMN_GAP * (columns - 1)) / columns;
            measurerEl.style.width = `${targetWidth}px`;

            const headerGap = isCarousel ? HEADER_GAP_LARGE : HEADER_GAP;
            const itemGap = isCarousel ? ITEM_GAP_LARGE : ITEM_GAP;

            const chunks = data.categories.flatMap((category) => {
                const headerHeight = headerRefs.current[category.id]?.offsetHeight ?? 0;
                const itemHeights = category.items.map(
                    (item) => itemRefs.current[item.id]?.offsetHeight ?? 0,
                );
                return chunkCategory(category, itemHeights, headerHeight, headerGap, itemGap, availableHeight);
            });

            if (isCarousel) {
                setCarouselScreens(chunks);
            } else {
                setGridScreens(packIntoScreens(chunks, columns, availableHeight, COLUMN_GAP));
            }
            setScreenIndex(0);
        };

        compute();
        window.addEventListener("resize", compute);
        return () => window.removeEventListener("resize", compute);
    }, [data, isCarousel]);

    const screenCount = isCarousel ? carouselScreens.length : gridScreens.length;

    useEffect(() => {
        if (screenCount <= 1) return;
        const id = setInterval(() => {
            setScreenIndex((i) => (i + 1) % screenCount);
        }, intervalMs);
        return () => clearInterval(id);
    }, [screenCount, intervalMs]);

    if (status === "loading") {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
                <p className="text-lg text-muted-foreground">{t("loading")}</p>
            </div>
        );
    }

    if (status === "error" || !data) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground gap-2">
                <h1 className="text-2xl font-bold">{t("unavailable_title")}</h1>
                <p className="text-muted-foreground">{t("unavailable_desc")}</p>
            </div>
        );
    }

    const currentCarouselScreen = carouselScreens[screenIndex];
    const currentGridScreen = gridScreens[screenIndex];

    return (
        <div
            className={cn(
                "h-screen w-screen overflow-hidden flex flex-col",
                isDark ? "bg-neutral-950 text-white" : "bg-white text-neutral-900",
            )}
        >
            <header className="flex items-center gap-4 px-10 py-6 shrink-0">
                {data.business?.logo && (
                    <img src={data.business.logo} alt="" className="h-14 w-14 rounded-full object-cover" />
                )}
                <div>
                    <h1 className="text-3xl font-bold">{data.business?.name}</h1>
                    <p className={cn("text-sm", isDark ? "text-neutral-400" : "text-neutral-500")}>
                        {data.board.name}
                    </p>
                </div>
            </header>

            <main ref={mainRef as any} className="flex-1 overflow-hidden px-10 pb-10 relative">
                {/* Hidden measurer: identical markup to the real render, off-screen, used
                    only to read real heights so pagination always fits without scrolling. */}
                <div
                    ref={measurerRef}
                    aria-hidden
                    style={{ position: "fixed", top: 0, left: -99999, visibility: "hidden", pointerEvents: "none" }}
                >
                    {data.categories.map((category) => (
                        <div key={category.id}>
                            <CategoryHeaderRow
                                ref={(el) => {
                                    headerRefs.current[category.id] = el;
                                }}
                                name={category.name}
                                large={isCarousel}
                                measureOnly
                            />
                            {category.items.map((item) => (
                                <ItemRow
                                    key={item.id}
                                    ref={(el) => {
                                        itemRefs.current[item.id] = el;
                                    }}
                                    item={item}
                                    currency={currency}
                                    isDark={isDark}
                                    large={isCarousel}
                                    measureOnly
                                />
                            ))}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {isCarousel
                        ? currentCarouselScreen && (
                              <motion.div
                                  key={screenIndex}
                                  variants={containerVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="hidden"
                                  className="h-full flex flex-col"
                              >
                                  <CategoryScreenBlock
                                      chunk={currentCarouselScreen}
                                      currency={currency}
                                      isDark={isDark}
                                      large
                                  />
                              </motion.div>
                          )
                        : currentGridScreen && (
                              <motion.div
                                  key={screenIndex}
                                  variants={containerVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="hidden"
                                  className="h-full flex items-start"
                                  style={{ gap: COLUMN_GAP }}
                              >
                                  {currentGridScreen.map((column, colIdx) => (
                                      <div
                                          key={colIdx}
                                          className="flex-1 flex flex-col min-w-0"
                                          style={{ gap: COLUMN_GAP }}
                                      >
                                          {column.map((chunk) => (
                                              <CategoryScreenBlock
                                                  key={`${chunk.category.id}-${chunk.part}`}
                                                  chunk={chunk}
                                                  currency={currency}
                                                  isDark={isDark}
                                              />
                                          ))}
                                      </div>
                                  ))}
                              </motion.div>
                          )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function CategoryScreenBlock({
    chunk,
    currency,
    isDark,
    large,
}: {
    chunk: Chunk;
    currency: string;
    isDark: boolean;
    large?: boolean;
}) {
    const label =
        chunk.totalParts > 1 ? `${chunk.category.name} (${chunk.part + 1}/${chunk.totalParts})` : chunk.category.name;

    return (
        <div className="flex flex-col" style={{ gap: large ? HEADER_GAP_LARGE : HEADER_GAP }}>
            <CategoryHeaderRow name={label} large={large} />
            <div className="flex flex-col" style={{ gap: large ? ITEM_GAP_LARGE : ITEM_GAP }}>
                {chunk.items.map((item) => (
                    <ItemRow key={item.id} item={item} currency={currency} isDark={isDark} large={large} />
                ))}
            </div>
        </div>
    );
}

const CategoryHeaderRow = React.forwardRef<
    HTMLElement,
    { name: string; large?: boolean; measureOnly?: boolean }
>(({ name, large, measureOnly }, ref) => {
    const Comp: any = measureOnly ? "div" : motion.div;
    const motionProps = measureOnly ? {} : { variants: itemVariants };
    return (
        <Comp ref={ref} {...motionProps} className={cn("font-bold", large ? "text-5xl" : "text-2xl")}>
            {name}
        </Comp>
    );
});

const ItemRow = React.forwardRef<
    HTMLElement,
    {
        item: PublicBoardItem;
        currency: string;
        isDark: boolean;
        large?: boolean;
        measureOnly?: boolean;
    }
>(({ item, currency, isDark, large, measureOnly }, ref) => {
    const Comp: any = measureOnly ? "div" : motion.div;
    const motionProps = measureOnly ? {} : { variants: itemVariants };
    return (
        <Comp ref={ref} {...motionProps} className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
                {item.media?.[0]?.url && (
                    <img
                        src={item.media[0].url}
                        alt=""
                        className={cn("rounded-lg object-cover shrink-0", large ? "h-20 w-20" : "h-14 w-14")}
                    />
                )}
                <div className="min-w-0">
                    <p className={cn("font-semibold truncate", large ? "text-2xl" : "text-base")}>{item.name}</p>
                    {item.description && (
                        <p
                            className={cn(
                                "truncate",
                                large ? "text-lg" : "text-sm",
                                isDark ? "text-neutral-400" : "text-neutral-500",
                            )}
                        >
                            {item.description}
                        </p>
                    )}
                </div>
            </div>
            <span className={cn("font-bold shrink-0", large ? "text-2xl" : "text-base")}>
                {formatCurrency(item.price, currency)}
            </span>
        </Comp>
    );
});
