import React, { useEffect, useMemo, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import {
    PublicBoardResponse,
    fetchPublicMenuBoardApiCall,
} from "@/features/business/menuBoards/service";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

const DEFAULT_INTERVAL_MS = 8000;

export default function MenuBoardDisplayPage() {
    const { t } = useTranslation("menu_board");
    const { routeParams } = usePageContext();
    const token = routeParams.token as string;

    const [data, setData] = useState<PublicBoardResponse | null>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [slideIndex, setSlideIndex] = useState(0);

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
    const intervalMs = useMemo(() => {
        const seconds = data?.board.presentationConfig?.intervalSeconds;
        return seconds ? Number(seconds) * 1000 : DEFAULT_INTERVAL_MS;
    }, [data]);

    useEffect(() => {
        if (!isCarousel || !data || data.categories.length <= 1) return;
        const id = setInterval(() => {
            setSlideIndex((i) => (i + 1) % data.categories.length);
        }, intervalMs);
        return () => clearInterval(id);
    }, [isCarousel, data, intervalMs]);

    const isDark = data?.board.theme === "dark";
    const currency = data?.business?.currency ?? "USD";

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

    const categoriesToRender = isCarousel
        ? [data.categories[slideIndex]].filter(Boolean)
        : data.categories;

    return (
        <div
            className={cn(
                "h-screen w-screen overflow-hidden flex flex-col",
                isDark ? "bg-neutral-950 text-white" : "bg-white text-neutral-900",
            )}
        >
            <header className="flex items-center gap-4 px-10 py-6 shrink-0">
                {data.business?.logo && (
                    <img
                        src={data.business.logo}
                        alt=""
                        className="h-14 w-14 rounded-full object-cover"
                    />
                )}
                <div>
                    <h1 className="text-3xl font-bold">{data.business?.name}</h1>
                    <p className={cn("text-sm", isDark ? "text-neutral-400" : "text-neutral-500")}>
                        {data.board.name}
                    </p>
                </div>
            </header>

            <main className="flex-1 overflow-hidden px-10 pb-10">
                {isCarousel ? (
                    <AnimatePresence mode="wait">
                        {categoriesToRender.map((category) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.5 }}
                                className="h-full flex flex-col"
                            >
                                <CategoryBlock
                                    category={category}
                                    currency={currency}
                                    isDark={isDark}
                                    large
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                        {categoriesToRender.map((category) => (
                            <CategoryBlock
                                key={category.id}
                                category={category}
                                currency={currency}
                                isDark={isDark}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

function CategoryBlock({
    category,
    currency,
    isDark,
    large,
}: {
    category: PublicBoardResponse["categories"][number];
    currency: string;
    isDark: boolean;
    large?: boolean;
}) {
    return (
        <div className="flex flex-col gap-4">
            <h2 className={cn("font-bold", large ? "text-5xl mb-4" : "text-2xl")}>
                {category.name}
            </h2>
            <div className={cn("flex flex-col", large ? "gap-6" : "gap-3")}>
                {category.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            {item.media?.[0]?.url && (
                                <img
                                    src={item.media[0].url}
                                    alt=""
                                    className={cn(
                                        "rounded-lg object-cover shrink-0",
                                        large ? "h-20 w-20" : "h-14 w-14",
                                    )}
                                />
                            )}
                            <div className="min-w-0">
                                <p className={cn("font-semibold truncate", large ? "text-2xl" : "text-base")}>
                                    {item.name}
                                </p>
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
                    </div>
                ))}
            </div>
        </div>
    );
}
