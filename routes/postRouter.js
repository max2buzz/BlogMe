var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	//Get All the posts
	
})
.get('/post/:id' , function(req, res) {
	//Grab the post with that ID and return it
	res.json();
})
.get('/post/tag/:hashtag' , function(req , res) {
	//Grab The post by Hashtags


});


module.exports = router;