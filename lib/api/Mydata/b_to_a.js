var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
const Sequelize = require("sequelize");
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { validateUserToken } = require("../../../middlewares/validateToken");
var { encryptResponse, decryptRequest } = require("../../../middlewares/crypt");
const axios = require('axios');
const apiUrl = 'http://127.0.0.1:3000/api/mydata/send_btoa';

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
    let bank_code = req.body.bank_code;
    let amount = req.body.amount;
    let sendtime = req.body.sendtime;
    let username = req.username;

    if (amount < 0) {
        r.status = statusCodes.BAD_INPUT;
        r.data = {
            "message": "Must Be a Positive Number"
        };
        return res.json(encryptResponse(r));
    } else {
        axios({
            method: "post",
            url: apiUrl,
            data: { from_account: from_account, amount: amount, bank_code: bank_code, to_account: to_account, sendtime: sendtime, username: username }
        }).then((data) =>{
            
            if (data.data.status.code == 200) {
                Model.account.update({
                    balance: Sequelize.literal(`balance + ${amount}`)
                }, {
                    where: {
                        account_number: to_account
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
                        return res.json(encryptResponse(r));
                    })
                }).catch((err) => {
                    r.status = statusCodes.SERVER_ERROR;
                    r.data = {
                        "message": "뭔가 이상합니다"
                    };
                    return res.json(encryptResponse(r));
                })
            } else {
                r.status = statusCodes.BAD_INPUT;
                r.data = {
                    "message": "계좌의 잔액이 부족합니다2."
                };
                return res.json(encryptResponse(r));        
            }
        }).catch((err) => {
            r.status = statusCodes.SERVER_ERROR;
            r.data = {
                "message": "뭔가 이상합니다"
            };
            return res.json(encryptResponse(r));
        })
    }
})

module.exports = router;
