var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    var serveError = "";

    if (!(req.session.serror === undefined)) {
        serveError = (req.session.serror);
        delete req.session.serror;
    }

    res.render("index", {
        error: serveError
    });

});

router.get('/signup', function(req, res) {
    res.render("singup", {
        serverError: ""
    });
});


module.exports = router;
