var express = require('express');
var router = express.Router();

var view = require("./view");
var getdata = require("./getdata");
var mydata_sms = require("./mydata_sms");
var b_api = require("./b_api");
var req_account = require("./req_account");
var b_to_a = require("./b_to_a");



router.use('/view', view);
router.use('/getdata', getdata);
router.use('/mydata_sms', mydata_sms);
router.use('/b_api', b_api);
router.use('/req_account', req_account);
router.use('/b_to_a', b_to_a);

module.exports = router;