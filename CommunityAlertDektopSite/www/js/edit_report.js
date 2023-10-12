function Report(title, description, timeAndDate, uniqueReportId, lat, lng)
{
    this.title = title;
    this.description = description;
    this.timeAndDate = timeAndDate;
    this.uniqueReportId = uniqueReportId;
    this.lat = lat;
    this.lng = lng;
    
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
}

function getCurrentListOfStationsReports()
{
    $.when($.ajax({
        url: "https://api.mongolab.com/api/1/databases/communityalert/collections/stations/"+ username + 
            "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
            type: 'get',                                                                                
    })
    .done(function(data) {
        var stationInfo = JSON.stringify(data,undefined,1);
        var obj = JSON.parse(stationInfo);
        stationsReports = obj['reports'];
    })
    .fail(function(request,status,error) {
        sweetAlert("Error", "Check your internet connection.", "error");
    }))
    .then(downloadStationsReports);
}

function downloadStationsReports()
{
    reports = [];
    reportIds = [];

    if(String(stationsReports).length > 1) {
        reportIds = stationsReports.split(",");
    } 
    else if(String(stationsReports).length == 1) { 
        reportIds = [stationsReports];
    }
    else {
        reportIds = [];   
    }
    
    if (reportIds.length) {
        for(i = 0; i < reportIds.length; i++)
        {  
            $.ajax({
                url: "https://api.mongolab.com/api/1/databases/communityalert/collections/reports/" + reportIds[i] +
                        "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
                        type: 'get',                                                                                
            })
            .done(function(data) {
                reportInformation = JSON.stringify(data,undefined,1);
                var obj = JSON.parse(reportInformation);
                var reportTitle = obj['title'];
                var reportDescription = obj['reportDescription'];
                var dateTime = obj['dateTime'];
                var reportID = obj['_id'];
                var lat = obj['lat'];
                var lng = obj['lng'];
                var report = new Report(reportTitle, reportDescription, dateTime, reportID, lat, lng);
                reports[reportID] = report;  
                displayReportInDiv(reports[reportID]);
            })
            .fail(function(request,status,error) {
                sweetAlert("", "You have no active reports.", "error");
            })
        }
    }
    else {
        sweetAlert("", "You have no active reports.", "error");       
    }
}

function displayReportInDiv(index)
{
    var mainDiv = document.getElementById("mainDiv");
    var innerDiv = document.createElement('div');
    innerDiv.className = 'innerDiv';
    var uniqueReportID = index.getUniqueReportId();
    innerDiv.id = uniqueReportID;
    
    innerDiv.innerHTML = '<img class="edit_pic" id="' + uniqueReportID 
                            + '" onclick="setValuesInUpdateFields(this.id)" src="images/edit.png">'+
                            '<img class="edit_pic" id="' + uniqueReportID 
                            + '" onclick="confirmAlert(this.id)" src="images/delete.png">';
    var time = document.createElement('h3');
    var title = document.createElement('h3');
    time.innerHTML = index.getTimeAndDate();
    title.innerHTML = index.getTitle();
    innerDiv.appendChild(time);
    innerDiv.appendChild(title);
    mainDiv.appendChild(innerDiv);
}

function setValuesInUpdateFields(uniqueReportID)
{
    var titleInputForm = document.getElementById("report_title");
    titleInputForm.innerHTML = reports[uniqueReportID].getTitle();
    var descriptionInputForm = document.getElementById("report_description");
    descriptionInputForm.value = reports[uniqueReportID].getDescription();
    var heading = document.getElementById("updateHeading");
    var updateButton = document.getElementsByClassName("updateBtn")[0];
    updateButton.id = uniqueReportID;
    
    titleInputForm.style.visibility = "";
    descriptionInputForm.style.visibility = "";
    heading.style.visibility = "";

    document.getElementsByClassName("updateBtn")[0].style.visibility = "";
}

function getCurrentStateOfReportCollection(updateButton)
{
     indexOfReportToUpdate = updateButton.id;
     
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
            sweetAlert("Error...", "Check your internet connection.", "error");
        }))
    .then(confirmUpdate);
}

function confirmUpdate()
{
    newNumberOfReports = parseInt(numberOfReports) + 1;
    var dateTime = getDateTime();
    var reportDescription = document.getElementById("report_description").value;
    var reportTitle = reports[indexOfReportToUpdate].getTitle();
    var lat = reports[indexOfReportToUpdate].getLat();
    var lng = reports[indexOfReportToUpdate].getLng();
    
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
                                "stationPhoneNum" : phoneNum
                                } ),
        type: "POST",
        contentType: "application/json" 
    }))
    .then(updateMaster());
}

function updateMaster()
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
    .then(deleteOriginalReport());    
}

function deleteOriginalReport()
{
    $.ajax
    ( 
        { 
            url: "https://api.mongolab.com/api/1/databases/communityalert/collections/reports/"+ indexOfReportToUpdate +"?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
            type: "DELETE",
            async: true,
            timeout: 300000,
            success: function (data) { updateStationsListofReports() },
            error: function (xhr, status, err) { } 
        } 
    );
}

function updateStationsListofReports()
{
    var stationReports;
    
    if(reportIds.length == 1) {
          stationReports = newNumberOfReports;
    } 
    else { 
        var indexOfDeletedReport = reportIds.indexOf(indexOfReportToUpdate);
        if (indexOfDeletedReport > -1) {
            reportIds.splice(indexOfDeletedReport, 1);
        }
        reportIds.push(newNumberOfReports); 
        stationReports = reportIds.join();
    }

    var url = "https://api.mongolab.com/api/1/databases/communityalert/collections/stations/" + username 
                    + "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32";

    $.when($.ajax(
    { 
        url: url,
        data: JSON.stringify( { "$set" : {"reports" : stationReports} }),
        type: "PUT",
        async: false,
        contentType: "application/json" 
    }))
    .then(reportedUpdatedSuccessfullyMessage);   
}

function reportedUpdatedSuccessfullyMessage()
{
    swal({   title: "Report Updated!",   
        text: "The report has been updated successfully and users have been notified.",   
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

function confirmAlert(uniqueReportID) 
{
    swal({   
        title: "Confirm Deletion",   
        text: "Are you sure you want to delete this report?",   
        type: "warning",   
        showCancelButton: true,   
        confirmButtonColor: "#DD6B55",   
        confirmButtonText: "Yes",   
        closeOnConfirm: false }, 
        
        function()
        {   
            updateStationsReports(uniqueReportID);
        }
    );
}

function updateStationsReports(uniqueReportID)
{
    $.ajax({
    url: "https://api.mongolab.com/api/1/databases/communityalert/collections/stations/"+ username +
            "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
            type: 'get',                                                                                
    })
    .done(function(data) {
        var stationInfo = JSON.stringify(data,undefined,1);
        var obj = JSON.parse(stationInfo);
        var stationsReports = obj['reports'];
        
        if(stationsReports.length > 2)
        {
            var stationsReportsArray = stationsReports.split(",");
            var indexOfReportToDelete = stationsReportsArray.indexOf(uniqueReportID);

            if (indexOfReportToDelete > -1) 
            {
                stationsReportsArray.splice(indexOfReportToDelete, 1);
            } 
            
            var newListWithDeletedReportRemoved = stationsReportsArray.join();
        }
        else {
            var newListWithDeletedReportRemoved = "";  
        }

        updateStationsListOfReports(newListWithDeletedReportRemoved, uniqueReportID); 
    })
    .fail(function(request,status,error) {
        sweetAlert("Error...", "Check your internet connection.", "error");
    }) 
}

function updateStationsListOfReports(newListOfStationReports, uniqueReportID)
{
    var url = "https://api.mongolab.com/api/1/databases/communityalert/collections/stations/" + username 
                + "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32";

    $.when($.ajax(
    { 
        url: url,
        data: JSON.stringify( { "$set" : {"reports" : newListOfStationReports} }),
        type: "PUT",
        async: false,
        contentType: "application/json" 
    }))
    .then(deleteReport(uniqueReportID));  
}

function deleteReport(uniqueReportID)
{
    $.ajax
    ( 
        { 
            url: "https://api.mongolab.com/api/1/databases/communityalert/collections/reports/"+ uniqueReportID +"?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
            type: "DELETE",
            async: true,
            timeout: 300000,
            success: function (data) 
            {
                swal(
                    {   
                        title: "Report Deleted!",   
                        text: "The report has been deleted successfully.",   
                        type: "success",   
                        showCancelButton: false,   
                        confirmButtonColor: "#AEDEF4",   
                        confirmButtonText: "OK",   
                        closeOnConfirm: false,   
                        closeOnCancel: false 
                    }, 
                    function(isConfirm)
                    {   
                        location.reload();   
                    }
                );
            },
            error: function (xhr, status, err) { } 
        } 
    );
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

function updateHomePageToUserValues()
{
    var div = document.getElementById("phone");
    div.innerHTML = phoneNum + " - " + username;
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

function logout()
{
    window.location.href = "index.html";
}

