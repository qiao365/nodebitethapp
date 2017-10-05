var Sequelize = require('sequelize');
const KEYS = require("../model/oauth2.model").KEYS;

const APP = "nodebitapp";
var sequelize = new Sequelize(APP, APP, APP, {
    host: "localhost",
    logging: true,
    define: {
        freezeTableName: true,
        underscored: true

    },
    dialect: 'postgres'
});

var bluebird = require('bluebird');
var redisdb = require('redis');
var redis = redisdb.createClient();
bluebird.promisifyAll(redisdb.RedisClient.prototype);
bluebird.promisifyAll(redisdb.Multi.prototype);
/**
//如果时区不正确，则需要放开
require('pg').types.setTypeParser(1114, stringValue => {
    return new Date(stringValue + "+0000");
    // e.g., UTC offset. Use any offset that you would like.
});
 **/
/**
初始化数据
**/

redis.hmset(`${KEYS.client}${APP}`, {
    clientId: APP,
    clientSecret: 'a1d405a9257191a9dcaca'
});
const CONFIG = {
    callBackServerOption:{
        port:9000,
        hostname:"localhost",
        method:"POST"
    },
    bitcoin:{
        port: 8332,
        host: 'localhost',
        user: 'somenew',
        pass: 'bydpdwz218',
        timeout: 30000
    }

};


exports.sequelize = sequelize;
exports.Sequelize = Sequelize;
exports.redis = redis;
exports.CONFIG = CONFIG;
