var convict = require('convict');

var conf = convict({
    env: {
        doc: "The applicaton environment.",
        format: ["production", "development", "staging", "test"],
        default: "development",
        env: "NODE_ENV"
    },
    ip: {
        doc: "The IP address to bind.",
        format: "ipaddress",
        default: "127.0.0.1",
        env: "IP_ADDRESS",
    },
    port: {
        doc: "The port to bind.",
        format: "port",
        default: 4000,
        env: "PORT"
    },
    mongo: {
        doc: "Mongo connection url",
        default: 'mongodb://localhost/community',
        env: "MONGO_URL",
        debug: false
    },
    auth: {
        password_salt: "Dz63N98f1BzJdpLjk9LVtCWkQS5M96mBCBIQuwfZ8lzw85ogiH8kDZNdkQkxC0kwUzC06yGRN5jGXgvDbaVMyaHcVUN1WYmI5CeJ",
        token: {
            maxAge: 60*60*1000*24*30,
            salt: "alsdflajsdlf"
        }
    },
    redis: {
        url: "redis://localhost:6379",
        options: {
            host: "",
            port: "",
            pass: ""
        },
        debug: false,
        prefix: "community:",
        env: "REDISTOGO_URL"
    },
    meetup: {
        key: "PUT YOUR KEY HERE"
    }
})


var env = conf.get('env');
console.log("port before loading env specifics %s, env port %s", conf.get('port'),process.env.PORT);
conf.loadFile (__dirname + '/'+  env + '_config.json');

conf.validate();

var saveRedisDetails = function () {
    console.log("calling redis details");
    var redis_url = require("url").parse(conf.get('redis.url'));
    conf.set('redis.options.host', redis_url.hostname);
    conf.set('redis.options.port', redis_url.port);
    if(redis_url.auth) {
        conf.set('redis.options.pass', redis_url.auth.split(":")[1]);
    }
}();

module.exports = conf;


