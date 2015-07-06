var cluster = require('cluster'),
    numCPUs = Math.min(2,require('os').cpus().length);

if (cluster.isMaster && process.env.NODE_ENV != "test") {
    // Fork workers
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });

    cluster.on('disconnect', function(worker) {
        console.error("Worker " + worker.process.pid + " encountered an error and is disconnected. Starting a new worker.");
        cluster.fork();
    });

    return;
}

var
    restify = require("restify"),
    conf = require("./config/settings"),
    server = restify.createServer({
        formatters: {
            "application/json": function customJSONFormatter(req, res, body) {
                if (body instanceof Error) {
                    // snoop for RestError or HttpError, but don't rely on
                    // instanceof
                    res.statusCode = body.statusCode || 500;

                    if (body.body) {
                        body = body.body;
                    } else {
                        body = {
                            message: body.message
                        };
                    }

                } else if (Buffer.isBuffer(body)) {
                        body = body.toString('base64');
                }

                var data = JSON.stringify(body);
                res.setHeader('Content-Length', Buffer.byteLength(data));

                return (data);
            }
        }
    });


var
    mongoose = require("mongoose");

ServerConf = require("./config")(server);

server.listen(conf.get('port'), function(){
    console.log("Restify listening on port " + conf.get('port'));
});

mongoose.set("debug", true);
mongoose.connect(conf.get('mongo'));

//let's load up models now
require("fs").readdirSync(__dirname + "/models").forEach(function(file) {
    require(__dirname + "/models/"+ file);
});


process.on('uncaughtException', function (err) {
    console.log(err.stack || err);

    server.close();

    var killtimer = setTimeout(function() {
        process.exit(1);
    }, 30000);

    killtimer.unref();
    if(process.env.NODE_ENV != "test") cluster.worker.disconnect();
    if(process.env.NODE_ENV == "test") process.exit(1);
});
