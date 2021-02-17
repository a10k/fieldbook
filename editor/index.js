import { Runtime, Inspector, Library } from "./runtime.js";

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

const updateUi = ()=>{
  console.log(config.settings)
}

const observer_resolver = (handle) => {
  return (name) => {
    const does_exist = typeof cache[handle] !== "undefined";

    let container;
    let observer;
    if (does_exist) {
      container = cache[handle].container;
      observer = cache[handle].observer;
    } else {
      const label = document.createElement("div");
      label.innerHTML = handle.replace(/^.*_/, "");
      label.setAttribute(
        "class",
        "fieldbook-label " + handle.replace(/_.*$/, "")
      );

      container = document.createElement("div");
      container.appendChild(label);
      observer = Inspector.into(container);
      container.setAttribute("class", handle);
      container.style.order = 0; // can be set by user in ui
      container.style.display = "display"; // can be set by user in ui
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
  updateUi()
};

const socket = io("http://localhost:3000/");
socket.on("event", handler);
socket.on("settings", (data) => {
  config.settings = data || [];
  socket.emit("ready");
});
