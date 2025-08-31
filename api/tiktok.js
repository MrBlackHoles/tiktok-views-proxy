// api/tiktok.js
import chromium from "@sparticuz/chromium";
import playwright from "playwright-core";

export default async function handler(req, res) {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    res.status(400).json({ error: "Missing url" });
    return;
  }

  let browser;
  try {
    const executablePath = await chromium.executablePath(); // путь к бинарю для лямбды
    browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath,
      headless: true
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      locale: "en-US"
    });

    const page = await context.newPage();
    await page.goto(videoUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

    // ждём, пока страница подгрузит JSON
    await page.waitForSelector("#SIGI_STATE", { timeout: 15000 });

    const views = await page.evaluate(() => {
      try {
        const s = document.querySelector("#SIGI_STATE");
        const data = JSON.parse(s.textContent);
        const item = Object.values(data.ItemModule || {})[0];
        return item?.stats?.playCount ?? null;
      } catch (e) {
        return null;
      }
    });

    await browser.close();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ views });
  } catch (e) {
    if (browser) try { await browser.close(); } catch {}
    res.status(500).json({ error: e.message });
  }
}
