"use strict";

const appUtil = require("./util.js");
const net = require('net');
// const datadir = '/Users/nevernew/var/data/ethereum/prod';
const datadir = '/Users/liuhr/data/blockdata/ethereum/prod';

const DomainAddress = require("../domain/database.define").DomainAddress;

const Web3 = require("Web3");
var web3 = new Web3(new Web3.providers.IpcProvider(`${datadir}/geth.ipc`, net));
//var web3 = Web3;
//web3.setProvider(new web3.providers.IpcProvider(`${datadir}/geth.ipc`, net));

var eth = module.exports;


eth.bulkCreateEthAddress = function bulkCreateEthAddress(quantity, usage) {
    let bulk = [];
    return new Promise((resolve, reject) => {
        let client = net.connect(`${datadir}/geth.ipc`);
        client.on("connect", () => {
            resolve(client);
        });
    }).then((client) => {
        return new Promise((resolve, reject) => {
            let resultArray = [];
            let password, key = usage;
            for (var start = 0; start < quantity; ++start) {
                password = appUtil.guid();
                client.write(JSON.stringify({ "jsonrpc": "2.0", "method": "personal_newAccount", "params": [password], "id": (start + 1) }));
                client.on("data", (data) => {
                    let dj = JSON.parse(data.toString());
                    if (dj.error) {
                        reject(dj.error);
                    } else {
                        resultArray.push({
                            address: dj.result,
                            key,
                            password
                        });
                        if (start == quantity - 1) {
                            resolve(resultArray);
                        }
                    };
                });
            };
        });
    }).then((resultArray) => {
        let bulkData = values.map((ele) => {
            return {
                address: ele.address,
                bankType: 'ETH',
                status: "ok",
                usage: usage,
                password: ele.password
            };
        });
        return DomainAddress.bulkCreate(bulkData);
    }).then((instanceArray) => {
        return {
            status: "ok",
            sqldata: instanceArray.map((ele) => {
                return `insert into t_lib_eth (status, address) values ('ok', '${ele.toJSON().address}');`;
            }),
            msg: `generate ${quantity} eth address`
        };

    });
};

function generateCreateAddressPromise(password, key) {
    return new Promise((resolve, reject) => {
        let client = net.connect(`${datadir}/geth.ipc`, () => {
            console.log("connect to server geth.ipc");
            client.write(JSON.stringify({ "jsonrpc": "2.0", "method": "personal_newAccount", "params": [password], "id": 1 }));
        });
    });
};

var ethFilter = {};
eth.startFilter = function startFilter() {
    return DomainAddress.findAll({
        where: {
            bankType: "ETH",
            status: "ok"
        }
    }).then((addressInstanceArray) => {
        let addressArray = addressInstanceArray.map((ele) => ele.toJSON());
        console.log(`addressArray:${JSON.stringify(addressArray)}`);
        let address = addressArray.map((ele) => ele.address);
        return subscribeLogs(address, [null, null]);
    });
};

eth.stopFilter = function stopFilter(key) {
    return new Promise((resolve, reject) => {
        let filter = ethFilter[key];
        if (filter != null) {
            filter.unsubscribe((error, success) => {
                if (success) {
                    console.log("Success unsubscribed");
                    resolve("ok");
                } else {
                    reject("Error when unsubscribe");
                }
            });
        } else {
            resolve("ok");
        };
    });
};

function subscribeLogs(address, topics) {
    var option = {
        fromBlock: 4249784,
        address: address || web3.eth.accounts,
        topics: topics || [null]
    };

    ethFilter.logs = web3.eth.filter(option);
    ethFilter.logs.watch(function(error, result) {
        if (!error) {
            console.log(`no error: ${result}`);
        } else {
            console.log(`error: ${error}`);
        };
    });
    return ethFilter.logs;
};

function subscribeSyncing(address, topics) {
    return new Promise((resolve, reject) => {
        ethFilter.syncing = web3.eth.subscribe("syncing", (error, result) => {
            if (!error) {
                console.log(`no error: ${result}`);
            } else {
                console.log(`error: ${error}`);
            };
        }).on("data", (blockdata) => {
            console.log(`data:${JSON.stringify(blockdata)}`);
        });
        resolve(ethFilter);
    });
};