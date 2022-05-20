const express = require('express');

const { shortUrl, redirectToSource } = require('../controller/urlController');
const router = express.Router();



router.post("/url/shorten", shortUrl );
router.get("/:urlCode", redirectToSource);



module.exports = router;