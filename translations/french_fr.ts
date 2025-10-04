const shared = {
  days: {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
  },
};

const landing_page = {
  header: {
    navLinks: {
      home_tab_title: "Accueil",
      businesses_tab_title: "Entreprises",
      features_tab_title: "Fonctionnalités",
      solution_tab_title: "Solution",
      integration_tab_title: "Intégration",
      pricing_tab_title: "Tarifs",
      faq_tab_title: "FAQ",
    },
    joinUsButton: "Rejoignez-nous",
    findBusinessButton: "Trouvez votre entreprise préférée",
  },
  hero: {
    title: "Optimisez la gestion de votre café & restaurant",
    subtitle:
      "Le moyen le plus simple de gérer votre flux de travail et de collaborer avec votre équipe sans effort.",
    trialButton: "Commencer l'essai gratuit",
    explainButton: "Voir comment ça fonctionne",
  },

  features: {
    globalTitle:
      "Tout ce dont vous avez besoin pour gérer votre café & restaurant",
    globalSubtitle:
      "Des menus au personnel, de l'inventaire à la découverte des clients — gérez tout sur une seule plateforme élégante. Gagnez du temps, réduisez les coûts et concentrez-vous sur la qualité de vos plats et expériences pendant que nous gérons les opérations.",
    inventoryManagement: {
      title: "Gestion des stocks",
      subtitle:
        "Surveillez les ingrédients en temps réel, recevez des alertes de faible stock et simplifiez les commandes aux fournisseurs pour maintenir votre cuisine efficace.",
    },
    staffManagement: {
      title: "Gestion du personnel",
      subtitle:
        "Créez et partagez les horaires du personnel en quelques minutes, gérez les shifts et suivez la présence — tout depuis un seul endroit. Fini le chaos de dernière minute.",
    },
  },

  problemSolution: {
    title: "Nous connaissons les défis de la gestion d'un restaurant",
    subtitle:
      "Gérer le personnel, suivre les stocks, mettre à jour les menus et fidéliser les clients peut être accablant. C'est pourquoi nous avons créé un outil simple tout-en-un pour les cafés et restaurants.",
    leftPanelTitle:
      "Comment nous pouvons vous aider à développer votre entreprise",
    solutions: [
      {
        id: 1,
        title: "Suivre facilement les stocks",
        description:
          "Gardez vos stocks à jour, recevez des alertes de faible stock et réapprovisionnez les ingrédients sans effort.",
        cardTitle: "Gestion des stocks",
        cardDescription:
          "Surveillez les ingrédients en temps réel, recevez des alertes de faible stock et simplifiez les commandes aux fournisseurs pour maintenir votre cuisine efficace.",
      },
      {
        id: 2,
        title: "Gérer les horaires du personnel",
        description:
          "Créez et partagez les shifts, suivez la présence et communiquez facilement avec votre équipe.",
        cardTitle: "Gestion du personnel",
        cardDescription:
          "Créez et partagez les horaires du personnel en quelques minutes, gérez les shifts et suivez la présence — tout depuis un seul endroit.",
      },
      {
        id: 3,
        title: "Mettre à jour les menus rapidement",
        description:
          "Ajoutez de nouveaux plats, supprimez les anciens et modifiez les prix sans tracas.",
        cardTitle: "Gestion des menus",
        cardDescription:
          "Gérez facilement votre menu et maintenez vos offres à jour pour vos clients.",
      },
      {
        id: 4,
        title: "Fidéliser les clients",
        description:
          "Engagez vos clients et faites-les revenir grâce à des offres personnalisées.",
        cardTitle: "Engagement client",
        cardDescription:
          "Créez des programmes de fidélité, suivez les préférences clients et améliorez la rétention.",
      },
    ],
  },
  integration: {
    title: "Installation simple, zéro tracas",
    subtitle:
      "Pas d'intégrations compliquées. Créez simplement votre compte, configurez les détails de votre entreprise et commencez à tout gérer depuis un seul endroit — immédiatement.",
    buttonText: "Réservez une démo",
    mainCard: {
      title: "Prévention des découverts",
      status: "Actuellement activé",
      progress: "93%",
      progressLabel: "Progression hebdomadaire",
    },
  },
  pricing: {
    title: "Choisissez le plan qui vous convient !",
    monthly_label: "Facturation mensuelle",
    yearly_label: "Facturation annuelle (41% de réduction)",
    billed_note: "*Facturé annuellement, taxes de l'application en sus",
    choose_plan_button: "Choisir le plan",
  },
  faq: {
    title: "Questions fréquemment posées",
    subtitle:
      "Vous avez des questions ? Nous avons des réponses. Voici quelques-unes des questions les plus fréquentes posées par les propriétaires de restaurants et cafés concernant notre plateforme.",
    cta_button: "Vous avez d'autres questions ?",
  },

  footer: {
    logo: "FlairSync",
    follow_us: "Suivez-nous",
    quick_links_title: "Liens rapides",
    quick_links: [
      "Accueil",
      "À propos",
      "Intégrations",
      "Fonctionnalités",
      "Tarifs",
      "Contactez-nous",
    ],
    support_title: "Support",
    support_links: [
      "FAQ",
      "Centre d'assistance",
      "Politique de confidentialité",
      "Conditions",
    ],
    contact_title: "Contact",
    contact_address_line1: "Andorra La Vella, AD500, Andorre",
    contact_phone: "+376 123 456",
    newsletter_title: "Abonnez-vous à notre newsletter",
    newsletter_placeholder: "Entrez votre email",
    copyright: "© {{year}} FlairSync. Tous droits réservés.",
  },
};

const auth_page = {
  signin_page_title: "Connectez-vous à votre compte",
  please_login_label: "Veuillez entrer vos informations pour vous connecter",
  email_label: "Email",
  password_label: "Mot de passe",
  stay_signedin_label: "Rester connecté",
  signin_button_label: "Se connecter",
  or_label: "ou",
  signin_with_google_label: "Se connecter avec Google",
  need_account_label: "Vous n'avez pas de compte ?",
  create_account_label: "Créez-en un",

  register: {
    signup_page_title: "Créez votre compte",
    signup_page_subtitle:
      "Entrez vos informations pour commencer avec FlairSync",
    email_label: "Email",
    password_label: "Mot de passe",
    signup_button_label: "S'inscrire",
    or_label: "ou",
    signin_with_google_label: "Se connecter avec Google",
    already_have_account_label: "Vous avez déjà un compte ?",
    signin_instead_label: "Connectez-vous à la place",
  },
};

const errors = {
  "404": {
    title: "Page non trouvée",
    description:
      "Nous ne pouvons pas trouver la page que vous recherchez. Elle a peut-être été déplacée, renommée ou n'a jamais existé.",
    quickSearch: "Recherche rapide",
    searchPlaceholder: "Rechercher pages, personnel ou paramètres...",
    searchButton: "Rechercher",
    goToDashboard: "Aller au tableau de bord",
    contactSupport: "Contacter le support",
    reportError:
      "Si vous pensez qu'il s'agit d'une erreur, veuillez la signaler — nous enquêterons.",
    lostTitle: "Perdu en cuisine ?",
    lostDescription:
      "Essayez l'un des liens ci-dessous ou retournez au tableau de bord principal.",
    staffManagement: "Gestion du personnel",
    scheduleManagement: "Gestion des horaires",
    settings: "Paramètres",
    errorCode: "Code d'erreur :",
  },
  "500": {
    title: "500 Erreur interne du serveur",
    description: "Une erreur est survenue.",
  },
};

const public_feed = {
  resultsFound: "{{count}} résultats trouvés",
  sortBy: "Trier par",
  sortOptions: {
    default: "Par défaut",
    rating_low: "Note : du plus bas au plus élevé",
    rating_high: "Note : du plus élevé au plus bas",
  },
  searchHero: {
    title: "Arrêtez de chercher un restaurant - trouvez-le.",
    searchPlaceholder: "Recherchez des restaurants, cuisines ou lieux...",
  },
  sidebar: {
    filterTitle: "Filtrer",
    clearFilters: "Effacer les filtres",
    locationTitle: "Lieu",
    locationPlaceholder: "Andorra la Vella, AD 500",
    typeTitle: "Type",
    typeOptions: {
      all: "Tous",
      restaurants: "Restaurants",
      coffeeShops: "Cafés",
    },
    tagsTitle: "Tags",
  },
};

const business_page = {
  header: {
    reserve_table_button: "Réserver une table",
  },
  info_cards: {
    rating_title: "Note",
    status_title: "Statut",
    status_open_now: "Ouvert maintenant",
    status_closes_at: "Fermeture à {{time}}",
    location_title: "Localisation",
    view_on_map_button: "Voir sur la carte",
  },
  menu: {
    section_title: "Menu",
    categories: {
      coffee_drinks: "Café & Boissons",
      food: "Nourriture",
    },
  },
  timing: {
    section_title: "Horaires d'ouverture",
  },
  contact: {
    section_title: "Contact & Réseaux sociaux",
    buttons: {
      instagram: "Instagram",
      facebook: "Facebook",
      website: "Site Web",
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
