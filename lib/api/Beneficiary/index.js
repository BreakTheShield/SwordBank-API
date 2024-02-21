var express = require('express');
var router = express.Router();

var add = require("./add");
var approve = require("./approve");
var pending = require("./pending");
var view = require("./view");
var delete2 = require("./delete");
var check = require("./check");
var ceiling = require("./ceiling");
var loan = require("./loan");
var get_debt = require("./get_debt");
var repayment = require("./repayment");

router.use("/add", add);
router.use("/approve", approve);
router.use("/pending", pending);
router.use("/view", view); // Give options on FE to see pending list as well
router.use("/delete", delete2);
router.use("/check", check);
router.use("/ceiling", ceiling);
router.use("/loan", loan);
router.use("/get_debt", get_debt);
router.use("/repayment", repayment);

module.exports = router;
