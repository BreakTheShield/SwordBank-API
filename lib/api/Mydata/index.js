var express = require('express');
var router = express.Router();

var view = require("./view");
var req_account = require("./req_account");
var b_to_a = require("./b_to_a");


router.use('/view', view);
router.use('/req_account', req_account);
router.use('/b_to_a',b_to_a);

module.exports = router;