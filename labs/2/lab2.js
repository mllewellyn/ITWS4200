window.onload = function() {
	// check for browser support
	if (navigator.geolocation) {
		// store user lat and long
		var latitude, longitude;
		navigator.geolocation.getCurrentPosition(function(position) {
			latitude = position.coords.latitude;
			longitude = position.coords.longitude;

			console.log('Your current position is:');
			console.log('Latitude : ' + latitude);
			console.log('Longitude: ' + longitude);

			showPosition(latitude, longitude);
			getAndShowWeather(latitude, longitude);
		});
		
    } else {
        $("#location").text("Geolocation is not supported by this browser.");
    }
}

function getAndShowWeather(latitude, longitude) {
	var jqxhr = $.getJSON("http://api.openweathermap.org/data/2.5/weather",
		{
			lat : latitude,
			lon : longitude
		})
	.done(function(data) {
		console.log(data)
		$("#city").text(data.name);
		$("#weather").text(data.weather[0].main + ": " + data.weather[0].description);

		$("#temp-current").text("Temp: " + data.main.temp);
		$("#temp-max").text("High: " + data.main.temp_max);
		$("#temp-min").text("Low: " + data.main.temp_min);

		$("#windspeed").text("Windspeed: "+ data.wind.speed);
	})
	.fail(function( jqxhr, textStatus, error ) {
    	var err = textStatus + ", " + error;
    	console.log("Request Failed: " + err );
    })
}

// code is modified example from w3 schools
// http://www.w3schools.com/html/html5_geolocation.asp
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        $("#location").text("Geolocation is not supported by this browser.");
    }
}
function showPosition(latitude, longitude) {
    $("#latitude").text("Latitude: " + latitude);
    $("#longitude").text("Longitude: " + longitude); 
}