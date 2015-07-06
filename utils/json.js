var JSONUtils = function(){
    var _safeParse = function(str, done){
        var result;

        try {
            result = JSON.parse(str);
        } catch(error){
            if(done) done(error);
            return error;
        }

        if(done) done(null, result);
        return result;
    };

    var _tryParseJSON = function(jsonString){
        try {
            var o = JSON.parse(jsonString);

            // Handle non-exception-throwing cases:
            // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
            // but... JSON.parse(null) returns 'null', and typeof null === "object", 
            // so we must check for that, too.
            if (o && typeof o === "object" && o !== null) {
                return o;
            }
        }
        catch (e) { }

        return false;
    };

    return {
        safeParse: _safeParse,
        tryParseJSON: _tryParseJSON
    };
}();

module.exports = JSONUtils;