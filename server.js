/* jshint strict: false */

var Mongo = require('mongodb');
var express = require('express');
var app = express();

var connString = 'mongodb://readuser:reader1234@SG-mssmongodev02-874.servers.mongodirector.com:27017/dev-test';
var titles, server;

Mongo.connect(connString, function (err, db) {
  titles = db.collection("titles");
});

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render('public/index.html');
});

app.get('/titles', function (req, res) {
  var fields = {
    TitleName: true,
    TitleId: true
  };

  // Might be vulnerable to some kind of injection attack
  // This could probably be converted into $regex with the proper escaping
  var query = {
    $where: "this.TitleName.toLowerCase().indexOf('" + req.query.name.toLowerCase() + "') > -1"
  };

  var options = {
    sort: "TitleNameSortable"
  };

  titles.find(query, fields, options).toArray(function (err, items) {
    res.send(items);
  });
});

app.get('/title/:titleId', function (req, res) {
  titles.findOne({TitleId: +req.params.titleId}, function(err, title) {
    if (!title) 
      res.send(404);
    else 
      res.send(title);
  });
});

server = app.listen(3000);
