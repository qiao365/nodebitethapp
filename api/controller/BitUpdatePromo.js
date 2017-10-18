"use strict";

const bitModel = require("../model/bitupdate.model");

const http = require("http");

var btc = module.exports;
var accountMap = {};

// INSERT INTO t_listener_btc (  address ,bankType , createdAt , updatedAt , txHash , blockHash , blockNumber ,txFrom , txTo , txValue , txInput , txIndex , txAt) VALUES ('1GWqnHW2S9EPutmZhkWFRDEBFLPqGN2YBz','BTC','2017-10-17 13:01:10.829+08','2017-10-17 14:35:41.881+08',"78702cc38610fccd028956fd5c51c80db4e0c8eff1a0fa794d78c685391c298","78702cc38610fccd028956fd5c51c80db4e0c8eff1a0fa794d78c685391c298",9999,"1GWqnHW2S9EPutmZhkWFRDEBFLPqGN2YBz","213456782S9EPutmZhkWFRDEsrwerwer23232",23,23,1,11);

btc.updatePromoBitAddressWithUsage = function updatePromoBitAddressWithUsage(req, res) {
    return handleBulkCreateBitAddress(req, res);
};

function handleBulkCreateBitAddress(req, res) {
    let bankType = req.params.bankType;
    return bitModel.promoUpdate(bankType).then((bitListenerArray) => {
        res.status(200);
        let result = JSON.stringify(bitListenerArray);
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

