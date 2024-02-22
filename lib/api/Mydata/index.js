var express = require('express');
var router = express.Router();

var view = require("./view");
var req_account = require("./req_account");


router.use('/view', view);
router.use('/req_account', req_account);

module.exports = router;