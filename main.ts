import { Buffer, readAll, serve } from "./deps.ts";
import { parseWithNeologd } from "./parser.ts";

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

  return JSON.parse(decoder.decode(buf));
};

const parse_handler = async (request: Request) => {
  const expectedContentType = "application/json";
  if (request.headers.get("Content-Type") != expectedContentType) {
    return new Response(`Content-Type must be ${expectedContentType}`, {
      status: 400,
    });
  }

  const texts = (await convertFromBodyToJsonText(request.body)).texts;
  if (!isStringArray(texts)) {
    return new Response("Posted json has illegal type", { status: 400 });
  }
  const parsed = await parseWithNeologd(texts);
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

  return new Response(`No route for ${request.url}`, { status: 404 });
}, {
  port: 8080,
  onListen({ hostname, port }) {
    console.log(`HTTP server listening on http://${hostname}:${port}`);
  },
});
