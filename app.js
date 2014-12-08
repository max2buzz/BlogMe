var debug = require('debug')('NewApp');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cons = require('consolidate');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var session = require('express-session');

var routes = require('./routes/index');
var userRouter = require('./routes/usersRouter');
var postRouter = require('./routes/postRouter');
var api = require('./routes/apiRestUrl');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', cons.swig);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));


var portT = 3000;
if(process.argv[2]){
    portT= process.argv[2];
}
else{
    console.log("No Port Specified App Will Run on Port 3000");
}

app.set('port', process.env.PORT || portT);


var connectionMongoLocal = 'mongodb://localhost:27017/BlogMe';
var connectionMongoLab = 'mongodb://omkar1111:omkar1111@ds061360.mongolab.com:61360/blogme';

MongoClient.connect(connectionMongoLocal, function(err, db) {

        if (err) {
            console.log("ERROR Connecting to Database");
            throw err;
        }
        console.log("DB Connected");
        userRouter.setDB(db);
        api.setDB(db);
        //Routing Logic and modules
        app.use('/', routes);
        app.use('/user', userRouter.userrouter);
        app.use('/posts', postRouter);
        app.use('/api' , api.apiEndPoints);


        // catch 404 and forward to error handler
        app.use(function(req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

        // error handlers

        // development error handler
        // will print stacktrace
        if (app.get('env') === 'development') {
            app.use(function(err, req, res, next) {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: {}
            });
        });


        var server = app.listen(app.get('port'), function() {
            debug('Express server listening on port ' + server.address().port);
            console.log('Express server listening on port ' + server.address().port);
        });    
        
});
