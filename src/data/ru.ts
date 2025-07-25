// src/data/maps/ru.ts

export default {
    main_settings: {
        width: "responsive",
        background_color: "#FFFFFF",
        background_transparent: "yes",
        border_color: "#ffffff",
        state_description: "State description",
        state_color: "#1e5b8f",
        state_hover_color: "#3B729F",
        state_url: "",
        border_size: 1.5,
        all_states_inactive: "no",
        all_states_zoomable: "yes",
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
        label_color: "#ffffff",
        label_hover_color: "#ffffff",
        label_size: 30,
        label_font: "Arial",
        label_display: "auto",
        label_scale: "no",
        hide_labels: "no",
        hide_eastern_labels: "no",
        zoom: "yes",
        manual_zoom: "yes",
        back_image: "no",
        initial_back: "no",
        initial_zoom: "-1",
        initial_zoom_solo: "no",
        region_opacity: 1,
        region_hover_opacity: 0.6,
        zoom_out_incrementally: "yes",
        zoom_percentage: 0.99,
        zoom_time: 0.5,
        popup_color: "white",
        popup_opacity: 0.9,
        popup_shadow: 1,
        popup_corners: 5,
        popup_font: "12px/1.5 Verdana, Arial, Helvetica, sans-serif",
        popup_nocss: "no",
        div: "map",
        auto_load: "yes",
        url_new_tab: "no",
        images_directory: "default",
        fade_time: 0.1,
        link_text: "View Website",
        popups: "off", // <--- САМОЕ ВАЖНОЕ ИЗМЕНЕНИЕ
        state_image_url: "",
        state_image_position: "",
        location_image_url: ""
    },
    // Этот блок уникален для России и остается без изменений
    state_specific: {
        RUBEL: { name: "Белгородская область", color: "#FFB74D", url: "javascript:handleMapClick('RUBEL')" },
        RUBRY: { name: "Брянская область", color: "#FFA726", url: "javascript:handleMapClick('RUBRY')" },
        RUVLA: { name: "Владимирская область", color: "#FF9800", url: "javascript:handleMapClick('RUVLA')" },
        RUVOR: { name: "Воронежская область", color: "#FB8C00", url: "javascript:handleMapClick('RUVOR')" },
        RUIVA: { name: "Ивановская область", color: "#FFA726", url: "javascript:handleMapClick('RUIVA')" },
        RUKLU: { name: "Калужская область", color: "#FFB74D", url: "javascript:handleMapClick('RUKLU')" },
        RUKOS: { name: "Костромская область", color: "#FF9800", url: "javascript:handleMapClick('RUKOS')" },
        RUKRS: { name: "Курская область", color: "#FB8C00", url: "javascript:handleMapClick('RUKRS')" },
        RULIP: { name: "Липецкая область", color: "#FFA726", url: "javascript:handleMapClick('RULIP')" },
        RUMOW: { name: "Москва", color: "#F57C00", url: "javascript:handleMapClick('RUMOW')" },
        RUMOS: { name: "Московская область", color: "#FF9800", url: "javascript:handleMapClick('RUMOS')" },
        RUORL: { name: "Орловская область", color: "#FFB74D", url: "javascript:handleMapClick('RUORL')" },
        RURYA: { name: "Рязанская область", color: "#FFA726", url: "javascript:handleMapClick('RURYA')" },
        RUSMO: { name: "Смоленская область", color: "#FB8C00", url: "javascript:handleMapClick('RUSMO')" },
        RUTAM: { name: "Тамбовская область", color: "#FF9800", url: "javascript:handleMapClick('RUTAM')" },
        RUTVE: { name: "Тверская область", color: "#FFA726", url: "javascript:handleMapClick('RUTVE')" },
        RUTUL: { name: "Тульская область", color: "#FFB74D", url: "javascript:handleMapClick('RUTUL')" },
        RUYAR: { name: "Ярославская область", color: "#FB8C00", url: "javascript:handleMapClick('RUYAR')" },
        RUARK: { name: "Архангельская область", color: "#29B6F6", url: "javascript:handleMapClick('RUARK')" },
        RUVLG: { name: "Вологодская область", color: "#03A9F4", url: "javascript:handleMapClick('RUVLG')" },
        RUKGD: { name: "Калининградская область", color: "#039BE5", url: "javascript:handleMapClick('RUKGD')" },
        RUKR:  { name: "Республика Карелия", color: "#0288D1", url: "javascript:handleMapClick('RUKR')" },
        RUKO:  { name: "Республика Коми", color: "#0277BD", url: "javascript:handleMapClick('RUKO')" },
        RULEN: { name: "Ленинградская область", color: "#03A9F4", url: "javascript:handleMapClick('RULEN')" },
        RUMUR: { name: "Мурманская область", color: "#29B6F6", url: "javascript:handleMapClick('RUMUR')" },
        RUNEN: { name: "Ненецкий АО", color: "#4FC3F7", url: "javascript:handleMapClick('RUNEN')" },
        RUNGR: { name: "Новгородская область", color: "#039BE5", url: "javascript:handleMapClick('RUNGR')" },
        RUPSK: { name: "Псковская область", color: "#0288D1", url: "javascript:handleMapClick('RUPSK')" },
        RUSPE: { name: "Санкт-Петербург", color: "#01579B", url: "javascript:handleMapClick('RUSPE')" },
        RUAD:  { name: "Республика Адыгея", color: "#9CCC65", url: "javascript:handleMapClick('RUAD')" },
        RUAST: { name: "Астраханская область", color: "#8BC34A", url: "javascript:handleMapClick('RUAST')" },
        RUVGG: { name: "Волгоградская область", color: "#7CB342", url: "javascript:handleMapClick('RUVGG')" },
        RUKL:  { name: "Республика Калмыкия", color: "#689F38", url: "javascript:handleMapClick('RUKL')" },
        RUKDA: { name: "Краснодарский край", color: "#558B2F", url: "javascript:handleMapClick('RUKDA')" },
        RUROS: { name: "Ростовская область", color: "#33691E", url: "javascript:handleMapClick('RUROS')" },
        RUDA: { name: "Республика Дагестан", color: "#E53935", url: "javascript:handleMapClick('RUDA')" },
        RUIN: { name: "Республика Ингушетия", color: "#F44336", url: "javascript:handleMapClick('RUIN')" },
        RUKB: { name: "Кабардино-Балкарская Республика", color: "#D32F2F", url: "javascript:handleMapClick('RUKB')" },
        RUKC: { name: "Карачаево-Черкесская Республика", color: "#C62828", url: "javascript:handleMapClick('RUKC')" },
        RUSE: { name: "Республика Северная Осетия — Алания", color: "#B71C1C", url: "javascript:handleMapClick('RUSE')" },
        RUSTA:{ name: "Ставропольский край", color: "#D32F2F", url: "javascript:handleMapClick('RUSTA')" },
        RUCE: { name: "Чеченская Республика", color: "#E53935", url: "javascript:handleMapClick('RUCE')" },
        RUBA:  { name: "Республика Башкортостан", color: "#26A69A", url: "javascript:handleMapClick('RUBA')" },
        RUKIR: { name: "Кировская область", color: "#009688", url: "javascript:handleMapClick('RUKIR')" },
        RUME:  { name: "Республика Марий Эл", color: "#00897B", url: "javascript:handleMapClick('RUME')" },
        RUMO:  { name: "Республика Мордовия", color: "#00796B", url: "javascript:handleMapClick('RUMO')" },
        RUNIZ: { name: "Нижегородская область", color: "#00695C", url: "javascript:handleMapClick('RUNIZ')" },
        RUORE: { name: "Оренбургская область", color: "#004D40", url: "javascript:handleMapClick('RUORE')" },
        RUPNZ: { name: "Пензенская область", color: "#00897B", url: "javascript:handleMapClick('RUPNZ')" },
        RUPER: { name: "Пермский край", color: "#26A69A", url: "javascript:handleMapClick('RUPER')" },
        RUSAM: { name: "Самарская область", color: "#00796B", url: "javascript:handleMapClick('RUSAM')" },
        RUSAR: { name: "Саратовская область", color: "#009688", url: "javascript:handleMapClick('RUSAR')" },
        RUTA:  { name: "Республика Татарстан", color: "#00695C", url: "javascript:handleMapClick('RUTA')" },
        RUUD:  { name: "Удмуртская Республика", color: "#00897B", url: "javascript:handleMapClick('RUUD')" },
        RUULY: { name: "Ульяновская область", color: "#26A69A", url: "javascript:handleMapClick('RUULY')" },
        RUCU:  { name: "Чувашская Республика", color: "#009688", url: "javascript:handleMapClick('RUCU')" },
        RUKGN: { name: "Курганская область", color: "#AB47BC", url: "javascript:handleMapClick('RUKGN')" },
        RUSVE: { name: "Свердловская область", color: "#9C27B0", url: "javascript:handleMapClick('RUSVE')" },
        RUTYU: { name: "Тюменская область", color: "#8E24AA", url: "javascript:handleMapClick('RUTYU')" },
        RUKHM: { name: "Ханты-Мансийский АО — Югра", color: "#7B1FA2", url: "javascript:handleMapClick('RUKHM')" },
        RUCHE: { name: "Челябинская область", color: "#6A1B9A", url: "javascript:handleMapClick('RUCHE')" },
        RUYAN: { name: "Ямало-Ненецкий АО", color: "#4A148C", url: "javascript:handleMapClick('RUYAN')" },
        RUAL:  { name: "Республика Алтай", color: "#7E57C2", url: "javascript:handleMapClick('RUAL')" },
        RUALT: { name: "Алтайский край", color: "#673AB7", url: "javascript:handleMapClick('RUALT')" },
        RUIRK: { name: "Иркутская область", color: "#5E35B1", url: "javascript:handleMapClick('RUIRK')" },
        RUKEM: { name: "Кемеровская область", color: "#512DA8", url: "javascript:handleMapClick('RUKEM')" },
        RUKYA: { name: "Красноярский край", color: "#4527A0", url: "javascript:handleMapClick('RUKYA')" },
        RUNVS: { name: "Новосибирская область", color: "#311B92", url: "javascript:handleMapClick('RUNVS')" },
        RUOMS: { name: "Омская область", color: "#512DA8", url: "javascript:handleMapClick('RUOMS')" },
        RUTOM: { name: "Томская область", color: "#5E35B1", url: "javascript:handleMapClick('RUTOM')" },
        RUTY:  { name: "Республика Тыва", color: "#673AB7", url: "javascript:handleMapClick('RUTY')" },
        RUKK:  { name: "Республика Хакасия", color: "#7E57C2", url: "javascript:handleMapClick('RUKK')" },
        RUAMU: { name: "Амурская область", color: "#EC407A", url: "javascript:handleMapClick('RUAMU')" },
        RUBU:  { name: "Республика Бурятия", color: "#E91E63", url: "javascript:handleMapClick('RUBU')" },
        RUYEV: { name: "Еврейская АО", color: "#D81B60", url: "javascript:handleMapClick('RUYEV')" },
        RUZAB: { name: "Забайкальский край", color: "#C2185B", url: "javascript:handleMapClick('RUZAB')" },
        RUKAM: { name: "Камчатский край", color: "#AD1457", url: "javascript:handleMapClick('RUKAM')" },
        RUMAG: { name: "Магаданская область", color: "#880E4F", url: "javascript:handleMapClick('RUMAG')" },
        RUPRI: { name: "Приморский край", color: "#C2185B", url: "javascript:handleMapClick('RUPRI')" },
        RUSA:  { name: "Республика Саха (Якутия)", color: "#E91E63", url: "javascript:handleMapClick('RUSA')" },
        RUSAK: { name: "Сахалинская область", color: "#AD1457", url: "javascript:handleMapClick('RUSAK')" },
        RUKHA: { name: "Хабаровский край", color: "#D81B60", url: "javascript:handleMapClick('RUKHA')" },
        RUCHU: { name: "Чукотский АО", color: "rgba(236,64,122,0.85)", url: "javascript:handleMapClick('RUCHU')" }
    },
    locations: {},
    labels: {},
    legend: {
        entries: []
    },
    regions: {}
};