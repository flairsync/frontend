const shared = {};

const landing_header = {
  home_tab_title: "Inicio",
  features_tab_title: "Funciones",
  solution_tab_title: "Solución",
  integration_tab_title: "Integración",
  pricing_tab_title: "Precios",
  faq_tab_title: "Preguntas frecuentes",
  join_us_tab_title: "Únete a nosotros",
};

const landing_hero = {
  landing_hero_title: "Mejora la gestión de tu café y restaurante",
  landing_hero_subtitle:
    "La forma más sencilla de gestionar tu flujo de trabajo y colaborar con tu equipo sin complicaciones.",
  landing_hero_trial_bt: "Comenzar prueba gratuita",
  landing_hero_explain_bt: "Ver cómo funciona",
};

const features_sections = {
  feature_global_title:
    "Todo lo que necesitas para gestionar tu café y restaurante",
  feature_global_subtitle:
    "Desde menús hasta personal, inventario y descubrimiento de clientes — gestiona todo en una sola plataforma elegante. Ahorra tiempo, reduce costos y concéntrate en ofrecer buena comida y experiencias mientras nosotros nos ocupamos de las operaciones.",
  inventory_management_title: "Gestión de inventario",
  inventory_management_subtitle:
    "Supervisa los ingredientes en tiempo real, recibe alertas de bajo stock y simplifica los pedidos a proveedores para que tu cocina funcione sin problemas.",
  staff_management_title: "Gestión de personal",
  staff_management_subtitle:
    "Crea y comparte horarios del personal en minutos, gestiona turnos y controla la asistencia — todo desde un solo lugar. Di adiós al caos de último minuto.",
};

export default {
  ...shared,
  ...landing_header,
  ...landing_hero,
  ...features_sections,
};
