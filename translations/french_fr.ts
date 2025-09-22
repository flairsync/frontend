const shared = {};

const landing_header = {
  home_tab_title: "Accueil",
  features_tab_title: "Fonctionnalités",
  solution_tab_title: "Solution",
  integration_tab_title: "Intégration",
  pricing_tab_title: "Tarifs",
  faq_tab_title: "FAQ",
  join_us_tab_title: "Rejoignez-nous",
};

const landing_hero = {
  landing_hero_title: "Améliorez la gestion de votre café & restaurant",
  landing_hero_subtitle:
    "La façon la plus simple de gérer votre flux de travail et de collaborer avec votre équipe en toute fluidité.",
  landing_hero_trial_bt: "Commencer l’essai gratuit",
  landing_hero_explain_bt: "Voir comment ça marche",
};

const features_sections = {
  feature_global_title:
    "Tout ce dont vous avez besoin pour gérer votre café & restaurant",
  feature_global_subtitle:
    "Des menus au personnel, de l’inventaire à la découverte des clients — gérez tout sur une seule plateforme élégante. Gagnez du temps, réduisez les coûts et concentrez-vous sur la qualité de vos plats et expériences pendant que nous nous occupons des opérations.",
  inventory_management_title: "Gestion des stocks",
  inventory_management_subtitle:
    "Surveillez les ingrédients en temps réel, recevez des alertes de rupture et simplifiez les commandes fournisseurs pour que votre cuisine fonctionne sans accroc.",
  staff_management_title: "Gestion du personnel",
  staff_management_subtitle:
    "Créez et partagez des plannings en quelques minutes, gérez les shifts et suivez la présence — le tout à partir d’un seul endroit. Dites adieu au chaos de dernière minute.",
};

export default {
  ...shared,
  ...landing_header,
  ...landing_hero,
  ...features_sections,
};
