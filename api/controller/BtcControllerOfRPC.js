"use strict";

const btcModel = require("../model/btc.model");
var btc = module.exports;
var accountMap = {};

btc.getAccountByUserIdentifier = function getAccountByUserIdentifier(req, res) {
    let userIdentifier = req.params.userIdentifier;
    let userPassword = req.params.password;
    let account = accountMap[userIdentifier];

    if (account) {
        if (account.password == userPassword) {
            res.json(account);
            return;
        } else {
            res.status(500);
            res.json({
                message: "账号错误"
            });
            return;
        }
    };
};

btc.bulkCreateBtcAddress = function bulkCreateBtcAddress(req, res) {
    let quantity = req.params.quantity;
    return btcModel.bulkCreateBtcAddress(quantity).then((addressResult) => {
        res.status(200);
        let result = JSON.stringify(addressResult);
        let buffer = Buffer.alloc(result.length);
        buffer.write(result);
        res.set({
            "Content-Type": "text/plain"
        });
        res.send(buffer);
    }).catch((err) => {
        res.status(500);
        res.json(err);
    });
};

btc.bulkCreateBtcAddressWithUsage = function bulkCreateBtcAddressWithUsage(req, res) {};
