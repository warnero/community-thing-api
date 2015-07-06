var
    request = require("supertest"),
    should = require("should"),
    mongoose = require("mongoose"),
    conf = require("../../config/settings"),
    User = require("../../models/user").Model;

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

describe("Users", function(){
    describe("POST /user", function(){
        it("should register new user", function(done){
            var data = {
                email: "warnero+test@email.com",
                name: "Warner Onstine",
                password: "password"
            };
            request(server)
                .post("/user")
                .send(data)
                .end(function(err, res){
                    if(err) throw err;
                    console.log("register user body %j", res.body);
                    res.statusCode.should.equal(200);
                    should.exist(res.body);
                    return done();
                });
        });
    });

    describe("POST /token", function(){
        it("should fail login", function(done) {

            this.timeout(10000);
            var data = {
                username: "fake@gmail.com",
                password: "password",
                grant_type: "password"
            };
            request(server)
                .post("/token")
                .send(data)
                .auth("foo","bar")
                .end(function(err, res){
                    res.statusCode.should.equal(401);
                    should.exist(res.body.error);
                    res.body.error.should.equal("invalid_grant");
                    return done();
                });
        });
        it("should get a valid token", function(done) {

            this.timeout(10000);
            var data = {
                username: "warner@test.com",
                password: "password",
                grant_type: "password"
            };
            request(server)
                .post("/token")
                .send(data)
                .auth("foo","bar")
                .end(function(err, res){
                    if(err) throw err;
                    res.statusCode.should.equal(200);
                    should.exist(res.body.access_token);
                    should.exist(res.body.token_type);
                    return done();
                });
        });
    });
    describe("GET /user", function(){
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
        it("should get current logged in user via token", function(done) {
            request(server)
                .get("/user")
                .set("Authorization", user_token.token_type + " " + user_token.access_token)
                .end(function(err, res){
                    should.not.exist(err);
                    should.exist(res.body);

                    console.log(res.body);

                    res.statusCode.should.equal(200);
                    should.exist(res.body._id);
                    should.not.exist(res.body.hashedPassword);
                    should.exist(res.body.created);
                    should.exist(res.body.email);
                    should.exist(res.body.name);

                    return done();
                });
        });
    });
});