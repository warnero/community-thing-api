var Redis = function(){
    var 
        conf = require("./settings"),
        redis = require("redis"),
        rclient = redis.createClient(
            conf.get('redis.options.port'), 
            conf.get('redis.options.host'), 
            conf.get('redis.options')
        );

    redis.debug_mode = conf.get('redis.debug');

    if(conf.get('redis.options.pass')) rclient.auth(conf.get('redis.options.pass'));

    return rclient;
}();

module.exports = Redis;