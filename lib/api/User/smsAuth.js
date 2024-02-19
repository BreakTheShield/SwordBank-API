var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { encryptResponse, decryptRequest } = require("../../../middlewares/crypt");

/**
 * findPass route
 * This endpoint allows the user to login
 * @path                             - /api/user/smsAuth
 * @middleware                       - Checks admin authorization
 * @param username                   - username to smsAuth
 * @param phone                      - phone to smsAuth
 * @param authnum                    - authnum to smsAuth
 * @return                           - JWT token
 */

router.post('/', decryptRequest, (req, res) => {
    const r = new Response();
    let username = req.body.username;
    let authnum = req.body.authnum;
    let authnumInt = parseInt(authnum, 10);
    let next_new_password = req.body.next_new_password;
    let check_password = req.body.check_password;

    Model.smsauths.findOne({
        where: {
            username : username
        },
        attributes: ["username","authnum"]
    }).then((user) => {
        if (user) {
            if(user.authnum === authnumInt){
                Model.users.findOne({
                    where: {
                        username : username
                    },
                    attributes: ["username","password"]
                }).then((data) => {
                    if (data) {
                        if(data.password === next_new_password){
                            r.status = statusCodes.BAD_INPUT;
                            r.data = {
                                "message": "현재 비밀번호로는 변경할 수 없습니다."
                            };
                            return res.json(encryptResponse(r));
                        }
                        else{
                            if(next_new_password != check_password){
                                r.status = statusCodes.BAD_INPUT;
                                r.data = {
                                    "message": "비밀번호가 다릅니다."
                                };
                                return res.json(encryptResponse(r));
                            }else{
                                Model.users.update({
                                    password: next_new_password
                                }, {
                                    where: {
                                        username: user.username
                                    }
                                }).then(() => {
                                    r.status = statusCodes.SUCCESS;
                                    r.data = {
                                        "message": "비밀번호가 성공적으로 변경되었습니다."
                                    };
                                    return res.json(encryptResponse(r));
                                })
                            }
                        }
                    }
                })
            }else{
                r.status = statusCodes.BAD_INPUT;
                r.data = {
                    "message": "인증번호가 다릅니다."
                };
                return res.json(encryptResponse(r));
            }
        } else {
            r.status = statusCodes.BAD_INPUT;
            r.data = {
                "message": "no user"
            };
            return res.json(encryptResponse(r));
        }
    }).catch((err) => {
        console.error(err);
        r.status = statusCodes.SERVER_ERROR;
        r.data = {
            "message": "error"
        };
        return res.json(encryptResponse(r));
    });
});

module.exports = router;