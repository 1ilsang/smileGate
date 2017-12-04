var express = require('express'),
    http = require('http'),
    path = require('path');
var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    static = require('serve-static');

var app = express();
var index = require('./routes/index');

//===== 뷰 엔진 설정 =====//
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.set('port', process.env.PORT || '3000');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/public', static(path.join(__dirname, 'public')));
app.use(cookieParser());

//index로
app.use('/', index)

var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
});