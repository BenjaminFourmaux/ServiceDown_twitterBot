/**
	Downdetector Twitter Bot
	
	@Author Benjamin Fourmaux Beruet
	@Version 1.1
	@Date 08/01/2022
	@Description Bot Twiiter to tweet when a service is down
**/
const Twit = require('twit');
const https = require('https');
const ServiceDown_api = require('./ServiceDown_api/lib/ServiceDown_api.js');

// Get API Tokens 
var config = require('./config.js');
const T = new Twit(config);

const API = new ServiceDown_api();

(async () => {
	serviceStatus = await API.getServiceStatus("facebook");
	
	// Tweet send
	sendTweet(tweetPatern(serviceStatus));
})()

function sendTweet(tweetSend) {
	T.post('statuses/update', {status: tweetSend}, function(error, tweet, response) {
		if (!error) {
			console.log('Tweet sent successfully');
		} else {
			console.log(tweetSend)
			console.error("Tweet not sent, we're sorry");
		}
	});
}

function tweetPatern(apiResponse) {
	var tabIconStatus = ["🟩", "🟧", "🟥", "⬜"];
	var iconStatus;
	var tweet;
	
	// Choose icon by the status of the service
	switch (apiResponse.service_status){
		case "ok": // Ok
			iconStatus = tabIconStatus[0];
			break;
		case "warning": // Warning
			iconStatus = tabIconStatus[1];
			break;
		case "error": // Error
			iconStatus = tabIconStatus[2];
			break;
		default : // None
			iconStatus = tabIconStatus[3];
			break;
	}
	
	
	tweet = apiResponse.service_name + " status : " + iconStatus + " (" + apiResponse.service_status + ")" +
			"\n" +
			"\n ⁉ Troubles : " + apiResponse.status_cause +  
			"\n 🌍 Country : " + apiResponse.country +
			"\n 📅 DateTime : " + datetimeFormater(apiResponse.datetime) +
			"\n 🔗 Source : " + apiResponse.src
	
	
	return tweet;
}

function datetimeFormater(dt){
	let hours = dt.getHours().toString().padStart(2, "0");
	let minutes = dt.getMinutes().toString().padStart(2, "0");
	let seconds = dt.getSeconds().toString().padStart(2, "0");
	let day = dt.getDate().toString().padStart(2, "0");
	let mounth = (dt.getMonth() + 1).toString().padStart(2, "0");
	let year = dt.getFullYear();
	
	return hours + ":" + minutes + " " + day + "/" + mounth + "/" + year;
}