var express = require('express');
var router = express.Router();
var moment = require('moment');
var db = "";
var UsersHandler = require('./userHandler').UsersHandler;
var PostHandler = require('./postHandler').PostHandler;
var userHandler = "";
var postHandler = "";

exports.setDB = function(datab) {
    db = datab;
    userHandler = new UsersHandler(db);
    postHandler = new PostHandler(db);
};

//api/
router.get('/', function(req, res) {
    //Generic Endpoint
    res.json({
        version: "1.0"
    });
});

//api/p
router.get('/p', function(req, res) {
    postHandler.getAllPosts(function(err, docs) {
        if (docs) {
            res.json({
                posts: docs
            });
        } else {
            res.status(400).json({
                posts: null,
                error: "Contents Cannot Be Retrived From Server"
            });
        }
    });
});

router.get('/search/p/q=:query' , function(req, res) {
    var titleString = req.params.query;
    postHandler.getPostByTitle(titleString, function(err, postsR) {
        if (err) {
            res.json({
                error:"Cannot Fetch Posts"
            });
        } else{
            res.json({
                posts:postsR
            });
        }
    });
});


router.get('/p/tag/:tag', function(req, res) {
    var tag = req.params.tag;
    postHandler.getPostByTag(tag, function(err, docs) {
        if (docs) {
            res.json({
                posts: docs,
                count: docs.length
            });
        } else {
            res.status(400).json({
                posts: null,
                error: "Contents Cannot Be Retrived From Server"
            });
        }
    });
});

router.get('/p/:id', function(req, res) {
    //Req to get post
    postHandler.getPostById(req.params.id, function(err, postR) {
        if (postR) {
            res.json({
                post: postR
            });
        } else {
            res.json({
                error: "Error Fetching Post"
            });
        }
    });
});

router.get('/p/:id/comments', function(req, res) {
    //End Point to get Comments
    var id = req.params.id;
    postHandler.getCommentsFromPost(id, function(err, comments) {
        if (err) {
            res.json(500, {
                error: "Cannot Fetch Comments"
            });
        } else {
            res.json(comments);
        }
    });
});

router.get('/stat/count/post', function(req, res) {
    //End Point to get Number of Posts
    console.log("Here in count");
    postHandler.getPostCount(function(err, countN) {
        if (err) {
            res.json(500, {
                error: "Cannot Fetch Post Counts"
            });
        } else {
            res.json({
                count: countN
            });
        }
    });
});


router.get('/stat/count/user', function(req, res) {
    //End Point to get Number of Posts


});

router.post('/p/:id/postcomment', function(req, res) {
    var id = req.params.id;
    var comment = {
        user: {
            firstName: req.session.user.firstName,
            lastName: req.session.user.lastName,
            email: req.session.user._id
        },
        body: req.body.commentbody,
        postedAt: moment().format()
    };
    postHandler.addCommentToPost(id, comment, function(err, result) {
        if (err) {
            res.json(500, {
                error: "Some Error Posting Comment"
            });
            return;
        }
        if (result) {
            res.json(comment);
            return;
        }
        res.json(500, {
            error: "Some Error Posting Comment"
        });
    });
});


module.exports.apiEndPoints = router;
