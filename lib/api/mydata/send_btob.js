var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
const { Sequelize } = require('../../../models_board');


// POST 요청을 처리하는 핸들러
router.post('/', function (req, res) {
    var f_ac = req.body.from_account;
    var t_ac = req.body.to_account;
    let sendtime = req.body.sendtime;
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
                Model.account.findOne({
                    where:{
                        account_number: t_ac
                    },
                }).then((data)=> {
                    if(data){
                        Model.account.findOne({
                            where: {
                                account_number: f_ac
                            },
                            attributes: ["balance", "bank_code"],
                        }).tehn((data2) => {
                            if(data2.balance >= req.body.amount) {
                                console.log("data@!@#!@#!", data2.bank_code)
                                Model.transactions.create({
                                    from_bankcode: data2.bank_code,
                                    from_account: f_ac,
                                    to_bankcode: data.bank_code,
                                    to_account: t_ac,
                                    amount: req.body.amount,
                                    sendtime: sendtime
                                }).then(() => {
                                    console.log("되나?.");
                                    return res.send({ "check": "done" });
                                }).catch(() => {
                                    return res.send({ "check": "none" });
                                })
                            }
                        })
                    }
                })
                })
        })

    
    
});
module.exports = router;