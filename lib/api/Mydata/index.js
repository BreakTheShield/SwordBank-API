var express = require('express');
var router = express.Router();

var view = require("./view");
var getdata = require("./getdata");


router.use('/view', view);
router.use('/getdata', getdata);

module.exports = router;