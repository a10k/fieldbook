import { Runtime, Inspector, Library } from "./runtime.js";
import ui from "https://api.observablehq.com/@a10k/observable-fieldbook.js?v=3";
const Compiler = window.index.js.Compiler;
const interact = window.interact;
const {
  EditorState,
  EditorView,
  basicSetup,
  javascript,
  defaultTabBinding,
  keymap,
} = window.cm;

const cache = {};
let config = { settings: [], meta: {} };
let eye_toggle = true;
const root = document.getElementById("fieldbook-root");
const editor_container = document.getElementById("fieldbook-editor");
const editor_placeholder = document.getElementById(
  "fieldbook-editor-placeholder"
);
const codemirror_extensions = [
  basicSetup,
  keymap.of([defaultTabBinding]),
  javascript(),
  EditorView.theme({
    $: {
      outline: "none",
      "font-size": "14px",
      color: "#32A897",
    },
    $gutters: {
      background: "#fff",
    },
    $matchingBracket: {
      "text-decoration": "underline",
      color: "#32A897",
    },
  }),
];
const codemirror = new EditorView({
  lineWrapping: true,
  state: EditorState.create({
    doc: "",
    extensions: codemirror_extensions,
  }),
});
editor_placeholder.appendChild(codemirror.dom);

let set = null;
let active_cell_index = null;
const ui_module = new Runtime().module(ui, (name) => {
  if (name === "viewof list")
    return new Inspector(document.querySelector("#fieldbook-sidebar"));
  if (name === "set")
    return {
      fulfilled(d) {
        set = d;
      },
    };
  if (name === "active_cell_index")
    return {
      fulfilled(d) {
        active_cell_index = d;
        let tmp =
          config.settings[active_cell_index] &&
          config.settings[active_cell_index].text;
        if (tmp !== void 0) {
          editor_container.style.display = "block";
          codemirror.setState(
            EditorState.create({
              doc: tmp,
              extensions: codemirror_extensions,
            })
          );
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
      editor_container.style.display = eye_toggle ? "block" : "none";
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

//custom files resolver
const Files = () => {
  return (name) => {
    return `./files/${name}`;
  };
};

const overloadedLibrary = Object.assign(new Library(), { Files });
const runtime = new Runtime(overloadedLibrary);
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

      container = document.createElement("div");
      container.appendChild(label);
      observer = Inspector.into(container);
      container.setAttribute("class", handle);
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
    config.settings.push({
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
    const markup = name + " = " + text;
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
    const markup = text + "";
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

const socket = io("http://localhost:3000/");
socket.on("event", handler);
socket.on("settings", (data) => {
  config = data || { settings: [], meta: {} };
  socket.emit("ready");
});

document.addEventListener("keydown", function (event) {
  if (event.ctrlKey && event.key === "s") {
    //add, remove, modify should be applied locally to settings as well!?
    if (active_cell_index !== null) {
      let txt = codemirror.state.doc.toString();
      config.settings[active_cell_index].text = txt;

      let tmp = config.settings[active_cell_index];
      socket.emit("edit", {
        file: tmp.name,
        folder: tmp.group,
        text: tmp.text,
      });
    }
    socket.emit("save", config);
    event.preventDefault();
  }else if(event.ctrlKey && event.key === "y"){
    var input_name = prompt("Create a named cell:", "");
    if (input_name == null || input_name == "") {
    } else {
      socket.emit("edit", {
        file: input_name,
        folder: "named",
        text: "",
      });
    }
    event.preventDefault();
  }else if(event.ctrlKey && event.key === "u"){
    var input_name = prompt("Create a unnamed cell:", "");
    if (input_name == null || input_name == "") {
    } else {
      socket.emit("edit", {
        file: input_name,
        folder: "unnamed",
        text: "",
      });
    }
    event.preventDefault();
  }else if(event.ctrlKey && event.key === "i"){
    var input_name = prompt("Create a import cell:", "");
    if (input_name == null || input_name == "") {
    } else {
      socket.emit("edit", {
        file: input_name,
        folder: "imports",
        text: "",
      });
    }
    event.preventDefault();
  }
});

ui_module.redefine("del", () => (curr) => {
  console.log("delete", config.settings[curr]);
  let tmp = config.settings[curr];
  socket.emit("delete", { file: tmp.name, folder: tmp.group });
  setTimeout(() => {
    socket.emit("save", config);
  }, 2000);
});

let x = localStorage.getItem("resize_x") || 0;
let y = localStorage.getItem("resize_y") || 0;
let w = localStorage.getItem("resize_w") || 500;
let h = localStorage.getItem("resize_h") || 500;
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
      },
      end(event) {
        var target = event.target;
        var x = parseFloat(target.getAttribute("data-x")) || 0;
        var y = parseFloat(target.getAttribute("data-y")) || 0;
        localStorage.setItem("resize_x", x);
        localStorage.setItem("resize_y", y);
        localStorage.setItem("resize_w", event.rect.width);
        localStorage.setItem("resize_h", event.rect.height);
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

        localStorage.setItem("resize_x", x);
        localStorage.setItem("resize_y", y);
      },
    },
    ignoreFrom: "#fieldbook-editor-placeholder",
  });

//For debuggin on browser console
window.debug = { main, cache, compile, config, codemirror };
