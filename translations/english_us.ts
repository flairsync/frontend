const shared = {
  days: {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  },
  actions: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    move: "Move",
    duplicate: "Duplicate",
    confirm: "Confirm",
    back: "Back",
    search: "Search",
    clear: "Clear",
    all: "All",
    previous: "Previous",
    next: "Next",
  },
  tags: {
    halal: "Halal",
    vegan: "Vegan",
    vegetarian: "Vegetarian",
    gluten_free: "Gluten-Free",
    organic: "Organic",
    kosher: "Kosher",
    dairy_free: "Dairy-Free",
    nut_free: "Nut-Free",
    locally_sourced: "Locally Sourced",
    fair_trade: "Fair Trade",
    pet_friendly: "Pet-Friendly",
    outdoor_seating: "Outdoor Seating",
    takeaway: "Takeaway",
    delivery: "Delivery",
    kid_friendly: "Kid-Friendly",
    wifi: "Wi-Fi",
    wheelchair_accessible: "Wheelchair Accessible",
    brunch: "Brunch",
    breakfast: "Breakfast",
    late_night: "Late Night",
    cozy: "Cozy",
    romantic: "Romantic",
    family_friendly: "Family-Friendly",
    trendy: "Trendy",
    quiet: "Quiet",
    lively: "Lively",
  },
};

const permissions = {
  MENU: {
    label: "Menu management",
    description:
      "Create, update, and manage menu items, categories, and pricing.",
  },

  RESERVATIONS: {
    label: "Reservation management",
    description:
      "View, create, update, and manage customer reservations and bookings.",
  },

  STAFF: {
    label: "Staff management",
    description:
      "Manage staff members, roles, permissions, and work assignments.",
  },

  OPENING_HOURS: {
    label: "Opening hours management",
    description:
      "Configure business opening hours, special schedules, and closures.",
  },

  BUSINESS_SETTINGS: {
    label: "Business settings",
    description:
      "Manage business information, preferences, and operational settings.",
  },
};

const landing_page = {
  header: {
    navLinks: {
      home_tab_title: "Home",
      businesses_tab_title: "Businesses",
      features_tab_title: "Features",
      solution_tab_title: "Solution",
      integration_tab_title: "Integration",
      pricing_tab_title: "Pricing",
      faq_tab_title: "FAQ",
    },
    joinUsButton: "Join us",
    findBusinessButton: "Find your favorite business",
  },
  hero: {
    title: "Upgrade your café & restaurant management",
    subtitle:
      "The easiest way to manage your workflow and collaborate with your team seamlessly.",
    trialButton: "Start Free Trial",
    explainButton: "See how it works",
  },

  features: {
    globalTitle: "Everything You Need to Run Your Café & Restaurant",
    globalSubtitle:
      "From menus to staff, inventory to customer discovery — manage it all in one sleek platform. Save time, cut costs, and focus on serving great food and experiences while we handle the operations.",
    inventoryManagement: {
      title: "Inventory Management",
      subtitle:
        "Monitor ingredients in real time, get low-stock alerts, and simplify supplier orders to keep your kitchen running smoothly.",
    },
    staffManagement: {
      title: "Staff Management",
      subtitle:
        "Create and share staff schedules in minutes, manage shifts, and track attendance — all from one place. Say goodbye to last-minute chaos.",
    },
  },

  problemSolution: {
    title: "We Know the Struggles of Running a Restaurant",
    subtitle:
      "Managing staff, tracking stock, updating menus, and keeping customers coming back can feel overwhelming. That’s why we built a simple, all-in-one tool designed for cafés and restaurants.",
    leftPanelTitle: "How we can help you grow your business",
    solutions: [
      {
        id: 1,
        title: "Track inventory easily",
        description:
          "Keep your stock up-to-date, get low-stock alerts, and reorder ingredients effortlessly.",
        cardTitle: "Inventory Management",
        cardDescription:
          "Monitor ingredients in real time, get low-stock alerts, and simplify supplier orders to keep your kitchen running smoothly.",
      },
      {
        id: 2,
        title: "Manage staff schedules",
        description:
          "Create and share shifts, track attendance, and communicate easily with your team.",
        cardTitle: "Staff Management",
        cardDescription:
          "Create and share staff schedules in minutes, manage shifts, and track attendance — all from one place.",
      },
      {
        id: 3,
        title: "Update menus quickly",
        description:
          "Add new items, remove old ones, and update prices without hassle.",
        cardTitle: "Menu Management",
        cardDescription:
          "Easily manage your menu and keep your offerings up-to-date for your customers.",
      },
      {
        id: 4,
        title: "Boost customer loyalty",
        description:
          "Engage your customers and keep them coming back with personalized offers.",
        cardTitle: "Customer Engagement",
        cardDescription:
          "Build loyalty programs, track customer preferences, and improve retention.",
      },
    ],
  },
  integration: {
    title: "Seamless Setup, Zero Hassle",
    subtitle:
      "No complicated integrations. Just create your account, set up your business details, and start managing everything from one place — right away.",
    buttonText: "Book a Demo",
    mainCard: {
      title: "Overdraft Prevention",
      status: "Currently On",
      progress: "93%",
      progressLabel: "Weekly Progress",
    },
  },
  pricing: {
    title: "Choose The Plans That Suits You!",
    monthly_label: "Bill monthly",
    yearly_label: "Bill yearly (41% off)",
    billed_note: "*Billed annually, plus application taxes",
    choose_plan_button: "Choose Plan",
  },
  faq: {
    title: "Frequently Asked Questions",
    subtitle:
      "Got questions? We've got answers. Here are some of the most common questions restaurant and café owners ask about using our platform.",
    cta_button: "Got more questions?",
  },

  footer: {
    logo: "FlairSync",
    follow_us: "Follow us",
    quick_links_title: "Quick Links",
    quick_links: [
      "Home",
      "About Us",
      "Integrations",
      "Features",
      "Pricing",
      "Contact Us",
    ],
    support_title: "Support",
    support_links: ["FAQ's", "Support Center", "Privacy Policy", "Terms"],
    contact_title: "Contact",
    contact_address_line1: "Andorra La Vella, AD500, Andorra",
    contact_phone: "+376 123 456",
    newsletter_title: "Subscribe to our Newsletter",
    newsletter_placeholder: "Enter your email",
    copyright: "© {{year}} FlairSync. All Rights Reserved.",
  },
};

const auth_page = {
  signin_page_title: "Sign in to your account",
  please_login_label: "Please enter your details to login to your account",
  email_label: "Email",
  password_label: "Password",
  stay_signedin_label: "Stay signed in",
  signin_button_label: "Sign In",
  or_label: "or",
  signin_with_google_label: "Sign in with Google",
  need_account_label: "Don't have an account?",
  create_account_label: "Create one",

  register: {
    signup_page_title: "Create your account",
    signup_page_subtitle: "Enter your details to get started with FlairSync",
    email_label: "Email",
    password_label: "Password",
    signup_button_label: "Sign Up",
    or_label: "or",
    signin_with_google_label: "Sign in with Google",
    already_have_account_label: "Already have an account?",
    signin_instead_label: "Sign in instead",
    firstname_label: "Firstname",
    lastname_label: "Lastname",
    repeat_password_label: "Repeat password",
  },
};

const errors = {
  "404": {
    title: "Page not found",
    description:
      "We can’t find the page you’re looking for. It may have been moved, renamed, or might never have existed.",
    quickSearch: "Quick search",
    searchPlaceholder: "Search pages, staff, or settings...",
    searchButton: "Search",
    goToDashboard: "Go to dashboard",
    contactSupport: "Contact support",
    reportError:
      "If you think this is an error, please report it — we’ll investigate.",
    lostTitle: "Lost in the kitchen?",
    lostDescription:
      "Try one of the links below or return to the main dashboard.",
    staffManagement: "Staff Management",
    scheduleManagement: "Schedule Management",
    settings: "Settings",
    errorCode: "Error code:",
  },
  "500": {
    title: "500 Internal Server Error",
    description: "Something went wrong.",
  },
};

const public_feed = {
  resultsFound: "Found {{count}} results",
  sortBy: "Sort by",
  sortOptions: {
    default: "Default",
    rating_low: "Rating: Low to High",
    rating_high: "Rating: High to Low",
  },
  // Search hero
  searchHero: {
    title: "Stop looking for a restaurant - find it.",
    searchPlaceholder: "Search for restaurants, cuisines, or locations...",
  },

  // Sidebar
  sidebar: {
    filterTitle: "Filter",
    clearFilters: "Clear filters",
    locationTitle: "Location",
    locationPlaceholder: "Andorra la vella, AD 500",
    typeTitle: "Type",
    typeOptions: {
      all: "All",
      restaurants: "Restaurants",
      coffeeShops: "Coffee shops",
    },
    tagsTitle: "Tags",
  },
};

const business_page = {
  header: {
    reserve_table_button: "Reserve a Table",
  },
  info_cards: {
    rating_title: "Rating",
    status_title: "Status",
    status_open_now: "Open Now",
    status_closes_at: "Closes at {{time}}",
    location_title: "Location",
    view_on_map_button: "View on Map",
  },
  menu: {
    section_title: "Menu",
    categories: {
      coffee_drinks: "Coffee & Drinks",
      food: "Food",
    },
  },
  timing: {
    section_title: "Opening Hours",
  },
  contact: {
    section_title: "Contact & Socials",
    buttons: {
      instagram: "Instagram",
      facebook: "Facebook",
      website: "Website",
    },
  },
};

const input_errors = {
  email: {
    invalid: "Invalid email address",
    required: "Email is required",
  },
  firstName: {
    required: "First name is required",
    too_long: "First name is too long",
  },
  lastName: {
    required: "Last name is required",
    too_long: "Last name is too long",
  },
  displayName: {
    required: "Display name is required",
    too_long: "Display name is too long",
  },
  password: {
    min_length: "Password must be at least 8 characters long",
    requirements:
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    too_long: "Password is too long",
    required: "Password is required",
  },
  repeat_password: {
    mismatch: "Passwords must match",
    required: "Please confirm your password",
  },
  repeatNewPassword: {
    mismatch: "New passwords must match",
    required: "Please confirm your new password",
  },
  checkbox: {
    required: "You must confirm this checkbox",
  },
};

const menu_management = {
  actions: {
    add_category: "Add Category",
    add_item: "Add Item",
    save_changes: "Save changes",
    move_to_category: "Move to Category",
    delete_category: "Delete Category",
  },
  labels: {
    simple_view: "Simple",
    organize_view: "Organize",
    menu_hints: "Menu Hints",
    no_items: "No items yet. Click \"Add Item\" to start.",
    no_items_category: "No items in this category yet.",
    items_count: "{{count}} items",
    add_first_item: "Add your first item",
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    go_back_menus: "Go back to all menus",
  },
  messages: {
    delete_category_confirm: "Are you sure you want to delete this category? This action cannot be undone and will remove all items within it.",
    delete_item_confirm_title: "Delete item?",
    delete_item_confirm_desc: "This will permanently delete \"{{name}}\".",
    move_item_select_category: "Select the category to move this item to.",
  },
  modal: {
    create_title: "Create New Menu",
    edit_title: "Edit Menu",
    name: "Name",
    description: "Description",
    icon: "Icon",
    start_date: "Start Date",
    end_date: "End Date",
    start_time: "Start Time",
    end_time: "End Time",
    repeat: "Repeat",
    repeat_yearly: "Repeat yearly",
    select_all_days: "Select all days",
    unselect_all_days: "Unselect all days",
    update_button: "Update Menu",
    create_button: "Create Menu",
    tooltips: {
      icon: "Pick an icon to represent this menu in the UI.",
      date_empty: "Leave empty for a menu that is always active.",
      time_empty: "Leave empty for this menu to be active all day.",
    }
  },
  list: {
    title: "Your Menus",
    description: "Click on a menu to manage its categories and items. Add new menus to get started!",
    remaining_menus: "You can create {{count}} more menu with your subscription.",
    remaining_menus_plural: "You can create {{count}} more menus with your subscription.",
    limit_reached: "You have reached your menu limit for your subscription.",
    upgrade: "Upgrade",
    no_menus_title: "No menus yet",
    no_menus_desc: "Create your first menu to start organizing your items.",
    create_menu: "Create Menu",
    categories_count: "{{count}} Category",
    categories_count_plural: "{{count}} Categories",
    items_count: "{{count}} Item",
    items_count_plural: "{{count}} Items",
    hints: "Hints",
    more_hints: "+{{count}} more",
    manage_menu_hint: "Click to open and manage this menu.",
    create_new_menu_card: "Create New Menu",
  }
};

const item_modal = {
  create_title: "Create New Item",
  edit_title: "Edit Item",
  copy_label: "Copy from existing items",
  copy_hint: "Select an item to auto-fill the form. All fields remain editable",
  name: "Name",
  description: "Description",
  price: "Price",
  allergies: "Allergies",
  images: "Images",
  tracking: {
    label: "Tracking",
    tooltip: "Choose how this item links to your inventory.",
    none: "None",
    none_desc: "No inventory tracking for this item.",
    direct: "Direct Link",
    direct_desc: "This menu item maps directly to an inventory item. (e.g., a \"Coca Cola\" menu item links to a \"Coke Can\" inventory item).",
    link_existing: "Link Existing Item",
    create_new: "Create new inventory item",
    unit: "Unit",
    unit_placeholder: "Select unit",
    quantity_per_sale: "How much is consumed per sale?",
    quantity_hint: "If sold in liters and this item uses 0.5L, enter 0.5",
  }
};

const inventory_management = {
  title: "Inventory Management",
  add_item: "Add Item",
  edit_item: "Edit Item",
  delete_item: "Delete Item",
  adjust_stock: "Adjust Stock",
  groups: "Groups",
  manage_groups: "Manage Groups",
  add_group: "Add Group",
  edit_group: "Edit Group",
  delete_group: "Delete Group",
  items: "Items",
  low_stock: "Low Stock",
  all_items: "All Items",
  table: {
    name: "Name",
    quantity: "Quantity",
    unit: "Unit",
    group: "Group",
    threshold: "Threshold",
    last_updated: "Last Updated",
    actions: "Actions",
  },
  form: {
    name: "Item Name",
    barcode: "Barcode",
    description: "Description",
    quantity: "Quantity",
    unit: "Unit",
    threshold: "Low Stock Threshold",
    group: "Group",
    no_group: "No Group",
    errors: {
      name_required: "Item name is required",
      quantity_required: "Quantity is required",
      quantity_min: "Quantity cannot be negative",
      unit_required: "Unit is required",
      threshold_required: "Threshold is required",
      threshold_min: "Threshold cannot be negative",
    },
  },
  search_barcode: "Search Barcode",
  edit_group_mode: "Updating group...",
  adjust: {
    title: "Adjust Stock for {{name}}",
    current: "Current Quantity",
    adjustment: "Adjustment",
    adjustment_placeholder: "e.g., 5 or -2",
    reason: "Reason",
    reason_placeholder: "e.g., Restock, Waste, etc.",
    new_quantity: "New Quantity",
  },
  messages: {
    delete_item_confirm: "Are you sure you want to delete this item? This will also remove it from any linked menu items.",
    delete_group_confirm: "Are you sure you want to delete this group? Items in this group will be moved to 'Default'.",
    no_items: "No inventory items found.",
    no_groups: "No groups found.",
  }
};

export default {
  landing_page,
  errors,
  public_feed,
  auth_page,
  business_page,
  shared,
  input_errors,
  permissions,
  menu_management,
  item_modal,
  inventory_management,
};
