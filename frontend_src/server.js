import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const skyjoApiBase = process.env.SKYJO_INTERNAL_BASE || "http://skyjo-logic:1023";
const colorApiBase = process.env.COLOR_INTERNAL_BASE || "http://color-api:3003";

app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

app.get("/frontend-api/skyjo/getGame/:id", async (req, res) => {
  try {
    const response = await fetch(`${skyjoApiBase}/getGame-${req.params.id}`);
    const text = await response.text();

    res
      .status(response.status)
      .type(response.headers.get("content-type") || "application/json")
      .send(text);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Proxy request failed",
    });
  }
});

app.post("/frontend-api/skyjo/getCard/:id", async (req, res) => {
  try {
    const body = JSON.stringify({
      token: req.body?.token || "",
    });

    const targetUrl = new URL(`${skyjoApiBase}/getCard/${req.params.id}`);

    const proxyReq = http.request(
      {
        hostname: targetUrl.hostname,
        port: targetUrl.port,
        path: targetUrl.pathname,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (proxyRes) => {
        let responseData = "";

        proxyRes.on("data", (chunk) => {
          responseData += chunk;
        });

        proxyRes.on("end", () => {
          res
            .status(proxyRes.statusCode || 500)
            .type(proxyRes.headers["content-type"] || "application/json")
            .send(responseData);
        });
      }
    );

    proxyReq.on("error", (error) => {
      res.status(500).json({
        error: error.message || "Proxy request failed",
      });
    });

    proxyReq.write(body);
    proxyReq.end();
  } catch (error) {
    res.status(500).json({
      error: error.message || "Proxy request failed",
    });
  }
});

app.post("/frontend-api/skyjo/move", async (req, res) => {
  try {
    const response = await fetch(`${skyjoApiBase}/move`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body || {}),
    });

    const text = await response.text();

    res
      .status(response.status)
      .type(response.headers.get("content-type") || "application/json")
      .send(text);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Proxy request failed",
    });
  }
});

app.post("/frontend-api/skyjo/setupGame", async (req, res) => {
  try {
    const response = await fetch(`${skyjoApiBase}/setUpGame`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body || []),
    });

    const text = await response.text();

    res
      .status(response.status)
      .type(response.headers.get("content-type") || "application/json")
      .send(text);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Proxy request failed",
    });
  }
});

app.get("/frontend-api/color/scheme", async (_req, res) => {
  try {
    const response = await fetch(`${colorApiBase}/scheme`);
    const text = await response.text();

    res
      .status(response.status)
      .type(response.headers.get("content-type") || "application/json")
      .send(text);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Proxy request failed",
    });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Frontend running on port ${port}`);
});