require('dotenv').config()
const Pageres = require('pageres');
const ImageKit = require("imagekit");

const imagekit = new ImageKit({
    publicKey: process.env.imagekit_public_key,
    privateKey: process.env.imagekit_private_key,
    urlEndpoint: process.env.imagekit_endpoint,
});

(async () => {
    const imgBuffer = await new Pageres()
        .src('https://google.com', ['1280x1024'])
        //.src('data:text/html,<h1>Awesome!</h1>', ['1024x768'])
        //.dest(__dirname)
        .run();
    
    const filename = "vercel.jpg"

    imagekit.upload({
        file: imgBuffer[0], 
        fileName: filename,   
    }).then(response => {
        console.log(response);
    }).catch(error => {
        console.log(error);
    });
})();