var AuthUtils = function(){
        
    var 
        conf = require("../config/settings"),
        crypto = require("crypto");

    var _hashPassword = function(password){
        return crypto.createHash('md5').update(password + conf.get('auth.password_salt')).digest("hex");
    };

    return {
        hashPassword: _hashPassword
    };
}();

module.exports = AuthUtils;