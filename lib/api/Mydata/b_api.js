var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { encryptResponse, decryptRequest } = require("../../../middlewares/crypt");

router.post('/', (req, res) => {
    var r = new Response();
    const phone = req.body.phone;
    // r.data = {
    //     "phone" : phone
    // };
    // return res.json(r);
    Model.users.findOne({
        where: {
            phone: phone
        },  
        attributes: ["username", "phone"]
    }).then((data) => {
        if (data) {
            r.status = statusCodes.SUCCESS;
            r.data = {
                "message": "유저가 존재합니다."
            };
            return res.json(r);


        } else {
            r.status = statusCodes.BAD_INPUT;
            r.data = {
                "message": "다른 은행에 사용자의 계좌가 존재하지 않습니다."
            };
            return res.json(r);

        }
    }).catch((err) => {
            r.status = statusCodes.SERVER_ERROR;
            r.data = {
                "message": "뭔가 이상합니다"
            };
            return res.json(r);
        });
    })

module.exports = router;
