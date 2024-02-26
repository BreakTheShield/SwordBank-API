var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
const { Sequelize } = require('../../../models_board');


// POST 요청을 처리하는 핸들러
router.post('/', function (req, res) {
    var f_ac = req.body.from_account;
    var t_ac = req.body.to_account;
    var amount = req.body.amount;
    var sendtime = req.body.sendtime;
    var from_bankcode = 333;
    var to_bankcode = req.body.bankcode; 
    console.log("계좌", f_ac);

    Model.account.update({
        balance: Sequelize.literal(`balance-${amount}`)
    },
    {
        where: {
            account_number: f_ac
        }
    }).then(() => {
            Model.account.update({
                balance: Sequelize.literal(`balance+${amount}`)
            },
            {
                where: {
                    account_number: t_ac
                }
            }).then(() => {

                Model.transactions.create({
                    from_account: f_ac,
                    to_account: t_ac,
                    amount: amount,
                    sendtime: sendtime,
                    from_bankcode:from_bankcode,
                    to_bankcode: to_bankcode
                })
                
                    console.log("됐다.");
                    return res.send({ "check": "done" });
                }).catch(() => {
                    return res.send({ "check": "none" });
                })
        })

    
});
module.exports = router;