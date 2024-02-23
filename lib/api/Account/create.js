var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { validateUserToken, tokenCheck } = require("../../../middlewares/validateToken");
var { encryptResponse } = require("../../../middlewares/crypt");

/**
 * Account view route
 * @path - /api/account/view
 * @middleware
 * @return
 */
router.post('/', validateUserToken, (req, res) => {
    var r = new Response();
    const bank_code = 333;
    let username = req.username;
    let balance = 1000000;
    let account_number = Math.round(Math.random() * 888888 + 111111);

    Model.account.findOne({
        where: {
            account_number: account_number
        }
    }).then((data) => {
        if (data) {
            account_number = Math.round(Math.random() * 888888 + 111111);
            return Model.account.create({
                username: username,
                balance: balance,
                account_number: account_number,
                bank_code: bank_code
            });
        } else {
            return Model.account.create({
                username: username,
                balance: balance,
                account_number: account_number,
                bank_code: bank_code
            });
        }
    }).then(() => {
        return Model.account.findAll({
            where: {
                username: req.username
            },
            attributes: ["balance", "account_number", "bank_code"]
        });
    }).then((data) => {
        if (data.length > 0) {
            r.status = statusCodes.SUCCESS;
            r.data = data;
            res.json(encryptResponse(r));
        } else {
            r.status = statusCodes.NOT_AUTHORIZED;
            r.data = {
                "message": "Not authorized"
            };
            res.json(encryptResponse(r));
        }
    }).catch((err) => {
        r.status = statusCodes.SERVER_ERROR;
        r.data = {
            "message": err.toString()
        };
        res.json(encryptResponse(r));
    });
});

module.exports = router;


