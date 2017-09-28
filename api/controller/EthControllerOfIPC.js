"use strict";

const appUtil = require("../model/util.js");
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
    let bulk = [];
    for ( let idx = 0; idx < quantity; idx++){
        bulk[idx] = generateCreateAddressPromise(appUtil.guid());
    };
    return Promise.all(bulk).then((values)=>{
        let result = values.map((ele)=> JSON.stringify(ele)).join("\n");
        console.log(result);
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

function generateCreateAddressPromise(password,key){
    return new Promise((resolve, reject)=>{
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
