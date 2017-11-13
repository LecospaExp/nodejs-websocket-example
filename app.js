var url         = require('url'), 
    fs          = require('fs'), 
    serialport  = require("serialport"),
    express     = require('express'),
    app         = express(),
    path        = require('path'),
    http        = require('http').Server(app),
    io          = require('socket.io')(http), 
    session     = require('express-session'),
    mongoose    = require('mongoose'),
    DBconfig    = require('./config/db')
    mongojs     = require('mongojs'),
    db          = mongojs(DBconfig.url, ['events'])
    i18n        = require('./lang/i18n');

// connect DB
mongoose.connect(DBconfig.url);

// express setup
app.set('port', 9487)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'taiwannumberone', key: 'lecospa'}));

var router = require('./router.js')();
app.use('/', router);
http.listen(9487)


require('./handler/socketHandler.js')(io);
// require('./handler/serialPortHandler.js')(io, DBconfig);


