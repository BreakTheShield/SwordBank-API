var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var { validateUserToken } = require("../../../middlewares/validateToken");
var { encryptResponse } = require("../../../middlewares/crypt");

/**
 * Beneficiary approve route
 * This endpoint allows to approve beneficiary requests of any user from this endpoint
 * @path                             - /api/beneficiary/approve
 * @middleware                       - Checks admin authorization
 * @param id                         - ID to be approved
 * @return                           - Status
 */
router.post('/', validateUserToken, (req, res) => {
    var r = new Response();
    let username=req.body.username;
    
    Model.account.findAll({
        where: {
            username:username,
        },
        attributes: ["account_number"]
    }).then((data) => {
        //console.log("22222222222222 : ",data);

        let arr = data.map((elem) => parseInt(elem.account_number));
        //console.log("3333333333333 : ",arr);

                       r.status = statusCodes.SUCCESS;
                        r.data = {
                            "message": "Success",
                            "accountdata": arr
                        }
                        return res.json(encryptResponse(r));
                    }).catch((err) => {
        r.status = statusCodes.SERVER_ERROR;
        r.data = {
            "message": err.toString()
        };
        res.json(encryptResponse(r));
    });
});

module.exports = router;
