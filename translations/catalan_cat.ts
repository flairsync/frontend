const shared = {
  days: {
    monday: "Dilluns",
    tuesday: "Dimarts",
    wednesday: "Dimecres",
    thursday: "Dijous",
    friday: "Divendres",
    saturday: "Dissabte",
    sunday: "Diumenge",
  },
  actions: {
    save: "Guardar",
    cancel: "Cancel·lar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Afegir",
    move: "Moure",
    duplicate: "Duplicar",
    confirm: "Confirmar",
    back: "Enrere",
    search: "Cercar",
    clear: "Netejar",
    all: "Tot",
    previous: "Anterior",
    next: "Següent",
  },
};

const landing_page = {
  header: {
    navLinks: {
      home_tab_title: "Inici",
      businesses_tab_title: "Negocis",
      features_tab_title: "Funcions",
      solution_tab_title: "Solució",
      integration_tab_title: "Integració",
      pricing_tab_title: "Preus",
      faq_tab_title: "FAQ",
    },
    joinUsButton: "Uneix-te a nosaltres",
    findBusinessButton: "Troba el teu negoci preferit",
  },
  hero: {
    title: "Millora la gestió del teu cafè i restaurant",
    subtitle:
      "La manera més fàcil de gestionar el teu flux de treball i col·laborar amb el teu equip sense problemes.",
    trialButton: "Comença la prova gratuïta",
    explainButton: "Veure com funciona",
  },

  features: {
    globalTitle: "Tot el que necessites per gestionar el teu cafè i restaurant",
    globalSubtitle:
      "Des de menús fins a personal, inventari i descoberta de clients: gestiona-ho tot en una sola plataforma elegant. Estalvia temps, redueix costos i centra’t a oferir excel·lents plats i experiències mentre nosaltres gestionem les operacions.",
    inventoryManagement: {
      title: "Gestió d'inventari",
      subtitle:
        "Supervisa els ingredients en temps real, rep alertes de baix estoc i simplifica les comandes als proveïdors per mantenir la cuina funcionant sense problemes.",
    },
    staffManagement: {
      title: "Gestió del personal",
      subtitle:
        "Crea i comparteix horaris del personal en minuts, gestiona torns i controla l’assistència, tot des d’un sol lloc. Adéu al caos d’últim moment.",
    },
  },

  problemSolution: {
    title: "Coneixem els reptes de gestionar un restaurant",
    subtitle:
      "Gestionar personal, controlar l’inventari, actualitzar menús i fidelitzar clients pot ser aclaparador. Per això vam crear una eina simple tot-en-un dissenyada per a cafès i restaurants.",
    leftPanelTitle: "Com podem ajudar-te a fer créixer el teu negoci",
    solutions: [
      {
        id: 1,
        title: "Controla fàcilment l’inventari",
        description:
          "Mantingues el teu estoc actualitzat, rep alertes de baix inventari i torna a demanar ingredients sense esforç.",
        cardTitle: "Gestió d’inventari",
        cardDescription:
          "Supervisa els ingredients en temps real, rep alertes de baix estoc i simplifica les comandes als proveïdors per mantenir la cuina funcionant sense problemes.",
      },
      {
        id: 2,
        title: "Gestiona els horaris del personal",
        description:
          "Crea i comparteix torns, controla l’assistència i comunica’t fàcilment amb el teu equip.",
        cardTitle: "Gestió del personal",
        cardDescription:
          "Crea i comparteix horaris del personal en minuts, gestiona torns i controla l’assistència, tot des d’un sol lloc.",
      },
      {
        id: 3,
        title: "Actualitza els menús ràpidament",
        description:
          "Afegeix nous plats, elimina els antics i actualitza preus sense complicacions.",
        cardTitle: "Gestió de menús",
        cardDescription:
          "Gestiona fàcilment el teu menú i mantingues les ofertes actualitzades per als teus clients.",
      },
      {
        id: 4,
        title: "Fidelitza els clients",
        description:
          "Involucra els teus clients i fes que tornin amb ofertes personalitzades.",
        cardTitle: "Compromís amb el client",
        cardDescription:
          "Crea programes de fidelització, controla les preferències dels clients i millora la retenció.",
      },
    ],
  },
  integration: {
    title: "Configuració senzilla, sense complicacions",
    subtitle:
      "Sense integracions complicades. Simplement crea el teu compte, configura els detalls del teu negoci i comença a gestionar-ho tot des d’un sol lloc, immediatament.",
    buttonText: "Reserva una demo",
    mainCard: {
      title: "Prevenció de descoberts",
      status: "Actualment actiu",
      progress: "93%",
      progressLabel: "Progrés setmanal",
    },
  },
  pricing: {
    title: "Tria el pla que millor s’adapti a tu!",
    monthly_label: "Facturació mensual",
    yearly_label: "Facturació anual (41% de descompte)",
    billed_note: "*Facturat anualment, impostos de l’aplicació no inclosos",
    choose_plan_button: "Tria pla",
  },
  faq: {
    title: "Preguntes freqüents",
    subtitle:
      "Tens preguntes? Tenim respostes. Aquí tens algunes de les preguntes més comunes dels propietaris de restaurants i cafès sobre la nostra plataforma.",
    cta_button: "Tens més preguntes?",
  },

  footer: {
    logo: "FlairSync",
    follow_us: "Segueix-nos",
    quick_links_title: "Enllaços ràpids",
    quick_links: [
      "Inici",
      "Sobre nosaltres",
      "Integracions",
      "Funcions",
      "Preus",
      "Contacta’ns",
    ],
    support_title: "Suport",
    support_links: ["FAQ", "Centre d’ajuda", "Política de privadesa", "Termes"],
    contact_title: "Contacte",
    contact_address_line1: "Andorra la Vella, AD500, Andorra",
    contact_phone: "+376 123 456",
    newsletter_title: "Subscriu-te al nostre butlletí",
    newsletter_placeholder: "Introdueix el teu correu electrònic",
    copyright: "© {{year}} FlairSync. Tots els drets reservats.",
  },
};

const auth_page = {
  signin_page_title: "Inicia sessió al teu compte",
  please_login_label:
    "Introdueix les teves dades per iniciar sessió al teu compte",
  email_label: "Correu electrònic",
  password_label: "Contrasenya",
  stay_signedin_label: "Mantenir sessió iniciada",
  signin_button_label: "Inicia sessió",
  or_label: "o",
  signin_with_google_label: "Inicia sessió amb Google",
  need_account_label: "No tens un compte?",
  create_account_label: "Crea’n un",

  register: {
    signup_page_title: "Crea el teu compte",
    signup_page_subtitle:
      "Introdueix les teves dades per començar amb FlairSync",
    email_label: "Correu electrònic",
    password_label: "Contrasenya",
    signup_button_label: "Registra’t",
    or_label: "o",
    signin_with_google_label: "Inicia sessió amb Google",
    already_have_account_label: "Ja tens un compte?",
    signin_instead_label: "Inicia sessió en lloc d’això",
  },
};

const errors = {
  "404": {
    title: "Pàgina no trobada",
    description:
      "No podem trobar la pàgina que cerques. Pot haver estat moguda, renombrada o potser mai no ha existit.",
    quickSearch: "Cerca ràpida",
    searchPlaceholder: "Cerca pàgines, personal o configuracions...",
    searchButton: "Cerca",
    goToDashboard: "Ves al tauler",
    contactSupport: "Contacta amb suport",
    reportError: "Si creus que això és un error, informa’ns i ho investigarem.",
    lostTitle: "Perdut a la cuina?",
    lostDescription:
      "Prova un dels enllaços següents o torna al tauler principal.",
    staffManagement: "Gestió del personal",
    scheduleManagement: "Gestió d’horaris",
    settings: "Configuració",
    errorCode: "Codi d’error:",
  },
  "500": {
    title: "500 Error intern del servidor",
    description: "Alguna cosa ha anat malament.",
  },
};

const public_feed = {
  resultsFound: "{{count}} resultats trobats",
  sortBy: "Ordenar per",
  sortOptions: {
    default: "Per defecte",
    rating_low: "Valoració: de menor a major",
    rating_high: "Valoració: de major a menor",
  },
  searchHero: {
    title: "Deixa de buscar un restaurant - troba’l.",
    searchPlaceholder: "Cerca restaurants, cuines o ubicacions...",
  },
  sidebar: {
    filterTitle: "Filtra",
    clearFilters: "Esborra filtres",
    locationTitle: "Ubicació",
    locationPlaceholder: "Andorra la Vella, AD 500",
    typeTitle: "Tipus",
    typeOptions: {
      all: "Tots",
      restaurants: "Restaurants",
      coffeeShops: "Cafeteries",
    },
    tagsTitle: "Etiquetes",
  },
};

const business_page = {
  header: {
    reserve_table_button: "Reserva una taula",
  },
  info_cards: {
    rating_title: "Valoració",
    status_title: "Estat",
    status_open_now: "Obert ara",
    status_closes_at: "Tanca a les {{time}}",
    location_title: "Ubicació",
    view_on_map_button: "Veure al mapa",
  },
  menu: {
    section_title: "Menú",
    categories: {
      coffee_drinks: "Cafè i Begudes",
      food: "Menjar",
    },
  },
  timing: {
    section_title: "Horari d'obertura",
  },
  contact: {
    section_title: "Contacte i Xarxes socials",
    buttons: {
      instagram: "Instagram",
      facebook: "Facebook",
      website: "Web",
    },
  },
};

const menu_management = {
  actions: {
    add_category: "Afegir categoria",
    add_item: "Afegir article",
    save_changes: "Guardar canvis",
    move_to_category: "Moure a categoria",
    delete_category: "Eliminar categoria",
  },
  labels: {
    simple_view: "Simple",
    organize_view: "Organitzar",
    menu_hints: "Suggeriments del menú",
    no_items: "Encara no hi ha articles. Fes clic a \"Afegir article\" per començar.",
    no_items_category: "Encara no hi ha articles en aquesta categoria.",
    items_count: "{{count}} articles",
    add_first_item: "Afegeix el teu primer article",
    critical: "Crític",
    high: "Alt",
    medium: "Mitjà",
    low: "Baix",
    go_back_menus: "Tornar a tots els menús",
  },
  messages: {
    delete_category_confirm: "Estàs segur que vols eliminar aquesta categoria? Aquesta acció no es pot desfer i eliminarà tots els articles que contingui.",
    delete_item_confirm_title: "Eliminar article?",
    delete_item_confirm_desc: "Això eliminarà permanentment \"{{name}}\".",
    move_item_select_category: "Selecciona la categoria on vols moure aquest article.",
  },
  modal: {
    create_title: "Crear nou menú",
    edit_title: "Editar menú",
    name: "Nom",
    description: "Descripció",
    icon: "Icona",
    start_date: "Data d'inici",
    end_date: "Data de fi",
    start_time: "Hora d'inici",
    end_time: "Hora de fi",
    repeat: "Repetir",
    repeat_yearly: "Repetir anualment",
    select_all_days: "Seleccionar tots els dies",
    unselect_all_days: "Deseleccionar tots els dies",
    update_button: "Actualitzar menú",
    create_button: "Crear menú",
    tooltips: {
      icon: "Tria una icona per representar aquest menú.",
      date_empty: "Deixar buit per a un menú sempre actiu.",
      time_empty: "Deixar buit per a un menú actiu tot el dia.",
    }
  },
  list: {
    title: "Els teus Menús",
    description: "Fes clic en un menú per gestionar les seves categories i articles. Afegeix nous menús per començar!",
    remaining_menus: "Pots crear {{count}} menú més amb la teva subscripció.",
    remaining_menus_plural: "Pots crear {{count}} menús més amb la teva subscripció.",
    limit_reached: "Has assolit el límit de menús per a la teva subscripció.",
    upgrade: "Actualitzar pla",
    no_menus_title: "Encara no hi ha menús",
    no_menus_desc: "Crea el teu primer menú per començar a organitzar els teus articles.",
    create_menu: "Crear menú",
    categories_count: "{{count}} Categoria",
    categories_count_plural: "{{count}} Categories",
    items_count: "{{count}} Article",
    items_count_plural: "{{count}} Articles",
    hints: "Suggeriments",
    more_hints: "+{{count}} més",
    manage_menu_hint: "Fes clic per obrir i gestionar aquest menú.",
    create_new_menu_card: "Crear nou menú",
  }
};

const item_modal = {
  create_title: "Crear nou article",
  edit_title: "Editar article",
  copy_label: "Copiar d'articles existents",
  copy_hint: "Selecciona un article per pre-emplenar el formulari. Tots els camps segueixen sent editables",
  name: "Nom",
  description: "Descripció",
  price: "Preu",
  allergies: "Al·lèrgies",
  images: "Imatges",
  tracking: {
    label: "Seguiment",
    tooltip: "Tria com es vincula aquest article amb el teu inventari.",
    none: "Cap",
    none_desc: "Sense seguiment d'inventari per a aquest article.",
    direct: "Vincle directe",
    direct_desc: "Aquest article del menú correspon directament a un article de l'inventari (ex: un article \"Coca Cola\" està vinculat a una \"Llauna de Coca\").",
    link_existing: "Vincular article existent",
    create_new: "Crear nou article d'inventari",
    unit: "Unitat",
    unit_placeholder: "Seleccionar unitat",
    quantity_per_sale: "Quina quantitat es consumeix per venda?",
    quantity_hint: "Si es ven en litres i aquest article usa 0.5 L, introdueix 0.5",
  }
};

const inventory_management = {
  title: "Gestió d'Inventari",
  add_item: "Afegir Article",
  edit_item: "Editar Article",
  delete_item: "Eliminar Article",
  adjust_stock: "Ajustar Estoc",
  groups: "Grups",
  manage_groups: "Gestionar Grups",
  add_group: "Afegir Grup",
  edit_group: "Editar Grup",
  delete_group: "Eliminar Grup",
  items: "Articles",
  low_stock: "Estoc Baix",
  all_items: "Tots els Articles",
  table: {
    name: "Nom",
    quantity: "Quantitat",
    unit: "Unitat",
    group: "Grup",
    threshold: "Llindar",
    last_updated: "Actualitzat",
    actions: "Accions",
  },
  form: {
    name: "Nom de l'Article",
    description: "Descripció",
    quantity: "Quantitat",
    unit: "Unitat",
    threshold: "Llindar d'Alerta",
    group: "Grup",
    no_group: "Sense Grup",
  },
  adjust: {
    title: "Ajustar Estoc per a {{name}}",
    current: "Quantitat Actual",
    adjustment: "Ajust",
    adjustment_placeholder: "ex: 5 o -2",
    reason: "Raó",
    reason_placeholder: "ex: Reabastiment, Mermes, etc.",
    new_quantity: "Nova Quantitat",
  },
  messages: {
    delete_item_confirm: "Estàs segur que vols eliminar aquest article? Això també l'eliminarà de tots els articles del menú vinculats.",
    delete_group_confirm: "Estàs segur que vols eliminar aquest grup? Els articles d’aquest grup es mouran a 'Per Defecte'.",
    no_items: "No s’han trobat articles.",
    no_groups: "No s’han trobat grups.",
  }
};

export default {
  landing_page,
  errors,
  public_feed,
  auth_page,
  business_page,
  shared,
  menu_management,
  item_modal,
  inventory_management,
};
