const Koa = require("koa");
const koaStatic = require("koa-static");
const http = require("http");
const app = new Koa();
const opn = require("opn");
const puppeteer = require("puppeteer");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const router = new Router();
const fs = require("fs");

let browser;

(async () => {
  browser = await puppeteer.launch({ headless: true });
})();

app.use(bodyParser());
router.post("/snapshot", async (ctx) => {
  await screens(ctx.request.body);
  ctx.body = {
    status: "OK",
  };
});

app.use(router.routes());
app.use(koaStatic("./editor")); //static server for editor
app.use(koaStatic("./viewer")); //static server for viewer
app.listen(3000); //http
//opn("http://localhost:3000");

const screens = async (jsn) => {
  const dir = `./snapshots/${jsn.meta._NAME || "tmp"}_${+new Date()}`;
  const page = await browser.newPage();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  await page.goto("http://localhost:3000/viewer.html");
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
      div.style.transform = "translate(0px, -28px)";
      let setting = f.config.settings.find((d) => d.handle == ki);
      return setting;
    }, ik);
    if (!setting.hide) {
      await page.setViewport({
        width: setting.resize_w,
        height: setting.resize_h - 28,
        deviceScaleFactor: 3,
      });
      await page.screenshot({
        path: `${dir}/${setting.handle}.png`,
      });
    }
  }
  await page.close();
};
