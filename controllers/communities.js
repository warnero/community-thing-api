var CommunitiesController = function(){

    var
        settings = require("../config/settings"),
        mongoose = require("mongoose"),
        async = require('async'),
        restify = require("restify"),
        restifyErrors = require("../config/errors")(restify),
        _ = require("lodash"),
        Community = require("../models/community");

    var _add = function(req, res, next) {
        var
            _user = req.user;

        var community = new Community.Model(req.params);
        community.createdBy = _user._id;
        community.members.push({
            user: _user._id,
            role: "admin"   
        });
        community.save(function(err, saved){
            if(err && err.errors) {
                return next(new restifyErrors.InvalidInputError(err.errors));
            }
            
            return res.send(saved);
        });

    };

    var _list = function(req, res, next) {
        var
            _user = req.user;

        Community.Model
            .find({
                "members.user" : req.user._id
            })
            .lean()
            .exec(function(err, communities){
                if(err) return next(err);
                res.send(communities);
            });
    };

    var _get = function(req, res, next) {
        var
            _user = req.user,
            id = req.params.id;

        Community.Model
            .findOne({
                _id:id
            })
            .lean()
            .exec(function(err, community){
                if(err) return next(err);
                if(!community) {
                    return next(new restify.ResourceNotFoundError("Community not found"));
                }
                // TODO: figure out our permissions here, we need to only allow returning of community details
                // if anonymous access is turned on or they are a member

                // var anonymousAccess = (req.user._id == "anonymous" && community.anonymousAccess === true);
                // if(community.getPermissions(req.user).indexOf("view_community") < 0 && !anonymousAccess && req.user.permissions.indexOf("view_all_accounts") < 0) {
                //     return next(new restify.NotAuthorizedError("You don't have permissions to view this community"));
                // }
                // notebook = Notebook.prepareForOutput(notebook, req.user);
                // return res.send(notebook);
                res.send(community);
            });
    };

    var _update = function(req, res, next) {
        var
            _user = req.user,
            id = req.params.id;

        Community.Model
            .findOne({
                _id:id,
                user:_user._id
            })
            .exec(function(err, community){
                if(err) return next(err);
                if(!community) {
                    return next(new restify.ResourceNotFoundError("Community not found"));
                }
                community = _.assign(community, req.params);
                community.save(function(err, saved){
                    if(err) next(err);
                    return res.send(saved);
                });
            });
    };

    return {
        add: _add,
        list: _list,
        get: _get,
        update:_update
    };
}();

module.exports = CommunitiesController;
