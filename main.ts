import { Buffer, readAll, serve } from "./deps.ts";
import { parseWithNeologd } from "./parser.ts";

const port = 8080;
const PARSE_ROUTE = new URLPattern({ pathname: "/parse" });
const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) &&
    value.every((val) => typeof val === "string");
};

serve(async (request: Request) => {
  if (request.method != "POST" || !PARSE_ROUTE.exec(request.url)) {
    return new Response(`No route for ${request.url}`, { status: 404 });
  }
  if (request.headers.get("Content-Type") != "application/json") {
    return new Response("Content-Type must be application/json", {
      status: 400,
    });
  }

  const reader = await request.body?.getReader().read();
  const buf = await readAll(new Buffer(reader?.value));
  const decoder = new TextDecoder();
  const texts = JSON.parse(decoder.decode(buf)).texts;
  if (!isStringArray(texts)) {
    return new Response("Posted json has illegal type", { status: 400 });
  }
  const parsed = await parseWithNeologd(texts);
  if (parsed.isFailure()) {
    return new Response("Parser Error", { status: 500 });
  }

  const responseJson = JSON.stringify(parsed.value);

  return new Response(responseJson);
}, {
  port,
  onListen({ hostname, port }) {
    console.log(`HTTP server listening on http://${hostname}:${port}`);
  },
});
