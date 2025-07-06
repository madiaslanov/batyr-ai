var simplemaps_countrymap_mapdata={
  main_settings: {
    //General settings
    width: "responsive",
    background_color: "#FFFFFF",
    background_transparent: "yes",
    border_color: "#ffffff",

    //State defaults
    state_description: "State description",
    state_color: "#1e5b8f",
    state_hover_color: "#3B729F",
    state_url: "",
    border_size: 1.5,
    all_states_inactive: "no",
    all_states_zoomable: "yes",

    //Location defaults
    location_description: "Location description",
    location_url: "",
    location_color: "#FF0067",
    location_opacity: 0.8,
    location_hover_opacity: 1,
    location_size: 25,
    location_type: "square",
    location_image_source: "frog.png",
    location_border_color: "#FFFFFF",
    location_border: 2,
    location_hover_border: 2.5,
    all_locations_inactive: "no",
    all_locations_hidden: "no",

    //Label defaults
    label_color: "#ffffff",
    label_hover_color: "#ffffff",
    label_size: 30,
    label_font: "Arial",
    label_display: "auto",
    label_scale: "no",
    hide_labels: "no",
    hide_eastern_labels: "no",

    //Zoom settings
    zoom: "yes",
    manual_zoom: "no",
    back_image: "no",
    initial_back: "no",
    initial_zoom: "-1",
    initial_zoom_solo: "no",
    region_opacity: 1,
    region_hover_opacity: 0.6,
    zoom_out_incrementally: "yes",
    zoom_percentage: 0.99,
    zoom_time: 0.5,

    //Popup settings
    popup_color: "white",
    popup_opacity: 0.9,
    popup_shadow: 1,
    popup_corners: 5,
    popup_font: "12px/1.5 Verdana, Arial, Helvetica, sans-serif",
    popup_nocss: "no",

    //Advanced settings
    div: "map",
    auto_load: "yes",
    url_new_tab: "no",
    images_directory: "default",
    fade_time: 0.1,
    link_text: "View Website",
    popups: "off",
    state_image_url: "",
    state_image_position: "",
    location_image_url: ""
  },
  state_specific: {
    KZ10: {
      name: "Абай облысы",
      color: "#A1887F",
      description: "Абай облысы — ұлы ақын Абайдың мекені, рухани мұра орталығы.",
      url: "javascript:handleMapClick('KZ10')"
    },
    KZ11: {
      name: "Ақмола облысы",
      color: "#90CAF9",
      description: "Ақмола облысы — еліміздің жүрегі, дала мен тарихтың түйіскен жері.",
      url: "javascript:handleMapClick('KZ11')"
    },
    KZ15: {
      name: "Ақтөбе",
      color: "#6D4C41",
      description: "Ақтөбе — батыс қақпасы, батырлар мен кен орындарының өлкесі.",
      url: "javascript:handleMapClick('KZ15')"
    },
    KZ19: {
      name: "Алматы облысы",
      color: "#66BB6A",
      description: "Алматы облысы — таулар мен табиғаттың тамаша үйлесімі.",
      url: "javascript:handleMapClick('KZ19')"
    },
    KZ23: {
      name: "Атырау",
      color: "#00897B",
      description: "Атырау — Каспий жағасындағы мұнайлы өңір, балықшылар мекені.",
      url: "javascript:handleMapClick('KZ23')"
    },
    KZ27: {
      name: "Орал",
      color: "#558B2F",
      description: "Орал — Еуропа мен Азия түйіскен ежелгі шаһар.",
      url: "javascript:handleMapClick('KZ27')"
    },
    KZ31: {
      name: "Жамбыл облысы",
      color: "#D84315",
      description: "Жамбыл облысы — көне Тараз, мыңжылдықтар елі.",
      url: "javascript:handleMapClick('KZ31')"
    },
    KZ33: {
      name: "Жетісу облысы",
      color: "#4DB6AC",
      description: "Жетісу облысы — жеті өзеннің өлкесі, мал шаруашылығы мен табиғат байлығы.",
      url: "javascript:handleMapClick('KZ33')"
    },
    KZ35: {
      name: "Қарағанды",
      color: "#424242",
      description: "Қарағанды — көмірлі өлке, еңбек ерлерінің жері.",
      url: "javascript:handleMapClick('KZ35')"
    },
    KZ39: {
      name: "Қостанай",
      color: "#8D6E63",
      description: "Қостанай — астықты аймақ, даланың алтыны.",
      url: "javascript:handleMapClick('KZ39')"
    },
    KZ43: {
      name: "Қызылорда",
      color: "#E53935",
      description: "Қызылорда — Сыр елінің кіндігі, бай тарих пен мәдениет ошағы.",
      url: "javascript:handleMapClick('KZ43')"
    },
    KZ47: {
      name: "Ақтау",
      color: "#F57C00",
      description: "Ақтау — Каспий жағасындағы қала, мұнай мен тастың мекені.",
      url: "javascript:handleMapClick('KZ47')"
    },
    KZ55: {
      name: "Павлодар",
      color: "#039BE5",
      description: "Павлодар — Ертіс бойындағы өндірісті аймақ.",
      url: "javascript:handleMapClick('KZ55')"
    },
    KZ59: {
      name: "Петропавл",
      color: "#5C6BC0",
      description: "Петропавл — солтүстіктегі тыныш, тарихи қала.",
      url: "javascript:handleMapClick('KZ59')"
    },
    KZ61: {
      name: "Түркістан",
      color: "#8E24AA",
      description: "Түркістан — түркі әлемінің рухани астанасы.",
      url: "javascript:handleMapClick('KZ61')"
    },
    KZ62: {
      name: "Ұлытау облысы",
      color: "#A1887F",
      description: "Ұлытау облысы — қазақ тарихының алтын бесігі.",
      url: "javascript:handleMapClick('KZ62')"
    },
    KZ63: {
      name: "Өскемен",
      color: "#E53935",
      description: "Өскемен — Алтай етегіндегі өндірісті және орманды өлке.",
      url: "javascript:handleMapClick('KZ63')"
    },
    KZ71: {
      name: "Астана",
      color: "#1E88E5",
      description: "Астана — заманауи елорда, болашақтың қаласы.",
      url: "javascript:handleMapClick('KZ71')"
    },
    KZ75: {
      name: "Алматы",
      color: "#43A047",
      description: "Алматы — мәдениет пен табиғаттың орталығы, бұрынғы астана.",
      url: "javascript:handleMapClick('KZ75')"
    },
    KZ79: {
      name: "Шымкент",
      color: "#FBC02D",
      description: "Шымкент — күншуақты оңтүстік, сауда мен мәдениеттің қайнаған ошағы.",
      url: "javascript:handleMapClick('KZ79')"
    }
  },
  locations: {},
  labels: {
    KZ10: {
      name: "Абай обл",
      parent_id: "KZ10"
    },
    KZ11: {
      name: "Ақмола обл",
      parent_id: "KZ11"
    },
    KZ15: {
      name: "Ақтөбе",
      parent_id: "KZ15"
    },
    KZ19: {
      name: "Алматы обл",
      parent_id: "KZ19"
    },
    KZ23: {
      name: "Атырау",
      parent_id: "KZ23"
    },
    KZ27: {
      name: "Орал",
      parent_id: "KZ27"
    },
    KZ31: {
      name: "Жамбыл",
      parent_id: "KZ31"
    },
    KZ33: {
      name: "Жетісу",
      parent_id: "KZ33"
    },
    KZ35: {
      name: "Қарағанды",
      parent_id: "KZ35"
    },
    KZ39: {
      name: "Қостанай",
      parent_id: "KZ39"
    },
    KZ43: {
      name: "Қызылорда",
      parent_id: "KZ43"
    },
    KZ47: {
      name: "Ақтау",
      parent_id: "KZ47"
    },
    KZ55: {
      name: "Павлодар",
      parent_id: "KZ55"
    },
    KZ59: {
      name: "Петропавл",
      parent_id: "KZ59"
    },
    KZ61: {
      name: "Түркістан",
      parent_id: "KZ61"
    },
    KZ62: {
      name: "Ұлытау",
      parent_id: "KZ62"
    },
    KZ63: {
      name: "Өскемен",
      parent_id: "KZ63"
    },
    KZ71: {
      name: "Астана",
      parent_id: "KZ71"
    },
    KZ75: {
      name: "Алматы",
      parent_id: "KZ75"
    },
    KZ79: {
      name: "Шымкент",
      parent_id: "KZ79"
    }
  },
  legend: {
    entries: []
  },
  regions: {}
};