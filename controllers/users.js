var UsersController = function(){

    var
        settings = require("../config/settings"),
        User = require("../models/user"),
        mongoose = require("mongoose"),
        async = require('async'),
        restify = require("restify"),
        restifyErrors = require("../config/errors")(restify),
        _ = require("lodash");

    var _current = function(req, res, next) {
        var
            user = req.user;
        console.log("user %j", user);
        return res.send(user);

    };

    var _list = function(req, res, next) {

    };

    var _register = function(req, res, next) {
        console.log("trying to create a new user %j", req.params);
        var user = new User.Model(req.params);

        user.save(function(err, saved){
            if(err && err.errors) {
                return next(new restifyErrors.InvalidInputError(err.errors));
            }
            else if(err) return next(err);
            return res.send(saved);
        });
    };

    return {
        current: _current,
        list: _list,
        register: _register
    };
}();

module.exports = UsersController;
