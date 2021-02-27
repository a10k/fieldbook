const Koa = require("koa");
const koaStatic = require("koa-static");
const http = require("http");
const app = new Koa();
const server = http.createServer(app.callback());
const opn = require("opn");
app.use(koaStatic("./editor")); //static server for editor
server.listen(3000); //http
opn("http://localhost:3000");