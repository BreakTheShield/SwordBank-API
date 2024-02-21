var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
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
    let username = req.body.username;
    Model.users.findAll({
        where: {
            username : username,
            is_loan: true 
        },
        attributes: ["username"]
    }).then((data) => {
        if(data.length > 0){
            Model.loan.findAll({
                where: {
                    username: username
                },
                attributes: ["loan_amount"]
        }).then((loanData) => {           
            Model.account.findAll({
                where: {
                    username: username
                },
                attributes: ["account_number", "balance"]
            }).then((accountData) => {
                let arr_loan_amount = loanData.map((elem) => parseInt(elem.loan_amount));
                let arr_account_number = accountData.map((elem) => parseInt(elem.account_number));
                let arr_balance = accountData.map((elem) => parseInt(elem.balance));
                r.status = statusCodes.SUCCESS;
                r.data = {
                    "message": "Success",
                    "loan_amount": arr_loan_amount,
                    "account_number": arr_account_number,
                    "balance": arr_balance
                }
                    return res.json(encryptResponse(r));
                })
            })
        } else {
            Model.account.findAll({
                where: {
                    username: username
                },
                attributes: ["account_number"]
            }).then((data) => {
                let debt_account_number = data.map((elem) => parseInt(elem.account_number));
                r.status = statusCodes.BAD_INPUT;
                r.data = {
                    "message": "Success",                    
                    "account_number": debt_account_number,
                }
                    return res.json(encryptResponse(r));
                })
        }
    }).catch((err) => {
        r.status = statusCodes.SERVER_ERROR;
        r.data = err;
        return res.json(encryptResponse(r));
    });
});



module.exports = router;