// api/tiktok.js
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    res.status(400).json({ error: "Missing url" });
    return;
  }

  let browser;
  try {
    const executablePath = await chromium.executablePath();

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(videoUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

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
