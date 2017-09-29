var model = module.exports;
var bluebird = require('bluebird');
var redisdb = require('redis');
var db = redisdb.createClient();
bluebird.promisifyAll(redisdb.RedisClient.prototype);
bluebird.promisifyAll(redisdb.Multi.prototype);

const KEYS = {
    token: "token:",
    client: "clients:",
    refreshToken: "refresh_token:",
    grantTypes: ":grant_types",
    user: "users:",
    controller: "controllers:"
};

model.getAccessToken = function(bearerToken) {
    return db.hgetallAsync(`${KEYS.token}${bearerToken}`).then((token) => {
        if (!token) {
            return undefined;
        };
        return {
            accessToken: token.accessToken,
            accessTokenExpiresAt: new Date(token.accessTokenExpiresAt),
            client: JSON.parse(token.client),
            refreshToken: token.refreshToken,
            refreshTokenExpiresAt: new Date(token.refreshTokenExpiresAt),
            user: JSON.parse(token.user)
        };
    });
};

model.getClient = function(clientId, clientSecret) {
    let key = `${KEYS.client}${clientId}`;
    return db.hgetallAsync(key).then((client) => {
        if (!client || client.clientSecret !== clientSecret) return undefined;
        return {
            clientId: client.clientId,
            clientSecret: client.clientSecret,
            grants: ["password", "refresh_token"]
        };
    });
};

model.getRefreshToken = function(bearerToken) {
    console.log(bearerToken);
    return db.hgetallAsync(`${KEYS.refreshToken}${bearerToken}`).then((token) => {
        if (!token) return undefined;
        return {
            accessToken: token.accessToken,
            accessTokenExpiresAt: new Date(token.accessTokenExpiresAt),
            client: JSON.parse(token.client),
            refreshToken: token.refreshToken,
            refreshTokenExpiresAt: new Date(token.refreshTokenExpiresAt),
            user: JSON.parse(token.user)
        };
    });
};
model.revokeToken = function(token){
    console.log(token);
    return db.delAsync(`${KEYS.refreshToken}${token.refreshToken}`).then((refreshed)=>{
        return !!refreshed;
    });
};


model.getUser = function(username, password) {
    let key = `${KEYS.user}${username}`;
    return db.hgetallAsync(key).then((user) => {
        if (!user || password !== user.password) {
            return undefined;
        }
        return {
            id: username,
            accountId: user.accountId
        };
    });
};

/**
 * Save token.
 */

model.saveToken = function(token, client, user) {
    var data = {
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        client: JSON.stringify(client),
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        user: JSON.stringify(user)
    };

    return Promise.all([
        db.hmsetAsync(`${KEYS.token}${token.accessToken}`, data),
        db.hmsetAsync(`${KEYS.refreshToken}${token.refreshToken}`, data)
    ]).then(() => {
        return data;
    });
};

model.KEYS = KEYS;
