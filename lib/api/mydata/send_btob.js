var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
const { Sequelize } = require('../../../models_board');




// POST 요청을 처리하는 핸들러
router.post('/', function (req, res) {
    var r=Response();
    var f_ac = req.body.from_account;
    var t_ac = req.body.to_account;
    console.log("계좌", f_ac);


    Model.account.update({
        balance: Sequelize.literal(`balance-${req.body.amount}`)
    },
        {
            where: {
                account_number: f_ac
            }
        }).then(() => {
            Model.account.update({
                balance: Sequelize.literal(`balance+${req.body.amount}`)
            },
                {
                    where: {
                        account_number: t_ac
                    }
                }).then(() => {
                    console.log("왜 안가?");
                    return res.send({ "check": "done" });
                }).catch(() => {
                    return res.send({ "check": "none" });
                })
        })
});


module.exports = router;

