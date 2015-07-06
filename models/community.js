var CommunityModel = function(){

    var 
        mongoose = require("mongoose"),
        Schema = mongoose.Schema;

    var _users = {
        _id: {type:Schema.Types.ObjectId, "default":mongoose.Types.ObjectId},
        user: {type: String, ref: "User"},
        role: String,
        added: {type: Date, "default": Date.now},
        settings: {
            emails: {type: Boolean, "default": true} //emails default to on
        }
    };

    var _jsonSchema = {
        _id: {type:Schema.Types.ObjectId, "default":mongoose.Types.ObjectId},
        name: String,
        description: String,
        isInviteOnly: {type:Boolean, "default": true},
        created: {type: Date, "default": Date.now},
        anonymousAccess: {type:Boolean, "default": false},
        members: [_users],
        createdBy: {type:String, ref:"User"}
    };

    var _schema = mongoose.Schema(_jsonSchema);

    var _model = mongoose.model("Community", _schema);

    return {
        Schema: _schema,
        Model: _model,
        jsonSchema: _jsonSchema
    };

}();

module.exports = CommunityModel;