"use strict";

const appUtil = require("./util.js");
const net = require('net');
const http = require("http");
//const datadir = '/Users/liuhr/data/blockdata/ethereum/prod';

const TableDefine = require("../domain/database.define");
const DomainAddress = TableDefine.DomainAddress;
const DomainEthListener = TableDefine.DomainEthListener;
const DomainSyncResult = TableDefine.DomainSyncResult;
const BigNumber = require('bignumber.js');

const Config = require("../domain/bitapp.prepare").CONFIG;
const datadir = Config.ethereum.datadir;

const Web3 = require("Web3");
var web3 = new Web3(new Web3.providers.IpcProvider(`${datadir}/geth.ipc`, net));
//var rpc = new Web3(new Web3.providers.HttpProvider(Config.ethereum.rpc));
//var web3 = Web3;
//web3.setProvider(new web3.providers.IpcProvider(`${datadir}/geth.ipc`, net));

var eth = module.exports;


eth.bulkCreateEthAddress = function bulkCreateEthAddress(quantity, usage) {
    let bulk = [];
    for (let idx = 0; idx < quantity; idx++) {
        bulk[idx] = generateCreateAddressPromise(appUtil.guid());
    };
    return Promise.all(bulk).then((values) => {
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
    }).then((addressInstanceArray) => {
        return {
            status: "ok",
            sqldata: addressInstanceArray.map((ele) => {
                let ej = ele.toJSON();
                return `insert into t_lib_eth (status, address, created_at, updated_at) values ('ok', '${ej.address}', now(), now());`;
            }),
            msg: `generate ${quantity} eth address`
        };
    });
};

function generateCreateAddressPromise(password, key) {
    return new Promise((resolve, reject) => {
        let client = net.connect(`${datadir}/geth.ipc`, () => {
            client.write(JSON.stringify({ "jsonrpc": "2.0", "method": "personal_newAccount", "params": [password], "id": 1 }));
        });
        let dataString = '';
        client.on('data', (data) => {
            dataString += data.toString();
            client.end();
        });
        client.on('end', () => {
            let data = JSON.parse(dataString);
            if (data.error) {
                reject(data.error);
            } else {
                resolve({
                    address: data.result,
                    key,
                    password
                });
            };
            client.destroy();
        });
    });
};

var ethFilter = {};
eth.startFilter = function startFilter() {
    let addressMap = new Object(null);
    return DomainAddress.findAll({
        where: {
            bankType: "ETH",
            status: "used",
            usage: "promoico"
        }
    }).then((instanceArray) => {
        addressMap = new Object(null);
        instanceArray.forEach((ele) => {
            addressMap[ele.toJSON().address] = true;
        });
        // console.log("address size:" + instanceArray.length);
        return addressMap;
    }).then((addressMap)=>{
        var filter = web3.eth.filter("latest");
        filter.watch((err, result)=>{
            if(!err){
                return genereateWatchHandle(addressMap, result)();
            }else{
                throw err;
            };
        });
    });
};
function genereateWatchHandle(addressMap, blockHash){
    addressMap = addressMap || {};
    return function watchhandle(){
        let lastBlock;
        return new Promise((resolve, reject)=>{
            console.log(blockHash);
            web3.eth.getBlock(blockHash, (err, lastBlock)=>{
                if(!err){
                    resolve(lastBlock);
                }else{
                    reject(err);
                };
            });
        }).then((theBlock)=>{
            return bulkGetTransaction(theBlock, addressMap);
        }).then((txArray)=>{
            let filteredArray = txArray.filter((ele)=> ele);
            console.log("all:"+txArray.length+",filtered:"+filteredArray.length);
            return DomainEthListener.bulkCreate(filteredArray.map((ele)=>{
                return {
                    address: addressMap[ele.from]? ele.from : ele.to,
                    bankType: 'ETH',
                    txHash: ele.hash,
                    blockHash: ele.blockHash,
                    blockNumer: ele.blockNumber,
                    txFrom: ele.from,
                    txTo: ele.to,
                    txValue: new BigNumber(ele.value).toNumber(),
                    txInput: ele.input,
                    txIndex: ele.transactionIndex
                };
            }));
        }).then((instanceArray)=>{
            return {} || new Promise((resolve, reject)=>{
                let write = JSON.stringify({
                    bankType:"ETH",
                    password:Config.password,
                    data: instanceArray.map((ele)=> {
                        let ej = Object.assign({}, ele.toJSON());
                        ej.txHuman = new BigNumber(ej.txValue).dividedBy(1e18).toNumber();
                        return ej;
                    })
                });
                let option = Object.assign({}, Config.callBackServerOption);
                option.headers= {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(write)
                };
                let req = http.request(option, (res)=>{
                    let data = '';
                    res.setEncoding("utf8");
                    res.on("data", (chunk)=>{
                        data += chunk;
                    });
                    res.on("end", ()=>{
                        resolve(data);
                    });
                });
                req.on('error', (e)=>{
                    reject(e);
                });
                req.write(write);
                req.end();
            });
            //发送异步请求
        }).then((requesResult)=>{
            let successSync = requesResult && requesResult.result && requesResult.result.length > 0;
            if( successSync){
                DomainSyncResult.bulkCreate(requesResult.result);
            }
        });
    };
};

let bulkGetTransaction = function(theBlock, addressMap){
    return new Promise((resolve, reject)=>{
        let txSize = theBlock.transactions.length;
        let txArray = [];
        function bulkFixNumberTrans(start, step){
            let txidArray = theBlock.transactions.slice(start, start+step);
            let bulkget = txidArray.map((txid)=>{
                return new Promise((resolve, reject)=>{
                    web3.eth.getTransaction(txid, (err, tx)=>{
                        if(!err && tx != null){
                            let isRelative = addressMap[tx.from] || addressMap[tx.to];
                            resolve(isRelative ? tx : undefined);
                            //resolve(tx);
                        }else {
                            reject(err);
                        };
                    });
                });
            });
            return Promise.all(bulkget).then((txarray)=>{
                txArray.push.apply(txArray, txarray);
                if(start + step >= txSize){
                    return txArray;
                }else{
                    return bulkFixNumberTrans(start+step, step);
                }
            });
        };
        bulkFixNumberTrans(0, 1).then((txarray)=>{
            resolve(txArray);
        });
    });
};
