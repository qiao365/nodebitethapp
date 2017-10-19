"use strict";
const bitcoin = require('bitcoin');
const appUtil = require('./util');
const timer = require("timers");
const http = require("http");

const TableDefine = require("../domain/database.define");
const DomainAddress = TableDefine.DomainAddress;
const DomainBtcListener = TableDefine.DomainBtcListener;
const DomainEthListener = TableDefine.DomainEthListener;
const DomainSyncResult = TableDefine.DomainSyncResult;

const Config = require("../domain/bitapp.prepare").CONFIG;

var btc = module.exports;

btc.promoUpdate = function promoUpdate(bankType){

    // new Promise((resolve, reject)=>{
    //     var btcdAte = {
    //         address :'1GWqnHW2S9EPutmZhkWFRDEBFLPqGN2YB1',
    //         bankType :'BTC',
    //         createdAt : new Date(),
    //         updatedAt :'2017-10-17 13:01:10.829+08',
    //         txHash :'0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    //         blockHash:'0xhashxxxxxxxxxxxxxxxxxxxxxxx',
    //         blockNumber :33,
    //         txFrom :'1GWqnHW2S9EPutmZhkWFRDEBFLPqGN2YB1',
    //         txTo :'010nHW2S9EPutmZhkWFRDEBFLPqGN2YBz01',
    //         txValue :6,
    //         txInput :'6',
    //         txIndex :9
    //     };
    //     resolve(btcdAte);
    // }).then((btcdAte)=>{
    //     console.log('\n------------------btcdAte:'+btcdAte+'------------------');
    //     DomainBtcListener.insertOrUpdate(btcdAte);
    // });
    
    return new Promise((resolve, reject)=>{
        var bitListenerArray;
        switch(bankType){
            case "ETH":
                resolve(DomainEthListener.findAll());
            case "BTC":
                resolve(DomainBtcListener.findAll());
            default:
                throw new Error("unknown fund type");
        }
    }).then((bitListenerArray) => {
        // console.log('\n------------------bitListenerArray:'+JSON.stringify(bitListenerArray)+'------------------');
        return new Promise((resolve, reject)=>{
        let write = JSON.stringify({
            bankType: bankType,
            password: Config.password,
            data: bitListenerArray.map((ele) => {
                let ej = Object.assign({}, ele.toJSON());
                if(bankType == "BTC"){
                    ej.txHuman = ej.txValue / 1e10;
                }else if(bankType == "ETH"){
                    ej.txHuman = ej.txValue / 1e18;
                };
                ej.id = null;
                return ej;
            })
        });
        console.log('\n------------------data:'+JSON.stringify(write)+'------------------');
        let option = Object.assign({}, Config.promoServerUpdateOption);
        option.headers= {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(write)
        };
        var req = http.request(option, (res) =>{
                var data = "";
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
        req.write(write);
        req.end();
    })
    });
}

// INSERT INTO t_listener_eth (  address , bankType , created_at , updated_at , tx_hash , tx_block_hash , tx_block_number ,tx_from , tx_to , tx_value , tx_input , tx_index , tx_at) VALUES ('1GWqnHW2S9EPutmZhkWFRDEBFLPqGN2YBz','BTC','2017-10-17 13:01:10.829+08','2017-10-17 14:35:41.881+08',"78702cc38610fccd028956fd5c51c80db4e0c8eff1a0fa794d78c685391c298","78702cc38610fccd028956fd5c51c80db4e0c8eff1a0fa794d78c685391c298",9999,"1GWqnHW2S9EPutmZhkWFRDEBFLPqGN2YBz","213456782S9EPutmZhkWFRDEsrwerwer23232",23,23,1,11);