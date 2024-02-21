var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
const Sequelize = require("sequelize");
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { validateUserToken } = require("../../../middlewares/validateToken");
var { encryptResponse, decryptRequest } = require("../../../middlewares/crypt");

/**
 * Balance transfer route
 * @path                 - /api/balance/transfer
 * @middleware
 * @param to_account     - Amount to be transferred to this account
 * @param amount         - Amount to be transferred
 * @return               - Status
 */
router.post('/', [validateUserToken, decryptRequest], (req, res) => {
    var r = new Response();
    let from_account = req.body.from_account;
    let to_account = req.body.to_account;
    let amount = req.body.amount;
    let sendtime = req.body.sendtime;

    if (amount < 0) {
        r.status = statusCodes.BAD_INPUT;
        r.data = {
            "message": "Must Be a Positive Number"
        };
        return res.json(encryptResponse(r));
    }

    Model.account.findOne({
        where: {
            account_number: from_account
        },
        attributes: ["balance"]
    }).then((data) => {
        if (data) {
            Model.transactions.create({
                from_account: from_account,
                to_account: to_account,
                amount: amount,
                sendtime: sendtime
            }).then(() => {
                Model.account.update({
                    balance: Sequelize.literal(`balance - ${amount}`)
                }, {
                    where: {
                        account_number: from_account
                    }
                }).then(() => {
                    Model.account.update({
                        balance: Sequelize.literal(`balance + ${amount}`)
                    }, {
                        where: {
                            account_number: to_account
                        }
                    }).then(() => {
                        r.status = statusCodes.SUCCESS;
                        r.data = {
                            "message": "Success"
                        };
                        return res.json(encryptResponse(r));
                    });
                });
            });
        } else {
            r.status = statusCodes.BAD_INPUT;
            r.data = {
                "message": "error error"
            };
            return res.json(encryptResponse(r));
        }
    }).catch((err) => {
        r.status = statusCodes.SERVER_ERROR;
        r.data = {
            "message": err.toString()
        };
        return res.json(encryptResponse(r));
    });
});

module.exports = router;