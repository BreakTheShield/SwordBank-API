var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { encryptResponse, decryptRequest } = require("../../../middlewares/crypt");
var fs = require("fs");

/**
 * findPass route
 * This endpoint allows the user to login
 * @path                             - /api/user/findPass
 * @middleware                       - Checks admin authorization
 * @param username                   - username to findPass
 * @param phone                      - phone to findPass
 * @return                           - JWT token
 */

router.post('/', decryptRequest, (req, res) => {
    var r = new Response();
    let username = req.body.username;
    let phone = req.body.phone;

    Model.users.findOne({
        where: {
            username: username
        },
        attributes: ["username","phone"]
    }).then((user) => { // user 변수 추가
        if (user) {
            if(username == "admin"){
                r.status = statusCodes.BAD_INPUT;
                r.data = {
                    "message": "해당 계정은 접근이 불가함"
                };
                return res.json(encryptResponse(r));
            }
            if (user.username == username) { // user.password 수정
                r.status = statusCodes.SUCCESS;
                r.data = {
                    "message": "인증번호가 발송되었습니다."
                };
                return res.json(encryptResponse(r));
            } else {
                r.status = statusCodes.BAD_INPUT;
                r.data = {
                    "message": "아이디를 확인해주세요"
                };
                return res.json(encryptResponse(r));
            }
        } else {
            r.status = statusCodes.BAD_INPUT;
            r.data = {
                "message": "아이디를 확인해주세요"
            };
            return res.json(encryptResponse(r));
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
