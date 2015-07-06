var util = require("util");

var CustomErrors = function(restify){

    //Custom errors

    var InvalidInputError = function(errors) {
        restify.RestError.call(this, {
            restCode: 'InvalidInputError',
            statusCode: 400,
            message: errors,
            constructorOpt: InvalidInputError
        });
        this.name = 'InvalidInputError';
    };
    
    util.inherits(InvalidInputError, restify.RestError);

    return {
        InvalidInputError: InvalidInputError
    };
};

module.exports = CustomErrors;