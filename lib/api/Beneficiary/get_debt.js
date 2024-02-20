    var express = require('express');
    var router = express.Router();
    var Model = require('../../../models/index');
    var Response = require('../../Response');
    var statusCodes = require('../../statusCodes');
    var { validateUserToken } = require("../../../middlewares/validateToken");
    var { encryptResponse} = require("../../../middlewares/crypt");

    /**
     * Beneficiary approve route
     * This endpoint allows to view is_loan of any user
     * @path                             - /api/beneficiary/loan
     * @middleware                       - Checks admin authorization
     * @param loan_amount
     * @param username
     * @return                           - Status
     */
    router.post('/', validateUserToken, (req, res) => {
        var r = new Response();
        let username = req.body.username;
        console.log("username :", username);
        let loan_amount = req.body.loan_amount;
        console.log("loan_amount : ", loan_amount);

        Model.loan.create({ 
            id: 1,
            username: username,
            loan_amount: loan_amount
        }).then(() => {
            r.status = statusCodes.SUCCESS;
            r.data = {
                "message": "Request processed successfully"
            }
            return res.json(encryptResponse(r));
        }).catch((err) => {
            r.status = statusCodes.BAD_INPUT;
            r.data = {
                "message": err.toString()
            };
            return res.json(encryptResponse(r));
        });
    });



    module.exports = router;