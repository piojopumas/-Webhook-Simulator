import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for proxying webhook requests
  app.post("/api/proxy", async (req, res) => {
    const { targetUrl, method, headers, body } = req.body;
    
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing targetUrl" });
    }

    try {
      const response = await fetch(targetUrl, {
        method: method || 'POST',
        headers: headers || {},
        body: typeof body === 'string' ? body : JSON.stringify(body)
      });
      
      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = responseText;
      }
      
      res.status(response.status).json({
        status: response.status,
        ok: response.ok,
        data: responseData
      });
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
