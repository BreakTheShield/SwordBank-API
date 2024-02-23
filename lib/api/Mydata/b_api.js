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
    const messageService = new coolsms('NCS2ULU0PYWR4DU8', 'LHQVWAJRESNTB8W9SBRJM5LBEIOZPI2D');
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
        console.log("LOG1!!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

        if (smsData) {
            Model.smsauths.update({
                authnum: auth_num
            }, {
                where: {
                    username: userData.dataValues.username
                }
            })
        } else {
          
            console.log("LOG2!!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

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
            from: "01097252505",
            text: auth_num_str
            }
        ).then(() => {
            console.log("LOG22!!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

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

router.post('/check_authnum',(req, res) => {
    var r = new Response();
    var phone = req.body.phone;
    var authnum = req.body.authnum;

    Model.users.findOne({
        where: {
            phone: phone
        },
        attributes: ["username", "phone"]
    }).then((userData) => {
        console.log("LOG3!!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

        Model.smsauths.findOne({
            where: {
                username: userData.dataValues.username
            },
            attributes: ["username", "authnum"]
        }).then((smsData) => {
            console.log("LOG4!!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

            if (authnum == smsData.dataValues.authnum) {
                console.log("LOG5!!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

                r.status = statusCodes.SUCCESS;
                r.data = {
                    "message": "마이데이터 연동 인증되었습니다."
                };
                console.log("LOG6!!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",r);
                r =  {
                      status: { code: 200, message: 'Success' },
                      data: { message: '마이데이터 연동 인증되었습니다.' }
                    }
                return res.json(r);
            } else {
                r.status = statusCodes.BAD_INPUT;
                r.data = {
                    "message": "인증번호가 일치하지 않습니다."
                };
                console.log("LOG7!!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

                return res.json(encryptResponse(r));
            }

        }).catch((err) => {
            console.log("LOG8!!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

            r.status = statusCodes.SERVER_ERROR;
            r.data = {
                "message": "뭔가 이상합니다"
            };

            return res.json(encryptResponse(r));
        });
    });
});

module.exports = router;
