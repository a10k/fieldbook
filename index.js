const Koa = require("koa");
const koaStatic = require("koa-static");
const cookie = require("koa-cookie");
const app = new Koa();
const puppeteer = require("puppeteer");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const router = new Router();
const fs = require("fs");
const simpleGit = require("simple-git");
const rimraf = require("rimraf");
const BASE = __dirname;
const SECRET = "author";

app.use(bodyParser());
router.post("/snapshot", async (ctx) => {
  const cookies = ctx.cookie;
  if (cookies && cookies.secret === SECRET) {
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
    if (cookies && cookies.secret === SECRET) {
      ctx.body = fs.readFileSync(`${BASE}/editor/fieldbook.html`);
    } else {
      ctx.body =
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

const process_persistence = async (jsn) => {
  //Create main folder if not present
  if (!fs.existsSync(`${BASE}/snapshots`)) {
    fs.mkdirSync(`${BASE}/snapshots`);
  }

  const dir = `${BASE}/snapshots/${jsn.meta._NAME || "tmp"}`;

  //Create sub folders and init git
  let git;
  rimraf(dir + "/named", () => {});
  rimraf(dir + "/unnamed", () => {});
  rimraf(dir + "/imports", () => {});
  rimraf(dir + "/snapshots", () => {});

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    git = simpleGit(dir);
    await git.init();
  } else {
    git = simpleGit(dir);
  }
  //Save the top level file
  fs.writeFileSync(`${dir}/raw.json`, JSON.stringify(jsn, null, 4));
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
  await page.goto("http://localhost/viewer.html");
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
  await git.commit("Snapshot");
};
