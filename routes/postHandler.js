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
            } else {
                if(err){
                    return callback(err, null);
                }
               
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

    this.addCommentToPost = function(id, comment, callback) {

        var query = {
            _id: new require('mongodb').ObjectID(id)
        };

        posts.update(query, {
            $push: {
                comments: comment
            }
        }, function(err, result) {
            if (err) {
                return callback(err, null);
            } else {
                console.log("Here");
                return callback(null, result);
            }
        });
    };

    this.getCommentsFromPost = function(id, callback) {
        var query = {
            _id: new require('mongodb').ObjectID(id)
        };

        posts.findOne(query, function(err, doc) {
            if (doc) {
                return callback(null, doc.comments);
            }
            if (err) {
                return callback(err, null);
            }

        });
    };

    this.getPostCount = function(callback) {

        posts.count({}, function(err, count) {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, count);
            }

        });

    };


    this.getPostByTitle = function(queryS, callback) {

        var query = {
            title: new RegExp(queryS, "i")
        };
        console.log(query);
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

    
    this.updatePost= function(id , edit , callback){

        var query = {
            _id: new require('mongodb').ObjectID(id)
        };
        
        posts.update(query, {
            $set: {
                body: edit.newBody,
                title: edit.newTitle,
                tags: edit.newTags
            }
        }, function(err, result) {

            if (err) {
                return callback(err, null);
            } else {
                return callback(null, result);
            }
        });

    };


}

module.exports.PostHandler = PostHandler;
