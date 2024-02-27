var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { validateNumberToken } = require("../../../middlewares/validateToken");
var { encryptResponse, } = require("../../../middlewares/crypt");

const axios = require('axios');

const apiUrl = 'http://127.0.0.1:3000/api/mydata/res_account';
/**
 * Beneficiary approve route
 * This endpoint allows to view is_loan of any user
 * @path                             - /api/mydata/req_account
 * @middleware                       - Checks admin authorization
 * @return                           - Status
 */
router.post('/', validateNumberToken, (req, res) => {
    var r = new Response();
    let req_phone = req.phone;
    //console.log("req_phone", req_phone);
    // 타 API 서버에서 데이터 가져오기
    axios({
        method:"post",
        url: apiUrl,
        data: { phone: req_phone }
    }).then(data => {   // 타 은행 계좌 및 잔액 정보
        // 요청에 성공한 경우 응답 데이터 처리
        r.data = data.data.data2;
        console.log('응답@@데이터:', r.data[0]);
        // 여기서 데이터를 원하는 대로 처리합니다.
        return res.send(r);
    })
    .catch(error => {
        // 요청에 실패한 경우 에러 처리
        console.error('API 요청에 실패했습니다:', error);
        return res.json((r));
    });
});


module.exports = router;