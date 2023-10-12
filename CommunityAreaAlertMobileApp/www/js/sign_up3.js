function infoCorrectMessage(username)
{   
    swal("Information Correct!", 
         "In order to recieve relevant alerts in your area you need to mark the location of your house." +
         "You can do this now by dragging the red marker to the location of your house."+ 
         "You must ensure the marker is placed as accurately as possible.", "success")
}

var map;
var marker;
var geocoder;

function toggleBounce() 
{
    if (marker.getAnimation() != null) {
      marker.setAnimation(null);
    } 
    else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}

function initialize() {
    if(navigator.geolocation) 
    {
        success = function(position) 
        {
            createMap(position.coords.latitude, position.coords.longitude);
            createMarker(position.coords.latitude, position.coords.longitude);
        };
        error = function() 
        { 
            createMap(53.423933, -7.94069); 
            createMarker(53.423933, -7.94069);
        }

        navigator.geolocation.getCurrentPosition(success, error);
    }
    else 
    {
        createMap(53.423933, -7.94069);
        createMarker(53.423933, -7.94069);
    }
}

function createMap(lat, lng) 
{
    var mapOptions = { 
        center: new google.maps.LatLng(lat, lng), 
        zoom: 8,
        scrollwheel: false,
        streetViewControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP 
    };
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
}

function createMarker(lat, lng)
{
    marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),
        map: map,
        draggable:true,
        animation: google.maps.Animation.DROP,
        title: 'Your Location'   
    });
    google.maps.event.addListener(marker, 'click', toggleBounce);
}

function codeLatLng() 
{
    var r = $.Deferred();
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder = new google.maps.Geocoder();
    var infowindow = new google.maps.InfoWindow();
    
    geocoder.geocode({'latLng': latlng}, 
    function(results, status) 
    {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                formattedAddress = results[1].formatted_address;
            } 
            else {
                formattedAddress= "Could not generate address from coordinates.";
            }
        } 
        else {
            formattedAddress= "Could not generate address from coordinates.";
        }
    });
    setTimeout(function () {
        r.resolve();
    }, 2500);
    
    return r;
}

function getMarkerCoordinates()
{
    lat = marker.getPosition().lat();
    lng = marker.getPosition().lng();
}

function confirmAddress() 
{
    getMarkerCoordinates();
    swal({   
        title: "Confirm Address",   
        text: "Have you placed the marker on the actual location of your house?",   
        type: "warning",   
        showCancelButton: true,   
        confirmButtonColor: "#DD6B55",   
        confirmButtonText: "Yes, continue!",   
        closeOnConfirm: false }, 
        
        function()
        {   
            codeLatLng().done(getCurrentStateOfReportCollection);
        }
    );
}

function getPreviousUserValues()
{
    var parameters =  getUserValuesFromUrl();
    recievedUsername = getUrlValue(parameters[0]);
    recievedPassword = getUrlValue(parameters[1]);
    recievedDateOfBirth = getUrlValue(parameters[2]);
}

function getCurrentStateOfReportCollection()
{
    var numberOfReports;
    $.ajax({
        url: "https://api.mongolab.com/api/1/databases/communityalert/collections/reports/masterReport?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
                type: 'get',                                                                                
    })
    .done(function(data) {
        var reportInfo = JSON.stringify(data,undefined,1);
        var obj = JSON.parse(reportInfo);
        numberOfReports = obj['numberOfReports'];
        createUserAccount(numberOfReports);
    })
    .fail(function(request,status,error) {
                sweetAlert("Oops...", "Unknown username or wrong password.", "error");
    })
}

function createUserAccount(currentNumOfReports)
{
    getPreviousUserValues();
    var url = "https://api.mongolab.com/api/1/databases/communityalert/collections/users?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32";
    $.when($.ajax(
    { 
        url: url,
        data: JSON.stringify( { "_id" : recievedUsername, 
                                 "password" : recievedPassword,
                                "dob": recievedDateOfBirth, 
                                "lat" : lat,
                                "lng" : lng,
                                "formattedAddress" : formattedAddress,
                                "community" : "",
                                "gpsRaduis" : 1,
                                notifications : "true",
                                "reports" : "",
                                "verified" : false,
                               "reportTracker" : currentNumOfReports
                                } ),
        type: "POST",
        contentType: "application/json" 
    }))
    .then(nextPage, accountCreationError);
}
      
function accountCreationError()
{
    sweetAlert("Oops...", "Error creating account. Please ensure your device has an active internet connection.", "error");
}

function nextPage()
{  
    var userDetails = createUrlSuffix();
    openNextPage("verify_address.html", userDetails);
}

function createUrlSuffix()
{
    return "?username=" + recievedUsername + "&password=" + recievedPassword + "&dateOfBirth=" + recievedDateOfBirth + 
        "&lat=" + lat + "&long=" + lng + "&address=" + formattedAddress;
}

