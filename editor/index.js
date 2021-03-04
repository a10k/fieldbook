import { Runtime, Inspector, Library } from "./runtime.js";
import ui from "./ui.js"; //"https://api.observablehq.com/@a10k/observable-fieldbook.js?v=3";
const Compiler = window.index.js.Compiler;
const interact = window.interact;

function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const current_book = getParameterByName("fieldbook") || "fieldbook";
const cache = {};
// prettier-ignore
const demo = JSON.stringify({"settings":[{"group":"unnamed","name":"notes","handle":"unnamed_notes","hide":false,"resize_x":10,"resize_y":10,"resize_w":500,"resize_h":220,"text":"md`# Hello \n\nThis is a fieldbook canvas! click on the eye icon to enter viewer mode! and click again to return to the editor mode, you can layout the cells as needed, adjsut z-order from left pane, hide or show by right clicking them. Edit code and save it locally. Hover the name to see the delete icon, create cells by ctrl+y/u/i; one big caveat is cell names exist for all types of cells, but only named ones can be referenced!`"},{"group":"named","name":"data_chooser","handle":"named_data_chooser","hide":false,"resize_x":275,"resize_y":240,"resize_w":670,"resize_h":110,"text":"viewof chooseData"},{"group":"named","name":"control_2","handle":"named_control_2","hide":false,"resize_x":630,"resize_y":420,"resize_w":540,"resize_h":170,"text":"viewof sankeyParameters"},{"group":"named","name":"control_1","handle":"named_control_1","hide":false,"resize_x":310,"resize_y":420,"resize_w":300,"resize_h":130,"text":"viewof virtualLinkType"},{"group":"named","name":"chart","handle":"named_chart","hide":false,"resize_x":100,"resize_y":600,"resize_w":1120,"resize_h":620,"text":"finalGraph"},{"group":"imports","name":"sankey_imports","handle":"imports_sankey_imports","hide":true,"resize_x":0,"resize_y":0,"resize_w":400,"resize_h":200,"text":"import {viewof chooseData, viewof object,viewof virtualLinkType,finalGraph,viewof sankeyParameters} from '@tomshanley/sankey-circular-deconstructed'"}],"meta":{}})
const empty = '{"settings":[],"meta":{}}';

let config = JSON.parse(localStorage.getItem(current_book) || demo);
let eye_toggle = true;
const root = document.getElementById("fieldbook-root");
const editor_container = document.getElementById("fieldbook-editor");
const editor_placeholder = document.getElementById(
  "fieldbook-editor-placeholder"
);
let theme = {
  base: "vs-dark",
  inherit: true,
  rules: [
    {
      background: "272822",
      token: "",
    },
    {
      foreground: "75715e",
      token: "comment",
    },
    {
      foreground: "e6db74",
      token: "string",
    },
    {
      foreground: "ae81ff",
      token: "constant.numeric",
    },
    {
      foreground: "ae81ff",
      token: "constant.language",
    },
    {
      foreground: "ae81ff",
      token: "constant.character",
    },
    {
      foreground: "ae81ff",
      token: "constant.other",
    },
    {
      foreground: "f92672",
      token: "keyword",
    },
    {
      foreground: "f92672",
      token: "storage",
    },
    {
      foreground: "66d9ef",
      fontStyle: "italic",
      token: "storage.type",
    },
    {
      foreground: "a6e22e",
      fontStyle: "underline",
      token: "entity.name.class",
    },
    {
      foreground: "a6e22e",
      fontStyle: "italic underline",
      token: "entity.other.inherited-class",
    },
    {
      foreground: "a6e22e",
      token: "entity.name.function",
    },
    {
      foreground: "fd971f",
      fontStyle: "italic",
      token: "variable.parameter",
    },
    {
      foreground: "f92672",
      token: "entity.name.tag",
    },
    {
      foreground: "a6e22e",
      token: "entity.other.attribute-name",
    },
    {
      foreground: "66d9ef",
      token: "support.function",
    },
    {
      foreground: "66d9ef",
      token: "support.constant",
    },
    {
      foreground: "66d9ef",
      fontStyle: "italic",
      token: "support.type",
    },
    {
      foreground: "66d9ef",
      fontStyle: "italic",
      token: "support.class",
    },
    {
      foreground: "f8f8f0",
      background: "f92672",
      token: "invalid",
    },
    {
      foreground: "f8f8f0",
      background: "ae81ff",
      token: "invalid.deprecated",
    },
    {
      foreground: "cfcfc2",
      token: "meta.structure.dictionary.json string.quoted.double.json",
    },
    {
      foreground: "75715e",
      token: "meta.diff",
    },
    {
      foreground: "75715e",
      token: "meta.diff.header",
    },
    {
      foreground: "f92672",
      token: "markup.deleted",
    },
    {
      foreground: "a6e22e",
      token: "markup.inserted",
    },
    {
      foreground: "e6db74",
      token: "markup.changed",
    },
    {
      foreground: "ae81ffa0",
      token: "constant.numeric.line-number.find-in-files - match",
    },
    {
      foreground: "e6db74",
      token: "entity.name.filename.find-in-files",
    },
  ],
  colors: {
    "editor.foreground": "#F8F8F2",
    "editor.background": "#272822",
    "editor.selectionBackground": "#49483E",
    "editor.lineHighlightBackground": "#3E3D32",
    "editorCursor.foreground": "#F8F8F0",
    "editorWhitespace.foreground": "#3B3A32",
    "editorIndentGuide.activeBackground": "#9D550FB0",
    "editor.selectionHighlightBorder": "#222218",
  },
};
monaco.editor.defineTheme("monokai", theme);
var editor = monaco.editor.create(editor_placeholder, {
  value: ["function x() {", '\tconsole.log("Hello world!");', "}"].join("\n"),
  language: "javascript",
  wordWrap: true,
  theme: "monokai",
});

let set = null;
let set_active_cell_index = null;
let active_cell_index = null;
const ui_module = new Runtime().module(ui, (name) => {
  if (name === "viewof list")
    return new Inspector(document.querySelector("#fieldbook-sidebar"));
  if (name === "viewof editor_header")
    return new Inspector(document.querySelector("#fieldbook-editor-label"));
  if (name === "set")
    return {
      fulfilled(d) {
        set = d;
        //on initial load..
        config.settings.map((d) => {
          handler({
            type: "add",
            cellName: d.name,
            data: d.text,
            group: d.group,
          });
        });
      },
    };
  if (name === "set_active_cell_index")
    return {
      fulfilled(d) {
        set_active_cell_index = d;
      },
    };
  if (name === "active_cell_index")
    return {
      fulfilled(d) {
        active_cell_index = d;
        if (active_cell_index === null) {
          editor_container.style.display = "none";
        } else {
          let tmp =
            config.settings[active_cell_index] &&
            config.settings[active_cell_index].text;
          if (tmp !== void 0) {
            editor_container.style.display = "block";
            editor.layout();
            editor.getModel().setValue(tmp);
          }
        }
      },
    };
  if (name === "settings")
    return {
      fulfilled(d) {
        rebuildUi(d);
      },
    };
  return true;
});

ui_module.redefine(
  "eye_toggle",
  () =>
    function () {
      eye_toggle = !eye_toggle;
      document
        .querySelector("body")
        .setAttribute("class", eye_toggle ? "" : "close_eyes");
      set_active_cell_index(null);
      Object.values(debug.cache).map((d) =>
        d.interact_instance
          .resizable({
            enabled: eye_toggle,
          })
          .draggable({
            enabled: eye_toggle,
          })
      );
    }
);

const runtime = new Runtime();
const main = runtime.module();
const compile = new Compiler();

const updateUi = () => {
  set(config.settings);
};

const rebuildUi = (d) => {
  config.settings = d;
  config.settings.map((c, i) => {
    let item = cache[c.handle];
    if (item) {
      item.container.style.zIndex = 1000000 - i;
      item.container.style.display = c.hide ? "none" : "inline-block";
    }
  });
};

const getIndextByHandle = (handle) => {
  let found = -1;
  config.settings.map((d, i) => {
    if (d.handle == handle) {
      found = i;
    }
  });
  return found;
};

const removeByHandle = (handle) => {
  const i = getIndextByHandle(handle);
  if (i > -1) {
    config.settings.splice(i, 1);
  }
};

const observer_resolver = (handle) => {
  return (name) => {
    const does_exist = typeof cache[handle] !== "undefined";
    const settings_index = getIndextByHandle(handle);
    const settings_obj =
      settings_index > -1
        ? config.settings[settings_index]
        : { hide: false, order: 0 };
    let container;
    let observer;
    if (does_exist) {
      container = cache[handle].container;
      observer = cache[handle].observer;
    } else {
      const label = document.createElement("div");
      label.innerHTML = handle.replace(/^.*?_/, "");
      label.setAttribute(
        "class",
        "fieldbook-label " + handle.replace(/_.*$/, "")
      );

      label.addEventListener("click", () => {
        set_active_cell_index(getIndextByHandle(handle));
      });

      container = document.createElement("div");
      container.appendChild(label);
      observer = Inspector.into(container);
      container.setAttribute("class", "fielbook-cell " + handle);
      container.style.zIndex = 1000000 - settings_obj.order; // can be set by user in ui
      container.style.display = settings_obj.hide ? "none" : "inline-block"; // can be set by user in ui
      root.appendChild(container);

      //apply settings if they exist
      if (settings_index > -1) {
        let x = config.settings[settings_index].resize_x || 0;
        let y = config.settings[settings_index].resize_y || 0;
        let w = config.settings[settings_index].resize_w;
        let h = config.settings[settings_index].resize_h;
        container.style.webkitTransform = container.style.transform =
          "translate(" + x + "px," + y + "px)";
        if (w && h) {
          container.style.width = w + "px";
          container.style.height = h + "px";
        }
        container.setAttribute("data-x", x);
        container.setAttribute("data-y", y);
      }

      let interact_instance = interact(container)
        .resizable({
          // resize from all edges and corners
          edges: { left: true, right: true, bottom: true, top: true },

          listeners: {
            move(event) {
              var target = event.target;
              var x = parseFloat(target.getAttribute("data-x")) || 0;
              var y = parseFloat(target.getAttribute("data-y")) || 0;

              // update the element's style
              target.style.width = event.rect.width + "px";
              target.style.height = event.rect.height + "px";

              // translate when resizing from top or left edges
              x += event.deltaRect.left;
              y += event.deltaRect.top;

              target.style.webkitTransform = target.style.transform =
                "translate(" + x + "px," + y + "px)";

              target.setAttribute("data-x", x);
              target.setAttribute("data-y", y);
              //target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height)
            },
            end(event) {
              var target = event.target;
              var x = parseFloat(target.getAttribute("data-x")) || 0;
              var y = parseFloat(target.getAttribute("data-y")) || 0;
              let settings_index = getIndextByHandle(handle);
              config.settings[settings_index].resize_x = x;
              config.settings[settings_index].resize_y = y;
              config.settings[settings_index].resize_w = event.rect.width;
              config.settings[settings_index].resize_h = event.rect.height;
            },
          },
          modifiers: [
            // minimum size
            interact.modifiers.restrictSize({
              min: { width: 50, height: 50 },
            }),
          ],

          inertia: true,
        })
        .draggable({
          listeners: {
            move(event) {
              var target = event.target;
              // keep the dragged position in the data-x/data-y attributes
              var x =
                (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
              var y =
                (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

              // translate the element
              target.style.webkitTransform = target.style.transform =
                "translate(" + x + "px, " + y + "px)";

              // update the posiion attributes
              target.setAttribute("data-x", x);
              target.setAttribute("data-y", y);
            },
            end(event) {
              var target = event.target;
              // keep the dragged position in the data-x/data-y attributes
              var x =
                (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
              var y =
                (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

              let settings_index = getIndextByHandle(handle);
              config.settings[settings_index].resize_x = x;
              config.settings[settings_index].resize_y = y;
            },
          },
          ignoreFrom: ".observablehq",
        });

      cache[handle] = {
        observer,
        container,
        interact_instance,
      };
    }

    return observer(name);
  };
};

const def = async (m, h) => {
  compile.cell(m).then((obj) => {
    const define = obj.define;
    const vars = define(main, observer_resolver(h));
    cache[h].vars = vars;
  });
};

const rdef = async (m, h) => {
  compile.cell(m).then((obj) => {
    const redefine = obj.redefine;
    redefine(main);
  });
};

const handler = async (data) => {
  const group = data.group;
  const name = data.cellName;
  const text = data.data;
  const handle = `${group}_${name}`.replace(/ /g, "_");
  let type = data.type;

  // add to settings if not present
  let found = false;
  config.settings.map((f) => {
    if (f.handle == handle) {
      found = true;
      f.text = text;
    }
  });
  if (found === false) {
    config.settings.splice(0, 0, {
      group,
      name,
      handle,
      hide: false,
      resize_x: 0,
      resize_y: 0,
      resize_w: 400,
      resize_h: 200,
      text,
    });
  }
  // issue: socket disconnects and reconnects when switching tabs
  // triggers add all over again, fix by renaming them to change, if already present
  if (typeof cache[handle] !== "undefined" && type == "add") {
    type = "change";
  }

  if (group == "named") {
    const markup = name + " = " + (text || "null");
    if (type == "add") {
      def(markup, handle);
    } else if (type == "change") {
      rdef(markup, handle);
    } else if (type == "unlink") {
      cache[handle].vars.map((v) => v.delete());
      cache[handle].container.remove();
      delete cache[handle];
      removeByHandle(handle);
    }
  } else if (group == "unnamed" || group == "imports") {
    const markup = (text || "null") + "";
    if (type == "add" && markup.length) {
      def(markup, handle);
    } else if (type == "change") {
      if (typeof cache[handle] != void 0) {
        cache[handle].vars && cache[handle].vars.map((v) => v.delete());
        cache[handle].container &&
          cache[handle].container
            .querySelectorAll(".observablehq")
            .forEach((e) => e.parentNode.removeChild(e));
      }
      def(markup, handle);
    } else if (type == "unlink") {
      if (typeof cache[handle] != void 0) {
        cache[handle].vars && cache[handle].vars.map((v) => v.delete());
        cache[handle].container && cache[handle].container.remove();
      }
      delete cache[handle];
      removeByHandle(handle);
    }
  }
  // update ui!!
  updateUi();
};

const keyboard_shortcuts = function (event) {
  if ((event.ctrlKey || event.metaKey) && event.key === "s") {
    //add, remove, modify should be applied locally to settings as well!?
    if (active_cell_index !== null) {
      let txt = editor.getValue();
      let tmp = config.settings[active_cell_index];
      handler({
        type: "change",
        cellName: tmp.name,
        data: txt,
        group: tmp.group,
      });
    }
    localStorage.setItem(current_book, JSON.stringify(config));
    event.preventDefault();
  } else if ((event.ctrlKey || event.metaKey) && (event.key === "y" || event.code == "KeyY")) {
    var input_name = prompt("Create a named cell:", "");
    if (input_name == null || input_name == "") {
    } else {
      handler({
        type: "add",
        cellName: input_name,
        data: "",
        group: "named",
      });
    }
    event.preventDefault();
  } else if ((event.ctrlKey || event.metaKey) &&  (event.key === "u" || event.code == "KeyU")) {
    var input_name = prompt("Create a unnamed cell:", "");
    if (input_name == null || input_name == "") {
    } else {
      handler({
        type: "add",
        cellName: input_name,
        data: "",
        group: "unnamed",
      });
    }
    event.preventDefault();
  } else if ((event.ctrlKey || event.metaKey) &&  (event.key === "i" || event.code == "KeyI")) {
    var input_name = prompt("Create a import cell:", "");
    if (input_name == null || input_name == "") {
    } else {
      handler({
        type: "add",
        cellName: input_name,
        data: "",
        group: "imports",
      });
    }
    event.preventDefault();
  }
};
editor.onKeyDown(keyboard_shortcuts)
document.addEventListener("keydown", keyboard_shortcuts);

ui_module.redefine("del", () => (curr) => {
  let tmp = config.settings[curr];
  handler({
    type: "unlink",
    cellName: tmp.name,
    data: "",
    group: tmp.group,
  });
  set_active_cell_index(null);
});

let x = config.meta["resize_x"] || 0;
let y = config.meta["resize_y"] || 0;
let w = config.meta["resize_w"] || 500;
let h = config.meta["resize_h"] || 500;
editor_container.style.webkitTransform = editor_container.style.transform =
  "translate(" + x + "px," + y + "px)";
if (w && h) {
  editor_container.style.width = w + "px";
  editor_container.style.height = h + "px";
}
editor_container.setAttribute("data-x", x);
editor_container.setAttribute("data-y", y);
let editor_interact_instance = interact(editor_container)
  .resizable({
    // resize from all edges and corners
    edges: { left: true, right: true, bottom: true, top: true },

    listeners: {
      move(event) {
        var target = event.target;
        var x = parseFloat(target.getAttribute("data-x")) || 0;
        var y = parseFloat(target.getAttribute("data-y")) || 0;

        // update the element's style
        target.style.width = event.rect.width + "px";
        target.style.height = event.rect.height + "px";

        // translate when resizing from top or left edges
        x += event.deltaRect.left;
        y += event.deltaRect.top;

        target.style.webkitTransform = target.style.transform =
          "translate(" + x + "px," + y + "px)";

        target.setAttribute("data-x", x);
        target.setAttribute("data-y", y);

        editor.layout();
      },
      end(event) {
        var target = event.target;
        var x = parseFloat(target.getAttribute("data-x")) || 0;
        var y = parseFloat(target.getAttribute("data-y")) || 0;
        config.meta["resize_x"] = x;
        config.meta["resize_y"] = y;
        config.meta["resize_w"] = event.rect.width;
        config.meta["resize_h"] = event.rect.height;
      },
    },
    modifiers: [
      // minimum size
      interact.modifiers.restrictSize({
        min: { width: 10, height: 10 },
      }),
    ],

    inertia: true,
  })
  .draggable({
    listeners: {
      move(event) {
        var target = event.target;
        // keep the dragged position in the data-x/data-y attributes
        var x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
        var y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

        // translate the element
        target.style.webkitTransform = target.style.transform =
          "translate(" + x + "px, " + y + "px)";

        // update the posiion attributes
        target.setAttribute("data-x", x);
        target.setAttribute("data-y", y);
      },
      end(event) {
        var target = event.target;
        // keep the dragged position in the data-x/data-y attributes
        var x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
        var y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

        config.meta["resize_x"] = x;
        config.meta["resize_y"] = y;
      },
    },
    ignoreFrom: "#fieldbook-editor-placeholder",
  });

//For debuggin on browser console
window.debug = { main, cache, compile, config, editor };
