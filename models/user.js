var UserModel = function(){

    var 
        mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        AuthUtils = require("../utils/auth"),
        crypto = require("crypto");

    var _jsonSchema = {
        _id: {type:Schema.Types.ObjectId, "default":mongoose.Types.ObjectId},
        name: String,
        email: String,
        hashedPassword: String,
        created: {type: Date, "default": Date.now}
    };

    var _schema = mongoose.Schema(_jsonSchema);

    _schema.virtual('password').set(function (password) {
        this.hashedPassword = AuthUtils.hashPassword(password);
    });

    var _model = mongoose.model("User", _schema);

    return {
        Schema: _schema,
        Model: _model,
        jsonSchema: _jsonSchema
    };

}();

module.exports = UserModel;