type MenuHeaderProps = {
    menu: {
        id: string;
        name: string;
        description?: string | null;
        startDate?: string | null;
        endDate?: string | null;
        isActive?: boolean;
    };

    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
};

export const MenuHeader = ({
    menu,
    onEdit,
    onDuplicate,
    onDelete,
}: MenuHeaderProps) => {
    return (
        <div className="flex flex-col gap-4 border-b border-zinc-200 dark:border-zinc-700 pb-6">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Menu info */}
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
                        {menu.name}
                    </h1>

                    {menu.description && (
                        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
                            {menu.description}
                        </p>
                    )}

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-3 text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                        {menu.startDate && (
                            <span>
                                📅 {menu.startDate} → {menu.endDate ?? "∞"}
                            </span>
                        )}

                        <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium
                ${menu.isActive
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                                }`}
                        >
                            {menu.isActive ? "Active" : "Inactive"}
                        </span>

                        <span className="text-xs text-zinc-400">
                            ID: {menu.id}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={onEdit}
                        className="px-3 py-1.5 rounded-md text-sm font-medium
              bg-indigo-500 text-white hover:bg-indigo-600 transition"
                    >
                        Edit
                    </button>

                    <button
                        onClick={onDuplicate}
                        className="px-3 py-1.5 rounded-md text-sm font-medium
              bg-zinc-200 text-zinc-800 hover:bg-zinc-300
              dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600 transition"
                    >
                        Duplicate
                    </button>

                    <button
                        onClick={onDelete}
                        className="px-3 py-1.5 rounded-md text-sm font-medium
              bg-red-500 text-white hover:bg-red-600 transition"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
