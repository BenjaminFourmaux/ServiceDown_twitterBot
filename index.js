/**
	Downdetector Twitter Bot
	
	@Author Benjamin Fourmaux Beruet
	@Version 1.0
	@Date 29/12/2021
	@Description Bot Twiiter to tweet when a service is down
**/
const Twit = require('twit');
const https = require('https')

// Get API Tokens 
var config = require('./config.js');
const T = new Twit(config);


T.post('statuses/update', {status: 'hello world !'}, function(error, tweet, response) {
  if (!error) {
    console.log('tweet publié');
  }
});