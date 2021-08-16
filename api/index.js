require('dotenv').config()
const puppeteer = require('puppeteer');
const chromium = require('chrome-aws-lambda');
const ImageKit = require("imagekit");
const { Deta } = require("deta")

const deta_project_key = process.env.deta_project_key
const deta = Deta(deta_project_key);

const imagekit = new ImageKit({
    publicKey: process.env.imagekit_public_key,
    privateKey: process.env.imagekit_private_key,
    urlEndpoint: process.env.imagekit_endpoint,
});

module.exports = async(req, res) => {
    const { web, title } = req.query;

    const filename = title
    const foldername = web.replace(/\./g,'-')

    //Check if exists, no need to create again, just return the value (thumbnail URL)
    let db = deta.Base("thumbnails")
    const { items } = await db.fetch({ foldername, filename})
    
    if(items.length !== 0) {
        const item = items[0]
        return res.redirect(item.url)
    }

    //Check DB if domain is not whitelisted
    db = deta.Base("sites")
    const { items: sites } = await db.fetch({ "sitename?contains": web })
    if (sites.length == 0)
        return res.status(403).json({ msg: 'your site is not allowed' })
        

    const extra_params = req.url.replace('/api?','')
    const ss_source_url = `https://template.imagin.live?${extra_params}`

    const browser = await puppeteer.launch({ 
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    })
    const page = await browser.newPage();
    await page.setViewport({ width: 500, height: 300 })
    await page.goto(ss_source_url, { "waitUntil": "networkidle0" });

    const options = { encoding: 'binary', type: 'png' };
    const imgBuffer = await page.screenshot(options);

    await browser.close();

    imagekit.upload({
        folder: foldername,
        file: imgBuffer, 
        fileName: filename,   
    }).then(async function(response){
        //save to db
        const uploadToDeta = await db.put({ foldername, filename, url: response.url})
        return res.redirect(uploadToDeta.url)

    }).catch(error => {
        return res.json({ body: error })
    });
}