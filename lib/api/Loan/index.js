var express = require('express');
var router = express.Router();

var loan = require("./loan");
var get_debt = require("./get_debt");
var repayment = require("./repayment");
//var cancel = require("./cancel");

router.use("/loan", loan);
router.use("/get_debt", get_debt);
router.use("/repayment", repayment);
//router.use("/cancel", cancel);

module.exports = router;
