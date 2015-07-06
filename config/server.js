var ServerConfig = function(server) {

    var
        conf = require("./settings"),
        restify = require("restify"),
        restifyOAuth2 = require("restify-oauth2"),
        auth = require("../controllers/auth"),
        util = require("util");

    server.use(restify.bodyParser());
    server.use(restify.queryParser());
    server.use(restify.authorizationParser());
    server.use(restify.fullResponse());

    restify.CORS.ALLOW_HEADERS.push('authorization');

    server.use(function(req, res, next){
        req.body = req.params;
        return next();
    });

    restifyOAuth2.ropc(server, {
        tokenEndpoint: "/token",
        hooks: auth.oauthHooks,
        tokenExpirationTime: conf.get('auth.token.maxAge')
    });

    /* Start CORS: All of this is required to get this working. */
    function corsHandler(req, res, next) {

        //TODO: Make sure this is a legit origin
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
        res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, DELETE, POST');
        res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
        res.setHeader('Access-Control-Max-Age', '1000');

        return next();
    }

    function optionsRoute(req, res, next) {
        res.send(200);
        return next();
    }

    server.opts('/.*/', corsHandler, optionsRoute);

    // server.pre(restify.CORS());

    server.pre(restify.CORS({
        origins: ['http://127.0.0.1:3000','http://localhost:3000'],
        credentials: true                  // defaults to false
    }));
    /* End CORS */


    return this;
};

module.exports = ServerConfig;
