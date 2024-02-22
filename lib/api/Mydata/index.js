var express = require('express');
var router = express.Router();

var view = require("./view");
var getdata = require("./getdata");
var mydata_sms = require("./mydata_sms");
var b_api = require("./b_api");

router.use('/view', view);
router.use('/getdata', getdata);
router.use('/mydata_sms', mydata_sms);
router.use('/b_api', b_api);


module.exports = router;