var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	res.json({
		posts:"all"
	});
})
.get('/post' , function(req, res) {
	res.json({
		posts:"one"
	});
});


module.exports = router;