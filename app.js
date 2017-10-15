"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var oauthServer = require("express-oauth-server");

var controllerOfEth = require("./api/controller/EthControllerOfIPC");
var controllerOfBtc = require("./api/controller/BtcControllerOfRPC");
var sequelize = require('./api/domain/bitapp.prepare').sequelize;
const ethModel = require("./api/model/eth.model");

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

/**
ref:https://bitcoin.stackexchange.com/questions/24457/how-do-i-use-walletnotify
--
bitcoin.conf
walletnotify=/home/scripts/transaction.sh %s
--
transaction.sh
curl -G "http://127.0.0.1:12010/blockchain/address/btc/listen/notify/$1"
**/
app.get("/blockchain/address/btc/listen/notify/:txid", controllerOfBtc.listenNotify);

var port = process.env.PORT || 12010;
app.listen(port);
// need 

sequelize.sync({force:false}).then(()=>{
    ethModel.startFilter();
});

console.log(`> app is listening ${port}`);
module.exports = app;
