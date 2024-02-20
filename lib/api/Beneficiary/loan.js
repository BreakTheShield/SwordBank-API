var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { validateUserToken } = require("../../../middlewares/validateToken");
var { encryptResponse } = require("../../../middlewares/crypt");

/**
 * Beneficiary approve route
 * This endpoint allows to view is_loan of any user
 * @path                             - /api/beneficiary/loan
 * @middleware                       - Checks admin authorization
 * @return                           - Status
 */
router.post('/', validateUserToken, (req, res) => {
    var r = new Response();
    var temp_username = req.body.username;
    console.log('test');
    console.log(temp_username);
    Model.users.findOne({
        where: {
            is_loan : false,
            username: temp_username
        },
        attributes: ["username"]
        
    }).then((data) => {
        
        r.status = statusCodes.SUCCESS;
        r.data = data;
        console.log(username);
        return res.json(encryptResponse(r));
    }).catch((err) => {
        
        r.status = statusCodes.SERVER_ERROR;
        r.data = {
            "message": err.toString()
        };
        return res.json(encryptResponse(r));
    });
    console.log(username);
});



module.exports = router;