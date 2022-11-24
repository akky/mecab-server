import { Env, MeCab } from "./deps.ts";
import { failure, success, unwrap } from "./result.ts";

const env = new Env();

const genMecab = (dicPathEnvName?: string) => {
  const commands = ["mecab"];
  if (dicPathEnvName) {
    if (env.has(dicPathEnvName)) commands.push("-d", env.get(dicPathEnvName));
    else return failure(new Error("The env is not set"));
  }

  return success(new MeCab(commands));
};

const parseWith = (lib: MeCab, texts: string[]) =>
  Promise.all(texts.map(async (s) => await lib.parse(s)));

export const parse = async (texts: string[]) =>
  await parseWith(unwrap(genMecab()), texts);

export const parseWithNeologd = async (texts: string[]) => {
  const mecab = genMecab("NEOLOGD_DIC_PATH");
  if (mecab.isFailure()) {
    return failure(mecab.error);
  }

  return success(await parseWith(mecab.value, texts));
};

// --- wakati

const genMecabWakati = (dicPathEnvName?: string) => {
  const commands = ["mecab"];
  commands.push("-Owakati");
  if (dicPathEnvName) {
    if (env.has(dicPathEnvName)) commands.push("-d", env.get(dicPathEnvName));
    else return failure(new Error("The env is not set"));
  }

  return success(new MeCab(commands));
};

const wakatiWith = (lib: MeCab, texts: string[]) =>
  Promise.all(texts.map(async (s) => await lib.parse(s)));

export const wakati = async (texts: string[]) =>
  await wakatiWith(unwrap(genMecabWakati()), texts);

export const wakatiWithNeologd = async (texts: string[]) => {
  const mecab = genMecabWakati("NEOLOGD_DIC_PATH");
  if (mecab.isFailure()) {
    return failure(mecab.error);
  }

  return success(await wakatiWith(mecab.value, texts));
};