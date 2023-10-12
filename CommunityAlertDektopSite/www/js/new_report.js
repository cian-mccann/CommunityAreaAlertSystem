function logout()
{
    window.location.href = "index.html";
}

function getAccountValues()
{
    var parameters = getUserValuesFromUrl();
    username = getUrlValue(parameters[0]);
    lat = getUrlValue(parameters[1]);
    lng = getUrlValue(parameters[2]);
    phoneNum = getUrlValue(parameters[3]);
    communities = getUrlValue(parameters[4]);
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
    createMap(lat, lng); 
    createMarker(lat, lng);
}

function createMap(lat, lng) 
{
    var mapOptions = { 
        center: new google.maps.LatLng(lat, lng), 
        zoom: 12,
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

function confirmAlert() 
{
    swal({   
        title: "Confirm Sending",   
        text: "Are you sure you want to alert people about this report?",   
        type: "warning",   
        showCancelButton: true,   
        confirmButtonColor: "#DD6B55",   
        confirmButtonText: "Yes, continue!",   
        closeOnConfirm: false }, 
        
        function()
        {   
            getReportInformation();
        }
    );
}

function getReportInformation()
{
    reportTitle = document.getElementById("report_title").value;
    reportDescription = document.getElementById("report_description").value;
    getMarkerCoordinates(); 
    dateTime = getDateTime();
    getCurrentStateOfReportCollection();
}

function getMarkerCoordinates()
{
    lat = marker.getPosition().lat();
    lng = marker.getPosition().lng();
}

function getDateTime() 
{
    var now     = new Date(); 
    var year    = now.getFullYear();
    var month   = now.getMonth()+1; 
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds(); 
    
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }   
    var dateTime = day+'/'+month+'/'+year+' '+hour+':'+minute+':'+second; 
    return dateTime;
}

function getCurrentStateOfReportCollection()
{
    $.when($.ajax({
        url: "https://api.mongolab.com/api/1/databases/communityalert/collections/reports/masterReport?" + 
            "apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
            type: 'get',                                                                                
        })
        .done(function(data) {
            var reportInfo = JSON.stringify(data,undefined,1);
            var obj = JSON.parse(reportInfo);
            numberOfReports = obj['numberOfReports'];
        })
        .fail(function(request,status,error) {
            sweetAlert("Oops...", "Unknown username or wrong password.", "error");
        }))
    .then(getCurrentListOfStationsReports);
}

function getCurrentListOfStationsReports()
{
    $.ajax({
        url: "https://api.mongolab.com/api/1/databases/communityalert/collections/stations/"+ username 
            + "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
        type: 'get',                                                                                
    })
    .done(function(data) {
        var stationInfo = JSON.stringify(data,undefined,1);
        var obj = JSON.parse(stationInfo);
        stationsReports = obj['reports'];
        getSelectedCommunities();
    })
    .fail(function(request,status,error) {
        sweetAlert("Oops...", "Unknown username or wrong password.", "error");
    })
}

function getSelectedCommunities()
{
    var stationsCommunities = getCommuniteies();
    var communitiesToNotify;
    
    for(var i = 0; i < stationsCommunities.length; i++)
    {
        var checkedValue=$("#"+stationsCommunities[i]).is(":checked");
        if (checkedValue == true) {
            if (isEmpty(communitiesToNotify)) {
                communitiesToNotify = stationsCommunities[i];
            }
            else {
                communitiesToNotify = communitiesToNotify + "," + stationsCommunities[i];    
            }
        }
    }
    createNewReport(communitiesToNotify);
}

function createNewReport(communitiesToNotify)
{
    var newNumberOfReports = parseInt(numberOfReports) + 1;
    var alertRaduisCheckedValue = $('.onoffswitch-checkbox:checked').val();
    var checkedValue;
    
    if(alertRaduisCheckedValue == "on") {
        checkedValue = "on";
    }
    else {
        checkedValue = "off"; 
    }
 
    var url = "https://api.mongolab.com/api/1/databases/communityalert/collections/reports?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32";
    $.when($.ajax(
    { 
        url: url,
        data: JSON.stringify( { "_id" : newNumberOfReports, 
                                 "title" : reportTitle, 
                                 "reportDescription" : reportDescription,
                                "lat" : lat,
                                "lng" : lng,
                                "dateTime" : dateTime,
                                "stationName" : username,
                                "stationPhoneNum" : phoneNum,
                                "communities" : communitiesToNotify,
                                "alertRadiusChecked" : checkedValue
                                } ),
        type: "POST",
        contentType: "application/json" 
    }))
    .then(updateMaster(newNumberOfReports));
}
           
function updateMaster(newNumberOfReports)
{
    var url = "https://api.mongolab.com/api/1/databases/communityalert/collections/reports?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32";
    $.when($.ajax(
    { 
        url: url,
        data: JSON.stringify( { "_id" : "masterReport", 
                                 "numberOfReports" : newNumberOfReports
                                } ),
        type: "POST",
        contentType: "application/json" 
    }))
    .then(updateStationsReports(newNumberOfReports));          
}

function updateStationsReports(newNumberOfReports)
{
    if(!(isEmpty(stationsReports))) {
        stationsReports = stationsReports + "," + newNumberOfReports;
    } 
    else { 
        stationsReports = newNumberOfReports;
    }

    var url = "https://api.mongolab.com/api/1/databases/communityalert/collections/stations/" + username 
            + "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32";
    $.when($.ajax(
    { 
        url: url,
        data: JSON.stringify( { "$set" : {"reports" : stationsReports} }),
        type: "PUT",
        contentType: "application/json" 
    }))
    .then(reportedCreatedSuccessfullyMessage);          
}

function reportedCreatedSuccessfullyMessage()
{
    swal({   title: "Report Created!",   
            text: "The report has been created successfully and users have been notified.",   
            type: "success",   
            showCancelButton: false,   
            confirmButtonColor: "#AEDEF4",   
            confirmButtonText: "OK",   
            closeOnConfirm: false,   
            closeOnCancel: false }, 
            function(isConfirm)
            {   
                location.reload();   
            }
    );
}

function isEmpty(str) 
{
    return (!str || 0 === str.length);
}

function updateHomePageToUserValues()
{
    var div = document.getElementById("phone");
    div.innerHTML = phoneNum + " - " + username;
    displayCommunities();
}

function getCommuniteies()
{
    var stationsCommunities = []; 
    if(communities.length > 0) {
        if(communities.indexOf(",") != -1) {
            stationsCommunities = communities.split(",");
        }
        else {
            stationsCommunities.push(communities);    
        }
        return stationsCommunities;
    }
    return "";
}

function displayCommunities(stationsCommunities)
{
    var stationsCommunities = getCommuniteies();
    for(var i = 0; i < stationsCommunities.length; i++)
    {
        var mainDiv = document.getElementById("mainContainer");
        var communityDiv = document.createElement('div'); 
        var communityName = document.createElement('h3');
        
        communityName.innerHTML = stationsCommunities[i] + '<input id="' + stationsCommunities[i] 
            + '" type="checkbox" class="myinput large" />';
        
        communityDiv.className = "communityDiv";

        communityDiv.appendChild(communityName);
        mainContainer.appendChild(communityDiv);
        
        if (i != stationsCommunities.length-1) {
            var separator = document.createElement('hr');
            communityDiv.appendChild(separator);
        }
    }
}

function editReportPage()
{
    window.location.href = "edit_report.html?username=" + username + "&lat=" + lat + "&lng=" + lng + "&phoneNum=" 
        + phoneNum + "&communities=" + communities; 
}

function newReportPage()
{
    window.location.href = "new_report.html?username=" + username + "&lat=" + lat + "&lng=" + lng + "&phoneNum=" 
        + phoneNum + "&communities=" + communities; 
}

function verifyUserPage()
{
    window.location.href = "verify_user.html?username=" + username + "&lat=" + lat + "&lng=" + lng + "&phoneNum=" 
        + phoneNum + "&communities=" + communities; 
}

function openCommunityManager()
{
    window.location.href = "community_manager.html?username=" + username + "&lat=" + lat + "&lng=" + lng 
            + "&phoneNum=" + phoneNum + "&communities=" + communities; 
}

function openHomepage()
{
    window.location.href = "GardaHomepage.html?username=" + username + "&lat=" + lat + "&lng=" + lng 
            + "&phoneNum=" + phoneNum + "&communities=" + communities; 
}