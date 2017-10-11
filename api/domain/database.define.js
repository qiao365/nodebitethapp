"use strict";

const Sequelize = require('./bitapp.prepare').Sequelize;
const sequelize = require('./bitapp.prepare').sequelize;
const redis = require('./bitapp.prepare').redis;

const KEYS = require("../model/oauth2.model").KEYS;

var model = module.exports;


model.DomainAddress = sequelize.define("t_address",{
    address:{
        type: Sequelize.STRING,
        unique: true
    },
    bankType:{
        type:Sequelize.STRING
    },
    status:{
        type:Sequelize.STRING
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: "created_at"
    },
    updatedAt: {
        type: Sequelize.DATE,
        field: "updated_at"
    },
    usage:{
        type:Sequelize.STRING
    },
    password:{
        type:Sequelize.STRING
    }
});

model.DomainEthListener = sequelize.define("t_listener_eth",{
    address:{
        type: Sequelize.STRING
    },
    bankType:{
        type:Sequelize.STRING
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: "created_at"
    },
    updatedAt: {
        type: Sequelize.DATE,
        field: "updated_at"
    },
    txHash:{
        type:Sequelize.STRING,
        field:"tx_hash"
    },
    blockHash:{
        type:Sequelize.STRING,
        field:"tx_block_hash"
    },
    blockNumber:{
        type:Sequelize.BIGINT,
        field:"tx_block_number"
    },
    txFrom:{
        type:Sequelize.STRING,
        field:"tx_from"
    },
    txTo:{
        type:Sequelize.STRING,
        field:"tx_to"
    },
    txValue:{
        type:Sequelize.BIGINT,
        field:"tx_value"
    },
    txInput:{
        type:Sequelize.STRING,
        field:"tx_input"
    },
    txIndex:{
        type:Sequelize.INTEGER,
        field:"tx_index"
    },
    txDate:{
        type: Sequelize.DATE,
        field: "tx_at"
    }    
},{
    indexes:[
        {
            name:"t_listener_eth_address_hash_from_to_value_block_hash_index",
            fields:["address", "tx_hash", "tx_from", "tx_to", "tx_value", "tx_block_hash","tx_index"]
        }
    ]
});
model.DomainBtcListener = sequelize.define("t_listener_btc",{
    address:{
        type: Sequelize.STRING
    },
    bankType:{
        type:Sequelize.STRING
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: "created_at"
    },
    updatedAt: {
        type: Sequelize.DATE,
        field: "updated_at"
    },
    txHash:{
        type:Sequelize.STRING,
        field:"tx_hash"
    },
    blockHash:{
        type:Sequelize.STRING,
        field:"tx_block_hash"
    },
    blockNumber:{
        type:Sequelize.BIGINT,
        field:"tx_block_number"
    },
    txFrom:{
        type:Sequelize.STRING,
        field:"tx_from"
    },
    txTo:{
        type:Sequelize.STRING,
        field:"tx_to"
    },
    txValue:{
        type:Sequelize.BIGINT,
        field:"tx_value"
    },
    txInput:{
        type:Sequelize.STRING,
        field:"tx_input"
    },
    txIndex:{
        type:Sequelize.INTEGER,
        field:"tx_index"
    },
    txDate:{
        type: Sequelize.DATE,
        field: "tx_at"
    }    
},{
    indexes:[
        {
            name:"t_listener_btc_address_hash_from_to_value_block_hash_index",
            fields:["address", "tx_hash", "tx_from", "tx_to", "tx_value", "tx_block_hash","tx_index"]
        }
    ]
});
model.DomainSyncResult = sequelize.define("t_sync_result",{
    txHash:{
        type:Sequelize.STRING,
        field:"tx_hash"
    },
    usage:{
        type:Sequelize.STRING,
        field:"usage"
    },
    status:{
        type:Sequelize.STRING,
        field:"status"
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: "created_at"
    },
    updatedAt: {
        type: Sequelize.DATE,
        field: "updated_at"
    }
},{
    indexes:[
        {
            name:"t_sync_result_hash_usage",
            fields:["tx_hash", "usage"],
            unique: true
        }
    ]
});
