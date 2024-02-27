var express = require('express');
var axios = require("axios");
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { validateUserToken, tokenCheck } = require("../../../middlewares/validateToken");
var { encryptResponse, decryptRequest } = require("../../../middlewares/crypt");
/**
 * Account view route
 * @path - /api/mydata/mydata_sms
 * @middleware
 * @return
 */
const test_api_url = "http://localhost:3000/api/mydata/b_api";

function generateRandomVerificationCode() {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

router.get('/',validateUserToken, (req,res)=>{          //my data 신청하는 요청
    var r = new Response();
    var username = req.username;
    // apiKey, apiSecret 설정
    const coolsms = require('coolsms-node-sdk').default;
    const messageService = new coolsms('NCS2ULU0PYWR4DU8', 'LHQVWAJRESNTB8W9SBRJM5LBEIOZPI2D');
    const auth_num = generateRandomVerificationCode();
    const auth_num_str = auth_num.toString();

    Model.users.findOne({
        where:{
            username: username

        }, attributes:['phone']
    }).then((data)=>{  
         
        var phone = data.dataValues.phone;
        //B API에 post 요청으로 phone을 넘겨서 해당 유저가 있는지에 대한 검증
        axios({
            method: "post",
            url : test_api_url,
            data : data.dataValues        //data.data : {phone : 01000101010}꼴

        }).then((bdata)=>{
            if (bdata.data.status.code == 200) {
                Model.smsauths.findOne({
                    where: {
                        username: username
                    },
                    attributes: ["username", "authnum"]        
                }).then((smsData) => {
                    if (smsData) {
                        Model.smsauths.update({
                            authnum: auth_num
                        }, {
                            where: {
                                username: username
                            }
                        })
                    } else {
                        Model.smsauths.create({
                            username: username,
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
                    text: "[인증번호] : " + auth_num_str + "를 입력해주세요."
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

            } else {
                r.status = statusCodes.BAD_INPUT;
                r.data = {
                    "message": "다른 은행에 사용자의 계좌가 존재하지 않습니다."
                };
                return res.json(encryptResponse(r));
            }
        }).catch((err)=>{
            r.status = statusCodes.BAD_INPUT;
            r.data = {
                "message": err.toString()
            };
            return res.json(encryptResponse(r));
        })                                    //mydata 신청하는 요청을 get으로 보냄.


    }).catch((err)=>{
        r.status = statusCodes.BAD_INPUT;
        r.data = {
            "message": err.toString()
        };
        return res.json(encryptResponse(r));                                //에러페이지 띄워주고, 다시 신청하는 페이지로 돌아감.
    })
});


router.post('/', [validateUserToken], (req, res) => {         //sms로 받은 인증번호 보내주는 요청
    var r = new Response();
    var username = req.username;
    var authnum = req.body.authnum;
 
    Model.users.findOne({
 
     where:{
             username: username
 
         }, attributes:['phone']
 
     }).then((data)=>{
        var phone = data.dataValues.phone;
        Model.users.findOne({
            where: {
                phone: phone
            },
            attributes: ["username", "phone"]
        }).then(() => {
            Model.smsauths.findOne({
                where: {
                    username: username
                },
                attributes: ["username", "authnum"]
            }).then((smsData) => {
    
                if (authnum == smsData.dataValues.authnum) {
                    Model.users.update({
                        is_mydata: true
                    }, {  where: {
                            username: username
                        }
                    }). then(() => {
                        r.status = statusCodes.SUCCESS;
                        r.data = {
                            "message": "마이데이터 연동 인증되었습니다."
                        };
                        return res.json(encryptResponse(r));
                    })
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
});

module.exports = router;