async function fieldbook(config) {
  const Compiler = window.index.js.Compiler;
  const Runtime = observablehq.Runtime;
  const Inspector = observablehq.Inspector;
  const cache = {};
  const root = document.getElementById("fieldbook-root");

  const runtime = new Runtime();
  const main = runtime.module();
  const compile = new Compiler(
    async (path) => {
      return (await import(path)).default;
    },
    (d) => d,
    (d) => d
  );

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
        container = document.createElement("div");
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
            "translate3d(" + x + "px," + y + "px,0px)";
          if (w && h) {
            container.style.width = w + "px";
            container.style.height = h + "px";
          }
          container.setAttribute("data-x", x);
          container.setAttribute("data-y", y);
        }

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
      set_active_cell_index(null);
      set_active_cell_index(0);
    }
    // issue: socket disconnects and reconnects when switching tabs
    // triggers add all over again, fix by renaming them to change, if already present
    if (typeof cache[handle] !== "undefined" && type == "add") {
      type = "change";
    }

    if (group == "named") {
      const markup = name + " = " + (text || "void 0");
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
      const markup = (text || "void 0") + "";
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
  };

  //on initial load..
  config.settings.map((d) => {
    handler({
      type: "add",
      cellName: d.name,
      data: d.text,
      group: d.group,
    });
  });

  return { cache, config, main, compile };
}
