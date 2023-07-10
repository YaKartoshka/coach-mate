var express = require('express');
var fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
// -------- routes --------
var index = require('./routes/index');
var students = require('./routes/students');
var coachers = require('./routes/coachers');


app.set('views', path.join(__dirname, 'views'));

//html ejs
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
// -------- used packages --------
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', index);
app.use('/students', students);
app.use('/coachers', coachers);

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

module.exports = app;

