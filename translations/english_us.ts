const shared = {
  email_label: "Email",
  password_label: "Password",
  or_label: "Or",
};

const landing_header = {
  home_tab_title: "Home",
  businesses_tab_title: "Businesses",
  features_tab_title: "Features",
  solution_tab_title: "Solution",
  integration_tab_title: "Integration",
  pricing_tab_title: "Pricing",
  faq_tab_title: "FAQ",
  join_us_tab_title: "Join us",
  find_business_tab_title: "Find your favorite business",
};

const landing_hero = {
  landing_hero_title: "Upgrade your café & restaurant management",
  landing_hero_subtitle:
    "The easiest way to manage your workflow and collaborate with your team seamlessly.",
  landing_hero_trial_bt: "Start Free Trial",
  landing_hero_explain_bt: "See how it works",
};
const features_sections = {
  feature_global_title: "Everything You Need to Run Your Café & Restaurant",
  feature_global_subtitle:
    "From menus to staff, inventory to customer discovery — manage it all in one sleek platform. Save time, cut costs, and focus on serving great food and experiences while we handle the operations.",
  inventory_management_title: "Inventory Management",
  inventory_management_subtitle:
    "Monitor ingredients in real time, get low-stock alerts, and simplify supplier orders to keep your kitchen running smoothly.",
  staff_management_title: "Staff Management",
  staff_management_subtitle:
    "Create and share staff schedules in minutes, manage shifts, and track attendance — all from one place. Say goodbye to last-minute chaos",
};

const landing_prob_solution = {
  prob1_title: "Unpredictable Schedules ?",
  prob1_description:
    "Last-minute changes and miscommunication leave your team unprepared.",
  prob1_card: "Smarter Staff Management",
  prob1_card_description:
    "Plan shifts in minutes, assign roles, and notify your team instantly. Everyone stays on the same page, reducing stress and keeping service smooth.",

  prob2_title: "Running Out of Stock ?",
  prob2_description:
    "Missing key ingredients in the middle of a busy service ruins consistency and sales.",
  prob2_card: "Inventory Tracking",
  prob2_card_description:
    "Easily track ingredients and supplies in real-time. Get automatic alerts when stock is low, so you can reorder before you run out and avoid menu surprises.",

  prob3_title: "Scattered Menus ?",
  prob3_description:
    "Updating prices and specials across print menus, delivery apps, and social media takes too much time.",
  prob3_card: "Centralized Menu Management",
  prob3_card_description:
    "Update your menu once and sync it everywhere—from your in-house POS to online delivery services. Keep your offerings current with a single click.",

  prob4_title: "Hard to Be Found ?",
  prob4_description:
    "Even with great food, customers struggle to discover your business.",
  prob4_card: "Customer Loyalty & Marketing",
  prob4_card_description:
    "Build a loyal following with integrated marketing tools and a rewards program. Easily create and send promotions to your customers to keep them coming back.",
};

const auth_pages = {
  signin_page_title: "Sign in",
  please_login_label: "Please login to continue to your account.",
  stay_signedin_label: "Keep me logged in",
  signin_button_label: "Sign in",
  signin_with_google_label: "Sign in with Google",
  need_account_label: "Need an account ?",

  create_account_label: "Create one",

  signup_page_title: "Sign up",
  signup_page_subtitle: "Sign up to enjoy the features of FlairSync",
  signup_button_label: "Create account",
  already_have_account_label: "Already have an account ?",
  signin_instead_label: "Sign in instead",
};

export default {
  ...shared,
  ...landing_header,
  ...landing_hero,
  ...features_sections,
  ...landing_prob_solution,
  ...auth_pages,
};
