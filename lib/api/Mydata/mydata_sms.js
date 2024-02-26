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
const test_api_url = "http://59.16.223.162:38888/api/mydata/b_api";
const test2_api_url = "http://59.16.223.162:38888/api/mydata/b_api/check_authnum";


router.get('/',validateUserToken, (req,res)=>{          //my data 신청하는 요청
    var r = new Response();
    var username = req.username;

    Model.users.findOne({
        where:{
            username: username

        }, attributes:['phone']

    }).then((data)=>{   
        //B API에 post 요청으로 phone을 넘겨서 해당 유저가 있는지에 대한 검증
        console.log(data.dataValues);
        axios({
            method: "post",
            url : test_api_url,
            data : data.dataValues        //data.data : {phone : 01000101010}꼴
            

        }).then((data)=>{
            r.status = statusCodes.SUCCESS;
            r.data = data.data;
            console.log("r 다시 확인하는 부분@@@@@@@@@@@@@@@@@",r);
            return res.json(encryptResponse(r));  
                                //받아오는 값은 요청을 잘 받았다는 return 해당 return을 받은 후 sms 인증화면으로 넘어가도록 하면 됨.
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
    console.log("LOG333!!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
 
    Model.users.findOne({
 
     where:{
             username: username
 
         }, attributes:['phone']
 
     }).then((data)=>{
         axios({
             method: "post",
             url : test2_api_url,
             data: {
                 "authnum" : authnum,
                 "phone" : data.phone
             }
         }).then((data)=>{
             console.log("LOG9!!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@", data);
 
             result = data.data;
             console.log("LOG99!!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@", result);
 
             r.status = result.status.code;
             r.data = result.data;
             console.log("##############################",r.status);
 
             if (r.status == 200) {
                 Model.users.update({
                     is_mydata : true,
                 }, {
                     where: {username: username}
             }).then(() => {
                     r.status = statusCodes.SUCCESS;
                     r.data = {
                         "message": "Success"
                     };
                     return res.json(encryptResponse(r));
                 })
             } else {
                 r.status = statusCodes.BAD_INPUT;
                 r.data = {
                     "message": "error error"
                 };
                 return res.json(encryptResponse(r));
             }
             
         }).catch((err)=>{
             r.status = statusCodes.BAD_INPUT;
             r.data = {
                 "message": err.toString()
             };
             console.log("LOG10!!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
 
             return res.json(encryptResponse(r));
 
         })                                  //mydata 인증하는 요청을 post으로 보냄.
                                                         // body에는 인증번호가 들어가있어야함.
     }).catch((err)=>{
         r.status = statusCodes.BAD_INPUT;
         r.data = {
             "message": err.toString()
         };
         console.log("LOG11!!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
 
         return res.json(encryptResponse(r));
     })
       
 });
                                                         //B API에서 받은 sms 인증 문자를 B API로 POST요청을 보냄
 module.exports = router;
 

