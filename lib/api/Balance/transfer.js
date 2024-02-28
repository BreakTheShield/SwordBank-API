var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
const Sequelize = require("sequelize");
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { validateUserToken } = require("../../../middlewares/validateToken");
var { encryptResponse, decryptRequest } = require("../../../middlewares/crypt");

/**
 * Balance transfer route
 * @path                 - /api/balance/transfer
 * @middleware
 * @param to_account     - Amount to be transferred to this account
 * @param amount         - Amount to be transferred
 * @return               - Status
 */
router.post('/', [validateUserToken, decryptRequest], (req, res) => {
    var r = new Response();
    let from_account = req.body.from_account;
    let to_account = req.body.to_account;
    let amount = req.body.amount;
    let sendtime = req.body.sendtime;
    let username = req.username;

    if (amount < 0) {
        r.status = statusCodes.BAD_INPUT;
        r.data = {
            "message": "입력 값을 0원 이상 입력해주세요."
        };
        return res.json(encryptResponse(r));
    }
    
    Model.account.findOne({
        where: {
            account_number: from_account
        }, attributes: ["username"] //여기서 username받은걸로 users테이블에서 membership 받아서 검증해야함.

    }).then((data) => {
        if(username!=data.username){
            r.status = statusCodes.BAD_INPUT;
            r.data = {
                "message": "출금계좌가 고객님의 계좌가 아닙니다."
            };
            return res.json(encryptResponse(r));
        }

        Model.users.findOne({
            where: {
                username: data.username
            },attributes:["membership"]

        }).then((data) => {
            
            if(data.membership === "SILVER") {
                if(amount >= 1000000) {
                    r.status = statusCodes.BAD_INPUT;
                    r.data = {
                        "message": "송금 한도 초과입니다."
                    };
                    return res.json(encryptResponse(r));
                }
                else{
                    Model.account.findOne({
                        where:{
                            account_number: to_account
                        },
                    }).then((data)=>{
                        if(data){
                            Model.account.findOne({
                                where: {
                                    account_number: from_account
                                },
                                attributes: ["balance", "bank_code"],
                            }).then((data2) => {
                                if (data2.balance >= amount) {
                                    Model.transactions.create({
                                        from_bankcode: data2.bank_code,
                                        from_account: from_account,
                                        to_bankcode: data.bank_code,
                                        to_account: to_account,
                                        amount: amount,
                                        sendtime: sendtime
                                    }).then(() => {
                                        Model.account.update({
                                            balance: Sequelize.literal(`balance - ${amount}`)
                                        }, {
                                            where: {
                                                account_number: from_account
                                            }
                                        }).then(() => {
                                            Model.account.update({
                                                balance: Sequelize.literal(`balance + ${amount}`)
                                            }, {
                                                where: {
                                                    account_number: to_account
                                                }
                                            }).then(() => {
                                                r.status = statusCodes.SUCCESS;
                                                r.data = {
                                                    "message": "송금에 성공했습니다."
                                                };
                                                return res.json(encryptResponse(r));
                                            });
                                        });
                                    });
                                } else {
                                    r.status = statusCodes.BAD_INPUT;
                                    r.data = {
                                        "message": "계좌의 잔액이 송금액보다 적습니다."
                                    };
                                    return res.json(encryptResponse(r));
                                }
                            }).catch((err) => {
                                r.status = statusCodes.SERVER_ERROR;
                                r.data = {
                                    "message": "송금에 실패했습니다."
                                };
                                console.log(r.data);
                                return res.json(encryptResponse(r));
                            })
                        }
                        else {
                            r.status = statusCodes.BAD_INPUT;
                            r.data = {
                                "message": "입금계좌가 존재하지 않습니다."
                            };
                            return res.json(encryptResponse(r));
                    }
                });
                
                }
            }

            else if(data.membership === "GOLD"){
                if(amount >= 10000000){
                    r.status = statusCodes.BAD_INPUT;
                    r.data = {
                        "message": "송금 한도 초과입니다."
                    }
                    return res.json(encryptResponse(r));
                }
                else{
                    Model.account.findOne({
                        where:{
                            account_number: to_account
                        },
                    }).then((data)=>{
                        if(data){
                            Model.account.findOne({
                                where: {
                                    account_number: from_account
                                },
                                attributes: ["balance", "bank_code"],
                            }).then((data2) => {
                                if (data2.balance >= amount) {
                                    console.log("data in transfer!!!123 : ",data.bank_code);
                                    Model.transactions.create({
                                        from_bankcode: data2.bank_code,
                                        from_account: from_account,
                                        to_bankcode: data.bank_code,
                                        to_account: to_account,
                                        amount: amount,
                                        sendtime: sendtime
                                    }).then(() => {
                                        Model.account.update({
                                            balance: Sequelize.literal(`balance - ${amount}`)
                                        }, {
                                            where: {
                                                account_number: from_account
                                            }
                                        }).then(() => {
                                            Model.account.update({
                                                balance: Sequelize.literal(`balance + ${amount}`)
                                            }, {
                                                where: {
                                                    account_number: to_account
                                                }
                                            }).then(() => {
                                                r.status = statusCodes.SUCCESS;
                                                r.data = {
                                                    "message": "송금에 성공했습니다."
                                                };
                                                return res.json(encryptResponse(r));
                                            });
                                        });
                                    });
                                } else {
                                    r.status = statusCodes.BAD_INPUT;
                                    r.data = {
                                        "message": "계좌의 잔액이 송금액보다 적습니다."
                                    };
                                    return res.json(encryptResponse(r));
                                }
                            }).catch((err) => {
                                r.status = statusCodes.SERVER_ERROR;
                                r.data = {
                                    "message": "송금에 실패했습니다."
                                };
                                console.log(r.data);
                                return res.json(encryptResponse(r));
                            })
                        }
                        else {
                            r.status = statusCodes.BAD_INPUT;
                            r.data = {
                                "message": "입금계좌가 존재하지 않습니다."
                            };
                            return res.json(encryptResponse(r));
                    }
                });
                
                }
            }

            else if(data.membership === "PLATINUM"){
                if(amount >= 100000000){
                    r.status = statusCodes.BAD_INPUT;
                    r.data = {
                        "message": "송금 한도 초과입니다."
                    }
                    return res.json(encryptResponse(r));
                }    
                else{
                    Model.account.findOne({
                        where:{
                            account_number: to_account
                        },
                    }).then((data)=>{
                        if(data){
                            Model.account.findOne({
                                where: {
                                    account_number: from_account
                                },
                                attributes: ["balance", "bank_code"],
                            }).then((data2) => {
                                if (data2.balance >= amount) {
                                    Model.transactions.create({
                                        from_bankcode: data2.bank_code,
                                        from_account: from_account,
                                        to_bankcode: data.bank_code,
                                        to_account: to_account,
                                        amount: amount,
                                        sendtime: sendtime
                                    }).then(() => {
                                        Model.account.update({
                                            balance: Sequelize.literal(`balance - ${amount}`)
                                        }, {
                                            where: {
                                                account_number: from_account
                                            }
                                        }).then(() => {
                                            Model.account.update({
                                                balance: Sequelize.literal(`balance + ${amount}`)
                                            }, {
                                                where: {
                                                    account_number: to_account
                                                }
                                            }).then(() => {
                                                r.status = statusCodes.SUCCESS;
                                                r.data = {
                                                    "message": "송금에 성공했습니다."
                                                };
                                                return res.json(encryptResponse(r));
                                            });
                                        });
                                    });
                                } else {
                                    r.status = statusCodes.BAD_INPUT;
                                    r.data = {
                                        "message": "계좌의 잔액이 송금액보다 적습니다."
                                    };
                                    return res.json(encryptResponse(r));
                                }
                            }).catch((err) => {
                                r.status = statusCodes.SERVER_ERROR;
                                r.data = {
                                    "message": "송금에 실패했습니다."
                                };
                                console.log(r.data);
                                return res.json(encryptResponse(r));
                            })
                        }
                        else {
                            r.status = statusCodes.BAD_INPUT;
                            r.data = {
                                "message": "입금계좌가 존재하지 않습니다."
                            };
                            return res.json(encryptResponse(r));
                    }
                });
                
                }
            }
            else{                               
                Model.account.findOne({
                    where:{
                        account_number: to_account
                    },
                }).then((data)=>{
                    if(data){
                        Model.account.findOne({
                            where: {
                                account_number: from_account
                            },
                            attributes: ["balance", "bank_code"],
                        }).then((data2) => {
                            if (data2.balance >= amount) {
                                Model.transactions.create({
                                    from_bankcode: data2.bank_code,
                                    from_account: from_account,
                                    to_bankcode: data.bank_code,
                                    to_account: to_account,
                                    amount: amount,
                                    sendtime: sendtime
                                }).then(() => {
                                    Model.account.update({
                                        balance: Sequelize.literal(`balance - ${amount}`)
                                    }, {
                                        where: {
                                            account_number: from_account
                                        }
                                    }).then(() => {
                                        Model.account.update({
                                            balance: Sequelize.literal(`balance + ${amount}`)
                                        }, {
                                            where: {
                                                account_number: to_account
                                            }
                                        }).then(() => {
                                            r.status = statusCodes.SUCCESS;
                                            r.data = {
                                                "message": "송금에 성공했습니다."
                                            };
                                            return res.json(encryptResponse(r));
                                        });
                                    });
                                });
                            } else {
                                r.status = statusCodes.BAD_INPUT;
                                r.data = {
                                    "message": "송금에 실패했습니다."
                                };
                                return res.json(encryptResponse(r));
                            }
                        }).catch((err) => {
                            r.status = statusCodes.SERVER_ERROR;
                            r.data = {
                                "message": "송금에 실패했습니다."
                            };
                            console.log(r.data);
                            return res.json(encryptResponse(r));
                        })
                    }
                    else {
                        r.status = statusCodes.BAD_INPUT;
                        r.data = {
                            "message": "송금에 실패했습니다."
                        };
                        return res.json(encryptResponse(r));
                }
            });
            
        }
    }).catch((err)=>{
        r.status = statusCodes.BAD_INPUT;
        r.data = {
            "message": "출금 계좌가 존재하지 않습니다."
        };
        return res.json(encryptResponse(r));
    })
}); //Membership을 이용한 송금 한도 통과.
    
});

module.exports = router;