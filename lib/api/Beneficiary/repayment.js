var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
const Sequelize = require("sequelize");
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { validateUserToken } = require("../../../middlewares/validateToken");
var { encryptResponse, } = require("../../../middlewares/crypt");
/**
 * Beneficiary approve route
 * This endpoint allows to view is_loan of any user
 * @path                             - /api/beneficiary/loan
 * @middleware                       - Checks admin authorization
 * @return                           - Status
 */
router.post('/', validateUserToken, (req, res) => {
    var r = new Response();
    let account_number = req.body.selected_account;
    let repayment_amount = req.body.repayment_amount;
    let username = req.body.username;
    console.log("account :",account_number);
    console.log("repayment :",repayment_amount);
    console.log("username : ", username);

    if (repayment_amount <= 0) {
        r.status = statusCodes.BAD_INPUT;
        r.data = {
            "message": "Must Be a Positive Number"
        };
        return res.json(encryptResponse(r));
    }

    Model.account.findOne({
        where: {
            account_number: account_number
        },
        attributes:["balance"]
    }).then((accountdata) => {
        if (accountdata.balance >= repayment_amount) {
            Model.loan.findOne({
                where: {
                    username: username
                },
                attributes:["loan_amount"]
            }).then((loanData) => {
                if (loanData.loan_amount > repayment_amount) {
                    Model.loan.update({
                        loan_amount: Sequelize.literal(`loan_amount - ${repayment_amount}`)
                    }, {
                        where: {
                            username : username
                        }
                    }).then(() => {
                        Model.account.update({
                            balance: Sequelize.literal(`balance - ${repayment_amount}`)
                        }, {
                            where: {
                                account_number: account_number
                            }
                        }).then(() => {
                            r.status = statusCodes.SUCCESS;
                            r.data = {
                                "message": "Partial Repayment Success"
                            };
                            return res.json(encryptResponse(r));
                        })
                    })
                } else if (loanData.loan_amount == repayment_amount) {
                    Model.users.update({
                        is_loan: false
                    }, {
                        where: {
                            username: username
                        }
                    }).then(() => {
                        Model.loan.destroy({
                            where: {
                                username: username
                            }
                        }).then(() => {
                            Model.account.update({
                                balance: Sequelize.literal(`balance - ${repayment_amount}`)
                            }, {
                                where: {
                                    account_number: account_number
                                }
                            }).then(() => { 
                            r.status = statusCodes.SUCCESS;
                            r.data = {
                                "message": "Full Repayment Success"
                            };
                            return res.json(encryptResponse(r));
                        })
                    })
                })
                } else {
                r.status = statusCodes.BAD_INPUT;
                r.data = {
                    "message": "too much"
                };
                return res.json(encryptResponse(r));
                } 
            })

        } else if (accountdata.balance < repayment_amount) {
            r.status = statusCodes.BAD_INPUT;
            r.data = {
                "message": "Insufficient balance"
            };
            return res.json(encryptResponse(r));
        } 
    }).catch((err) => {
        r.status = statusCodes.SERVER_ERROR;
        r.data = {
            "message": "뭔가 잘못됐습니다."
        };
        return res.json(encryptResponse(r));
    });
})

module.exports = router;