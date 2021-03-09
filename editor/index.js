async function fieldbook() {
  const monaco = window.monaco;
  const Compiler = window.index.js.Compiler;
  const interact = window.interact;
  const Runtime = observablehq.Runtime;
  const Inspector = observablehq.Inspector;
  const ui = await import("./ui.js"); //"https://api.observablehq.com/@a10k/observable-fieldbook.js?v=3";

  let random_named = [];
  const current_book = getParameterByName("fieldbook") || "fieldbook";
  const cache = {};
  // prettier-ignore
  const demo = JSON.stringify((await import('./demo-fieldbook.js')).default)
  const empty = '{"settings":[],"meta":{}}';
  let config = JSON.parse(localStorage.getItem(current_book) || demo);
  let eye_toggle = true;
  const root = document.getElementById("fieldbook-root");
  const editor_container = document.getElementById("fieldbook-editor");
  const editor_placeholder = document.getElementById(
    "fieldbook-editor-placeholder"
  );
  let set = null;
  let set_active_cell_index = null;
  let active_cell_index = null;

  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  const get_random_named = (handle) => {
    if (random_named.length) {
    } else {
      //assign all again and cycle through
      random_named = (
        "🌺,💐,🌸,💮,🏵️,🌹,🥀,🌻,🌼,🌷,🍀,🌾,🍇,🍉,🍊,🍋,🍌,🍍,🥭,🍒,🥑," +
        "🍆,🍄,🥕,🍎,🎃,🎍,🎋,🎑,🍠,🥦,🥒,🌶️,🥬,🍑,🥝,🍈"
      ).split(",");
    }
    let rand = Math.floor(Math.random() * random_named.length);
    var item = random_named[rand];
    random_named.splice(rand, 1);
    return item;
  };

  monaco.editor.defineTheme(
    "monokai",
    (await import("./monokai-theme.js")).default
  );
  var editor = monaco.editor.create(editor_placeholder, {
    value: ["function x() {", '\tconsole.log("Hello world!");', "}"].join("\n"),
    language: "javascript",
    wordWrap: true,
    theme: "monokai",
  });

  const ui_module = new Runtime().module(ui.default, (name) => {
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
          set_min_height();
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
              editor.focus();
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
  const compile = new Compiler(
    async (path) => {
      return (await import(path)).default;
    },
    (d) => d,
    (d) => d
  );

  const set_min_height = () => {
    const bottoms = config.settings
      .filter((d) => !d.hide)
      .map((d) => d.resize_y + d.resize_h);
    const rights = config.settings
      .filter((d) => !d.hide)
      .map((d) => d.resize_x + d.resize_w);
    const min_h = Math.max.apply(null, bottoms) + 20;
    const min_w = Math.max.apply(null, rights) + 20;
    document.querySelector(
      "#fieldbook-root"
    ).style.minHeight = `calc(${min_h}px + 60vh)`; // add more empty space to scroll!
    document.querySelector("#fieldbook-root").style.minWidth = min_w + "px";
  };

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
        const icon = handle.match(/^unnamed_/)
          ? ""
          : handle.match(/^imports/)
          ? ""
          : config.settings[settings_index].icon;
        label.innerHTML = icon + "  " + handle.replace(/^.*?_/, "");
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
          let x =
            config.settings[settings_index].resize_x ||
            document.querySelector("#fieldbook-content").scrollLeft + 10;
          let y =
            config.settings[settings_index].resize_y ||
            document.querySelector("#fieldbook-content").scrollTop + 10;
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
                  "translate3d(" + x + "px," + y + "px,0px)";

                target.setAttribute("data-x", x);
                target.setAttribute("data-y", y);
                //target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height)
              },
              end(event) {
                var target = event.target;
                var x = parseFloat(target.getAttribute("data-x")) || 0;
                var y = parseFloat(target.getAttribute("data-y")) || 0;
                let settings_index = getIndextByHandle(handle);
                config.settings[settings_index].resize_x = Math.round(x);
                config.settings[settings_index].resize_y = Math.round(y);
                config.settings[settings_index].resize_w = Math.round(
                  event.rect.width
                );
                config.settings[settings_index].resize_h = Math.round(
                  event.rect.height
                );
                set_min_height();
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
                  "translate3d(" + x + "px, " + y + "px,0px)";

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
                config.settings[settings_index].resize_x = Math.round(x);
                config.settings[settings_index].resize_y = Math.round(y);
                set_min_height();
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
        if (!f.icon) {
          f.icon = get_random_named();
        }
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
        icon: get_random_named(),
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
    // update ui!!
    updateUi();
  };

  const save_snapshot = (n, jsn) => {
    try {
      jsn.meta._NAME = n;
      fetch("./snapshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsn),
      });
    } catch (e) {}
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
      save_snapshot(current_book, config);
      event.preventDefault();
    } else if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === "y" || event.code == "KeyY")
    ) {
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
    } else if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === "u" || event.code == "KeyU")
    ) {
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
    } else if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === "i" || event.code == "KeyI")
    ) {
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

  if (navigator.platform.indexOf("Mac") > -1) {
    //not required on mac!
  } else {
    editor.onKeyDown(keyboard_shortcuts);
  }
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
    "translate3d(" + x + "px," + y + "px,0px)";
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
            "translate3d(" + x + "px," + y + "px,0px)";

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
        start() {
          editor_container.style.backdropFilter = "none";
        },
        move(event) {
          var target = event.target;
          // keep the dragged position in the data-x/data-y attributes
          var x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
          var y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

          // translate the element
          target.style.webkitTransform = target.style.transform =
            "translate3d(" + x + "px, " + y + "px,0px)";

          // update the posiion attributes
          target.setAttribute("data-x", x);
          target.setAttribute("data-y", y);
        },
        end(event) {
          editor_container.style.backdropFilter = "";
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
}
fieldbook();
