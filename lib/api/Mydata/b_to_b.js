var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
const Sequelize = require("sequelize");
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { validateUserToken } = require("../../../middlewares/validateToken");
var { encryptResponse, decryptRequest } = require("../../../middlewares/crypt");

const axios = require('axios');
const apiUrl = 'http://localhost:3000/api/mydata/send_btob';

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
    let bank_code = req.body.bank_code; //돈을 송금 받는 계좌의 bankcode
    let amount = req.body.amount;   
    let sendtime = req.body.sendtime;
    let username = req.username;
    if (amount < 0) {
        r.status = statusCodes.SUCCESS;
        r.data = {
            "message": "Must Be a Positive Number"
        };
        return res.json(encryptResponse(r));
    }
    
    axios({
        method: "post",
        url: apiUrl,
        data: { from_account: from_account, amount: amount, bankcode: bank_code, to_account: to_account, sendtime: sendtime } //돈을 송금 받는 계좌의 bankcode
    }).then(response => {

        if (response.data.check == 'done') {
            r.data = {
                "message": "Success"
            };
            return res.json(encryptResponse(r));
        }
        else {
            console.err('API 요청에 실패했습니다. :', err);
        }
    })
        .catch(err => {
            //요청에 실패한 경우
            console.error('API 요청에 실패했습니다. :', err);
        });
}); //Membership을 이용한 송금 한도 통과.



module.exports = router;