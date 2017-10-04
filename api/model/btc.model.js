"use strict";
const bitcoin = require('bitcoin');
const appUtil = require('./util');
const timer = require("timers");

const DomainAddress = require("../domain/database.define").DomainAddress;

var client = new bitcoin.Client({
    port: 8332,
    host: 'localhost',
    user: 'somenew',
    pass: 'bydpdwz218',
    timeout: 30000
});



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

let btcFilter = {
};

btc.startFilter = function startFilter(){
    return new Promise((resovle, reject)=>{
        btcFilter.promoserver = timer.setInterval(()=>{
        }, 5 * 60 * 1000);
    });
};

function handleListenBtcblock(){
    return Promise((resovle, reject)=>{
    })
}


btc.stopFilter = function stopFilter(){
    return new Promise((resolve, reject)=>{
        if(btcFilter.promoserver){
            timer.clearInterval(btcFilter.promoserver);
            btcFilter.promoserver = undefined;
        }
    });
};
