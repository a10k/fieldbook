const Koa = require("koa");
const koaStatic = require("koa-static");
const app = new Koa();
const puppeteer = require("puppeteer");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const router = new Router();
const fs = require("fs");
const { RemoveDuplicates } = require("@kingotten/remove-duplicates");

app.use(bodyParser());
router.post("/snapshot", async (ctx) => {
  screens(ctx.request.body);
  ctx.body = {
    status: "OK",
  };
});

app.use(router.routes());
app.use(koaStatic("./editor")); //static server for editor
app.use(koaStatic("./viewer")); //static server for viewer
app.listen(3000); //http

const screens = async (jsn) => {
  const date = new Date();
  const time = date
    .toTimeString()
    .replace(/(?<=:.*:.*) .*/g, "")
    .replace(/[:]+/g, "_");
  const date_str = date
    .toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    .replace(/[ ,]+/g, "_")
    .toUpperCase();
  const timestamp = `${date_str}_${time}`;
  const browser = await puppeteer.launch({ headless: true });
  const dir = `./snapshots/${jsn.meta._NAME || "tmp"}`;
  const page = await browser.newPage();
  if (!fs.existsSync("./snapshots")) {
    fs.mkdirSync("./snapshots");
  }
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
        width: Math.round(setting.resize_w),
        height: Math.round(setting.resize_h) - 28,
        deviceScaleFactor: 2,
      });
      await page.screenshot({
        path: `${dir}/${setting.handle}_${timestamp}.png`,
      });
    }
  }
  fs.writeFileSync(
    `${dir}/raw_${timestamp}.json`,
    JSON.stringify(jsn, null, 4)
  );

  //page.close();
  browser.close();

  RemoveDuplicates(dir, {
    dry_run: false, // run without deleting files
    recursive: false, // run in subfolders (does not compare to subfolders tho)
    depth: 1, // check 2 folders deep
    quiet: true, // run without logging information about the command
    filter: "", // regex filter performed on each filename
  });
};
