import React, { useLayoutEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { animate, onScroll, utils, Scope, createScope } from "animejs";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import {
    Package, AlertTriangle, Users, Clock,
    UtensilsCrossed, Star, Heart, Gift, MessageSquare,
    CheckCircle2, XCircle,
} from "lucide-react";

interface Solution {
    id: number;
    color: string;
}

const solutions: Solution[] = [
    { id: 1, color: "bg-primary" },
    { id: 2, color: "bg-primary" },
    { id: 3, color: "bg-primary" },
    { id: 4, color: "bg-primary" },
];

// --- Per-tab visuals ---

const inventoryItems = [
    { name: "Pasta Flour",    unit: "12 kg",   stock: 80, status: "ok"       },
    { name: "Tomato Sauce",   unit: "2 cans",  stock: 18, status: "low"      },
    { name: "Olive Oil",      unit: "5.5 L",   stock: 55, status: "ok"       },
    { name: "Mozzarella",     unit: "0.5 kg",  stock: 5,  status: "critical" },
    { name: "Basil",          unit: "1.2 kg",  stock: 40, status: "ok"       },
    { name: "Parmesan",       unit: "3 kg",    stock: 22, status: "low"      },
];

const InventoryVisual = () => (
    <div className="w-full space-y-3">
        {inventoryItems.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    item.status === "critical" ? "bg-red-100 text-red-500"
                    : item.status === "low"    ? "bg-amber-100 text-amber-500"
                    : "bg-primary/10 text-primary"
                )}>
                    {item.status === "critical" || item.status === "low"
                        ? <AlertTriangle className="w-4 h-4" />
                        : <Package className="w-4 h-4" />
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
                        <span className={cn(
                            "text-xs font-semibold px-1.5 py-0.5 rounded ml-2 shrink-0",
                            item.status === "critical" ? "bg-red-100 text-red-600"
                            : item.status === "low"    ? "bg-amber-100 text-amber-600"
                            : "bg-green-100 text-green-600"
                        )}>
                            {item.status === "critical" ? "Critical" : item.status === "low" ? "Low" : item.unit}
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-500",
                                item.status === "critical" ? "bg-red-500"
                                : item.status === "low"    ? "bg-amber-500"
                                : "bg-primary"
                            )}
                            style={{ width: `${item.stock}%` }}
                        />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const staffMembers = [
    { name: "Maria L.",  role: "Waitress",   time: "09:00 – 17:00", color: "bg-violet-500" },
    { name: "Ahmed K.",  role: "Head Chef",  time: "12:00 – 22:00", color: "bg-orange-500" },
    { name: "Lisa M.",   role: "Manager",    time: "08:00 – 16:00", color: "bg-emerald-500" },
    { name: "Carlos R.", role: "Bartender",  time: "17:00 – 01:00", color: "bg-sky-500"     },
    { name: "Elena V.",  role: "Host",       time: "10:00 – 18:00", color: "bg-pink-500"    },
    { name: "Tom B.",    role: "Sous Chef",  time: "11:00 – 19:00", color: "bg-teal-500"    },
];

const StaffVisual = () => (
    <div className="w-full space-y-3">
        <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Today's Shifts</span>
        </div>
        {staffMembers.map((s) => (
            <div key={s.name} className="flex items-center gap-3 bg-background rounded-xl px-3 py-2.5">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", s.color)}>
                    {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-none">{s.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.role}</p>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg shrink-0">{s.time}</span>
            </div>
        ))}
    </div>
);

const menuItems = [
    { name: "Spaghetti Bolognese", price: "$14.99", available: true  },
    { name: "Caesar Salad",        price: "$9.99",  available: true  },
    { name: "Tiramisu",            price: "$7.99",  available: false },
    { name: "Sparkling Water",     price: "$2.99",  available: true  },
    { name: "Margherita Pizza",    price: "$12.99", available: true  },
    { name: "Espresso",            price: "$3.49",  available: true  },
];
const menuCategories = ["Starters", "Mains", "Desserts", "Drinks"];

const MenuVisual = () => (
    <div className="w-full">
        <div className="flex gap-2 mb-4 flex-wrap">
            {menuCategories.map((cat, i) => (
                <span key={cat} className={cn(
                    "text-xs font-semibold px-3 py-1 rounded-full",
                    i === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                    {cat}
                </span>
            ))}
        </div>
        <div className="space-y-2.5">
            {menuItems.map((item) => (
                <div key={item.name} className="flex items-center gap-3 bg-background rounded-xl px-3 py-2.5">
                    <UtensilsCrossed className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 text-sm font-medium text-foreground truncate">{item.name}</span>
                    <span className="text-sm font-bold text-foreground shrink-0">{item.price}</span>
                    {item.available
                        ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        : <XCircle     className="w-4 h-4 text-red-400 shrink-0" />
                    }
                </div>
            ))}
        </div>
    </div>
);

const engagementMetrics = [
    { icon: Star,          label: "Avg Rating",       value: "4.8 / 5",  bg: "bg-amber-100 dark:bg-amber-900/30",   text: "text-amber-600"  },
    { icon: Heart,         label: "Loyal Customers",  value: "1,240",    bg: "bg-rose-100 dark:bg-rose-900/30",     text: "text-rose-500"   },
    { icon: Gift,          label: "Active Offers",    value: "48",       bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-500" },
    { icon: MessageSquare, label: "Positive Feedback",value: "94%",      bg: "bg-emerald-100 dark:bg-emerald-900/30",text:"text-emerald-600"},
    { icon: Users,         label: "Repeat Customers", value: "68%",      bg: "bg-sky-100 dark:bg-sky-900/30",       text: "text-sky-500"    },
    { icon: Clock,         label: "Avg Reply Time",   value: "2 min",    bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-500" },
];

const EngagementVisual = () => (
    <div className="w-full grid grid-cols-2 gap-3">
        {engagementMetrics.map(({ icon: Icon, label, value, bg, text }) => (
            <div key={label} className="bg-background rounded-xl p-3 flex flex-col gap-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bg)}>
                    <Icon className={cn("w-4 h-4", text)} />
                </div>
                <p className="text-lg font-bold text-foreground leading-none">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        ))}
    </div>
);

const visuals: Record<number, React.ReactNode> = {
    1: <InventoryVisual />,
    2: <StaffVisual />,
    3: <MenuVisual />,
    4: <EngagementVisual />,
};

// ---

const ProblemSolutionSection = () => {
    const { t } = useTranslation("landing");
    const [activeSolution, setActiveSolution] = useState<Solution>(solutions[0]);
    const scope = useRef<Scope>(null);

    const handleSolutionClick = (solution: Solution) => {
        setActiveSolution(solution);
    };

    useLayoutEffect(() => {
        scope.current = createScope().add(() => {
            utils.$("#prob_solution_title").forEach(($el) => {
                animate($el, {
                    opacity: [0, 1],
                    x: ["10rem", "0rem"],
                    duration: 900,
                    alternate: true,
                    easing: "inOutQuad",
                    autoplay: onScroll({ sync: "play", enter: "bottom top", leave: "center top" }),
                });
            });

            utils.$("#prob_sol_left_panel > *").forEach(($el, index) => {
                animate($el, {
                    opacity: [0, 1],
                    x: ["-10rem", "0rem"],
                    duration: 900,
                    easing: "inOutQuad",
                    autoplay: onScroll({ sync: "play", enter: "bottom top", leave: "center top" }),
                    delay: index * 150,
                });
            });

            utils.$("#prob_sol_right_panel").forEach(($el) => {
                animate($el, {
                    opacity: [0, 1],
                    x: ["10rem", "0rem"],
                    duration: 900,
                    alternate: true,
                    easing: "inOutQuad",
                    autoplay: onScroll({ sync: "play", enter: "bottom top", leave: "center top" }),
                });
            });
        });

        return () => scope.current?.revert();
    }, []);

    return (
        <div className="font-sans bg-background text-foreground py-16 px-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6" id="landing_prob_sol_section">
                {/* Top Section */}
                <div className="mb-10 md:mb-16">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-[1.3]" id="prob_solution_title">
                        {t("landing_page.problemSolution.title")}
                    </h1>
                    <p className="text-base sm:text-lg text-muted-foreground max-w-3xl" id="prob_solution_subtitle">
                        {t("landing_page.problemSolution.subtitle")}
                    </p>
                </div>

                <Separator className="bg-border mb-16" />

                {/* Main Content Section */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Panel */}
                    <div id="prob_sol_left_panel">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 md:mb-8">
                            {t("landing_page.problemSolution.leftPanelTitle")}
                        </h2>
                        <div className="space-y-3 md:space-y-4">
                            {solutions.map((solution) => (
                                <div
                                    key={solution.id}
                                    className={cn(
                                        "p-4 md:p-6 rounded-lg cursor-pointer transition-colors duration-200 ease-in-out",
                                        activeSolution.id === solution.id
                                            ? solution.color + " text-primary-foreground shadow-xl"
                                            : "bg-muted hover:bg-muted/80 text-foreground"
                                    )}
                                    onClick={() => handleSolutionClick(solution)}
                                >
                                    <div className="flex items-center space-x-4 mb-2">
                                        <div
                                            className={cn(
                                                "w-8 h-8 flex items-center justify-center rounded-full font-bold shrink-0",
                                                activeSolution.id === solution.id
                                                    ? "bg-background text-primary"
                                                    : "bg-muted-foreground/20 text-muted-foreground"
                                            )}
                                        >
                                            {solution.id}
                                        </div>
                                        <h3 className="text-lg font-semibold">
                                            {t(`landing_page.problemSolution.solutions.${solution.id - 1}.title`)}
                                        </h3>
                                    </div>
                                    <p className={cn(
                                        "text-sm",
                                        activeSolution.id === solution.id ? "text-primary-foreground/80" : "text-muted-foreground"
                                    )}>
                                        {t(`landing_page.problemSolution.solutions.${solution.id - 1}.description`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div id="prob_sol_right_panel" className="relative">
                        <motion.div
                            className="absolute -top-8 -right-8 w-56 h-56 rounded-full bg-primary/20 blur-3xl pointer-events-none"
                            animate={{ y: [0, -16, 0], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-violet-500/20 blur-3xl pointer-events-none"
                            animate={{ y: [0, 16, 0], opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        />
                        <Card className="relative z-10 rounded-2xl bg-muted border-none h-full flex flex-col">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-2xl font-bold">
                                    {t(`landing_page.problemSolution.solutions.${activeSolution.id - 1}.cardTitle`)}
                                </CardTitle>
                                <CardDescription className="text-base text-muted-foreground">
                                    {t(`landing_page.problemSolution.solutions.${activeSolution.id - 1}.cardDescription`)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4 flex-1 flex flex-col justify-center">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeSolution.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.22, ease: "easeOut" }}
                                    >
                                        {visuals[activeSolution.id]}
                                    </motion.div>
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemSolutionSection;
