var express = require('express');
var router = express.Router();

var view = require("./view");
var req_account = require("./req_account");
var res_account = require("./res_account");
var send_btoa = require("./send_btoa");
var send_btob = require("./send_btob");
var b_to_b = require("./b_to_b");
var b_to_a = require("./b_to_a");

router.use('/view', view);
router.use('/req_account', req_account);
router.use('/res_account', res_account);
router.use('/send_btoa', send_btoa);
router.use('/b_to_b', b_to_b);
router.use('/send_btob', send_btob);
router.use('/b_to_a', b_to_a);


module.exports = router;