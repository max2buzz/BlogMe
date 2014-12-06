function PostHandler(db) {
    "use strict";

    var posts = db.collection("Posts");


    if (false === (this instanceof PostHandler)) {
        console.log('Warning: UsersDAO constructor called without "new" operator');
        return new PostHandler(db);
    }


    this.submitPost = function(post, callback) {
        posts.insert(post, function(err, result) {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, result);
            }
        });
    };

    this.getPostByLocation = function(userloc, callback) {
        var query = {
            location: userloc
        };
        posts.find(query).sort({
            publishedAt: -1
        }).toArray(function(err, docs) {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, docs);
            }

        });
    };

    this.getAllPosts = function(callback) {
        posts.find({}).sort({
            publishedAt: -1
        }).toArray(function(err, docs) {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, docs);
            }

        });
    };


    this.getPostByUser = function(email, callback) {
    	var query = {
            "publishedBy.email": email
        };
        posts.find(query).sort({
            publishedAt: -1
        }).toArray(function(err, docs) {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, docs);
            }

        });

    };

    this.getPostByTag = function(hashtag, callback) {
    	var query = {
            tags: hashtag
        };
        posts.find(query).sort({
            publishedAt: -1
        }).toArray(function(err, docs) {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, docs);
            }

        });
    };


  this.getPostById = function(id, callback) {
        
        var query = {
            _id: new require('mongodb').ObjectID(id)
        };
        
        posts.findOne(query, function(err, doc) {
            if (doc) {
            	return callback(null, doc);
            }
            else {
                return callback(null, null)
            }

        });
    };


    this.deletePost = function(id, callback) {
        var query = {
            _id: new require('mongodb').ObjectID(id)
        };

        posts.remove(query, function(err, result) {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, result);
            }
        });
    };


}

module.exports.PostHandler = PostHandler;
