var CalendarsController = function(){

    var
        settings = require("../config/settings"),
        mongoose = require("mongoose"),
        async = require('async'),
        restify = require("restify"),
        restifyErrors = require("../config/errors")(restify),
        _ = require("lodash"),
        Community = require("../models/community"),
        ExternalCalendar = require("../models/external_calendar"),
        meetup = require("meetup-api")({
            key: settings.get("meetup.key")
        });

    var _addMeetupCalendar = function(req, res, next) {
        var
            _user = req.user;

        console.log("calling add calendar %j", req.params);
        var idx = req.params.feedUrl.indexOf("meetup.com");
        var shortName = req.params.feedUrl.slice(idx + 11, req.params.feedUrl.length-1);
        var calendar = new ExternalCalendar.Model(req.params);
        calendar.addedBy = _user._id;
        calendar.lastUpdated = Date.now();
        calendar.type = "meetup";
        calendar.meetup = {
            group_urlname: shortName
        };
        calendar.save(function(err, saved){
            if(err && err.errors) {
                return next(new restifyErrors.InvalidInputError(err.errors));
            }
            
            return res.send(saved);
        });

    };

    var _retrieveMeetupCalendarEvents = function(req, res, next) {
        ExternalCalendar.Model
            .find({
                "type" : "meetup"
            })
            .lean()
            .exec(function(err, calendars){
                if(err) return next(err);
                var events = [];
                async.each(calendars, getEvents, function(err){
                    if(err) console.log("error retrieving events: %j", err);
                    res.send(events);
                });

                function getEvents(data, callback) {
                    meetup.getEvents({
                        group_urlname: data.meetup.group_urlname
                    }, function(err, meetupEvents){
                        events.push({meetup: data._id, events: meetupEvents});
                        callback(err);
                    });
                }
                
            });
    };

    return {
        addMeetupCalendar: _addMeetupCalendar,
        retrieveMeetupCalendarEvents: _retrieveMeetupCalendarEvents
    };
}();

module.exports = CalendarsController;