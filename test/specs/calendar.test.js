var
    request = require("supertest"),
    should = require("should"),
    mongoose = require("mongoose"),
    conf = require("../../config/settings"),
    User = require("../../models/user").Model,
    Community = require("../../models/community").Model,
    ExternalCalendar = require("../../models/external_calendar").Model;

function logUserIn(email, done) {
     User
        .findOne({
            email: email
        })
        .exec(function(err, usr){
            if(err) throw err;

            var data = {
                username: usr.email,
                password: "password",
                grant_type: "password"
            };

            request(server)
                .post("/token")
                .send(data)
                .auth("foo","bar")
                .end(function(err, res){
                    if(err) throw err;
                    return done(err,{
                        user: usr,
                        token: res.body
                    });
                });
        });
}

describe("Calendar", function(){

    describe("POST /calendars/meetup", function(){
        var
            user,
            user_token,
            community_id;

        before(function(done){
            this.timeout(10000);
            var emit = function(){
                if (
                    !user ||
                    !user_token ||
                    !community_id 
                ) return;
                return done();
            };

            logUserIn("warner2@test.com", function(err, data){
                if(err) throw err;
                user = data.user;
                user_token = data.token;
                console.log("logged user in");
                Community
                    .findOne({"members.user":user._id})
                    .lean()
                    .exec(function(err, cmty) {
                        if(err) throw err;
                        community_id = cmty._id;
                        console.log("found community %j",cmty);
                        return emit();
                    });
                
            });
        });
        it("should add a new meetup calendar for the currently logged in user", function(done) {
            var data = {
                feedUrl: "https://meetup.com/Las-Vegas-Developers/",
                notes: "LVDev - Las Vegas Developer Meetup",
                public: true,
                community_id: community_id
            };
            request(server)
                .post("/calendars/meetup")
                .set("Authorization", user_token.token_type + " " + user_token.access_token)
                .send(data)
                .end(function(err, res){
                    should.not.exist(err);
                    should.exist(res.body);

                    console.log("saved calendar %j", res.body);

                    res.statusCode.should.equal(200);
                    should.exist(res.body._id);
                    res.body.feedUrl.should.equal(data.feedUrl);
                    res.body.notes.should.equal(data.notes);
                    res.body.community_id.should.equal(data.community_id.toString());
                    res.body.meetup.group_urlname.should.equal("Las-Vegas-Developers");
                    return done();
                });
        });
    });
    describe("GET /calendars/meetups/retrieve-events", function(){
        var
            user,
            user_token,
            community_id;

        before(function(done){
            this.timeout(10000);
            var emit = function(){
                if (
                    !user ||
                    !user_token ||
                    !community_id 
                ) return;
                return done();
            };

            logUserIn("warner2@test.com", function(err, data){
                if(err) throw err;
                user = data.user;
                user_token = data.token;
                console.log("logged user in");
                Community
                    .findOne({"members.user":user._id})
                    .lean()
                    .exec(function(err, cmty) {
                        if(err) throw err;
                        community_id = cmty._id;
                        console.log("found community %j",cmty);
                        return emit();
                    });
                
            });
        });
        it("should retrive a list of events for all meetups", function(done) {
            request(server)
                .get("/calendars/meetups/retrieve-events")
                .set("Authorization", user_token.token_type + " " + user_token.access_token)
                .end(function(err, res){
                    should.not.exist(err);
                    should.exist(res.body);

                    console.log("retrieved events %j", res.body);
                    return done();
                });
        });
    });
    // describe("GET /communities", function(){
    //     var
    //         user,
    //         user_token,
    //         community_id,
    //         community_to_change;

    //     before(function(done){
    //         this.timeout(10000);
    //         var emit = function(){
    //             if (
    //                 !user ||
    //                 !user_token  
    //             ) return;
    //             return done();
    //         };


    //         logUserIn("warner@test.com", function(err, data){
    //             if(err) throw err;
    //             user = data.user;
    //             user_token = data.token;
    //             return emit();
    //         });
    //     });
    //     it("should retrieve all todos for currently logged in user", function(done) {
    //         request(server)
    //             .get("/communities")
    //             .set("Authorization", user_token.token_type + " " + user_token.access_token)
    //             .end(function(err, res){
    //                 should.not.exist(err);
    //                 should.exist(res.body);

    //                 console.log(res.body);

    //                 res.statusCode.should.equal(200);
    //                 res.body.length.should.equal(2);
    //                 community_id = res.body[0]._id;
    //                 community_to_change = res.body[1]._id;
    //                 return done();
    //             });
    //     });
    //     it("should retrieve a specific calendar", function(done) {
    //         request(server)
    //             .get("/communities/" + community_id)
    //             .set("Authorization", user_token.token_type + " " + user_token.access_token)
    //             .end(function(err, res){
    //                 should.not.exist(err);
    //                 should.exist(res.body);

    //                 console.log(res.body);

    //                 res.statusCode.should.equal(200);
    //                 should.exist(res.body.text);
    //                 return done();
    //             });
    //     });
    // });

});