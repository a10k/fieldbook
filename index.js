const args = process.argv;
const chokidar = require("chokidar");
const Koa = require("koa");
const koaStatic = require("koa-static");
const http = require("http");
const fs = require("fs");
const path = require("path");
const opn = require("opn");

const app = new Koa();
const server = http.createServer(app.callback());
const io = require("socket.io")(server);

let root;
if (args.length !== 3) {
  console.log("npm run-script open PATH-TO-FIELDBOOK (no trailing slash)");
  process.exit(1);
} else {
  root = args[2];
}
io.on("connection", (client) => {
  const settings = readSettings();
  console.log("ws connected");
  client.emit("settings", settings);

  client.on("ready", () => {
    console.log("ws ready");
    const watcherConfig = { ignored: [/\/\./], persistent: true };
    const watcher_unnamed = chokidar.watch(
      root + "/src/unnamed",
      watcherConfig
    );
    watcher_unnamed
      .on("add", function (path) {
        change_handler("unnamed", client, "add", path);
      })
      .on("change", function (path) {
        change_handler("unnamed", client, "change", path);
      })
      .on("unlink", function (path) {
        change_handler("unnamed", client, "unlink", path);
      })
      .on("error", function (error) {
        change_handler("unnamed", client, "error", error);
      });
    const watcher_named = chokidar.watch(root + "/src/named", watcherConfig);
    watcher_named
      .on("add", function (path) {
        change_handler("named", client, "add", path);
      })
      .on("change", function (path) {
        change_handler("named", client, "change", path);
      })
      .on("unlink", function (path) {
        change_handler("named", client, "unlink", path);
      })
      .on("error", function (error) {
        change_handler("named", client, "error", error);
      });

    const watcher_import = chokidar.watch(root + "/src/imports", watcherConfig);
    watcher_import
      .on("add", function (path) {
        change_handler("imports", client, "add", path);
      })
      .on("change", function (path) {
        change_handler("imports", client, "change", path);
      })
      .on("unlink", function (path) {
        change_handler("imports", client, "unlink", path);
      })
      .on("error", function (error) {
        change_handler("imports", client, "error", error);
      });

    client.on("disconnect", () => {
      watcher_named.unwatch(root + "/src/named");
      watcher_named.close();
      watcher_unnamed.unwatch(root + "/src/unnamed");
      watcher_unnamed.close();
      watcher_import.unwatch(root + "/src/imports");
      watcher_import.close();
      console.log("ws disconnect");
    });
  });
});

const getCellName = (filePath) => {
  const baseName = path.basename(filePath);
  return baseName.replace(/\.ojs$/, "");
};

const change_handler = (group, client, type, file) => {
  const data =
    type == "unlink" || type == "error"
      ? void 0
      : fs.readFileSync(file, { encoding: "utf8", flag: "r" }) || null;
  const cellName = getCellName(file);
  console.log("fs", type, group, cellName);
  client.emit("event", {
    type,
    cellName,
    data,
    group,
  });
};

const readSettings = () => {
  const file = root + "/settings.json";
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, { encoding: "utf8", flag: "r" });
      const json = JSON.parse(data);
      return json;
    }
  } catch (err) {
    return [];
  }
};

app.use(koaStatic(root)); //static server
app.use(koaStatic("./editor")); //static server for editor
server.listen(3000); //socket.io+http
opn("http://localhost:3000");
