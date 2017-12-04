var express = require('express');
var router = express.Router();

//Mysql DataBase
var mysql = require('mysql');
var db_config = require('../database/config.json');
var pool = mysql.createPool({
    host: db_config.host,
    port: db_config.port,
    user: db_config.user,
    password: db_config.password,
    database: db_config.database,
    connectionLimit: db_config.connectionLimit,
    debug: false
});

//function
function makeRandomString(size) {
    var result = "";
    //0~9 : 48~57
    //a~z : 97~122
    //A~Z : 65~90
    for (var i = 0; i < size; i++) {
        var kind = Math.floor(Math.random() * 3 + 1);
        switch (kind) {
            case 1:
                result += String.fromCharCode(Math.floor(Math.random() * 10 + 48));
                break;
            case 2:
                result += String.fromCharCode(Math.floor(Math.random() * 26 + 97));
                break;
            default:
                result += String.fromCharCode(Math.floor(Math.random() * 26 + 65));
                break;
        }
    }
    return result;
}

function findNaturalUrl(urlString) {
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, connection) {
            if (err) reject(err);
            else {
                var firstQuery = 'select * from urlString where naturalUrl=?';
                var exe = connection.query(firstQuery, urlString, function(err, rows) {
                    if (err) reject(err);
                    else {
                        resolve(rows);
                    }
                    connection.release();
                });
            }
        });
    });
}

function findArtifactUrl(urlString) {
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, connection) {
            if (err) reject(err);
            else {
                var firstQuery = 'select * from urlString where artifactUrl=?';
                connection.query(firstQuery, urlString, function(err, rows) {
                    if (err) reject(err);
                    else {
                        resolve(rows);
                    }
                    connection.release();
                });
            }
        });
    });
}

function makeArtifactUrl(urlString, newArtifactUrl) {
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, connection) {
            if (err) reject(err);
            else {
                var secQuery = "INSERT INTO urlString (`naturalUrl`, `artifactUrl`) VALUES (?, ?)";
                connection.query(secQuery, [urlString, newArtifactUrl], function(err, rows) {
                    if (err) reject(err);
                    else {
                        resolve(rows);
                    }
                    connection.release();
                });
            }
        });
    });
}

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index');
});

//GET Artifact URL
router.get('/:artUrl', async function(req, res) {
    try {
        var artUrl = req.params.artUrl;
        var findUrl = await findArtifactUrl(artUrl);

        if (findUrl[0] != undefined) {
            //받은 naturalUrl 이 DB에 존재한다면
            console.log('ART URL이 DB에 존재! 리다이렉트 합니다 : ' + findUrl[0].naturalUrl);
            res.redirect(findUrl[0].naturalUrl);
        } else {
            //새로운 url 이라면 artifactUrl 을 만들어준다.
            res.redirect('/');
        }
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
})

//index -> goShort [POST URL]
router.post('/goShort', async function(req, res) {
    try {
        var urlString = req.body.urlString;
        var findUrl = await findNaturalUrl(urlString);

        if (findUrl[0] != undefined) {
            //받은 naturalUrl 이 DB에 존재한다면 artifactUrl 로 처리하도록 함.
            console.log('URL이 DB에 존재! ArtifactUrl : ' + findUrl[0].artifactUrl);
            res.render('ret', { url: findUrl[0].artifactUrl });
        } else {
            //새로운 url 이라면 artifactUrl 을 만들어준다.
            var newArtifactUrl = makeRandomString(8);
            console.log('URL이 DB에 존재하지 않습니다. 새로운 ArtfiactUrl 추가 : ' + newArtifactUrl);
            var ret = await makeArtifactUrl(urlString, newArtifactUrl);
            res.render('ret', { url: newArtifactUrl });
        }
    } catch (err) {
        console.log(err);
    }
})

module.exports = router;