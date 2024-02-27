var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
const { Sequelize } = require('../../../models_board');
var statusCodes = require('../../statusCodes');
var { encryptResponse, decryptRequest } = require("../../../middlewares/crypt");

// POST 요청을 처리하는 핸들러
router.post('/', function(req, res) {
    var r = new Response();
    var amount = req.body.amount;
    var from_account = req.body.from_account;
    var to_account = req.body.to_account;
    var bank_code = req.body.bank_code;
    var sendtime = req.body.sendtime;

    Model.account.findOne({
        where: {
            account_number: from_account
        },
        attributes: ["balance"]
    }).then((data) => {
        if (data.balance >= amount) {
            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$" , amount);
            Model.account.update({
                balance: Sequelize.literal(`balance-${amount}`)
            }, {
                where: {
                    account_number: from_account
                }
            }).then(() => {
                Model.transactions.create({
                    from_account: from_account,
                    to_account: to_account,
                    amount: amount,
                    sendtime: sendtime,
                    from_bankcode: 333,
                    to_bankcode: bank_code
                }).then(() => {
                    r.status = statusCodes.SUCCESS;
                    r.data = {
                        "message": "송금에 성공했습니다."
                    };
                    return res.json(r);
                })
            }).catch((err) => {
                r.status = statusCodes.SERVER_ERROR;
                r.data = {
                    "message": "뭔가 이상합니다"
                };
                return res.json(r);
            })
        } else {
            r.status = statusCodes.BAD_INPUT;
            r.data = {
                "message": "계좌의 잔액이 부족합니다."
            };
            return res.json(r);        
        }
    }).catch((err) => {
        r.status = statusCodes.SERVER_ERROR;
        r.data = {
            "message": "뭔가 이상합니다"
        };
        return res.json(r);
    })
})

module.exports = router;