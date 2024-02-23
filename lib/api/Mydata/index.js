var express = require('express');
var router = express.Router();

var view = require("./view");
var res_account= require("./res_account");
var send_btoa= require("./send_btoa");


router.use('/view', view);
router.use('/res_account', res_account);
router.use('/send_btoa', send_btoa);


module.exports = router;