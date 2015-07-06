var AuthController = function(){

    var
        conf = require("../config/settings"),
        User = require("../models/user"),
        AuthUtils = require("../utils/auth"),
        JSONUtils = require("../utils/json"),
        crypto = require("crypto"),
        restify = require("restify"),
        rclient = require("../config/redis");

    var _general = function(req, res, next){
        if ((!req.username && !req.user) || !req.authorization || req.authorization.scheme !== "Bearer") {
            return res.sendUnauthorized();
        } else {
            req.user = req.user || req.username;
            delete req.username;
            return next();
        }
    };

    var _refreshSessionData = function(req, res, next){
        return _refreshSessionForUser(req.user, function(err, user){
            req.user = user;
            return next();
        });
    };

    var _refreshSessionForUser = function(user, done) {
        User.Model
            .findOne({
                _id: user._id || user
            })
            .lean()
            .exec(function(err, user){
                if(err) return done(err);
                delete user.hashedPassword;
                delete user.__v;

                return done(err, user);
            });
    };

    var _generateToken = function(data){
        var random = Math.floor(Math.random() * 100001);
        var timestamp = (new Date()).getTime();
        var sha256 = crypto.createHmac("sha256", random + conf.get('auth.token.salt') + timestamp);
        return sha256.update(data).digest("base64");
    };

    var _saveToken = function(token, user, done) {
        var
            id = conf.get('redis.prefix') + token,
            maxAge = conf.get('auth.token.maxAge');

        user = JSON.stringify(user);

        rclient.setex(id, maxAge, user, function(err){
            return done && done.apply(this, arguments);
        });
    };

    var _getTokenData = function(token, done) {
        console.log("getting token data");
        var id = conf.get('redis.prefix') + token;

        rclient.get(id, function(err, data){
            if (err || !data) return done(err);
            return JSONUtils.safeParse(data, done);
        });
    };

    var _clearTokenData = function(token, done) {
        var id = conf.get('redis.prefix') + token;

        rclient.del(id, function(err, data){
            if (err || !data) return done(err);
            return done();
        });
    };

    var _validateClient = function(client, req, done){
        // console.log("validateClient", client.clientId, client.clientSecret);
        // TODO: eventually we want to validate who this is coming from, but this is fine for the moment
        return done(null,true);
    };

    var _grantUserToken = function(grant, req, done){
        var hashedPassword = AuthUtils.hashPassword(grant.password);
        User.Model
            .findOne({
                email: grant.username.toLowerCase(),
                hashedPassword: hashedPassword
            })
            .exec(function(err, user){
                console.log("user ", user, "err", err);
                if(err) {
                    return done(err, false);
                } 
                if(!user) return done(null, false);

                var token = _generateToken(grant.username + ":" + grant.password);

                _saveToken(token, user);

                return done(null, token);

            });

    };

    var _authenticateToken = function(token, req, done) {
        console.log("calling authenticateToken");
        _getTokenData(token, function(err, data){
            delete data.hashedPassword;
            delete data.__v;

            req.user = data;
            console.log("setting user %j", data);
            return done(err, data);
        });
    };

    return {
        general: _general,
        refreshSessionData: _refreshSessionData,
        oauthHooks: {
            authenticateToken: _authenticateToken,
            validateClient: _validateClient,
            grantUserToken: _grantUserToken
        }
    };

}();

module.exports = AuthController;
