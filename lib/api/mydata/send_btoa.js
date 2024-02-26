var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
const { Sequelize } = require('../../../models_board');


// POST 요청을 처리하는 핸들러
router.post('/', function(req, res) {
    var f_ac = req.body.from_account;
    console.log("계좌",f_ac);

    Model.transactions.create({
        from_bankcode: req.body.bank_code,
        from_account: f_ac,
        to_bankcode: req.body.bank_code,
        to_account: t_ac,
        amount: req.body.amount,
        sendtime: sendtime
    })
    
    Model.account.update({
        balance: Sequelize.literal(`balance-${req.body.amount}`)
    },
    {
        where: {
            account_number: f_ac
        }
    }).then(()=> {
        console.log("왜 안가?");
        return res.send({"check":"done"});
    }).catch(() => {
        return res.send({"check":"none"});
    }) 
});

module.exports = router;