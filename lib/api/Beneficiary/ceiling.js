var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { validateUserToken } = require("../../../middlewares/validateToken");
var { encryptResponse } = require("../../../middlewares/crypt");

/**
 * @path                             - /api/beneficiary/ceiling
 * @middleware                       - Checks admin authorization
 * @return                           - Status
 */

router.post('/', validateUserToken, (req, res) => {
    var r = new Response();
    Model.users.findOne({
        where: {
            account_number: req.account_number
        },
        attributes: ["is_admin"]
    }).then((user) => {
        if(user.is_admin) {
            Model.users.findAll({
                attributes: ["username", "membership", "id"]
            }).then((data) => {
                r.status = statusCodes.SUCCESS;
                r.data = data;
                return res.json(encryptResponse(r));
            }).catch((err) => {
                r.status = statusCodes.SERVER_ERROR;
                r.data = {
                    "message": err.toString()
                };
                return res.json(encryptResponse(r));
            });
        } else {
            Model.users.findOne({
                where: {
                    account_number: req.account_number
                },
                attributes: ["membership"]
            }).then((data) => {
                r.status = statusCodes.SUCCESS;
                r.data = data;
                return res.json(encryptResponse(r));
            }).catch((err) => {
                r.status = statusCodes.SERVER_ERROR;
                r.data = {
                    "message": err.toString()
                };
                return res.json(encryptResponse(r));
            });
        }
    })

    

});


module.exports = router;