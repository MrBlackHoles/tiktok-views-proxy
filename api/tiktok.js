// api/tiktok.js
export default async function handler(req, res) {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: "Missing url" });

  const match = videoUrl.match(/video\/(\d+)/);
  if (!match) return res.status(400).json({ error: "Invalid URL" });
  const videoId = match[1];

  try {
    const apiUrl = `https://m.tiktok.com/api/item/detail/?itemId=${videoId}`;
    const resp = await fetch(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": "https://www.tiktok.com/",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9"
      },
    });

    const text = await resp.text();

    try {
      const data = JSON.parse(text);
      const views = data?.itemInfo?.itemStruct?.stats?.playCount ?? null;
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(200).json({ views, raw: !!views ? undefined : text.slice(0, 200) });
    } catch (e) {
      // Если это не JSON → вернём начало текста для диагностики
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(200).json({ error: "Not JSON", preview: text.slice(0, 500) });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
