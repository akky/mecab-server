import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";
import { MeCab } from "https://deno.land/x/deno_mecab@v1.1.1/mod.ts";



Deno.test("wakati test", async () => {
    const mecab = new MeCab(["mecab"]);
    const text = "JavaScriptはとても楽しいです。";
    const result = await mecab.wakati(text);
    console.log(result);
    assertEquals(result, '[ "JavaScript", "は", "とても", "楽しい", "です", "。" ]', 'mecab wakati result did not match');
});