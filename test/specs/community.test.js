var
    request = require("supertest"),
    should = require("should"),
    mongoose = require("mongoose"),
    conf = require("../../config/settings"),
    User = require("../../models/user").Model,
    Community = require("../../models/community").Model;

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

describe("Community", function(){

    describe("POST /communities", function(){
        var
            user,
            user_token;

        before(function(done){
            this.timeout(10000);
            var emit = function(){
                if (
                    !user ||
                    !user_token  
                ) return;
                return done();
            };

            logUserIn("warner2@test.com", function(err, data){
                if(err) throw err;
                user = data.user;
                user_token = data.token;
                return emit();
            });
        });
        it("should add a new community for the currently logged in user", function(done) {
            var data = {
                name: "Vegas Tech",
                description: "Las Vegas Tech community"
            };
            request(server)
                .post("/communities")
                .set("Authorization", user_token.token_type + " " + user_token.access_token)
                .send(data)
                .end(function(err, res){
                    should.not.exist(err);
                    should.exist(res.body);

                    console.log(res.body);

                    res.statusCode.should.equal(200);
                    should.exist(res.body._id);
                    res.body.name.should.equal(data.name);
                    res.body.description.should.equal(data.description);
                    res.body.members.length.should.be.above(0);
                    return done();
                });
        });
    });
    describe("GET /communities", function(){
        var
            user,
            user_token,
            community_id,
            community_to_change;

        before(function(done){
            this.timeout(10000);
            var emit = function(){
                if (
                    !user ||
                    !user_token  
                ) return;
                return done();
            };


            logUserIn("warner@test.com", function(err, data){
                if(err) throw err;
                user = data.user;
                user_token = data.token;
                return emit();
            });
        });
        it("should retrieve all communities for currently logged in user", function(done) {
            request(server)
                .get("/communities")
                .set("Authorization", user_token.token_type + " " + user_token.access_token)
                .end(function(err, res){
                    should.not.exist(err);
                    should.exist(res.body);

                    console.log("retrieved communities %j", res.body);

                    res.statusCode.should.equal(200);
                    res.body.length.should.equal(1);
                    community_id = res.body[0]._id;
                    community_to_change = res.body[0]._id;
                    return done();
                });
        });
        it("should retrieve a specific community", function(done) {
            request(server)
                .get("/communities/" + community_id)
                .set("Authorization", user_token.token_type + " " + user_token.access_token)
                .end(function(err, res){
                    should.not.exist(err);
                    should.exist(res.body);

                    console.log(res.body);

                    res.statusCode.should.equal(200);
                    should.exist(res.body.name);
                    return done();
                });
        });
    });

});