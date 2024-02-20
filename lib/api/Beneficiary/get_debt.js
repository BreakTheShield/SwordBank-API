var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { validateUserToken } = require("../../../middlewares/validateToken");
var { encryptResponse, decryptRequest } = require("../../../middlewares/crypt");

/**
 * Beneficiary approve route
 * This endpoint allows to view is_loan of any user
 * @path                             - /api/beneficiary/loan
 * @middleware                       - Checks admin authorization
 * @param loan_mount
 * @param username
 * @return                           - Status
 */
router.post('/', [validateUserToken, decryptRequest], (req, res) => {
    var r = new Response();
    let username = req.username;
    let loan_mount = req.body.loan_mount;
    Model.loan.create({ 
        username: username,
        loan_mount:loan_mount
    }).then((enData) => {
        r.status = statusCodes.SUCCESS;
        r.data = enData;
        return res.json(encryptResponse(r));
    }).catch((err) => {
        r.status = statusCodes.SERVER_ERROR;
        r.data = {
            "message": err.toString()
        };
        return res.json(encryptResponse(r));
    });
});



module.exports = router;