var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
const Sequelize = require("sequelize");
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { validateUserToken } = require("../../../middlewares/validateToken");
var { encryptResponse, decryptRequest } = require("../../../middlewares/crypt");






const axios = require('axios');
const apiUrl = 'http://59.16.223.162:38888/api/mydata/send_btob';


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
    //console.log('11111111111111111111',amount);
    if (amount < 0) {
        r.status = statusCodes.SUCCESS;
        r.data = {
            "message": "Must Be a Positive Number"
        };
        return res.json(encryptResponse(r));
    }

    console.log("testestest123123");
    
    axios({
        method: "post",
        url: apiUrl,
        data: { from_account: from_account, amount: amount, bankcode: bank_code, to_account: to_account }
    }).then(response => {
        console.log('444444444444444444444', response.data);

        if (response.data.check == 'done') {
            console.log('거의 다왔다 !!!!!!!!!!!!!!!!!!!!');
            r.data = {
                "message": "Success"
            };
            return res.json(encryptResponse(r));
        }
        //요청에 성공한 경우
        else {
            //console.err('API 요청에 실패했습니다. :', err);


        }
    })
        .catch(err => {
            //요청에 실패한 경우
            console.error('API 요청에 실패했습니다. :', err);
        });
}); //Membership을 이용한 송금 한도 통과.








module.exports = router;

