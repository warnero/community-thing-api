var ExternalCalendarModel = function(){

    var 
        mongoose = require("mongoose"),
        Schema = mongoose.Schema;

    var meetupData = {
        group_urlname: String,
        group_id: String
    };
    var _jsonSchema = {
        _id: {type:Schema.Types.ObjectId, "default":mongoose.Types.ObjectId},
        feedUrl: String,
        notes: String,
        created: {type: Date, "default": Date.now},
        public: {type:Boolean, "default": true},
        lastUpdated: Date,
        position: {type:Number, "default":0},
        addedBy: {type: String, ref: "User"},
        type: String,
        community_id: {type:String, ref: "Community"},
        meetup: meetupData
    };

    var _schema = mongoose.Schema(_jsonSchema);

    var _model = mongoose.model("ExternalCalendar", _schema);

    return {
        Schema: _schema,
        Model: _model,
        jsonSchema: _jsonSchema
    };

}();

module.exports = ExternalCalendarModel;