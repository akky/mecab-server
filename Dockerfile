# syntax=docker/dockerfile:1.4
## Dictionary Builder
FROM ubuntu:22.04 as dic
RUN apt-get update \
    && apt-get install -y g++ git make curl file xz-utils sudo mecab libmecab-dev mecab-ipadic-utf8 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /var
RUN git clone https://github.com/neologd/mecab-ipadic-neologd.git --depth=1 \
    && cd mecab-ipadic-neologd \
    && ./bin/install-mecab-ipadic-neologd -y -n -a

## Deno base image
FROM denoland/deno:bin-1.26.0 AS deno

## Runner
FROM debian:stable-slim
EXPOSE 8080
RUN adduser deno

COPY --from=deno --link /deno /usr/local/bin/deno

RUN apt-get update \
    && apt-get install -y mecab libmecab-dev mecab-ipadic-utf8 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

USER deno

COPY --link deps.ts .
RUN deno cache deps.ts
COPY . .
RUN deno cache main.ts

ENV NEOLOGD_DIC_PATH /usr/lib/x86_64-linux-gnu/mecab/dic/mecab-ipadic-neologd
COPY --from=dic --link $NEOLOGD_DIC_PATH $NEOLOGD_DIC_PATH

CMD ["run", "--allow-net", "--allow-run", "--allow-env", "main.ts"]
