var passwordManager = require('password-hash-and-salt');

function UsersHandler(db) {
    "use strict";

    var users = db.collection("Users");

    
    if (false === (this instanceof UsersHandler)) {
        console.log('Warning: UsersDAO constructor called without "new" operator');
        return new UsersHandler(db);
    }

    //For Signing User Up.
    this.validateUser = function(email, pass, callback) {

        var query = {
            _id: email
        };


        users.findOne(query, function(err, doc) {
            if (err) {
                return callback(err, null);
            } else {
                if (doc) {
                    passwordManager(pass).verifyAgainst(doc.pass, function(error, verified) {
                        if (error)
                            throw new Error('Something went wrong!');
                        if (!verified) {
                            return callback(err, null);
                        } else {
                            return callback(null, doc);
                        }
                    });
                } else {
                    return callback(err, null);
                }
            }
        });
    };



    this.getUserByEmail = function(email, callback) {
        "use strict";

        var query = {
            _id: email
        };

        users.findOne(query, function(err, doc) {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, doc);
            }
        });

    };


    this.addNewUser = function(user, callback) {

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
