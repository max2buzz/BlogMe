function UsersHandler(db) {
	"use strict";

	var users = db.collection("Users");

	/* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof UsersHandler)) {
        console.log('Warning: UsersDAO constructor called without "new" operator');
        return new UsersHandler(db);
    }

    //For Signing User Up.
    this.validateUser = function(uName, pass, callback) {
        
        var query = {
            username: uName
        };
        
        console.log("In Validate User");
        
        users.findOne(query, function(err, doc) {
            if (err) {
                return callback(err, null);
            } else {
                if (doc && doc.password == pass) {
                    return callback(null, doc);
                } else {
                    return callback("Password Doesn't match User Name", null);
                }

            }
        });
    };


    this.addNewUser= function(user , callback){
    	
    	users.insert(user, function(err, result) {
            if (err) {
                return callback(err);
            } else {
                return callback(null);
            }
        });
    };






}

module.exports.UsersHandler = UsersHandler;