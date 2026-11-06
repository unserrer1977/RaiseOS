const http = require("http");

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = "0.0.0.0";

const server = http.createServer((_req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(
    "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>raiseos</title></head><body><h1>raiseos</h1><p>Running on Railway.</p></body></html>"
  );
});

server.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on http://${host}:${port}`);
});
