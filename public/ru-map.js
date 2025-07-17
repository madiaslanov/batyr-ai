var simplemaps_countrymap_mapdata = {
    main_settings: {
        //Общие настройки
        width: "responsive",
        background_color: "#FFFFFF",
        background_transparent: "yes",
        border_color: "#ffffff",
        
        //Настройки регионов по умолчанию
        state_description: "Регион России",
        state_color: "#88A4BC", // Цвет для регионов, если они не заданы
        state_hover_color: "#3B729F",
        state_url: "",
        border_size: 1.5,
        all_states_inactive: "no",
        all_states_zoomable: "yes",
        
        //Настройки локаций по умолчанию
        location_description: "Город",
        location_url: "",
        location_color: "#FF0067",
        location_opacity: 0.8,
        
        //Настройки подписей по умолчанию
        label_color: "#ffffff",
        label_hover_color: "#d_ffffff",
        label_size: 16,
        label_font: "Arial",
        label_display: "auto",
        
        //Настройки зума
        zoom: "yes",
        manual_zoom: "yes",
        initial_zoom: "-1",
        
        //Продвинутые настройки
        div: "map",
        auto_load: "yes",
        url_new_tab: "no",
        popups: "detect",
        link_text: "Подробнее"
    },
    state_specific: {
        // --- Центральный федеральный округ (Оранжевые/Янтарные) ---
        RUBEL: { name: "Белгородская область", color: "#FFB74D" },
        RUBRY: { name: "Брянская область", color: "#FFA726" },
        RUVLA: { name: "Владимирская область", color: "#FF9800" },
        RUVOR: { name: "Воронежская область", color: "#FB8C00" },
        RUIVA: { name: "Ивановская область", color: "#FFA726" },
        RUKLU: { name: "Калужская область", color: "#FFB74D" },
        RUKOS: { name: "Костромская область", color: "#FF9800" },
        RUKRS: { name: "Курская область", color: "#FB8C00" },
        RULIP: { name: "Липецкая область", color: "#FFA726" },
        RUMOW: { name: "Москва", color: "#F57C00" }, // Город федерального значения
        RUMOS: { name: "Московская область", color: "#FF9800" },
        RUORL: { name: "Орловская область", color: "#FFB74D" },
        RURYA: { name: "Рязанская область", color: "#FFA726" },
        RUSMO: { name: "Смоленская область", color: "#FB8C00" },
        RUTAM: { name: "Тамбовская область", color: "#FF9800" },
        RUTVE: { name: "Тверская область", color: "#FFA726" },
        RUTUL: { name: "Тульская область", color: "#FFB74D" },
        RUYAR: { name: "Ярославская область", color: "#FB8C00" },

        // --- Северо-Западный федеральный округ (Синие/Голубые) ---
        RUARK: { name: "Архангельская область", color: "#29B6F6" },
        RUVLG: { name: "Вологодская область", color: "#03A9F4" },
        RUKGD: { name: "Калининградская область", color: "#039BE5" },
        RUKR:  { name: "Республика Карелия", color: "#0288D1" },
        RUKO:  { name: "Республика Коми", color: "#0277BD" },
        RULEN: { name: "Ленинградская область", color: "#03A9F4" },
        RUMUR: { name: "Мурманская область", color: "#29B6F6" },
        RUNEN: { name: "Ненецкий АО", color: "#4FC3F7" },
        RUNGR: { name: "Новгородская область", color: "#039BE5" },
        RUPSK: { name: "Псковская область", color: "#0288D1" },
        RUSPE: { name: "Санкт-Петербург", color: "#01579B" }, // Город федерального значения

        // --- Южный федеральный округ (Зеленые/Салатовые) ---
        RUAD:  { name: "Республика Адыгея", color: "#9CCC65" },
        RUAST: { name: "Астраханская область", color: "#8BC34A" },
        RUVGG: { name: "Волгоградская область", color: "#7CB342" },
        RUKL:  { name: "Республика Калмыкия", color: "#689F38" },
        RUKDA: { name: "Краснодарский край", color: "#558B2F" },
        RUROS: { name: "Ростовская область", color: "#33691E" },
        
        // --- Северо-Кавказский федеральный округ (Красные/Бордовые) ---
        RUDA: { name: "Республика Дагестан", color: "#E53935" },
        RUIN: { name: "Республика Ингушетия", color: "#F44336" },
        RUKB: { name: "Кабардино-Балкарская Республика", color: "#D32F2F" },
        RUKC: { name: "Карачаево-Черкесская Республика", color: "#C62828" },
        RUSE: { name: "Республика Северная Осетия — Алания", color: "#B71C1C" },
        RUSTA:{ name: "Ставропольский край", color: "#D32F2F" },
        RUCE: { name: "Чеченская Республика", color: "#E53935" },
        
        // --- Приволжский федеральный округ (Бирюзовые/Цвет морской волны) ---
        RUBA:  { name: "Республика Башкортостан", color: "#26A69A" },
        RUKIR: { name: "Кировская область", color: "#009688" },
        RUME:  { name: "Республика Марий Эл", color: "#00897B" },
        RUMO:  { name: "Республика Мордовия", color: "#00796B" },
        RUNIZ: { name: "Нижегородская область", color: "#00695C" },
        RUORE: { name: "Оренбургская область", color: "#004D40" },
        RUPNZ: { name: "Пензенская область", color: "#00897B" },
        RUPER: { name: "Пермский край", color: "#26A69A" },
        RUSAM: { name: "Самарская область", color: "#00796B" },
        RUSAR: { name: "Саратовская область", color: "#009688" },
        RUTA:  { name: "Республика Татарстан", color: "#00695C" },
        RUUD:  { name: "Удмуртская Республика", color: "#00897B" },
        RUULY: { name: "Ульяновская область", color: "#26A69A" },
        RUCU:  { name: "Чувашская Республика", color: "#009688" },

        // --- Уральский федеральный округ (Фиолетовые/Сиреневые) ---
        RUKGN: { name: "Курганская область", color: "#AB47BC" },
        RUSVE: { name: "Свердловская область", color: "#9C27B0" },
        RUTYU: { name: "Тюменская область", color: "#8E24AA" },
        RUKHM: { name: "Ханты-Мансийский АО — Югра", color: "#7B1FA2" },
        RUCHE: { name: "Челябинская область", color: "#6A1B9A" },
        RUYAN: { name: "Ямало-Ненецкий АО", color: "#4A148C" },
        
        // --- Сибирский федеральный округ (Индиго/Лавандовые) ---
        RUAL:  { name: "Республика Алтай", color: "#7E57C2" },
        RUALT: { name: "Алтайский край", color: "#673AB7" },
        RUIRK: { name: "Иркутская область", color: "#5E35B1" },
        RUKEM: { name: "Кемеровская область", color: "#512DA8" },
        RUKYA: { name: "Красноярский край", color: "#4527A0" },
        RUNVS: { name: "Новосибирская область", color: "#311B92" },
        RUOMS: { name: "Омская область", color: "#512DA8" },
        RUTOM: { name: "Томская область", color: "#5E35B1" },
        RUTY:  { name: "Республика Тыва", color: "#673AB7" },
        RUKK:  { name: "Республика Хакасия", color: "#7E57C2" },
        
        // --- Дальневосточный федеральный округ (Пурпурные/Розовые) ---
        RUAMU: { name: "Амурская область", color: "#EC407A" },
        RUBU:  { name: "Республика Бурятия", color: "#E91E63" },
        RUYEV: { name: "Еврейская АО", color: "#D81B60" },
        RUZAB: { name: "Забайкальский край", color: "#C2185B" },
        RUKAM: { name: "Камчатский край", color: "#AD1457" },
        RUMAG: { name: "Магаданская область", color: "#880E4F" },
        RUPRI: { name: "Приморский край", color: "#C2185B" },
        RUSA:  { name: "Республика Саха (Якутия)", color: "#E91E63" },
        RUSAK: { name: "Сахалинская область", color: "#AD1457" },
        RUKHA: { name: "Хабаровский край", color: "#D81B60" },
        RUCHU: { name: "Чукотский АО", color: "#EC407A" }
    },
    locations: {
        "0": {
            name: "Москва",
            lat: "55.752222",
            lng: "37.615556"
        }
    },
    labels: {},
    legend: {
        entries: []
    },
    regions: {}
};