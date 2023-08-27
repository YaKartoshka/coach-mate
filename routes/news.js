const express = require("express");
const router = express.Router();
const multer = require('multer');
const admin = require('firebase-admin');
const fs = require('fs');
const { fdb } = require("../libs/firebase_db");
const storage = admin.storage().bucket('gs://coach-mate-b8795.appspot.com')
const uuid = require('uuid-v4');
const multer_storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, conf.temp_path);
    },
    filename(req, file, cb) {
        cb(null, `${file.originalname}`);
    }
});

const limits = {
    fileSize: 1024 * 1024 * 50
}

const upload = multer({
    storage: multer_storage,
    limits: limits
});

const metadata = {
    metadata: {
        firebaseStorageDownloadTokens: uuid()
    },
    contentType: 'image/png',
    cacheControl: 'public, max-age=31536000',
};



router.post('/create', upload.single('img'), async function (req, res, next) {
    var r = { r: 1 };
    const image = req.file
    const panel_id = req.session.panel_id;
    const date = getCurrentDate();
    var data = {
        title: req.body.title,
        text: req.body.text,
        date: date
    }
    try {
        const newsRef = fdb.collection('panels').doc(panel_id).collection('news');
        const news = await newsRef.add(data);

        await storage.upload(image.path, {
            gzip: true,
            metadata: metadata,
            destination: `news/${image.originalname}`
        });


        var news_image_url = `https://firebasestorage.googleapis.com/v0/b/coach-mate-b8795.appspot.com/o/news%2F${image.originalname}?alt=media`
        console.log(news.id, news_image_url)
        await newsRef.doc(news.id).update({ news_id: news.id, news_image: news_image_url });
        res.send(JSON.stringify(r));
        fs.unlink(image.path, function (err) {
            if (err) {
                console.error(err);
            }
        });
    } catch (e) {
        r['r'] = 0;
        res.send(JSON.stringify(r))
    }


});

router.get('/get-all', async(req, res) => {
    const panel_id = req.session.panel_id;
    const data = [];
    try{
        await fdb.collection('panels').doc(panel_id).collection('news').orderBy('date', 'desc').get().then((news)=>{
            news.forEach((news_doc)=>{
                data.push({news_id: news_doc.id, title: news_doc.data().title, text: news_doc.data().text, image_url: news_doc.data().news_image});
            })
            res.send(JSON.stringify(data));
        });
    } catch(e){
        res.send(e);
    }
})



module.exports = router;