var express = require('express');
var router = express.Router();
var Model = require('../../../models/index');
var Response = require('../../Response');
var statusCodes = require('../../statusCodes');
var {encryptResponse, decryptRequest} = require("../../../middlewares/crypt");

/**
 * Registration route
 * This endpoint allows the user to register
 * Additionally this also creates a new account for this user
 * @path                             - /api/user/register
 * @middleware                       - Checks admin authorization
 * @param username                   - Username to login
 * @param password                   - Password to login
 * @param email                      - email
 * @return                           - Status
 */
router.post('/', decryptRequest, (req, res) => {
    var r = new Response();
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    let phone = req.body.phone;
    let sendtime = req.body.sendtime
    let account_number = Math.round(Math.random() * 888888 + 111111);

    Model.users.findAll({
        where: {
            username: username
        }
    }).then((data) => {
        if (data == "") {
            Model.users.findOne({
                account_number: account_number
            }).then((data) => {
                // Regenerates new account number if account number exists
                if (data) {
                    account_number = Math.round(Math.random() * 888888 + 111111);
                }

                Model.users.create({
                    username: username,
                    password: password,
                    email: email,
                    phone: phone,
                    account_number: account_number,
                    membership: "FRIEND"
                }).then(() => {

                    // Create a transaction
                    Model.transactions.create({
                        from_account: 999999,
                        to_account: account_number,
                        amount: 10000,
                        sendtime: sendtime
                    }).then(() => {

                        // Add beneficiary record
                        Model.beneficiaries.create({
                            account_number: account_number,
                            beneficiary_account_number: 999999,
                            approved: 1
                        }).then(() => {

                            // Add the reverse beneficiary record
                            Model.beneficiaries.create({
                                account_number: 999999,
                                beneficiary_account_number: account_number,
                                approved: 1
                            }).then(() => {
                                r.status = statusCodes.SUCCESS;
                                r.data = {
                                    "message": "Success"
                                }
                                res.json(encryptResponse(r));
                            }).catch((err) => {
                                r.status = statusCodes.SERVER_ERROR;
                                r.data = {
                                    "message": err.toString()
                                };
                                res.json(encryptResponse(r));
                            });
                        }).catch((err) => {
                            r.status = statusCodes.SERVER_ERROR;
                            r.data = {
                                "message": err.toString()
                            };
                            res.json(encryptResponse(r));
                        });
                    });
                }).catch((err) => {
                    r.status = statusCodes.SERVER_ERROR;
                    r.data = {
                        "message": err.toString()
                    };
                    res.json(encryptResponse(r));
                });
            });
        } else {
            r.status = statusCodes.BAD_INPUT;
            r.data = {
                "message": "Username already taken"
            };
            return res.json(encryptResponse(r));
        }
    }).catch((err) => {
        r.status = statusCodes.SERVER_ERROR;
        r.data = {
            "message": err.toString()
        };
        return res.json(encryptResponse(r));
    });
});

module.exports = router;