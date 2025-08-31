// api/tiktok.js
export default async function handler(req, res) {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: "Missing url" });

  // извлекаем ID видео из ссылки
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
      },
    });

    const data = await resp.json();
    const views = data?.itemInfo?.itemStruct?.stats?.playCount ?? null;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ views });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
