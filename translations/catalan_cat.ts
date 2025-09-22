const shared = {};

const landing_header = {
  home_tab_title: "Inici",
  features_tab_title: "Funcions",
  solution_tab_title: "Solució",
  integration_tab_title: "Integració",
  pricing_tab_title: "Preus",
  faq_tab_title: "Preguntes freqüents",
  join_us_tab_title: "Uneix-te a nosaltres",
};

const landing_hero = {
  landing_hero_title: "Millora la gestió del teu cafè i restaurant",
  landing_hero_subtitle:
    "La manera més fàcil de gestionar el teu flux de treball i col·laborar amb el teu equip sense complicacions.",
  landing_hero_trial_bt: "Comença la prova gratuïta",
  landing_hero_explain_bt: "Mira com funciona",
};

const features_sections = {
  feature_global_title:
    "Tot el que necessites per gestionar el teu cafè i restaurant",
  feature_global_subtitle:
    "Des de menús fins a personal, inventari i descobriment de clients — gestiona-ho tot en una sola plataforma elegant. Estalvia temps, redueix costos i centra’t en oferir bon menjar i experiències mentre nosaltres ens ocupem de les operacions.",
  inventory_management_title: "Gestió d’inventari",
  inventory_management_subtitle:
    "Controla els ingredients en temps real, rep alertes de poc estoc i simplifica les comandes als proveïdors perquè la teva cuina funcioni sense problemes.",
  staff_management_title: "Gestió de personal",
  staff_management_subtitle:
    "Crea i comparteix horaris del personal en minuts, gestiona torns i controla l’assistència — tot des d’un sol lloc. Digueu adéu al caos d’última hora.",
};

export default {
  ...shared,
  ...landing_header,
  ...landing_hero,
  ...features_sections,
};
