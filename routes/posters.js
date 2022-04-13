const express = require("express");
const router = express.Router(); // #1 - Create a new express Router

router.get('/', function (req, res) {
    res.render('posters/index')
})

module.exports = router;