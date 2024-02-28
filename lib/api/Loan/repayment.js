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
 * @path                             - /api/loan/loan
 * @middleware                       - Checks admin authorization
 * @return                           - Status
 */
router.post('/', validateUserToken, (req, res) => {
    var r = new Response();
    let account_number = req.body.selected_account;
    let repayment_amount = req.body.repayment_amount;
    let username = req.body.username;

    if (repayment_amount <= 0) {
        r.status = statusCodes.BAD_INPUT;
        r.data = {
            "message": "대출 상환금을 0원 이상 입력해주세요."
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
                                "message": "대출금의 일부를 상환하셨습니다. "
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
                                "message": "대출금을 모두 상환하셨습니다."
                            };
                            return res.json(encryptResponse(r));
                        })
                    })
                })
                } else {
                r.status = statusCodes.BAD_INPUT;
                r.data = {
                    "message": "잔여 대출금 이하의 상환금을 입력해주세요."
                };
                return res.json(encryptResponse(r));
                } 
            })

        } else if (accountdata.balance < repayment_amount) {
            r.status = statusCodes.BAD_INPUT;
            r.data = {
                "message": "계좌에 잔액이 부족합니다."
            };
            return res.json(encryptResponse(r));
        } 
    }).catch((err) => {
        r.status = statusCodes.SERVER_ERROR;
        r.data = {
            "message": "계좌를 선택해주세요."
        };
        return res.json(encryptResponse(r));
    });
})

module.exports = router;