require('dotenv').config()
const puppeteer = require('puppeteer');
const { Deta } = require("deta")

const DETA_PROJECT_KEY = process.env.DETA_PROJECT_KEY
const deta = Deta(DETA_PROJECT_KEY);

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const URL = 'https://sekolahkoding.com'
    await page.goto(URL);

    const options = { encoding: 'binary', type: 'png' };
    const imageBuffer = await page.screenshot(options);
    
    //upload to Deta    
    const detaDrive = deta.Drive("thumbnails");
    const res = await detaDrive.put("new.png", { data: imageBuffer });
    console.log(res)

    await browser.close();
})();