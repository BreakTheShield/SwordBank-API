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
 * @path                             - /api/beneficiary/loan
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
            r.status = statusCodes.SUCCESS;
            r.data = data;
            return res.json(encryptResponse(r));
        } else {
            r.status = statusCodes.SERVER_ERROR;
            r.data= err;
            res.json(encryptResponse(r));
        }
    }).catch((err) => {
        r.status = statusCodes.SERVER_ERROR;
        r.data = err;
        return res.json(encryptResponse(r));
    });
});



module.exports = router;