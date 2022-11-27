// url_test.ts
import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";
import * as Colors from "https://deno.land/std@0.95.0/fmt/colors.ts";
import { jason } from "https://deno.land/x/jason_formatter/mod.ts"; // JSON formatter

// https://github.com/hellgrenj/Rumpel/blob/main/tests/integration/util.ts
const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("done");
    }, ms);
  });
};
const waitForEndpoint = async (url: string): Promise<void> => {
  try {
    const response = await fetch(url, { method: "GET" });
    if (response.status !== 200) {
      throw new Error(`status code ${response.status}`);
    } else {
      console.log(`${url} ready, moving on..`);
      return;
    }
  } catch {
    await sleep(1000);
    return waitForEndpoint(url);
  }
};
/*
Deno.run({
  cmd: [
    "docker-compose",
    "--file",
    "docker-compose.yml",
    "up",
    "--build",
  ],
  stdout: "piped",
  stdin: "piped",
  stderr: "piped",
});

console.log("waiting for test-api to be available..");
const apiHealthEndpoint = "http://localhost:8080/health";
await waitForEndpoint(apiHealthEndpoint);
*/

console.log(Colors.blue("starting test"));

Deno.test("endpoint url test", () => {
  const url = new URL("./health", "http://localhost:8081/");
  assertEquals(url.href, "http://localhost:8081/health");
});

// curl "http://127.0.0.1:8080/mecab" -H 'Content-Type:application/json'  -d '{ "texts": [ "わたしだ。" ]}'
Deno.test("POST API parse test with Japanese", async () => {
  const resp = await fetch("http://localhost:8081/mecab", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ "texts": ["わたしだ。"] }),
  });
  //console.log(resp);
  const gottenText = await resp.text();
  //console.log(jason(gottenText));
  assertEquals(
    gottenText,
    '[[{"surface":"わたし","feature":"名詞","featureDetails":["代名詞","一般","*"],"conjugationForms":["*","*"],"originalForm":"わたし","reading":"ワタシ","pronunciation":"ワタシ"},{"surface":"だ","feature":"助動詞","featureDetails":["*","*","*"],"conjugationForms":["特殊・ダ","基本形"],"originalForm":"だ","reading":"ダ","pronunciation":"ダ"},{"surface":"。","feature":"記号","featureDetails":["句点","*","*"],"conjugationForms":["*","*"],"originalForm":"。","reading":"。","pronunciation":"。"}]]',
  );
  const parsedJson = JSON.parse(gottenText);
  //console.log(parsedJson);
  assertEquals(parsedJson.length, 1, "returned JSON does not have 1 result.");
  assertEquals(
    parsedJson[0][0].surface,
    "わたし",
    "retuened JSON does not have an expected surface.",
  );
  assertEquals(
    parsedJson[0][1].feature,
    "助動詞",
    "retuened JSON does not have an expected feature.",
  );
});

Deno.test("POST API parse test with 2 Japanese sentences", async () => {
  const resp = await fetch("http://localhost:8081/mecab", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ "texts": ["わたしだ。", "いや、僕です。"] }),
  });
  const gottenText = await resp.text();
  //console.log(jason(gottenText));
  const parsedJson = JSON.parse(gottenText);
  //console.log(parsedJson);
  assertEquals(parsedJson.length, 2, "returned JSON does not have 2 results.");
  assertEquals(
    parsedJson[1][0].surface,
    "いや",
    "retuened JSON does not have an expected surface.",
  );
});

/*
const stopApiProcess = Deno.run({
  cmd: ["docker-compose", "--file", "docker-compose-api.yml", "down"],
  stdout: "piped",
  stdin: "piped",
  stderr: "piped",
});
await stopApiProcess.status();
*/
