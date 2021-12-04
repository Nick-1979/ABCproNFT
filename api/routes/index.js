var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('index get is called')
  res.render('index', { title: 'Abcpro backend' });
});

module.exports = router;
