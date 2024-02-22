var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
const Sequelize = require("sequelize");
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { validateUserToken } = require("../../../middlewares/validateToken");
var { encryptResponse, decryptRequest } = require("../../../middlewares/crypt");



const axios = require('axios');
const apiUrl = 'http://59.16.223.162:38888/api/mydata/send_btoa';

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
    let username = req.username;
    //console.log('11111111111111111111',amount);
    if (amount < 0) {
        r.status = statusCodes.SUCCESS;
        r.data = {
            "message": "Must Be a Positive Number"
        };
        return res.json(encryptResponse(r));
    }

    Model.account.findOne({
        where: {
            account_number: from_account
        }, attributes: ["username"] //여기서 username받은걸로 users테이블에서 membership 받아서 검증해야함.

    }).then((data) => {
        //console.log('22222222222222222222',data);
        if (username != data.username) {
            r.status = statusCodes.BAD_INPUT;
            r.data = {
                "message": "출금계좌가 고객님의 계좌가 아닙니다."
            };
            return res.json(encryptResponse(r));
        }

        Model.users.findOne({
            where: {
                username: data.username
            }, attributes: ["membership"]

        }).then((data) => {

            if (data.membership === "SILVER") {
                if (amount >= 1000000) {
                    r.status = statusCodes.BAD_INPUT;
                    r.data = {
                        "message": "송금 한도 초과입니다."
                    };
                    return res.json(encryptResponse(r));
                };
            }

            else if (data.membership === "GOLD") {
                if (amount >= 10000000) {
                    r.status = statusCodes.BAD_INPUT;
                    r.data = {
                        "message": "송금 한도 초과입니다."
                    }
                    return res.json(encryptResponse(r));
                };
            }

            else {
                if (amount >= 100000000) {
                    r.status = statusCodes.BAD_INPUT;
                    r.data = {
                        "message": "송금 한도 초과입니다."
                    }
                    return res.json(encryptResponse(r));
                }
            };
        });
        axios({
            method: "post",
            url: apiUrl,
            data: { from_account: "169702", amount: amount, bankcode: "555", to_account: "555555" }
        }).then(response => {
            console.log('444444444444444444444', response.status);
            if (response.status == '200') {
                console.log('거의 다왔다 !!!!!!!!!!!!!!!!!!!!');
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
                    console.log('응답 데이터:', response.data);
                    return res.json(encryptResponse(r));
                })
            }
            //요청에 성공한 경우
            else {
                //console.err('API 요청에 실패했습니다. :', err);

            }
        })
            .catch(err => {
                //요청에 실패한 경우
                console.err('API 요청에 실패했습니다. :', err);
            });
    })
}); //Membership을 이용한 송금 한도 통과.




module.exports = router;