var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { encryptResponse, decryptRequest } = require("../../../middlewares/crypt");
const axios = require("axios");

function generateRandomVerificationCode() {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



router.post('/', (req, res) => {
    var r = new Response();
    const phone = req.body.phone;
    const coolsms = require('coolsms-node-sdk').default;
    // apiKey, apiSecret 설정
    const messageService = new coolsms('NCSKJWSJ7FPYA3LA', 'UTZYD0TCCY3JSOTZA2SSU2MVDONPXFLY');
    const auth_num = generateRandomVerificationCode();
    const auth_num_str = auth_num.toString();
   
    // r.data = {
    //     "phone" : phone
    // };
    // return res.json(r);
    Model.users.findOne({
        where: {
            phone: phone
        },
        attributes: ["username", "phone"]
    }).then((userData) => {

        Model.smsauths.findOne({
        where: {
            username: userData.dataValues.username
        },
        attributes: ["username", "authnum"]        
    }).then((smsData) => {

        if (smsData) {
            Model.smsauths.update({
                authnum: auth_num
            }, {
                where: {
                    username: userData.dataValues.username
                }
            })
        } else {
          

            Model.smsauths.create({
                username: userData.dataValues.username,
                authnum: auth_num
            })
        }
        }).catch((err) => {

                r.status = statusCodes.SERVER_ERROR;
                r.data = {
                    "message": "뭔가 이상합니다"
                };
                return res.json(encryptResponse(r));
            });

        messageService.sendOne(
            {
            to: phone,
            from: "01034112647",
            text: auth_num_str
            }
        ).then(() => {
            r.status = statusCodes.SUCCESS;
            r.data = {
                "message": "인증번호를 전송하였습니다."
            };
            return res.json(encryptResponse(r));
        }).catch((err) => {
            r.status = statusCodes.SERVER_ERROR;
            r.data = {
                "message": "뭔가 이상합니다"
            };
            return res.json(encryptResponse(r));
        });
    })
})

router.post('/check_authnum', encryptResponse,(req, res) => {
    var r = new Response();
    var phone = req.body.phone;
    var authnum = req.body.authnum;
    Model.users.findOne({
        where: {
            phone: phone
        },
        attributes: ["username", "phone"]
    }).then((userData) => {
        Model.smsauths.findOne({
            where: {
                username: userData.dataValues.username
            },
            attributes: ["username", "authnum"]
        }).then((smsData) => {

            if (authnum == smsData.dataValues.authnum) {
                r.status = statusCodes.SUCCESS;
                r.data = {
                    "message": "마이데이터 연동 인증되었습니다."
                };
                console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",r);
                return res.json(encryptResponse(r));
            } else {
                r.status = statusCodes.BAD_INPUT;
                r.data = {
                    "message": "인증번호가 일치하지 않습니다."
                };
                return res.json(encryptResponse(r));
            }

        }).catch((err) => {
            r.status = statusCodes.SERVER_ERROR;
            r.data = {
                "message": "뭔가 이상합니다"
            };

            return res.json(encryptResponse(r));
        });
    });
});

module.exports = router;
