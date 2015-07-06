var Config = function(server) {

    var server_config = require("./server")(server);
    var routes = require("./routes")(server);
    
};

module.exports = Config;
