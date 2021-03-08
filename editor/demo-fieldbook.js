export default {
  settings: [
    {
      group: "unnamed",
      name: "notes",
      handle: "unnamed_notes",
      hide: false,
      resize_x: 10,
      resize_y: 10,
      resize_w: 500,
      resize_h: 220,
      text:
        "md`# Hello! \n\nThis is a fieldbook canvas! click on the eye icon to enter viewer mode! and click again to return to the editor mode, you can layout the cells as needed, adjsut z-order from left pane, hide or show by right clicking them. Edit code and save it locally. Hover the name to see the delete icon, create cells by ctrl+y/u/i; one big caveat is cell names exist for all types of cells, but only named ones can be referenced!`",
    },
    {
      group: "named",
      name: "data_chooser",
      handle: "named_data_chooser",
      hide: false,
      resize_x: 275,
      resize_y: 240,
      resize_w: 670,
      resize_h: 110,
      text: "viewof chooseData",
    },
    {
      group: "named",
      name: "control_2",
      handle: "named_control_2",
      hide: false,
      resize_x: 630,
      resize_y: 420,
      resize_w: 540,
      resize_h: 170,
      text: "viewof sankeyParameters",
    },
    {
      group: "named",
      name: "control_1",
      handle: "named_control_1",
      hide: false,
      resize_x: 310,
      resize_y: 420,
      resize_w: 300,
      resize_h: 130,
      text: "viewof virtualLinkType",
    },
    {
      group: "named",
      name: "chart",
      handle: "named_chart",
      hide: false,
      resize_x: 100,
      resize_y: 600,
      resize_w: 1120,
      resize_h: 620,
      text: "finalGraph",
    },
    {
      group: "imports",
      name: "sankey_imports",
      handle: "imports_sankey_imports",
      hide: true,
      resize_x: 0,
      resize_y: 0,
      resize_w: 400,
      resize_h: 200,
      text:
        "import {viewof chooseData, viewof object,viewof virtualLinkType,finalGraph,viewof sankeyParameters} from 'https://api.observablehq.com/@tomshanley/sankey-circular-deconstructed.js?v=3'",
    },
  ],
  meta: { resize_x: 400, resize_y: 200, resize_h: 300 },
};
