import React, { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Coffee, Moon, ForkKnife } from "lucide-react";
import { motion } from "framer-motion";
import { useBusinessMenus } from "@/features/business/menu/useBusinessMenus";
import { usePageContext } from "vike-react/usePageContext";
import { CreateMenuModal } from "@/components/management/menu/CreateMenuModal";

const dummyMenus = [
    { id: "menu1", name: "Lunch Menu", items: 12, categories: 4, icon: <ForkKnife /> },
    { id: "menu2", name: "Dinner Menu", items: 8, categories: 3, icon: <Moon /> },
];

// Example subscription data
const userSubscription = {
    maxMenus: 5,
};

const MenusPage: React.FC = () => {
    const [createModal, setCreateModal] = useState(false);
    const {
        routeParams,
        data
    } = usePageContext();

    const {
        businessBasicMenus,
        createNewMenu
    } = useBusinessMenus(routeParams.id);

    const remainingMenus = userSubscription.maxMenus - (businessBasicMenus?.length || 0);
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
            <CreateMenuModal
                isOpen={createModal}
                onClose={() => {
                    setCreateModal(false);
                }}
                onCreate={(data) => {
                    createNewMenu({
                        name: data.name,
                        description: data.description,
                    });
                    setCreateModal(false);

                }}
            />
            <div className="max-w-6xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
                    Your Menus
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Click on a menu to manage its categories and items. Add new menus to get started!
                </p>

                {/* Subscription counter */}
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300 mb-4">
                    <span>
                        {remainingMenus > 0
                            ? `You can create ${remainingMenus} more menu${remainingMenus > 1 ? "s" : ""} with your subscription.`
                            : "You have reached your menu limit for your subscription."}
                    </span>
                    {remainingMenus === 0 && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="ml-2"
                            onClick={() => console.log("Upgrade subscription clicked")}
                        >
                            Upgrade
                        </Button>
                    )}
                </div>

                {businessBasicMenus?.length === 0 ? (
                    <Card className="text-center p-12 border-dashed border-2 border-zinc-300 dark:border-zinc-700">
                        <CardTitle className="text-2xl">No menus yet</CardTitle>
                        <p className="text-zinc-500 my-4">
                            Create your first menu to start organizing your items.
                        </p>
                        <Button className="mt-4"
                            onClick={() => {
                                setCreateModal(true);
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Create Menu
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {businessBasicMenus?.map((menu) => (
                            <motion.a
                                key={menu.id}
                                href={`./menu/${menu.id}`}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="block"
                            >
                                <Card className="cursor-pointer p-4 hover:shadow-xl transition-shadow border border-zinc-200 dark:border-zinc-700 rounded-xl">
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl text-indigo-500 dark:text-indigo-400">
                                                {menu.icon || <Coffee />}
                                            </div>
                                            <CardTitle className="text-xl font-semibold">{menu.name}</CardTitle>
                                        </div>

                                        <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400 text-sm">
                                            <span>{menu.categoriesCount} Categories</span>
                                            <span>•</span>
                                            <span>{menu.itemsCount} Items</span>
                                        </div>
                                        <p className="text-zinc-400 text-sm italic">
                                            Click to open and manage this menu.
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.a>
                        ))}

                        {/* Create Menu Card */}
                        {remainingMenus > 0 && (
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Card
                                    className="flex flex-col items-center justify-center cursor-pointer p-6 border-dashed border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition rounded-xl"
                                    onClick={() => {
                                        setCreateModal(true);
                                    }}
                                >
                                    <Plus className="h-6 w-6 text-indigo-500 mb-2" />
                                    <p className="font-semibold text-zinc-700 dark:text-zinc-200">
                                        Create New Menu
                                    </p>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenusPage;
