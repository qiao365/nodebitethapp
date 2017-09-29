"use strict";

const Sequelize = require('./bitapp.prepare').Sequelize;
const sequelize = require('./bitapp.prepare').sequelize;
const redis = require('./bitapp.prepare').redis;

const KEYS = require("../models/oauth2.model").keys;

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
        type:Sequelize.STRING,
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
            fields:["address", "tx_hash", "tx_from", "tx_to", "tx_value", "tx_block_hash","tx_index"]
        }
    ]
});

// need 
sequelize.sync({force:false }).then(()=>{
    console.log("sync the table ");
});
