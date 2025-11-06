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
    },
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

export default {
  landing_page,

  errors,
  public_feed,
  auth_page,
  business_page,
  shared,
};
