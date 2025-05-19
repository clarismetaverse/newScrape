const express = require('express');
const { chromium } = require('playwright');
const app = express();

app.use(express.json());

app.post('/get-reviewer', async (req, res) => {
  const { review_url } = req.body;
  if (!review_url) return res.status(400).json({ error: 'Missing review_url' });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(review_url, { waitUntil: 'networkidle' });
    await page.waitForSelector('.d4r55');
    const name = await page.$eval('.d4r55', el => el.textContent.trim());
    const profileUrl = await page.$eval('.d4r55 a', el => el.href).catch(() => null);
    res.json({ reviewer: name, profileUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await browser.close();
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
