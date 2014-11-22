var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.get('/soo', function(req, res) {
  res.send('respond with a Soo');
});


module.exports = router;
