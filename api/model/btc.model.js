"use strict";
const bitcoin = require('bitcoin');
const appUtil = require('./util');
const timer = require("timers");
const http = require("http");

const TableDefine = require("../domain/database.define");
const DomainAddress = TableDefine.DomainAddress;
const DomainBtcListener = TableDefine.DomainBtcListener;
const DomainSyncResult = TableDefine.DomainSyncResult;

const Config = require("../domain/bitapp.prepare").CONFIG;

var client = new bitcoin.Client(Config.bitcoin);


var btc = module.exports;


btc.bulkCreateBtcAddress = function bulkCreateBtcAddress(quantity, usage) {
    var bulk = [];
    for (var index = 0; index < quantity; ++index) {
        bulk.push(generateNewAddressPromise(appUtil.guid()));
    };
    return Promise.all(bulk).then((values) => {
        let bulkData = values.map((ele) => {
            return {
                address: ele.address,
                bankType: 'BTC',
                status: "ok",
                usage: usage,
                password: ele.password
            };
        });
        return DomainAddress.bulkCreate(bulkData);
    }).then((addressInstanceArray) => {
        return {
            status: "ok",
            sqldata: addressInstanceArray.map((ele) => {
                let ej = ele.toJSON();
                return `insert into t_lib_btc (status, address, created_at, updated_at) values ('ok', '${ej.address}', now(), now());`;
            }),
            msg: `generate ${quantity} eth address`
        };
    });
};

function generateNewAddressPromise(password, key) {
    return new Promise((resolve, reject) => {
        client.getNewAddress(password, (err, address, resHeader) => {
            if (!err) {
                resolve({
                    address: address,
                    key,
                    password
                });
            } else {
                reject(err);
            }
        });
    });
};

let btcFilter = {};

btc.startFilter = function startFilter() {
    let addressMap = new Object(null);
    return btc.stopFilter().then(() => {
        return DomainAddress.findAll({
            where: {
                bankType: "BTC",
                status: "used",
                usage: "promoser"
            }
        });
    }).then((instanceArray) => {
        instanceArray.forEach((ele) => {
            addressMap[ele.toJSON().address] = true;
        });
        return addressMap;
    }).then((addressMap) => {
        handleListenBtcblock(addressMap);
        btcFilter.promoserver = timer.setInterval(() => {
            return handleListenBtcblock(addressMap);
        }, 6 * 60 * 1000);
        return btcFilter.promoserver;
    });
};

var blockHeight = 0;

function handleListenBtcblock(addressMap) {
    let blockHash = '';
    return new Promise((resolve, reject)=>{
        client.getBlockCount((err, height, resHeader)=>{
            if(!err){
                console.log(height);
                resolve(height);
            }else{
                reject(err);
            };
        });
    }).then((height)=>{
        if(height > blockHeight){
            blockHeight = height;
            return new Promise((resolve, reject)=>{
                client.getBlockHash(blockHeight, (err, result, resHeader)=>{
                    if(!err){
                        console.log(result);
                        resolve(result);
                    }else {
                        reject(err);
                    };
                });
            });
        }else{
            throw {
                code: 2000
            };
        }
    }).then((blockhash)=>{
        blockHash = blockhash;
        return new Promise((resolve, reject)=>{
            client.getBlock(blockHash, 1, (err, result, resHeader)=>{
                if(!err){
                    console.log(result);
                    resolve(result);
                }else{
                    reject(err);
                };
            });
        });
    }).then((blockJson)=>{
        let batchTx = blockJson.tx.map((ele, idx)=>{
            return {
                method:"gettransaction",
                params:[ele]
            };
        });
        return new Promise((resolve, reject)=>{
            client.cmd(batchTx, (err, txarray, resHeader)=>{
                if(!err){
                    txarray.forEach((ele, idx)=>{
                        ele.txIndex = idx;
                    });
                    resolve(txarray);
                }else{
                    reject(err);
                };
            });
        });
    }).then((txArray) => {
        let relativeTx = txArray.filter((ele) => {
            let isRelative = ele.details.filter((ele) => {
                return addressMap[ele.address];
            }).length > 0;
            return isRelative;
        }).map((ele) => {
            ele.txFrom = ele.details.filter((ele) => ele.category == 'send');
            ele.txTo = ele.details.filter((ele) => ele.category == 'receive');
            ele.txWithdraw = ele.txFrom.filter((ele) => addressMap[ele.address]);
            ele.txDeposit = ele.txTo.filter((ele) => addressMap[ele.address]);
            return ele;
        }).map((ele) => {
            return {
                address: (ele.txWithdraw[0] || ele.txDeposit[0]).address,
                bankType: 'BTC',
                txHash: ele.txid,
                blockHash,
                blockNumber: blockHeight,
                txFrom: ele.txFrom,
                txTo: ele.txTo,
                txWithdraw: ele.txWithdraw,
                txDeposit: ele.txDeposit,
                txInput: (ele.txWithdraw[0] || ele.txDeposit[0]).amount,
                txIndex: ele.txIndex
            };
        });
        return DomainBtcListener.bulkCreate(relativeTx);
    }).then((instanceArray) => {
        return new Promise((resolve, reject) => {
            let req = http.request(Config.callBackServerOption, (res) => {
                let data = '';
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    data += chunk;
                });
                res.on("end", () => {
                    resolve(data);
                });
            });
            req.on('error', (e) => {
                reject(e);
            });
            req.write(JSON.stringify({
                bankType: "BTC",
                data: instanceArray.map((ele) => ele.toJSON())
            }));
            req.end();
        });
    }).then((requesResult) => {
        let successSync = requesResult && requesResult.result && requesResult.result.length > 0;
        if (successSync) {
            DomainSyncResult.bulkCreate(requesResult.result);
        }
    }).catch((err)=>{
        console.log(err);
    });
}


btc.stopFilter = function stopFilter() {
    return new Promise((resolve, reject) => {
        if (btcFilter.promoserver) {
            timer.clearInterval(btcFilter.promoserver);
            btcFilter.promoserver = undefined;
        }
        resolve();
    });
};
