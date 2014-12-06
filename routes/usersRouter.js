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
    console.log(validator.isEmail(email));
    console.log(email);
});

router.post('/login', function(req, res) {
    var email = req.body.email;
    var pass = req.body.password;

    userHandler.validateUser(email, pass, function(err, doc) {
        if (doc) {
            console.log("Correct Pass Evety");
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

router.get('/p/:id' , isUserLogged, function(req, res) {

    postHandler.getPostById(req.params.id, function(err, postR) {
        
        if(postR){
            res.render('userPostView',{
                post:postR,
                user:req.session.user
            });
        }
        else{
            res.render('userPostView',{
                error:"ERROR",
                user: req.session.user
            });
        }
    });
});

router.get('/p/tag/:tag', isUserLogged , function(req, res) {
    var tag = req.params.tag;
    console.log(tag);
    postHandler.getPostByTag(tag, function(err, docs) {
        if (docs) {
            res.render('postHashView', {
                user: req.session.user,
                posts: docs,
                hash:tag
            });
        } else {
            res.render('postHashView', {
                user: req.session.user,
                posts: null,
                hash:tag,
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
    passwordManager(b.password).hash(function(err, hash) {
        if (err) {
            console.log(err);
            throw err;
        }

        var b = req.body;

        var user = {
            _id: b.email,
            pass: hash,
            firstName: b.firstName,
            lastName: b.lastName,
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

router.get('/logout' , function(req, res) {
    console.log("In logout");
    if (req.session.user === undefined) {
        res.redirect("/");
    } else {
        delete req.session.user;
        res.redirect("/");
    }
});

router.post("/p/publish", isUserLogged, function(req, res) {
    
    var body = req.body;
    
    var post = {
        title: body.title,
        body: body.body,
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

    postHandler.submitPost(post , function(err , result) {
        if(result){
            res.json({
                posted: true
            });
        }
        else{
           res.json({
                posted: false
            });
        }
    });
});

module.exports.userrouter = router;
