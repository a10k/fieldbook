const Koa = require("koa");
const koaStatic = require("koa-static");
const cookie = require("koa-cookie");
const compiler = require("./editor/libs/compiler.js");
const app = new Koa();
const puppeteer = require("puppeteer");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const router = new Router();
const fs = require("fs");
const simpleGit = require("simple-git");
const rimraf = require("rimraf");

const BASE = __dirname;
const SECRET = ""; // Keep a cookie called to secret, document.cookie = "secret=..."
const EDITOR_MARKUP = fs.readFileSync(`${BASE}/editor/fieldbook.html`);
const VIEWER_MARKUP =
  fs.readFileSync(`${BASE}/viewer/viewer.html`) +
  `
<script>
function getPath() {
var p = window.location.pathname.replace(/^.*\\//, "");
return convertToValidFilename(p);
}

function convertToValidFilename(string) {
return string.replace(/[\\/|\\\\:*?"<>]/g, " ");
}
const page_name = getPath() || "fieldbook";
fetch(\`./\${page_name}/raw.json\`)
.then((d) => d.json())
.then(d=>{
  fieldbook(d)
})
.catch(e=>{})
</script>
`;

const authenticate = (cookie) => {
  if (!SECRET) {
    return true;
  } else {
    if (cookie && cookie.secret == SECRET) {
      return true;
    } else {
      return false;
    }
  }
};

app.use(bodyParser());

router.post("/snapshot", async (ctx) => {
  const cookies = ctx.cookie;
  if (authenticate(cookies)) {
    process_persistence_advanced(ctx.request.body);
  }
  ctx.body = {
    status: "OK",
  };
});

router.post("/snapshot_lite", async (ctx) => {
  const cookies = ctx.cookie;
  if (authenticate(cookies)) {
    process_persistence(ctx.request.body);
  }
  ctx.body = {
    status: "OK",
  };
});

app.use(async (ctx, next) => {
  try {
    await next();
    const status = ctx.status || 404;
    if (status === 404) {
      ctx.throw(404);
    }
  } catch (err) {
    const cookies = ctx.cookie;
    ctx.type = "html";
    if (authenticate(cookies)) {
      ctx.body = EDITOR_MARKUP;
    } else {
      // var page = ctx.path.replace(/^\//, "");
      // var target = `${BASE}/snapshots/${page || "fieldbook"}/standalone.html`;
      // if (fs.existsSync(target)) {
      //   ctx.body = fs.readFileSync(target);
      // } else {
      //   ctx.body = "";
      // }
      ctx.body = VIEWER_MARKUP;
    }
  }
});

app.use(cookie.default());
app.use(router.routes());
app.use(koaStatic(`${BASE}/editor`)); //static server for editor
app.use(koaStatic(`${BASE}/viewer`)); //static server for viewer
app.use(koaStatic(`${BASE}/cdn}`)); //static server for offline libs
app.use(koaStatic(`${BASE}/snapshots`)); //static server for offline libs
app.listen(80); //http

const generate_compiled_es = async (jsn) => {
  const resolve = async (path) => {
    return (await import(path)).default;
  };
  const compile = new compiler.Compiler(
    resolve,
    (d) => d,
    (d) => d
  );
  let str = "";
  jsn.settings.map((d) => {
    if (d.group == "named") {
      str += d.name;
      str += " = ";
      str += d.text;
      str += "\n\n";
    } else {
      str += d.text + "\n\n";
    }
  });

  let es = await compile.moduleToESModule(str);
  return es;
};

const generate_compiled_html = async (jsn, es) => {
  return `<!DOCTYPE html>
  <meta charset="utf-8" />
  <base href="/" target="_top" />
  <link rel="stylesheet" href="./styles.css" />
  <div id="fieldbook-export"></div>
  
  <script type="module">
  /* module begin */
  ${es.replace(/^export default /, "")}
  /* module end */
  
  /* raw config begin */
  const raw = ${JSON.stringify(jsn)};
  /* raw config end */
  
  import {
    Runtime,
    Inspector,
  } from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
  const root = document.getElementById("fieldbook-export");
  let counter = 0;
  let tmp = [];
  raw.settings.map((d) => {
    if (d.name.match(/^viewof /)) {
      tmp.push({ ...d, skip: false });
      tmp.push({ ...d, skip: true });
    } else if (d.name.match(/^mutable /)) {
      tmp.push({ ...d, skip: true });
      tmp.push({ ...d, skip: false });
    } else {
      tmp.push({ ...d, skip: false });
    }
  });
  new Runtime().module(define, (d) => {
    const ref = tmp[counter];
    counter++;
    if (ref.skip) {
      return true;
    } else {
      const div = document.createElement("div");
      div.setAttribute("class", ref.handle);
      div.style.position = "absolute";
      div.style.left = ref.resize_x + "px";
      div.style.top = ref.resize_y + "px";
      div.style.width = ref.resize_w + "px";
      div.style.height = ref.resize_h + "px";
      div.style.display = ref.hide ? "none" : "block";
      root.appendChild(div);
      return new Inspector(div);
    }
  });
  </script>
  `;
};

const process_persistence = async (jsn) => {
  //Create main folder if not present
  if (!fs.existsSync(`${BASE}/snapshots`)) {
    fs.mkdirSync(`${BASE}/snapshots`);
  }
  const dir = `${BASE}/snapshots/${jsn.meta._NAME || "tmp"}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  //Save the top level file
  fs.writeFileSync(`${dir}/raw.json`, JSON.stringify(jsn, null, 4));

  //Save as an ES Module for imports
  const es = await generate_compiled_es(jsn);
  fs.writeFileSync(`${dir}/es.js`, es);
};

const process_persistence_advanced = async (jsn) => {
  //Create main folder if not present
  if (!fs.existsSync(`${BASE}/snapshots`)) {
    fs.mkdirSync(`${BASE}/snapshots`);
  }

  const dir = `${BASE}/snapshots/${jsn.meta._NAME || "tmp"}`;

  //Create sub folders and init git
  let git;
  rimraf.sync(dir + "/named");
  rimraf.sync(dir + "/unnamed");
  rimraf.sync(dir + "/imports");
  rimraf.sync(dir + "/screenshots");

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    git = simpleGit(dir);
    await git.init();
  } else {
    git = simpleGit(dir);
  }

  //Save the top level file
  fs.writeFileSync(`${dir}/raw.json`, JSON.stringify(jsn, null, 4));

  //Save as an ES Module for imports
  const es = await generate_compiled_es(jsn);
  fs.writeFileSync(`${dir}/es.js`, es);

  //Save as an HTML for viewers
  const html = await generate_compiled_html(jsn, es);
  fs.writeFileSync(`${dir}/standalone.html`, html);

  //Save individual files
  jsn.settings.map((d, i) => {
    if (!fs.existsSync(`${dir}/${d.group}`)) {
      fs.mkdirSync(`${dir}/${d.group}`);
    }
    fs.writeFileSync(`${dir}/${d.group}/${d.name}.ojs`, d.text);
  });

  //save screenshots
  if (!fs.existsSync(dir + "/screenshots")) {
    fs.mkdirSync(dir + "/screenshots");
  }
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1/viewer.html");
  const f = await page.evaluate(async (jsn) => {
    const f = await fieldbook(jsn);
    await f.main._runtime._compute();
    await new Promise((resolve) => setTimeout(resolve, 4000)); //wait an additional few secs?!
    window.f = f;
    return f;
  }, jsn);

  let k = Object.keys(f.cache);
  for (var ik = 0; ik < k.length; ik++) {
    const setting = await page.evaluate((ik) => {
      let k = Object.keys(f.cache);
      let ki = k[ik];
      k.map((tki) => {
        f.cache[tki].container.style.display = "none"; //hideall
      });
      let div = f.cache[ki].container;
      div.style.display = "inline-block";
      div.style.transform = "translate(0px, 0px)";
      let setting = f.config.settings.find((d) => d.handle == ki);
      return setting;
    }, ik);
    if (!setting.hide) {
      await page.setViewport({
        width: Math.round(setting.resize_w),
        height: Math.round(setting.resize_h) - 28,
        deviceScaleFactor: 2,
      });
      await page.screenshot({
        path: `${dir + "/screenshots"}/${setting.handle}.png`,
      });
    }
  }
  browser.close();

  await git.add("*");
  await git.commit("Snapshot " + new Date());
};
