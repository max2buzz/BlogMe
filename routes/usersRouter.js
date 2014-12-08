var express = require('express');
var UsersHandler = require('./userHandler').UsersHandler;
var PostHandler = require('./postHandler').PostHandler;
var passwordManager = require('password-hash-and-salt');
var router = express.Router();
var validator = require('validator');
var moment = require('moment');

var db = "";
var userHandler = "";
var postHandler = "";

exports.setDB = function(datab) {
    db = datab;
    userHandler = new UsersHandler(db);
    postHandler = new PostHandler(db);
};

var mc = require('mc');

var client = new mc.Client(['pub-memcache-12670.us-east-1-4.4.ec2.garantiadata.com:12670', 'pub-memcache-19547.us-east-1-4.4.ec2.garantiadata.com:19547'], mc.Adapter.json, mc.Strategy.hash);
client.connect(function() {
    // client.set('{a:"b"}', '{"a":"myVal"}', {
    //     flags: 0,
    //     exptime: 0
    // }, function(err, status) {
    //     if (!err) {
    //         console.log(status); // 'STORED' on success!
    //     } else {
    //         console.log(err);
    //     }
    // });
});



/* GET users listing. */
router.post('/newUserEmail', function(req, res) {

    var email = req.body.emailAdd;

    userHandler.getUserByEmail(email, function(err, doc) {
        if (doc) {
            res.json({
                isAvail: false,
                isValid: validator.isEmail(email)
            });
        } else {
            res.json({
                isAvail: true,
                isValid: validator.isEmail(email)
            });
        }
    });

});

router.post('/login', function(req, res) {
    var email = req.body.email;
    var pass = req.body.password;

    userHandler.validateUser(email, pass, function(err, doc) {
        if (doc) {
            req.session.user = doc;
            res.redirect("/user");
        } else {
            req.session.serror = "Invalid Username and/or password";
            res.redirect("/");
        }
    });
});

router.get('/', function(req, res) {

    postHandler.getAllPosts(function(err, docs) {
        if (docs) {
            res.render('userDashboard', {
                user: req.session.user,
                posts: docs

            });
        } else {
            res.render('userDashboard', {
                user: req.session.user,
                posts: null,
                error: "Contents Cannot Be Retrived From Server"
            });
        }
    });

});

function isUserLogged(req, res, next) {

    if (req.session.user === undefined) {
        return res.redirect('/');
    } else {
        next();
    }
}


router.get('/edit/p/:id', isUserLogged, function(req, res) {

    var id = req.params.id;


    postHandler.getPostById(req.params.id, function(err, postR) {

        if (postR) {
            if (req.session.user._id === postR.publishedBy.email) {
                res.render('blogModify', {
                    post: postR,
                    user: req.session.user
                });
            } else {
                res.redirect('/user');
            }

        } else {
            res.render('blogModify', {
                error: "ERROR",
                user: req.session.user
            });
        }
    });

});

router.get("/p/search", isUserLogged, function(req, res) {
    res.render('blogSearchView', {
        user: req.session.user
    });
});

router.get('/loc/p/:location', isUserLogged, function(req, res) {
    var loc = req.params.location;
    postHandler.getPostByLocation(loc, function(err, docs) {
        if (docs) {
            res.render('postLocationView', {
                user: req.session.user,
                posts: docs,
                userLoc: loc
            });
        } else {
            res.render('postLocationView', {
                user: req.session.user,
                posts: null,
                userLoc: loc,
                error: "Contents Cannot Be Retrived From Server"
            });
        }
    });
});

router.get('/p/:id', isUserLogged, function(req, res) {


    client.get(req.params.id, function(err, response) {
        if (!err) {
            var cachedPost = response[req.params.id];
            console.log("Cache Hit");
            if (req.session.user._id === cachedPost.publishedBy.email) {
                res.render('userPostView', {
                    post: cachedPost,
                    user: req.session.user,
                    myPost: true,
                    fromCache: true
                });
            } else {
                res.render('userPostView', {
                    post: cachedPost,
                    user: req.session.user,
                    myPost: false,
                    fromCache: true
                });
            }
        } else {
            postHandler.getPostById(req.params.id, function(err, postR) {
                if (postR) {
                    delete postR.comments;
                    client.set(req.params.id, JSON.stringify(postR), {
                        flags: 0,
                        exptime: 60
                    }, function(err, status) {
                        if (!err) {
                            console.log("Cache Miss Storing Post " + postR.title + " in cache"); // 'STORED' on success!
                        } else {
                            console.log(err);
                        }
                    });
                    if (req.session.user._id === postR.publishedBy.email) {
                        res.render('userPostView', {
                            post: postR,
                            user: req.session.user,
                            myPost: true,
                            fromCache: false
                        });
                    } else {
                        res.render('userPostView', {
                            post: postR,
                            user: req.session.user,
                            myPost: false,
                            fromCache: false
                        });
                    }

                } else {
                    res.render('userPostView', {
                        error: "ERROR",
                        user: req.session.user
                    });
                }
            });
        }
    });


});

router.get('/p/tag/:tag', isUserLogged, function(req, res) {
    var tag = req.params.tag;
    postHandler.getPostByTag(tag, function(err, docs) {
        if (docs) {
            res.render('postHashView', {
                user: req.session.user,
                posts: docs,
                hash: tag
            });
        } else {
            res.render('postHashView', {
                user: req.session.user,
                posts: null,
                hash: tag,
                error: "Contents Cannot Be Retrived From Server"
            });
        }
    });
});




router.get('/new', isUserLogged, function(req, res) {
    res.render('postCreate', {
        user: req.session.user
    });
});

router.post('/signUpUser', function(req, res) {
    var b = req.body;
    passwordManager(b.password.trim()).hash(function(err, hash) {
        if (err) {
            console.log(err);
            throw err;
        }

        var b = req.body;

        var user = {
            _id: b.email.trim(),
            pass: hash,
            firstName: b.firstName.trim(),
            lastName: b.lastName.trim(),
            gender: b.gender,
            location: b.location,
            createdAt: moment().format()
        };

        userHandler.addNewUser(user, function(err) {
            if (err) {
                console.log("PROBLEM ADDING USER");
                res.json({
                    userAdded: false
                });

            } else {
                req.session.user = user;
                res.json({
                    userAdded: true,
                    redirectTo: '/user'
                });
            }

        });
    });

});

router.get('/logout', function(req, res) {
    console.log("In logout");
    if (req.session.user === undefined) {
        res.redirect("/");
    } else {
        delete req.session.user;
        res.redirect("/");
    }
});

router.get("/p/search", isUserLogged, function(req, res) {
    res.render('blogSearchView', {
        user: req.session.user
    });
});

router.post("/p/publish", isUserLogged, function(req, res) {

    var body = req.body;

    var post = {
        title: body.title.trim(),
        body: body.body.trim(),
        tags: body.tags.trim().toUpperCase().replace(/\s*(,|^|$)\s*/g, "$1").split(","),
        location: req.session.user.location,
        publishedBy: {
            email: req.session.user._id,
            firstName: req.session.user.firstName,
            lastName: req.session.user.lastName
        },
        publishedAt: moment().format(),
        comments: [],
    };

    postHandler.submitPost(post, function(err, result) {
        if (result) {
            res.json({
                posted: true
            });
        } else {
            res.json({
                posted: false
            });
        }
    });
});

router.post("/modify/p/:id", function(req, res) {
    var b = req.body;
    var edit = {
        newBody: b.body.trim(),
        newTitle: b.title.trim(),
        newTags: b.tags.trim().toUpperCase().replace(/\s*(,|^|$)\s*/g, "$1").split(",")
    };

    postHandler.updatePost(req.params.id, edit, function(err, result) {
        if (err) {
            throw err;

        } else {
            postHandler.getPostById(req.params.id, function(err, postR) {
                client.set(req.params.id, JSON.stringify(postR), {
                    flags: 0,
                    exptime: 60
                }, function(err, status) {
                    if (!err) {
                        console.log("Cache Miss Storing Post " + postR.title + " in cache");
                    } else {
                        console.log(err);
                    }
                });
                res.json({
                    modified: true,
                    id: req.params.id
                });
            });

        }

    });

});

module.exports.userrouter = router;
