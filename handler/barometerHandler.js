var rpiSensors = require('raspi-sensors');
var time = require('time');
Math.myround = function(x, n){
	return Math.round(x*Math.pow(10, n))/Math.pow(10, n);
}
module.exports = function(socket, config, database) {
	var BMP180 = new rpiSensors.Sensor({
		type    : "BMP180",
		address : 0X77
	}, "barometer");
	var curPressure = 0;
	var curTemp = 25;
	BMP180.fetch(function(err, data) {
		if(err) {
			console.error("An error occured!");
			console.error(err.cause);
			return;
		}
		if(data.type=='Pressure'){
			curPressure = Math.myround(data.value/100, 2)
			socket.pressureEvent(curPressure);
			console.log(curPressure);
		}
		if(data.type='Temperature'){
			curTemp = 25;
		}
	});
	BMP180.fetchInterval(function(err, data) {
		if(err) {
		    console.error("[Barometer]");
		    console.error(err.cause);
		    return;
		}
		if(data.type=='Pressure'){
			curPressure = Math.myround((data.value/100+curPressure*(config.smoothFactor-1))/config.smoothFactor,2)
			socket.pressureEvent(curPressure);
			console.log("[baro]Pressure:"+curPressure);
		}
		if(data.type=='Temperature'){
			curTemp = Math.myround(data.value,2)
			socket.tempEvent(curTemp);
			console.log("[baro]Temp:"+curTemp);
		}
	}, 5); // Fetch data every 5 seconds 
	return {
		getCurrentPressure: function(){return curPressure;},
		getCurrentTemperature: function(){return curTemp;}

	}
}
