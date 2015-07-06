var TestData = function(){

    var
        mongoose = require("mongoose"),
        async = require("async"),
        conf = require("../../config/settings"),
        User = require("../../models/user").Model,
        Community = require("../../models/community").Model,
        ExternalCalendar = require("../../models/external_calendar").Model,
        AuthUtils = require("../../utils/auth");

    var _clearDatabase = function(done){
        async.parallel([
            function(cb) { User.remove({}, cb); },
            function(cb) { Community.remove({}, cb);},
            function(cb) { ExternalCalendar.remove({}, cb);}
        ], function(err, res){
            if(err) throw err;
            return done(err, res);
        });
    };

    var _createTestData = function(done){
         var
            users = require("../data/users.data").map(function(usr){
                usr.hashedPassword = AuthUtils.hashPassword("password");
                usr._id = new mongoose.Types.ObjectId;
                return usr;
            });

        var 
            communities = require("../data/communities.data").map(function(cmty){
                cmty._id = new mongoose.Types.ObjectId;
                cmty.createdBy = users[0]._id;
                cmty.members = [];
                for(var i in users) {
                    cmty.members.push({
                        user: users[i]._id,
                        role: "admin"   
                    });
                }
                return cmty;
            });


        async.parallel([
            function(cb) {
                User.create(users, cb);
            },
            function(cb) { 
                Community.create(communities, cb); 
            }
        ], function(err, res){
            if(err) { console.log(err); return done(err); }

            return done(err, res);
        });

    };

    return {
        clearDatabase: _clearDatabase,
        createTestData: _createTestData
    };

}();

module.exports = TestData;