var Routes = function(server) {

    var
        auth = require("../controllers/auth"),
        users = require("../controllers/users"),
        communities = require("../controllers/communities"),
        calendars = require("../controllers/calendars");

    var UserRoutes = function(){
        server.get("/user", auth.general, auth.refreshSessionData, users.current);
        server.post("/user", users.register);
    }();

    var CommunityRoutes = function(){
        server.post("/communities", auth.general, communities.add);
        server.get("/communities", auth.general, communities.list);
        server.get("/communities/:id", auth.general, communities.get);
        // server.put("/communities/:id", auth.general, todos.update);
    }();

    var CalendarRoutes = function(){
        server.post("/calendars/meetup", auth.general, calendars.addMeetupCalendar);
        server.get("/calendars/meetups/retrieve-events", auth.general, calendars.retrieveMeetupCalendarEvents);
    }();

    return this;
};

module.exports = Routes;
