import { Runtime, Inspector, Library } from "./runtime.js";

//use fieldbook import for ui
import ui from "./52b2eb85b6b641b0@286.js";
let set = null;
let del = null;
const ui_module = new Runtime().module(ui, (name) => {
  if (name === "viewof list")
    return new Inspector(document.querySelector("#fieldbook-sidebar"));
  if (name === "set")
    return {
      fulfilled(d) {
        set = d;
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

const cache = {};
const config = {};

const root = document.getElementById("fieldbook-root");

//custom files resolver
const Files = () => {
  return (name) => {
    return `./files/${name}`;
  };
};
const overloadedLibrary = Object.assign(new Library(), { Files });
const runtime = new Runtime(overloadedLibrary);
const main = runtime.module();
const Compiler = index.js.Compiler;
const compile = new Compiler();

//For debuggin on browser console
window.debug = { main, cache, compile, config };

const updateUi = () => {
  set(config.settings);
};

const rebuildUi = (d) => {
  config.settings = d;
  config.settings.map((c, i) => {
    let item = cache[c.handle];
    if (item) {
      item.container.style.order = i;
      item.container.style.display = c.hide ? "none" : "block";
    }
  });
  socket.emit("save", config.settings);
};

const getObjectByHandle = (handle) => {
  let found = false;
  config.settings.map((d) => {
    if (d.handle == handle) {
      found = d;
    }
  });
  if (found) {
    return found;
  } else {
    return {
      hide: false,
      order: 0,
    };
  }
};

const observer_resolver = (handle) => {
  return (name) => {
    const does_exist = typeof cache[handle] !== "undefined";
    const settings_obj = getObjectByHandle(handle);
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
      container.style.order = settings_obj.order; // can be set by user in ui
      container.style.display = settings_obj.hide ? "none" : "display"; // can be set by user in ui
      root.appendChild(container);
      cache[handle] = {
        observer,
        container,
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
    }
  });
  if (found === false) {
    config.settings.push({
      group,
      name,
      handle,
      hide: false,
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
    }
  }
  // update ui!!
  updateUi();
};

const socket = io("http://localhost:3000/");
socket.on("event", handler);
socket.on("settings", (data) => {
  config.settings = data || [];
  socket.emit("ready");
});
