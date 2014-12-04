var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.get('/login', function(req, res) {
  	
  	var username = req.body.username.toLowerCase();
    var password = req.body.password;
    
    userHandler.validateUser(username, password, function(err, doc) {
        if (doc) {
            req.session.user = doc;
            res.redirect("/user");
        } else {
            req.session.serror = "Invalid Username and/or password";
            res.redirect("/");
        }
    });



});

router.get('/signup' , function(req, res) {

});


module.exports = router;
