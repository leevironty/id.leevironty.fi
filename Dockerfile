FROM denoland/deno:2.4.2 AS builder

WORKDIR /app
COPY . .
RUN deno task docker-build
ENTRYPOINT [ "deno", "task"]
CMD [ "start" ]
