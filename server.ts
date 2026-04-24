import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Fitbit OAuth Endpoints
  app.get("/api/auth/fitbit/url", (req, res) => {
    const clientId = process.env.VITE_FITBIT_CLIENT_ID;
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/fitbit/callback`;
    
    if (!clientId) {
      // If no client ID, return a mock URL that leads to our mock success
      return res.json({ url: `/auth/fitbit/callback?code=mock_code&mock=true` });
    }

    const scope = "activity heartrate sleep profile";
    const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    
    res.json({ url: authUrl });
  });

  app.get("/auth/fitbit/callback", async (req, res) => {
    const { code, mock } = req.query;

    if (mock === 'true') {
        // Handle mock success
        return res.send(`
            <html>
              <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f8fafc;">
                <div style="background: white; padding: 2rem; border-radius: 1rem; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                    <h1 style="color: #10b981;">Connection Successful (Mock)</h1>
                    <p style="color: #64748b;">Simulating Fitbit sync data for development.</p>
                    <script>
                      if (window.opener) {
                        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'fitbit', mock: true }, '*');
                        window.close();
                      }
                    </script>
                </div>
              </body>
            </html>
        `);
    }

    try {
      const clientId = process.env.VITE_FITBIT_CLIENT_ID;
      const clientSecret = process.env.FITBIT_CLIENT_SECRET;
      const redirectUri = `${req.protocol}://${req.get('host')}/auth/fitbit/callback`;

      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      
      const response = await axios.post('https://api.fitbit.com/oauth2/token', 
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: redirectUri
        }),
        {
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      // In a real app, you'd store these tokens in the user's document in Firestore
      // For this demo, we'll just signal success and have the client fetch data
      
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'fitbit' }, '*');
                window.close();
              }
            </script>
            <h1>Connected!</h1>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Fitbit Auth Error:", error);
      res.status(500).send("Auth failed");
    }
  });

  // Mock endpoint to get wearable data
  app.get("/api/health/sync", (req, res) => {
    // Return mock data that looks real
    res.json({
        steps: [
            { date: '2026-04-17', value: 8432 },
            { date: '2026-04-18', value: 10214 },
            { date: '2026-04-19', value: 7522 },
            { date: '2026-04-20', value: 12431 },
            { date: '2026-04-21', value: 9821 },
            { date: '2026-04-22', value: 11050 },
            { date: '2026-04-23', value: 4230 },
        ],
        heartRate: [
            { time: '08:00', value: 62 },
            { time: '10:00', value: 85 },
            { time: '12:00', value: 92 },
            { time: '14:00', value: 78 },
            { time: '16:00', value: 88 },
            { time: '18:00', value: 105 },
            { time: '20:00', value: 72 },
        ],
        sleep: {
            hours: 7.5,
            quality: 'Good',
            efficiency: 88
        }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
