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

btc.listenNotify = function listenNotify(txid){
    return new Promise((resolve, reject)=>{
        client.getTransaction(txid, (err, result, resHeader)=>{
            if(!err){
                resolve(result);
            }else{
                reject(err);
            };
        });
    }).then((tx)=>{
        let txDataSave = tx.details.map((ele)=>{
            // tx doest not have blockHeight
            return {
                address: ele.address,
                bankType: 'BTC',
                txHash: tx.txid,
                blockHash: tx.blockHash,
                blockNumber: 0,
                txFrom: ele.category == 'send' ? ele.address : '',
                txTo: ele.category == 'receive' ? ele.address : '',
                txValue: ele.amount * 1e10,
                txInput: ele.amount,
                txIndex: tx.blockindex,
                txDate: new Date(tx.timereceived * 1000)
            };
        });
        return DomainBtcListener.bulkCreate(txDataSave);
    }).then((listenInstance)=>{
        return new Promise((resolve, reject)=>{
            let write = JSON.stringify({
                bankType: "BTC",
                password: Config.password,
                data: listenInstance.map((ele) => {
                    let ej = Object.assign({}, ele.toJSON());
                    ej.txHuman = ej.txValue / 1e10;
                    return ej;
                })
            });
            let option = Object.assign({}, Config.callBackServerOption);
            option.headers= {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(write)
            };
            let req = http.request(option, (res) => {
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
            req.write();
            req.end();
        });
    }).then((syncResult)=>{
        DomainSyncResult.bulkCreate(syncResult.result);
    });
};

