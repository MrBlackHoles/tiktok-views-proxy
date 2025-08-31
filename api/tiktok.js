// api/tiktok.js
export default async function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "Missing url" });

    // Запросим TikTok «как обычный браузер»
    const r = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9,ru;q=0.8",
        "Referer": "https://www.tiktok.com/"
      }
    });
    const html = await r.text();

    // Достаём JSON из <script id="SIGI_STATE">...</script>
    const m = html.match(/<script id="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(200).json({ views: null, hint: "SIGI not found" });
    }

    const data = JSON.parse(m[1]);
    const item = Object.values(data?.ItemModule || {})[0];
    const views = item?.stats?.playCount ?? null;

    res.setHeader("Access-Control-Allow-Origin", "*"); // чтобы Google Sheets не ругался на CORS
    return res.status(200).json({ views });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
