"use strict";

const appUtil = require("./util.js");
const net = require('net');
const datadir = '/Users/liuhr/data/blockdata/ethereum/prod';

const DomainAddress = require("../domain/database.define").DomainAddress;

const Web3 = require("Web3");
var web3 = new Web3();

var eth = module.exports;


eth.bulkCreateEthAddress = function bulkCreateEthAddress(quantity, usage){
    let bulk = [];
    for ( let idx = 0; idx < quantity; idx++){
        bulk[idx] = generateCreateAddressPromise(appUtil.guid());
    };
    return Promise.all(bulk).then((values)=>{
        let bulkData = values.map((ele)=>{
            return {
                address: ele.address,
                bankType: 'ETH',
                status: "ok",
                usage: usage,
                password: ele.password
            };
        });
        return DomainAddress.bulkCreate(bulkData);
    }).then((addressInstanceArray)=>{
        return {
            status:"ok",
            sqldata: addressInstanceArray.map((ele)=> {
                let ej = ele.toJSON();
                return `insert into t_lib_eth (status, address) values ('ok', '${ej.address}');`;
            }),
            msg:`generate ${quantity} eth address`
        };
    });
};

function generateCreateAddressPromise(password,key){
    return new Promise((resolve, reject)=>{
        let client = net.connect(`${datadir}/geth.ipc`, ()=>{
            console.log("connect to server geth.ipc");
            client.write(JSON.stringify({"jsonrpc":"2.0","method":"personal_newAccount","params":[password],"id":1}));
        });
        let dataString = '';
        client.on('data', (data)=>{
            dataString += data.toString();
            console.log(dataString);
            client.end();
        });
        client.on('end',()=>{
            let data = JSON.parse(dataString);
            if(data.error){
                reject(data.error);
            }else{
                resolve({
                    address:data.result,
                    key,
                    password
                });
            }
        });
    });
}

function startFilter
