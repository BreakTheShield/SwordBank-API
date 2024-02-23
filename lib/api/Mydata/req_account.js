var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { validateNumberToken } = require("../../../middlewares/validateToken");
var { encryptResponse, } = require("../../../middlewares/crypt");

const axios = require('axios');

const apiUrl = 'http://59.16.223.162:38888/api/mydata/res_account';
/**
 * Beneficiary approve route
 * This endpoint allows to view is_loan of any user
 * @path                             - /api/loan/loan
 * @middleware                       - Checks admin authorization
 * @return                           - Status
 */
router.post('/', validateNumberToken, (req, res) => {
    var r = new Response();
    let cookie = req.phone;
    console.log("123", cookie);
    // API 서버에서 데이터 가져오기
    
    axios({
        method:"post",
        url: apiUrl,
        //headers : {"authorization":"1" + cookie},
        data:{phone: cookie}
    }).then(response => {
        // 요청에 성공한 경우 응답 데이터 처리
        console.log('응답 데이터:', response.data);
        // 여기서 데이터를 원하는 대로 처리합니다.
    })
    .catch(error => {
        // 요청에 실패한 경우 에러 처리
        console.error('API 요청에 실패했습니다:', error);
    });
});


module.exports = router;