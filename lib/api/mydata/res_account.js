var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');

// POST 요청을 처리하는 핸들러
router.post('/', function(req, res) {
    //console.log(req);
    var r = new Response();
    var req_phone = req.body.phone;
    //console.log("resssss", res);
    console.log("@@@@@@@@@@@@@@req@@@@",req.body.phone);

    Model.users.findOne({
        where: {
            phone: req_phone
        },
        attribute: ["username"]
    }).then((data) => {
        Model.account.findAll({
            where: {
                username : data.username
            },
            attributes: ["account_number", "balance", "bank_code"]
        }).then((data2) => {
            if(data2.length > 0) {
                //r.status = statusCodes.SUCCESS;
                //console.log("asdfasdf",data2);
                r.data2 = data2;
                return res.json((r));
            } else {
                //r.status = statusCodes.NOT_AUTHORIZED;
                r.data2 = {
                    "message": "안되는데??ㅠㅠ"
                }
                return res.json((r));
            }
        }).catch((err2) => {
            //r.status = statusCodes.SERVER_ERROR;
            r.data2 = {
                "message": err2.toString()
            };
            return res.json((r));
        });
    }).catch((err) => {
        console.log("에러가 뜨네????");
        r.data={
            "message":err.toString()
        };
        return res.json((r));
    });

    
});

module.exports = router;