const bitcoin = require('bitcoin');

var client = new bitcoin.Client({
    port:8332,
    host:'localhost',
    user: 'your_rpc_user',
    pass: 'your_rpc_password',
    timeout: 30000
});

var btc = module.exports;
var accountMap = {};

btc.getAccountByUserIdentifier = function getAccountByUserIdentifier(req, res){
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
    client.getNewAddress( userIdentifier, (err, address, resHeader)=>{
        account = {
            account: address,
            password: userPassword
        };
        accountMap[userIdentifier] = account;
        res.status(200);
        res.json(account);
    });
};

btc.bulkCreateBtcAddress = function bulkCreateBtcAddress(req, res){
};

btc.bulkCreateBtcAddressWithUsage = function bulkCreateBtcAddressWithUsage(req, res){
};
