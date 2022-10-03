import { parseWithNeologd } from "./parser.ts";

const text = "aiueo";
const res = await parseWithNeologd([text]);

// Parse (形態素解析)
console.log(res);
