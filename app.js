"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var oauthServer = require("express-oauth-server");

var controllerOfEth = require("./api/controller/EthControllerOfIPC");
var controllerOfBtc = require("./api/controller/BtcControllerOfRPC");

var app = express();
app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

app.oauth = new oauthServer({
    model: require('./api/model/oauth2.model')
});

app.get("/account/eth/:userIdentifier/:password", controllerOfEth.getAccountByUserIdentifier);
app.get("/account/btc/:userIdentifier/:password", controllerOfBtc.getAccountByUserIdentifier);

app.post("/blockchain/address/eth/bulk/:quantity", controllerOfEth.bulkCreateEthAddress);
app.post("/blockchain/address/eth/bulk/:usage/:quantity", controllerOfEth.bulkCreateEthAddressWithUsage);
app.post("/blockchain/address/btc/bulk/:quantity", controllerOfBtc.bulkCreateBtcAddress);
app.post("/blockchain/address/btc/bulk/:usage/:quantity", controllerOfBtc.bulkCreateBtcAddressWithUsage);

app.post("/blockchain/address/eth/listen/start", controllerOfEth.startFilter);
app.post("/blockchain/address/eth/listen/stop/:filterKey", controllerOfEth.stopFilter);

app.post("/blockchain/address/btc/listen/start", controllerOfBtc.startFilter);
app.post("/blockchain/address/btc/listen/stop/:filterKey", controllerOfBtc.stopFilter);
app.get("/blockchain/address/btc/listen/notify/:txid", controllerOfBtc.listenNotify);

var port = process.env.PORT || 12010;
app.listen(port);

console.log(`> app is listening ${port}`);
module.exports = app;
