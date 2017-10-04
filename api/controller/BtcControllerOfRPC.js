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
    return handleBulkCreateBtcAddress(quantity, undefined, req, res);
};

btc.bulkCreateBtcAddressWithUsage = function bulkCreateBtcAddressWithUsage(req, res) {
    let quantity = req.params.quantity;
    let usage = req.params.usage;
    return handleBulkCreateBtcAddress(quantity, usage, req, res);
};

function handleBulkCreateBtcAddress(quantity, usage, req, res){
    return btcModel.bulkCreateBtcAddress(quantity,usage).then((addressResult) => {
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
}

btc.startFilter = function startFilter(req, res){
    return btcModel.startFilter().then((filter)=>{
        res.status(200);
        res.json({
            msg:filter
        });
    });
};

btc.stopFilter = function stopFilter(req, res){
    return btcModel.stopFilter().then((result)=>{
        res.status(200);
        res.json({
            msg: result
        });
    });
};
