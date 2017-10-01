"use strict";

const appUtil = require("../model/util.js");
const ethModel = require("../model/eth.model");
const net = require('net');
const datadir = '/Users/liuhr/data/blockdata/ethereum/prod';
var eth = module.exports;

var accountMap = {
};

eth.getAccountByUserIdentifier = function getAccountByUserIdentifier(req, res){
    let userIdentifier = req.params.userIdentifier;
    let userPassword = req.params.password;
    let account = accountMap[userIdentifier];
    
    if(account) {
        if(account.password == userPassword){
            res.json(account);
            return;
        }else{
            res.status(500);
            res.json({
                message:"账号错误"
            });
            return;
        }
    };
    let client = net.connect(`${datadir}/geth.ipc`, ()=>{
        console.log("connect to server geth.ipc");
        client.write(JSON.stringify({"jsonrpc":"2.0","method":"personal_newAccount","params":[userPassword],"id":1}));
    });
    let dataString = '';
    client.on('data', (data)=>{
        dataString += data.toString();
        console.log(dataString);
        client.end();
    });
    client.on('end',()=>{
        let data = JSON.parse(dataString);
        account = {
            account: data.result,
            password: userPassword
        };
        accountMap[userIdentifier] = account;
        res.json(account);
        console.log("disconnect from server");
    });
};

eth.bulkCreateEthAddress = function bulkCreateEthAddress(req, res){
    let quantity = req.params.quantity;
    return ethModel.bulkCreateEthAddress(quantity).then((addressResult)=>{
        res.status(200);
        let result = JSON.stringify(addressResult);
        let buffer = Buffer.alloc(result.length);
        buffer.write(result);
        res.set({
            "Content-Type":"text/plain"
        });
        res.send(buffer);
    }).catch((err)=>{
        res.status(500);
        res.json(err);
    });
};
eth.bulkCreateEthAddressWithUsage = function bulkCreateEthAddressWithUsage(req, res){
    let quantity = req.params.quantity;
    let usage = req.params.usage;
    return ethModel.bulkCreateEthAddress(quantity, usage).then((addressResult)=>{
        res.status(200);
        let result = JSON.stringify(addressResult);
        let buffer = Buffer.alloc(result.length);
        buffer.write(result);
        res.set({
            "Content-Type":"text/plain"
        });
        res.send(buffer);
    }).catch((err)=>{
        res.status(500);
        res.json(err);
    });
};

eth.startFilter = function startFilter(req, res){
    return ethModel.startFilter().then((filter)=>{
        res.status(200);
        res.json({
            msg:"ok"
        });
    });
};

eth.stopFilter = function startFilter(req, res){
    let filterKey = req.params.filterKey;
    return ethModel.stopFilter(filterKey).then((result)=>{
        res.status(200);
        res.json({
            msg: result
        });
    });
};
