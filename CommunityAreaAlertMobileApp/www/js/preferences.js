function getAccountValues()
{
    var parameters = getUserValuesFromUrl();
    username = getUrlValue(parameters[0]);
    lat = getUrlValue(parameters[1]);
    lng = getUrlValue(parameters[2]);
    notifications = getUrlValue(parameters[3]);
    gpsRaduis = getUrlValue(parameters[4]);
    community = getUrlValue(parameters[5]);
}

function getUrlValue(index)
{
    var temp = index.split("=");
    return unescape(temp[1]);  
}

function getUserValuesFromUrl()
{
    return parameters = location.search.substring(1).split("&");
}

function openHomepage()
{
    window.location.href = "AccountHomepage.html"+ "?username="+username 
                                     + "&lat=" + lat + "&lng=" + lng + "&notifications=" + notifications 
                                     + "&gpsRaduis=" + gpsRaduis + "&community=" + community;
}

function openSettings()
{
    window.location.href = "settings.html" + "?username="+username 
                                     + "&lat=" + lat + "&lng=" + lng + "&notifications=" + notifications 
                                     + "&gpsRaduis=" + gpsRaduis + "&community=" + community; 
}

function openAlertSettings()
{
    window.location.href = "preferences.html" + "?username="+username 
                                     + "&lat=" + lat + "&lng=" + lng + "&notifications=" + notifications 
                                     + "&gpsRaduis=" + gpsRaduis + "&community=" + community;  
}

function openHomepageFromNotification()
{
    window.location.href = "AccountHomepage.html"+ "?username="+username 
                                     + "&lat=" + lat + "&lng=" + lng + "&notifications=" + notifications 
                                     + "&gpsRaduis=" + gpsRaduis + "&community=" + community + "&notifcation=true";
}

function displayAlertRadiusInfo()
{
    swal("Alert Radius", "Is how far away from your location you wish to recieve alerts.\n" +
            "Example: \n If you live in a rural you may want to receive alerts within 5km of your house.");
}

function dispayUserAccountValues()
{
    document.getElementById("sliderBar").value = gpsRaduis;
    document.getElementById("sliderValue").innerHTML = "Alert Radius: " + gpsRaduis + " km";
    
    if (!(community == "")) {
        var mainDiv = document.getElementById("mainContainer");
        var communityDiv = document.createElement('div'); 
        var communityName = document.createElement('h3');
        
        communityName.innerHTML = community + '<div class="tickBox"> <img src="images/selectButton.png"' + 
            'id="usersCommunity"  class="selectTick" onclick="communityPressed(this.id)" />';
        
        communityDiv.className = "communityDiv";
        communityDiv.id = "currentCommunity";

        communityDiv.appendChild(communityName);
        mainContainer.appendChild(communityDiv);
        
        var separator = document.createElement('hr');
        communityDiv.appendChild(separator);
    }
}

function saveAccountSettings()
{
    var infoOnSliderValue = document.getElementById("sliderValue").innerHTML;
    var kmValue = infoOnSliderValue.slice(14);
    gpsRaduis = kmValue.replace(" km", "");
    
    var searchComplete = document.getElementById("search_btn").style.display;
    
    if (searchComplete == "none") {
        for(var i = 0; i < relevantCommunities.length; i++) {
                var tickImage = document.getElementById(relevantCommunities[i]).src;
                tickImage = tickImage.slice(-16);

                if(tickImage == "selectButton.png") {
                    community = relevantCommunities[i];
                }
        }
    }
    else {
        var tickImage1 = document.getElementById("usersCommunity");

        if (!(tickImage1 == null))
        {
            var tickImage2 = tickImage1.src;  
            if(!(tickImage2 == "selectButton.png")) {
                community = "";
            }
        }
    }

    var url = "https://api.mongolab.com/api/1/databases/communityalert/collections/users/" 
            + username + "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32";
    
    $.ajax(
    { 
        url: url,
        data: JSON.stringify( { "$set" : {"gpsRaduis" : gpsRaduis, "community" : community} }),
        type: "PUT",
        contentType: "application/json",
        success: displaySettingsUpdatedMessage,
        error: function() 
        {
            sweetAlert("Oops...", "Cannott update settings. Check internet connection.", "error");
        }
    })
}

function displaySettingsUpdatedMessage() 
{
        swal({   title: "Settings Updated!",   
            text: "You updated your settings.",   
            type: "success",   
            showCancelButton: false,   
            confirmButtonColor: "#AEDEF4",   
            confirmButtonText: "OK",   
            closeOnConfirm: false,   
            closeOnCancel: false }, 
            function(isConfirm)
            {   
                openAlertSettings();   
            }
    );
}

$(function() 
{
    $(document).on('input', 'input[type="range"]', function(e) 
    {
        document.getElementById("sliderValue").innerHTML = "Alert Radius: " + e.target.value + " km";
    });
  
    $('input[type=range]').rangeslider({
        polyfill: false
    });
});

function downloadRelevantCommunities()
{
    $.ajax({
    url: "https://api.mongolab.com/api/1/databases/communityalert/collections/communities?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
            type: 'get',                                                                                
        })
        .done(function(data) {
            var stationInfo = JSON.stringify(data,undefined,1);
            var communityDocuments = JSON.parse(stationInfo);
            findCoummunitiesInUsersLocation(communityDocuments);
        })
        .fail(function(request,status,error) {
            sweetAlert("Oops...", "Unknown username or wrong password.", "error");
    })  
}

function findCoummunitiesInUsersLocation(communityDocuments)
{
    relevantCommunities = [];
    for(var i = 0; i < communityDocuments.length; i++)
    {
        var community = communityDocuments[i];
        var distance = getDistanceFromLatLngInKm(lat,lng,community['lat'],community['lng']); 
        if(distance < 10) {
            relevantCommunities.push(community['_id']);       
        }
    }
    displayRelevantCommunities(relevantCommunities);
}

function displayRelevantCommunities(relevantCommunities)
{
    document.getElementById("search_btn").style.display = 'none';
    document.getElementById("search_text").style.display = 'none';
    
    if (community != "") {
        document.getElementById("currentCommunity").style.display = 'none';
    }
    
    for(var i = 0; i < relevantCommunities.length; i++)
    {
        var mainDiv = document.getElementById("mainContainer");
        var communityDiv = document.createElement('div'); 
        var communityName = document.createElement('h3');
        
        communityName.innerHTML = relevantCommunities[i] + 
            '<div class="tickBox"> <img src="images/seperator.png" id="' +
                relevantCommunities[i] + 
                        '" class="selectTick" onclick="communityPressed(this.id)" />';
        
        communityDiv.className = "communityDiv";
        communityDiv.appendChild(communityName);
        mainContainer.appendChild(communityDiv);
        
        var separator = document.createElement('hr');
        communityDiv.appendChild(separator);
    }
}

function getDistanceFromLatLngInKm(lat1,lon1,lat2,lon2) 
{
    var R = 6371;
    var dLat = deg2rad(lat2-lat1); 
    var dLon = deg2rad(lon2-lon1); 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
    
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
}

function deg2rad(deg) 
{
    return deg * (Math.PI/180)
}

function communityPressed(id)
{
    var tickImage = document.getElementById(id).src;
    tickImage = tickImage.slice(-16);
    
    if(tickImage == "selectButton.png") {
        document.getElementById(id).src = "images/seperator.png";
    }
    else {
        document.getElementById(id).src = "images/selectButton.png";
    }
    
    if (id != "usersCommunity") {
        unSelectOtherCommunities(id);
    }
}

function unSelectOtherCommunities(selectedId)
{
    for(var i = 0; i < relevantCommunities.length; i++) {
        if (relevantCommunities[i] != selectedId) {
            var tickImage = document.getElementById(relevantCommunities[i]).src;
            tickImage = tickImage.slice(-16);
            
            if(tickImage == "selectButton.png") {
                document.getElementById(relevantCommunities[i]).src = "images/seperator.png";
            }
        } 
    } 
}



