import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { MeCab } from "https://deno.land/x/deno_mecab@v1.1.1/mod.ts";
import { parseWithNeologd, wakatiWithNeologd } from "./parser.ts";

const port = 8081;
const app = new Application({ logErrors: true });
const router = new Router();

router.get("/", (ctx) => {
  ctx.response.body = "Received a GET HTTP method";
});

router.get("/health", (ctx) => {
  ctx.response.body = { status: "ok" };
});

router.post("/", (ctx) => {
  ctx.response.body = "Received a POST HTTP method";
});

router.post("/mecab", async (ctx) => {
  if (!ctx.request.hasBody) {
    ctx.throw(415);
  }
  const reqBody = await ctx.request.body().value;
  //console.log(reqBody, typeof reqBody);

  const parsed = await parseWithNeologd(reqBody.texts);
  if (parsed.isFailure()) {
    console.error(`Parser Error!: ${parsed.error}`);
    ctx.throw(500);
  }

  //console.log(parsed.value);
  ctx.response.type = "application/json";
  ctx.response.body = parsed.value;
});

router.post("/wakati", async (ctx) => {
  if (!ctx.request.hasBody) {
    ctx.throw(415);
  }
  const reqBody = await ctx.request.body().value;
  //console.log(reqBody, typeof reqBody);

  const parsed = await wakatiWithNeologd(reqBody.texts);
  if (parsed.isFailure()) {
    console.error(`Parser Error!: ${parsed.error}`);
    ctx.throw(500);
  }

  //console.log(parsed.value);
  ctx.response.type = "application/json";
  ctx.response.body = parsed.value;
});

router.put("/", (ctx) => {
  ctx.response.body = "Received a PUT HTTP method";
});

router.delete("/", (ctx) => {
  ctx.response.body = "Received a DELETE HTTP method";
});

app.use(router.allowedMethods());
app.use(router.routes());

app.addEventListener("listen", () => {
  console.log(`Listening on: localhost:${port}`);
});

await app.listen({ port });
