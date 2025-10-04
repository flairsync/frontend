const shared = {
  days: {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
  },
};

const landing_page = {
  header: {
    navLinks: {
      home_tab_title: "Inicio",
      businesses_tab_title: "Negocios",
      features_tab_title: "Funciones",
      solution_tab_title: "Solución",
      integration_tab_title: "Integración",
      pricing_tab_title: "Precios",
      faq_tab_title: "FAQ",
    },
    joinUsButton: "Únete a nosotros",
    findBusinessButton: "Encuentra tu negocio favorito",
  },
  hero: {
    title: "Mejora la gestión de tu café y restaurante",
    subtitle:
      "La forma más fácil de gestionar tu flujo de trabajo y colaborar con tu equipo sin problemas.",
    trialButton: "Comenzar prueba gratuita",
    explainButton: "Ver cómo funciona",
  },

  features: {
    globalTitle: "Todo lo que necesitas para gestionar tu café y restaurante",
    globalSubtitle:
      "Desde menús hasta personal, inventario y descubrimiento de clientes: gestiona todo en una sola plataforma elegante. Ahorra tiempo, reduce costos y enfócate en ofrecer excelentes comidas y experiencias mientras nosotros manejamos las operaciones.",
    inventoryManagement: {
      title: "Gestión de inventario",
      subtitle:
        "Monitorea los ingredientes en tiempo real, recibe alertas de bajo stock y simplifica los pedidos a proveedores para mantener tu cocina funcionando sin problemas.",
    },
    staffManagement: {
      title: "Gestión de personal",
      subtitle:
        "Crea y comparte horarios del personal en minutos, gestiona turnos y sigue la asistencia, todo desde un solo lugar. Adiós al caos de último minuto.",
    },
  },

  problemSolution: {
    title: "Conocemos los retos de manejar un restaurante",
    subtitle:
      "Gestionar personal, controlar el inventario, actualizar menús y fidelizar clientes puede ser abrumador. Por eso creamos una herramienta simple todo-en-uno diseñada para cafés y restaurantes.",
    leftPanelTitle: "Cómo podemos ayudarte a hacer crecer tu negocio",
    solutions: [
      {
        id: 1,
        title: "Controla fácilmente el inventario",
        description:
          "Mantén tu stock actualizado, recibe alertas de bajo inventario y reordena ingredientes sin esfuerzo.",
        cardTitle: "Gestión de inventario",
        cardDescription:
          "Monitorea los ingredientes en tiempo real, recibe alertas de bajo stock y simplifica los pedidos a proveedores para mantener tu cocina funcionando sin problemas.",
      },
      {
        id: 2,
        title: "Gestiona los horarios del personal",
        description:
          "Crea y comparte turnos, controla la asistencia y comunícate fácilmente con tu equipo.",
        cardTitle: "Gestión de personal",
        cardDescription:
          "Crea y comparte horarios del personal en minutos, gestiona turnos y sigue la asistencia, todo desde un solo lugar.",
      },
      {
        id: 3,
        title: "Actualiza menús rápidamente",
        description:
          "Agrega nuevos artículos, elimina los antiguos y actualiza precios sin complicaciones.",
        cardTitle: "Gestión de menús",
        cardDescription:
          "Gestiona fácilmente tu menú y mantén tus ofertas actualizadas para tus clientes.",
      },
      {
        id: 4,
        title: "Fomenta la lealtad de los clientes",
        description:
          "Involucra a tus clientes y haz que regresen con ofertas personalizadas.",
        cardTitle: "Compromiso con el cliente",
        cardDescription:
          "Crea programas de lealtad, sigue las preferencias de los clientes y mejora la retención.",
      },
    ],
  },
  integration: {
    title: "Configuración sencilla, sin complicaciones",
    subtitle:
      "Sin integraciones complicadas. Solo crea tu cuenta, configura los detalles de tu negocio y empieza a gestionar todo desde un solo lugar, de inmediato.",
    buttonText: "Reservar una demo",
    mainCard: {
      title: "Prevención de sobregiros",
      status: "Actualmente activo",
      progress: "93%",
      progressLabel: "Progreso semanal",
    },
  },
  pricing: {
    title: "¡Elige el plan que se adapte a ti!",
    monthly_label: "Facturación mensual",
    yearly_label: "Facturación anual (41% de descuento)",
    billed_note:
      "*Facturado anualmente, impuestos de la aplicación no incluidos",
    choose_plan_button: "Elegir plan",
  },
  faq: {
    title: "Preguntas frecuentes",
    subtitle:
      "¿Tienes preguntas? Tenemos respuestas. Aquí están algunas de las preguntas más comunes de propietarios de restaurantes y cafés sobre nuestra plataforma.",
    cta_button: "¿Tienes más preguntas?",
  },

  footer: {
    logo: "FlairSync",
    follow_us: "Síguenos",
    quick_links_title: "Enlaces rápidos",
    quick_links: [
      "Inicio",
      "Acerca de nosotros",
      "Integraciones",
      "Funciones",
      "Precios",
      "Contáctanos",
    ],
    support_title: "Soporte",
    support_links: [
      "FAQ",
      "Centro de soporte",
      "Política de privacidad",
      "Términos",
    ],
    contact_title: "Contacto",
    contact_address_line1: "Andorra La Vella, AD500, Andorra",
    contact_phone: "+376 123 456",
    newsletter_title: "Suscríbete a nuestro boletín",
    newsletter_placeholder: "Ingresa tu correo electrónico",
    copyright: "© {{year}} FlairSync. Todos los derechos reservados.",
  },
};

const auth_page = {
  signin_page_title: "Inicia sesión en tu cuenta",
  please_login_label: "Ingresa tus datos para iniciar sesión en tu cuenta",
  email_label: "Correo electrónico",
  password_label: "Contraseña",
  stay_signedin_label: "Mantener sesión iniciada",
  signin_button_label: "Iniciar sesión",
  or_label: "o",
  signin_with_google_label: "Iniciar sesión con Google",
  need_account_label: "¿No tienes una cuenta?",
  create_account_label: "Crea una",

  register: {
    signup_page_title: "Crea tu cuenta",
    signup_page_subtitle: "Ingresa tus datos para comenzar con FlairSync",
    email_label: "Correo electrónico",
    password_label: "Contraseña",
    signup_button_label: "Registrarse",
    or_label: "o",
    signin_with_google_label: "Iniciar sesión con Google",
    already_have_account_label: "¿Ya tienes una cuenta?",
    signin_instead_label: "Inicia sesión en su lugar",
  },
};

const errors = {
  "404": {
    title: "Página no encontrada",
    description:
      "No podemos encontrar la página que buscas. Puede haber sido movida, renombrada o nunca haber existido.",
    quickSearch: "Búsqueda rápida",
    searchPlaceholder: "Buscar páginas, personal o configuraciones...",
    searchButton: "Buscar",
    goToDashboard: "Ir al panel",
    contactSupport: "Contactar soporte",
    reportError:
      "Si crees que esto es un error, repórtalo y lo investigaremos.",
    lostTitle: "¿Perdido en la cocina?",
    lostDescription:
      "Prueba uno de los enlaces a continuación o vuelve al panel principal.",
    staffManagement: "Gestión de personal",
    scheduleManagement: "Gestión de horarios",
    settings: "Configuraciones",
    errorCode: "Código de error:",
  },
  "500": {
    title: "500 Error interno del servidor",
    description: "Algo salió mal.",
  },
};

const public_feed = {
  resultsFound: "{{count}} resultados encontrados",
  sortBy: "Ordenar por",
  sortOptions: {
    default: "Predeterminado",
    rating_low: "Calificación: de menor a mayor",
    rating_high: "Calificación: de mayor a menor",
  },
  searchHero: {
    title: "Deja de buscar un restaurante - encuéntralo.",
    searchPlaceholder: "Buscar restaurantes, cocinas o ubicaciones...",
  },
  sidebar: {
    filterTitle: "Filtrar",
    clearFilters: "Limpiar filtros",
    locationTitle: "Ubicación",
    locationPlaceholder: "Andorra la Vella, AD 500",
    typeTitle: "Tipo",
    typeOptions: {
      all: "Todos",
      restaurants: "Restaurantes",
      coffeeShops: "Cafeterías",
    },
    tagsTitle: "Etiquetas",
  },
};

const business_page = {
  header: {
    reserve_table_button: "Reservar una mesa",
  },
  info_cards: {
    rating_title: "Calificación",
    status_title: "Estado",
    status_open_now: "Abierto ahora",
    status_closes_at: "Cierra a las {{time}}",
    location_title: "Ubicación",
    view_on_map_button: "Ver en el mapa",
  },
  menu: {
    section_title: "Menú",
    categories: {
      coffee_drinks: "Café & Bebidas",
      food: "Comida",
    },
  },
  timing: {
    section_title: "Horario de apertura",
  },
  contact: {
    section_title: "Contacto y redes sociales",
    buttons: {
      instagram: "Instagram",
      facebook: "Facebook",
      website: "Sitio web",
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
