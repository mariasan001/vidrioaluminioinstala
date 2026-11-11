import http from "node:http";

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(d));
    }).on("error", reject);
  });
}

const html = await get("http://127.0.0.1:8765/panel/?rol=dueno");
const idx = html.indexOf('data-vista="clientes"');
console.log("clientes snippet:", JSON.stringify(html.slice(idx - 30, idx + 90)));
const app = await get("http://127.0.0.1:8765/panel/app.js");
console.log("ensureDemoCrm", app.includes("ensureDemoCrm"));
console.log("tab.hidden = false", app.includes("tab.hidden = false"));
