import {
    AlarmClock,
    BarChart3,
    Banknote,
    Bell,
    Building2,
    CalendarPlus,
    Briefcase,
    CalendarCheck,
    CalendarRange,
    ChefHat,
    ClipboardList,
    ClockFading,
    CreditCard,
    FileSpreadsheet,
    Gift,
    HandCoins,
    Images,
    Layers,
    LayoutDashboard,
    LayoutGrid,
    Megaphone,
    MessageSquare,
    MessageSquareHeart,
    MonitorPlay,
    MonitorSmartphone,
    Nfc,
    PackageOpen,
    Palette,
    Plus,
    Receipt,
    ScrollText,
    Settings,
    ShieldAlert,
    ShoppingBag,
    Star,
    Store,
    Tablet,
    Tag,
    Upload,
    UserPlus,
    Users,
    Utensils,
    Wifi,
    type LucideIcon,
} from "lucide-react";

/**
 * The single source of truth for "what can I do in this app".
 *
 * Everything navigational reads from here: the Easy View launcher, the action
 * bars, the search palette, and the pinnable-links catalog. The point is that a
 * feature cannot exist in one shell and be missing from the other — if it isn't
 * in this file it isn't anywhere.
 *
 * Wording rules, because this is what non-technical owners and floor staff
 * actually read:
 *   - labels are plain nouns a café owner would say out loud ("Stock", not
 *     "Inventory Management"; "Tap cards", not "NFC").
 *   - descriptions are one short sentence, no jargon, no feature names.
 *   - actions are verb-first and always use the SAME verb for the same idea.
 *     We "Add" things. We never "Create", "New" or "Register" them.
 *   - synonyms exist so search works when their word isn't our word.
 */

export type TaskRole = "owner" | "staff";

export type PermissionRequirement = {
    key: string;
    action: "read" | "create" | "update" | "delete";
};

/**
 * Accents are written out as whole class strings rather than composed at
 * runtime — Tailwind only ships classes it can see literally in the source.
 */
export type TileAccent =
    | "orange"
    | "sky"
    | "violet"
    | "emerald"
    | "amber"
    | "rose"
    | "blue"
    | "slate";

export const TILE_ACCENTS: Record<TileAccent, { surface: string; icon: string; ring: string }> = {
    orange: {
        surface: "bg-orange-500/10 dark:bg-orange-400/10",
        icon: "text-orange-600 dark:text-orange-400",
        ring: "group-hover:ring-orange-500/40",
    },
    sky: {
        surface: "bg-sky-500/10 dark:bg-sky-400/10",
        icon: "text-sky-600 dark:text-sky-400",
        ring: "group-hover:ring-sky-500/40",
    },
    violet: {
        surface: "bg-violet-500/10 dark:bg-violet-400/10",
        icon: "text-violet-600 dark:text-violet-400",
        ring: "group-hover:ring-violet-500/40",
    },
    emerald: {
        surface: "bg-emerald-500/10 dark:bg-emerald-400/10",
        icon: "text-emerald-600 dark:text-emerald-400",
        ring: "group-hover:ring-emerald-500/40",
    },
    amber: {
        surface: "bg-amber-500/10 dark:bg-amber-400/10",
        icon: "text-amber-600 dark:text-amber-400",
        ring: "group-hover:ring-amber-500/40",
    },
    rose: {
        surface: "bg-rose-500/10 dark:bg-rose-400/10",
        icon: "text-rose-600 dark:text-rose-400",
        ring: "group-hover:ring-rose-500/40",
    },
    blue: {
        surface: "bg-blue-500/10 dark:bg-blue-400/10",
        icon: "text-blue-600 dark:text-blue-400",
        ring: "group-hover:ring-blue-500/40",
    },
    slate: {
        surface: "bg-slate-500/10 dark:bg-slate-400/10",
        icon: "text-slate-600 dark:text-slate-400",
        ring: "group-hover:ring-slate-500/40",
    },
};

export type TaskSectionKey = "service" | "house" | "money" | "setup";

export const TASK_SECTIONS: {
    key: TaskSectionKey;
    labelKey: string;
    descriptionKey: string;
}[] = [
        {
            key: "service",
            labelKey: "simple_mode.sections.service.label",
            descriptionKey: "simple_mode.sections.service.description",
        },
        {
            key: "house",
            labelKey: "simple_mode.sections.house.label",
            descriptionKey: "simple_mode.sections.house.description",
        },
        {
            key: "money",
            labelKey: "simple_mode.sections.money.label",
            descriptionKey: "simple_mode.sections.money.description",
        },
        {
            key: "setup",
            labelKey: "simple_mode.sections.setup.label",
            descriptionKey: "simple_mode.sections.setup.description",
        },
    ];

export type TaskAction = {
    /** Unique within its tile. Becomes the `?action=` value where one is used. */
    key: string;
    labelKey: string;
    icon: LucideIcon;
    /** Query string appended to the tile href, leading "?" included. */
    query: string;
    permission?: PermissionRequirement;
    /** Shown in the action bar itself rather than under "More actions". */
    primary?: boolean;
    /** Owner-only actions on a tile both roles can see. */
    roles?: TaskRole[];
};

export type AppTile = {
    key: string;
    labelKey: string;
    descriptionKey: string;
    synonymsKey: string;
    icon: LucideIcon;
    accent: TileAccent;
    section: TaskSectionKey;
    roles: TaskRole[];
    /** Staff-side permission gate. Owners implicitly have everything. */
    permission?: PermissionRequirement;
    /** Absolute path, for things that aren't under /manage/:id/:role/:key. */
    hrefOverride?: string;
    /** Opens in a new tab — used for the POS and kitchen screens. */
    external?: boolean;
    actions?: TaskAction[];
};

/**
 * Every destination in the management app. Nothing is hidden behind a "More"
 * bucket: an owner who wants tap cards or tax receipts can see them on the
 * launcher like everything else, and hides what they don't use themselves.
 */
export const APP_TILES: AppTile[] = [
    // ── Today's service ──────────────────────────────────────────────────────
    {
        key: "dashboard",
        labelKey: "simple_mode.tiles.dashboard.label",
        descriptionKey: "simple_mode.tiles.dashboard.description",
        synonymsKey: "simple_mode.tiles.dashboard.synonyms",
        icon: LayoutDashboard,
        accent: "blue",
        section: "service",
        roles: ["owner", "staff"],
    },
    {
        key: "orders",
        labelKey: "simple_mode.tiles.orders.label",
        descriptionKey: "simple_mode.tiles.orders.description",
        synonymsKey: "simple_mode.tiles.orders.synonyms",
        icon: ShoppingBag,
        accent: "orange",
        section: "service",
        roles: ["owner", "staff"],
        permission: { key: "ORDERS", action: "read" },
        actions: [
            {
                key: "live",
                labelKey: "simple_mode.actions.orders.live",
                icon: AlarmClock,
                query: "?status=ongoing",
                primary: true,
            },
            {
                key: "today",
                labelKey: "simple_mode.actions.orders.today",
                icon: ClipboardList,
                query: "?status=all",
                primary: true,
            },
        ],
    },
    {
        key: "reservations",
        labelKey: "simple_mode.tiles.reservations.label",
        descriptionKey: "simple_mode.tiles.reservations.description",
        synonymsKey: "simple_mode.tiles.reservations.synonyms",
        icon: CalendarCheck,
        accent: "violet",
        section: "service",
        roles: ["owner", "staff"],
        permission: { key: "RESERVATIONS", action: "read" },
        actions: [
            {
                key: "add",
                labelKey: "simple_mode.actions.reservations.add",
                icon: CalendarPlus,
                query: "?action=add",
                permission: { key: "RESERVATIONS", action: "create" },
                primary: true,
            },
        ],
    },
    {
        key: "floor-plan",
        labelKey: "simple_mode.tiles.floor_plan.label",
        descriptionKey: "simple_mode.tiles.floor_plan.description",
        synonymsKey: "simple_mode.tiles.floor_plan.synonyms",
        icon: LayoutGrid,
        accent: "emerald",
        section: "service",
        roles: ["owner"],
        actions: [
            {
                key: "add-table",
                labelKey: "simple_mode.actions.floor_plan.add_table",
                icon: Plus,
                query: "?action=add-table",
                primary: true,
            },
            {
                key: "add-many",
                labelKey: "simple_mode.actions.floor_plan.add_many",
                icon: LayoutGrid,
                query: "?action=add-many",
                primary: true,
            },
            {
                key: "add-floor",
                labelKey: "simple_mode.actions.floor_plan.add_floor",
                icon: Building2,
                query: "?action=add-floor",
            },
        ],
    },
    {
        key: "tasks",
        labelKey: "simple_mode.tiles.tasks.label",
        descriptionKey: "simple_mode.tiles.tasks.description",
        synonymsKey: "simple_mode.tiles.tasks.synonyms",
        icon: ClipboardList,
        accent: "sky",
        section: "service",
        roles: ["owner", "staff"],
        actions: [
            {
                key: "add",
                labelKey: "simple_mode.actions.tasks.add",
                roles: ["owner"],
                icon: Plus,
                query: "?action=add",
                primary: true,
            },
        ],
    },
    {
        key: "shifts",
        labelKey: "simple_mode.tiles.my_shifts.label",
        descriptionKey: "simple_mode.tiles.my_shifts.description",
        synonymsKey: "simple_mode.tiles.my_shifts.synonyms",
        icon: CalendarRange,
        accent: "violet",
        section: "service",
        roles: ["staff"],
    },
    {
        key: "messages",
        labelKey: "simple_mode.tiles.messages.label",
        descriptionKey: "simple_mode.tiles.messages.description",
        synonymsKey: "simple_mode.tiles.messages.synonyms",
        icon: MessageSquare,
        accent: "sky",
        section: "service",
        roles: ["staff"],
    },
    {
        key: "pos-app",
        labelKey: "simple_mode.tiles.pos_app.label",
        descriptionKey: "simple_mode.tiles.pos_app.description",
        synonymsKey: "simple_mode.tiles.pos_app.synonyms",
        icon: MonitorSmartphone,
        accent: "orange",
        section: "service",
        roles: ["owner", "staff"],
        hrefOverride: "/station/pos",
        external: true,
    },
    {
        key: "kds-app",
        labelKey: "simple_mode.tiles.kds_app.label",
        descriptionKey: "simple_mode.tiles.kds_app.description",
        synonymsKey: "simple_mode.tiles.kds_app.synonyms",
        icon: ChefHat,
        accent: "rose",
        section: "service",
        roles: ["owner", "staff"],
        hrefOverride: "/station/kds",
        external: true,
    },

    // ── Your place ───────────────────────────────────────────────────────────
    {
        key: "menu",
        labelKey: "simple_mode.tiles.menu.label",
        descriptionKey: "simple_mode.tiles.menu.description",
        synonymsKey: "simple_mode.tiles.menu.synonyms",
        icon: Utensils,
        accent: "orange",
        section: "house",
        roles: ["owner", "staff"],
        permission: { key: "MENU", action: "read" },
        actions: [
            {
                key: "add",
                labelKey: "simple_mode.actions.menu.add",
                icon: Plus,
                query: "?action=add",
                permission: { key: "MENU", action: "create" },
                primary: true,
            },
        ],
    },
    {
        key: "inventory",
        labelKey: "simple_mode.tiles.inventory.label",
        descriptionKey: "simple_mode.tiles.inventory.description",
        synonymsKey: "simple_mode.tiles.inventory.synonyms",
        icon: PackageOpen,
        accent: "amber",
        section: "house",
        roles: ["owner", "staff"],
        permission: { key: "INVENTORY", action: "read" },
        actions: [
            {
                key: "add",
                labelKey: "simple_mode.actions.inventory.add",
                roles: ["owner"],
                icon: Plus,
                query: "?action=add",
                permission: { key: "INVENTORY", action: "create" },
                primary: true,
            },
            {
                key: "import",
                labelKey: "simple_mode.actions.inventory.import",
                roles: ["owner"],
                icon: Upload,
                query: "?action=import",
                permission: { key: "INVENTORY", action: "create" },
                primary: true,
            },
            {
                key: "groups",
                labelKey: "simple_mode.actions.inventory.groups",
                roles: ["owner"],
                icon: Layers,
                query: "?action=groups",
                permission: { key: "INVENTORY", action: "update" },
            },
        ],
    },
    {
        key: "staff",
        labelKey: "simple_mode.tiles.staff.label",
        descriptionKey: "simple_mode.tiles.staff.description",
        synonymsKey: "simple_mode.tiles.staff.synonyms",
        icon: Users,
        accent: "sky",
        section: "house",
        roles: ["owner", "staff"],
        permission: { key: "STAFF", action: "read" },
        actions: [
            {
                key: "invite",
                labelKey: "simple_mode.actions.staff.invite",
                icon: UserPlus,
                query: "?tab=invitations&action=invite",
                permission: { key: "STAFF", action: "create" },
                primary: true,
            },
            {
                key: "people",
                labelKey: "simple_mode.actions.staff.people",
                icon: Users,
                query: "?tab=staff",
                primary: true,
            },
            {
                key: "roles",
                labelKey: "simple_mode.actions.staff.roles",
                icon: ShieldAlert,
                query: "?tab=roles",
                primary: true,
            },
            {
                key: "teams",
                labelKey: "simple_mode.actions.staff.teams",
                icon: Users,
                query: "?tab=teams",
            },
        ],
    },
    {
        key: "schedule",
        labelKey: "simple_mode.tiles.schedule.label",
        descriptionKey: "simple_mode.tiles.schedule.description",
        synonymsKey: "simple_mode.tiles.schedule.synonyms",
        icon: CalendarRange,
        accent: "violet",
        section: "house",
        roles: ["owner", "staff"],
        permission: { key: "STAFF", action: "read" },
        actions: [
            {
                key: "rota",
                labelKey: "simple_mode.actions.schedule.rota",
                icon: CalendarRange,
                query: "?tab=manage",
                primary: true,
            },
            {
                key: "time-off",
                labelKey: "simple_mode.actions.schedule.time_off",
                icon: CalendarCheck,
                query: "?tab=time-off",
                primary: true,
            },
            {
                key: "swaps",
                labelKey: "simple_mode.actions.schedule.swaps",
                icon: Users,
                query: "?tab=swaps",
                primary: true,
            },
            {
                key: "bids",
                labelKey: "simple_mode.actions.schedule.bids",
                icon: HandCoins,
                query: "?tab=bids",
            },
            {
                key: "rules",
                labelKey: "simple_mode.actions.schedule.rules",
                icon: ClockFading,
                query: "?tab=rules",
            },
            {
                key: "templates",
                labelKey: "simple_mode.actions.schedule.templates",
                icon: ClipboardList,
                query: "?tab=shifts",
            },
        ],
    },
    {
        key: "attendance",
        labelKey: "simple_mode.tiles.attendance.label",
        descriptionKey: "simple_mode.tiles.attendance.description",
        synonymsKey: "simple_mode.tiles.attendance.synonyms",
        icon: ClockFading,
        accent: "emerald",
        section: "house",
        roles: ["owner"],
        actions: [
            {
                key: "live",
                labelKey: "simple_mode.actions.attendance.live",
                icon: AlarmClock,
                query: "?tab=live",
                primary: true,
            },
            {
                key: "overview",
                labelKey: "simple_mode.actions.attendance.overview",
                icon: BarChart3,
                query: "?tab=overview",
                primary: true,
            },
            {
                key: "reports",
                labelKey: "simple_mode.actions.attendance.reports",
                icon: FileSpreadsheet,
                query: "?tab=reports",
            },
            {
                key: "absences",
                labelKey: "simple_mode.actions.attendance.absences",
                icon: CalendarCheck,
                query: "?tab=absences",
            },
        ],
    },
    {
        key: "settings",
        labelKey: "simple_mode.tiles.settings.label",
        descriptionKey: "simple_mode.tiles.settings.description",
        synonymsKey: "simple_mode.tiles.settings.synonyms",
        icon: Settings,
        accent: "slate",
        section: "house",
        roles: ["owner"],
        actions: [
            {
                key: "general",
                labelKey: "simple_mode.actions.settings.general",
                icon: Settings,
                query: "?section=general-info",
                primary: true,
            },
        ],
    },

    // ── Money & growth ───────────────────────────────────────────────────────
    {
        key: "analytics",
        labelKey: "simple_mode.tiles.analytics.label",
        descriptionKey: "simple_mode.tiles.analytics.description",
        synonymsKey: "simple_mode.tiles.analytics.synonyms",
        icon: BarChart3,
        accent: "blue",
        section: "money",
        roles: ["owner"],
    },
    {
        key: "payments",
        labelKey: "simple_mode.tiles.payments.label",
        descriptionKey: "simple_mode.tiles.payments.description",
        synonymsKey: "simple_mode.tiles.payments.synonyms",
        icon: CreditCard,
        accent: "emerald",
        section: "money",
        roles: ["owner"],
    },
    {
        key: "payroll",
        labelKey: "simple_mode.tiles.payroll.label",
        descriptionKey: "simple_mode.tiles.payroll.description",
        synonymsKey: "simple_mode.tiles.payroll.synonyms",
        icon: Banknote,
        accent: "emerald",
        section: "money",
        roles: ["owner"],
    },
    {
        key: "tip-pooling",
        labelKey: "simple_mode.tiles.tip_pooling.label",
        descriptionKey: "simple_mode.tiles.tip_pooling.description",
        synonymsKey: "simple_mode.tiles.tip_pooling.synonyms",
        icon: HandCoins,
        accent: "amber",
        section: "money",
        roles: ["owner"],
    },
    {
        key: "discounts",
        labelKey: "simple_mode.tiles.discounts.label",
        descriptionKey: "simple_mode.tiles.discounts.description",
        synonymsKey: "simple_mode.tiles.discounts.synonyms",
        icon: Tag,
        accent: "rose",
        section: "money",
        roles: ["owner"],
    },
    {
        key: "loyalty",
        labelKey: "simple_mode.tiles.loyalty.label",
        descriptionKey: "simple_mode.tiles.loyalty.description",
        synonymsKey: "simple_mode.tiles.loyalty.synonyms",
        icon: Gift,
        accent: "rose",
        section: "money",
        roles: ["owner", "staff"],
        permission: { key: "LOYALTY", action: "read" },
    },
    {
        key: "reviews",
        labelKey: "simple_mode.tiles.reviews.label",
        descriptionKey: "simple_mode.tiles.reviews.description",
        synonymsKey: "simple_mode.tiles.reviews.synonyms",
        icon: Star,
        accent: "amber",
        section: "money",
        roles: ["owner"],
    },
    {
        key: "feedback",
        labelKey: "simple_mode.tiles.feedback.label",
        descriptionKey: "simple_mode.tiles.feedback.description",
        synonymsKey: "simple_mode.tiles.feedback.synonyms",
        icon: MessageSquareHeart,
        accent: "violet",
        section: "money",
        roles: ["owner"],
    },
    {
        key: "fiscal-invoices",
        labelKey: "simple_mode.tiles.fiscal_invoices.label",
        descriptionKey: "simple_mode.tiles.fiscal_invoices.description",
        synonymsKey: "simple_mode.tiles.fiscal_invoices.synonyms",
        icon: Receipt,
        accent: "slate",
        section: "money",
        roles: ["owner"],
    },
    {
        key: "fiscal-services",
        labelKey: "simple_mode.tiles.fiscal_services.label",
        descriptionKey: "simple_mode.tiles.fiscal_services.description",
        synonymsKey: "simple_mode.tiles.fiscal_services.synonyms",
        icon: FileSpreadsheet,
        accent: "slate",
        section: "money",
        roles: ["owner"],
    },

    // ── Look & extras ────────────────────────────────────────────────────────
    {
        key: "branding",
        labelKey: "simple_mode.tiles.branding.label",
        descriptionKey: "simple_mode.tiles.branding.description",
        synonymsKey: "simple_mode.tiles.branding.synonyms",
        icon: Images,
        accent: "violet",
        section: "setup",
        roles: ["owner"],
    },
    {
        key: "themes",
        labelKey: "simple_mode.tiles.themes.label",
        descriptionKey: "simple_mode.tiles.themes.description",
        synonymsKey: "simple_mode.tiles.themes.synonyms",
        icon: Palette,
        accent: "rose",
        section: "setup",
        roles: ["owner", "staff"],
        permission: { key: "THEMES", action: "read" },
    },
    {
        key: "menu-boards",
        labelKey: "simple_mode.tiles.menu_boards.label",
        descriptionKey: "simple_mode.tiles.menu_boards.description",
        synonymsKey: "simple_mode.tiles.menu_boards.synonyms",
        icon: MonitorPlay,
        accent: "sky",
        section: "setup",
        roles: ["owner", "staff"],
        permission: { key: "MENU_DISPLAY", action: "read" },
    },
    {
        key: "stations",
        labelKey: "simple_mode.tiles.stations.label",
        descriptionKey: "simple_mode.tiles.stations.description",
        synonymsKey: "simple_mode.tiles.stations.synonyms",
        icon: Tablet,
        accent: "blue",
        section: "setup",
        roles: ["owner"],
    },
    {
        key: "nfc-tags",
        labelKey: "simple_mode.tiles.nfc_tags.label",
        descriptionKey: "simple_mode.tiles.nfc_tags.description",
        synonymsKey: "simple_mode.tiles.nfc_tags.synonyms",
        icon: Nfc,
        accent: "sky",
        section: "setup",
        roles: ["owner", "staff"],
        permission: { key: "NFC", action: "read" },
    },
    {
        key: "wifi",
        labelKey: "simple_mode.tiles.wifi.label",
        descriptionKey: "simple_mode.tiles.wifi.description",
        synonymsKey: "simple_mode.tiles.wifi.synonyms",
        icon: Wifi,
        accent: "emerald",
        section: "setup",
        roles: ["owner", "staff"],
        permission: { key: "WIFI", action: "read" },
    },
    {
        key: "announcements",
        labelKey: "simple_mode.tiles.announcements.label",
        descriptionKey: "simple_mode.tiles.announcements.description",
        synonymsKey: "simple_mode.tiles.announcements.synonyms",
        icon: Megaphone,
        accent: "amber",
        section: "setup",
        roles: ["owner"],
    },
    {
        key: "jobs",
        labelKey: "simple_mode.tiles.jobs.label",
        descriptionKey: "simple_mode.tiles.jobs.description",
        synonymsKey: "simple_mode.tiles.jobs.synonyms",
        icon: Briefcase,
        accent: "blue",
        section: "setup",
        roles: ["owner"],
    },
    {
        key: "marketplace",
        labelKey: "simple_mode.tiles.marketplace.label",
        descriptionKey: "simple_mode.tiles.marketplace.description",
        synonymsKey: "simple_mode.tiles.marketplace.synonyms",
        icon: Store,
        accent: "orange",
        section: "setup",
        roles: ["owner"],
    },
    {
        key: "alerts",
        labelKey: "simple_mode.tiles.alerts.label",
        descriptionKey: "simple_mode.tiles.alerts.description",
        synonymsKey: "simple_mode.tiles.alerts.synonyms",
        icon: Bell,
        accent: "amber",
        section: "setup",
        roles: ["owner"],
    },
    {
        key: "audit-logs",
        labelKey: "simple_mode.tiles.audit_logs.label",
        descriptionKey: "simple_mode.tiles.audit_logs.description",
        synonymsKey: "simple_mode.tiles.audit_logs.synonyms",
        icon: ScrollText,
        accent: "slate",
        section: "setup",
        roles: ["owner"],
    },
    {
        key: "danger",
        labelKey: "simple_mode.tiles.danger.label",
        descriptionKey: "simple_mode.tiles.danger.description",
        synonymsKey: "simple_mode.tiles.danger.synonyms",
        icon: ShieldAlert,
        accent: "rose",
        section: "setup",
        roles: ["owner"],
    },
];

// ─── Lookups ──────────────────────────────────────────────────────────────────

const TILES_BY_KEY = new Map(APP_TILES.map((tile) => [tile.key, tile]));

export function getTileByKey(key: string): AppTile | undefined {
    return TILES_BY_KEY.get(key);
}

export function buildTileHref(tile: AppTile, businessId: string, role: TaskRole): string {
    if (tile.hrefOverride) return tile.hrefOverride;
    return `/manage/${businessId}/${role}/${tile.key}`;
}

export function buildActionHref(
    tile: AppTile,
    action: TaskAction,
    businessId: string,
    role: TaskRole
): string {
    return `${buildTileHref(tile, businessId, role)}${action.query}`;
}

type PermissionChecker = (
    key: string,
    action: "read" | "create" | "update" | "delete"
) => boolean;

/**
 * Owners are not permission-checked — they hold every permission on their own
 * business by definition, and `usePermissions` isn't even fetched for them.
 */
function isAllowed(
    requirement: PermissionRequirement | undefined,
    role: TaskRole,
    hasPermission: PermissionChecker
): boolean {
    if (!requirement) return true;
    if (role === "owner") return true;
    return hasPermission(requirement.key, requirement.action);
}

export function getTilesForRole(
    role: TaskRole,
    hasPermission: PermissionChecker
): AppTile[] {
    return APP_TILES.filter(
        (tile) => tile.roles.includes(role) && isAllowed(tile.permission, role, hasPermission)
    );
}

export function getActionsForTile(
    tile: AppTile,
    role: TaskRole,
    hasPermission: PermissionChecker
): TaskAction[] {
    return (tile.actions ?? []).filter(
        (action) =>
            (!action.roles || action.roles.includes(role)) &&
            isAllowed(action.permission, role, hasPermission)
    );
}

/** Resolves the tile for a `/manage/:id/:role/:key` pathname. */
export function getTileForPathname(pathname: string, role: TaskRole): AppTile | undefined {
    const match = pathname.match(new RegExp(`/${role}/([^/?#]+)`));
    if (!match) return undefined;
    return getTileByKey(match[1]);
}
