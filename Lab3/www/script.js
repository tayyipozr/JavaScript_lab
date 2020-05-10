$(function() {
    const dateTime = document.querySelector('#date-time');
    const location = document.querySelector('#location');
    const locationLeft1 = document.querySelector('#left1');
    const locationRight = document.querySelector('#right');
    const locationLeft2 = document.querySelector('#left2');
    const locationAltitude = document.querySelector('#altitude');
    const locationAltitudeAcc = document.querySelector('#altitudeAcc');
    const locationHeading = document.querySelector('#heading');
    const compassButton = document.querySelector('#btnCompass');
    const btnCalculate = document.querySelector('#buttonCalculate');
    const inputLatitude = document.querySelector('#iLatitude');
    const inputLongitude = document.querySelector('#iLongitude');
    const aLeft1 = document.querySelector('#aleft1');
    const aLeft2 = document.querySelector('#aleft2');
    const aLeft3 = document.querySelector('#aleft3');
    const aLeft4 = document.querySelector('#aleft4');

    var distance = 0;
    var iLat = 0;
    var iLong = 0;

    var str = "";
    var strTime = "";
    var now = new Date();

    var year = now.getFullYear();
    var month = (now.getMonth() + 1) < 10 ? '0' + (now.getMonth() + 1) : (now.getMonth() + 1);
    var day = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
    var hour = now.getHours() < 10 ? '0' + now.getHours() : now.getHours();
    var minutes = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();

    strTime += hour + ":" + minutes;
    str += year + "-" + month + "-" + day;
    str = str.bold();
    str += '<br> <br>' + strTime;

    // showing date
    dateTime.style.textAlign = 'center';
    dateTime.innerHTML = str;

    function getPosition() {
        var options = {
            enableHighAccuracy: true,
            maximumAge: 3600000
        }

        function onSuccess(position) {
            locationLeft1.innerHTML = 'Latitude: ' + position.coords.latitude.toFixed(3) + '\n';
            locationRight.innerHTML = 'Longitude: ' + position.coords.longitude + '\n';
            locationRight.innerHTML = "+/- " + position.coords.accuracy + "m";
            locationLeft2.innerHTML = "Longitude: " + position.coords.longitude.toFixed(3);
            var alt = position.coords.altitude === null ? "Not avaliable" : position.coords.altitude;
            var altAcc = position.coords.altitudeAccuracy === null ? "+/- 0m" : position.coords.altitudeAccuracy;
            var head = position.coords.heading === null ? "Not avaliable" : position.coords.heading;
            locationAltitude.innerHTML = "Altitude: " + alt;
            locationAltitudeAcc.innerHTML = altAcc;
            locationHeading.innerHTML = "Heading: " + head;
        };

        function onError(error) {
            alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    }

    // function startWatch() {
    //     var options = {
    //         frequency: 3000
    //     };
    //     console.log(navigator.compass.getCurrentHeading)

    //     function onSuccess(heading) {
    //         console.log('i am here');
    //         locationHeading2.innerHTML = heading.magneticHeading;
    //     }

    //     // onError: Failed to get the heading
    //     //
    //     function onError(compassError) {
    //         alert('Compass error: ' + compassError.code);
    //     }

    //     navigator.compass.getCurrentHeading(onSuccess, onError, options);
    //     // onSuccess: Get the current heading
    // }


    getPosition();
    // startWatch();

    compassButton.onclick = function() {
        document.querySelector('#myNavigator').pushPage('page2_html');
    }

    var rad = function(x) {
        return x * Math.PI / 180;
    };

    var getDistance = function(p1, p2) {
        var R = 6378137; // Earth’s mean radius in meter
        var dLat = rad(p2[0] - p1[0]);
        var dLong = rad(p2[1] - p1[1]);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d; // returns the distance in meter
    };

})