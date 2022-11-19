import { Buffer, readAll, serve } from "./deps.ts";
import { parseWithNeologd } from "./parser.ts";
import { tryCatch } from "./result.ts";

const PARSE_ROUTE = new URLPattern({ pathname: "/parse" });
const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) &&
    value.every((val) => typeof val === "string");
};

const convertFromBodyToJsonText = async (
  body: ReadableStream<Uint8Array> | null,
) => {
  const reader = await body?.getReader().read();
  const buf = await readAll(new Buffer(reader?.value));
  const decoder = new TextDecoder();

  return tryCatch(() => JSON.parse(decoder.decode(buf)), (e) => e as Error);
};

const parse_handler = async (request: Request) => {
  const expectedContentType = "application/json";
  if (request.headers.get("Content-Type") != expectedContentType) {
    return new Response(`Content-Type must be ${expectedContentType}`, {
      status: 400,
    });
  }

  const parsedTexts = await convertFromBodyToJsonText(request.body);
  if (parsedTexts.isFailure() || !isStringArray(parsedTexts.value.texts)) {
    return new Response("Posted json has illegal type", { status: 400 });
  }
  const parsed = await parseWithNeologd(parsedTexts.value.texts);
  if (parsed.isFailure()) {
    console.error(`Parser Error!: ${parsed.error}`);
    return new Response("Parser Error", { status: 500 });
  }

  const responseJson = JSON.stringify(parsed.value);

  return new Response(responseJson);
};

serve(async (request: Request) => {
  if (request.method == "POST" && PARSE_ROUTE.exec(request.url)) {
    return await parse_handler(request);
  }

  // GET request handler for server health check
  const PARSE_HEALTH = new URLPattern({ pathname: "/health" })
  if (request.method == "GET" && PARSE_HEALTH.exec(request.url)) {
    return new Response(`Mecab API server is alive for ${request.url}`, { status: 200 });
  }

  return new Response(`No route for ${request.url}`, { status: 404 });
}, {
  port: 8080,
  onListen({ hostname, port }) {
    console.log(`HTTP server listening on http://${hostname}:${port}`);
  },
});
