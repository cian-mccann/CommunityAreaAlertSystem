function Report(title, description, timeAndDate, uniqueReportId, 
                 lat, lng, stationName, stationPhoneNum, reportCommunities, alertRadiusChecked)
{
    this.title = title;
    this.description = description;
    this.timeAndDate = timeAndDate;
    this.uniqueReportId = uniqueReportId;
    this.lat = lat;
    this.lng = lng;
    this.stationName = stationName;
    this.stationPhoneNum = stationPhoneNum;
    this.reportCommunities = reportCommunities;
    this.alertRadiusChecked = alertRadiusChecked;
    
    Report.prototype.getTitle = function()
    {
        return this.title;
    };
    
    Report.prototype.getDescription = function()
    {
        return this.description;
    };
    
    Report.prototype.getTimeAndDate = function()
    {
        return this.timeAndDate;
    };
    
    Report.prototype.getUniqueReportId = function()
    {
        return this.uniqueReportId;
    };
    
    Report.prototype.getLat = function()
    {
        return this.lat;
    };
    
    Report.prototype.getLng = function()
    {
        return this.lng;
    };
    
    Report.prototype.getStationName = function()
    {
        return this.stationName;
    };
    
    Report.prototype.getStationPhoneNum = function()
    {
        return this.stationPhoneNum;
    };
    
    Report.prototype.getReportCommunities = function()
    {
        return this.reportCommunities;
    };
    
    Report.prototype.getAlertRadiusChecked = function()
    {
        return this.alertRadiusChecked;
    };
}

function getAccountValues()
{
    var parameters = getUserValuesFromUrl();
    username = getUrlValue(parameters[0]);
    lat = getUrlValue(parameters[1]);
    lng = getUrlValue(parameters[2]);
    notifications = getUrlValue(parameters[3]);
    gpsRaduis = getUrlValue(parameters[4]);
    community = getUrlValue(parameters[5]);
    
    if(getUrlValue(parameters[6]) == "true") {
        getListOfUsersReports();
    }
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

function getReportTrackingNumber()
{
    $.ajax({
        url: "https://api.mongolab.com/api/1/databases/communityalert/collections/users/" + username + 
                "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
                type: 'get',                                                                                
    })
    .done(function(data) {
        var userAccountInformation = JSON.stringify(data,undefined,1);
        var obj = JSON.parse(userAccountInformation);
        var trackingNumber = obj['reportTracker'];

        document.addEventListener('deviceready', function () 
        {       
            pollForUpdates(trackingNumber);
        }, 
        false);
    })
    .fail(function(request,status,error) {
            sweetAlert("Error", "Check your internet connection.", "error");
    })     
}

var newRelevantReports = "";
function pollForUpdates(usersTrackedNumberOfReports)
{
    newRelevantReports = "";
    $.ajax({
        url: "https://api.mongolab.com/api/1/databases/communityalert/collections/reports/masterReport?" +
                    "apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
                type: 'get',                                                                                
    })
    .done(function(data) {
        var reportInfo = JSON.stringify(data,undefined,1);
        var obj = JSON.parse(reportInfo);
        numberOfReports = obj['numberOfReports'];
        if(usersTrackedNumberOfReports < numberOfReports) {
            getNewReports(usersTrackedNumberOfReports, numberOfReports);
        }
        else {
            setTimeout(function() { 
                pollForUpdates(usersTrackedNumberOfReports); 
            }, 15000);
        }
    })
    .fail(function(request,status,error) {
        sweetAlert("Error", "Check your internet connection.", "error");
    })  
}
 
function getNewReports(usersTrackedNumberOfReports, numberOfReports)
{
    var countOfReportsChecked = 1;
    var numberOfNewReportsFound = numberOfReports - usersTrackedNumberOfReports;
    for(i = usersTrackedNumberOfReports+1; i <= numberOfReports; i++)
    {  
        $.ajax({
            url: "https://api.mongolab.com/api/1/databases/communityalert/collections/reports/" + i + 
            "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
                    type: 'get',                                                                                
        })
        .done(function(data) {
            var reportInformation = JSON.stringify(data,undefined,1);
            var obj = JSON.parse(reportInformation);
            var reportTitle = obj['title']
            var reportDescription = obj['reportDescription'];
            var dateTime = obj['dateTime'];
            var reportID = obj['_id'];
            var lat = obj['lat'];
            var lng = obj['lng'];
            var stationName = obj['stationName'];
            var stationPhoneNum = obj['stationPhoneNum'];
            var reportCommunities = obj['communities'];
            var alertWithinRadius = obj['alertRadiusChecked'];
            var report = new Report(reportTitle, reportDescription, dateTime, reportID, 
                                        lat, lng, stationName, stationPhoneNum, reportCommunities, alertWithinRadius);
            checkIfReportIsRelevantToUser(report, numberOfNewReportsFound, countOfReportsChecked);
            countOfReportsChecked++;
        })
        .fail(function(request,status,error) {
            sweetAlert("Error", "Check your internet connection.", "error");
        })
     } 
}

function checkIfReportIsRelevantToUser(possibleReleventReport, numberOfNewReportsFound, reportCount)
{  
    var updateUserOfNewRelevantReport = false;
    var reportLat = possibleReleventReport.getLat();
    var reportLng = possibleReleventReport.getLng();
    var updateBasedOnLocation = possibleReleventReport.getAlertRadiusChecked();
    var communities = possibleReleventReport.getReportCommunities();
    var distanceBetweenReportAndUser = getDistanceFromLatLngInKm(reportLat, reportLng, lat, lng);
    
    if (updateBasedOnLocation == "on")
    {
        if (distanceBetweenReportAndUser < gpsRaduis) {
                newRelevantReports = newRelevantReports + "," + possibleReleventReport.getUniqueReportId();
                updateUserOfNewRelevantReport = true;
        }
    }
    
    if (updateUserOfNewRelevantReport == false && communities != undefined)
    {
        if (communities.indexOf(",") == -1) {
            if (communities == community) {
                newRelevantReports = newRelevantReports + "," + possibleReleventReport.getUniqueReportId();
                updateUserOfNewRelevantReport = true;    
            }
        }
        else {
            var reportCommunityArray = communities.split(','); 
            if (reportCommunityArray.indexOf(community) > -1) {
                updateUserOfNewRelevantReport = true;    
            }
        }
    }
            
    if (numberOfNewReportsFound == reportCount) {
            getUsersCurrentListOfReports(newRelevantReports, updateUserOfNewRelevantReport);
    }
}

function getUsersCurrentListOfReports(newRelevantReports, updateUserOfNewRelevantReport)
{
    $.ajax({
        url: "https://api.mongolab.com/api/1/databases/communityalert/collections/users/"+ username + 
                "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
                type: 'get',                                                                                
    })
    .done(function(data) {
        var stationInfo = JSON.stringify(data,undefined,1);
        var obj = JSON.parse(stationInfo);
        userReports = obj['reports'];

        if (userReports == "")
        {
            newRelevantReports = newRelevantReports.slice(1);
        }

        userReports = userReports + newRelevantReports;
        updateUserReports(userReports, updateUserOfNewRelevantReport);
    })
    .fail(function(request,status,error) {
        sweetAlert("Error", "Check your internet connection.", "error");
    })
}

function updateUserReports(userReports, updateUserOfNewRelevantReport)
{
    var url = "https://api.mongolab.com/api/1/databases/communityalert/collections/users/" + username +
                "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32";
    $.ajax(
    { 
        url: url,
        data: JSON.stringify( { "$set" : {"reports" : userReports,
                                            "reportTracker" : numberOfReports} }),
        type: "PUT",
        contentType: "application/json" 
    })
    .done(function(data) 
    {
        if (updateUserOfNewRelevantReport == true && notifications == "true") {
            sendNotificationToUser();    
        }
        else {
            getReportTrackingNumber();    
        }
    })
}

function sendNotificationToUser()
{
    window.plugin.notification.local.add({
        autoCancel: true,
        title:   'Community Area Alert',
        message: 'You recieved a new community alert.'
    });
    
    window.plugin.notification.local.onclick = function (id, state, json) {
        openHomepageFromNotification();
    };
    
    getReportTrackingNumber();
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


