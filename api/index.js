require('dotenv').config()
const puppeteer = require('puppeteer');
const ImageKit = require("imagekit");

const imagekit = new ImageKit({
    publicKey: process.env.imagekit_public_key,
    privateKey: process.env.imagekit_private_key,
    urlEndpoint: process.env.imagekit_endpoint,
});

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://example.com');

    const options = { encoding: 'binary', type: 'png' };
    const imgBuffer = await page.screenshot(options);

    const filename = "vercel.jpg"

    imagekit.upload({
        file: imgBuffer, 
        fileName: filename,   
    }).then(response => {
        console.log(response);
    }).catch(error => {
        console.log(error);
    });

    await browser.close();
})();