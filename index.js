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
const TimeLoop = 300000; // 300000 = 5 minutes
const TimeCallApi = 5000 // 5000 = 5 secondq

// Set list of services to be queried
const ServicesQueried = ["facebook", "google", "instagram", "orange", "free", "sfr", "discord", "snapchat", "tiktok", "twitch", "youtube", "netflix"];
var LastStatusServices = [];


function getServicesStatus(){
	// Get statut of the service
	(async () => {
		// Browse list of services queried
		for (var i = 0; i < ServicesQueried.length; i++){
			serviceStatus = await API.getServiceStatus(ServicesQueried[i]);
			
			// Check if the previous statut change
			if (LastStatusServices[i] != null && LastStatusServices[i] != serviceStatus.service_status){
				// Tweet send
				sendTweet(tweetPatern(serviceStatus));
			}	
			// Status not change or is the first loop
			LastStatusServices[i] = serviceStatus.service_status;
			
			// Log in the console
			consoleLogStatut(serviceStatus);
			
			// Timeout
			await wait(TimeCallApi);
		}
		
		// Log separtor
		console.log("-------------------------------------");
		
		// loop call
		await wait(TimeLoop);
		getServicesStatus();
		
	})()
}
async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}


getServicesStatus();





/** Technical functions **/

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
	
	return day + "/" + mounth + "/" + year + " " + hours + ":" + minutes;
}

function consoleLogStatut(apiResponse){
	// console font color
	var fontColor;
	switch (apiResponse.service_status){case "ok":fontColor = "\x1b[32m%s\x1b[37m";break;case "warning":fontColor = "\x1b[33m%s\x1b[37m";break;case "error":fontColor = "\x1b[31m%s\x1b[37m";break;default:fontColor = "\x1b[37m%s\x1b[37m";break;}
	
	console.log(fontColor, datetimeFormater(apiResponse.datetime) + " => " + apiResponse.service_name + " -> " + apiResponse.service_status);
}