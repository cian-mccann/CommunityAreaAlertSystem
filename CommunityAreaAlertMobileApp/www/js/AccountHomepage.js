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

function getListOfUsersReports()
{
     $.ajax({
        url: "https://api.mongolab.com/api/1/databases/communityalert/collections/users/"+ username + 
                    "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
                type: 'get',                                                                                
    })
    .done(function(data) 
    {
        var stationInfo = JSON.stringify(data,undefined,1);
        var obj = JSON.parse(stationInfo);
        var usersReports = obj['reports'];
        downloadUsersReports(usersReports);
    })
    .fail(function(request,status,error) {
        sweetAlert("Error", "Check your internet connection.", "error");
    })
}

function downloadUsersReports(userReports)
{
    reports = [];
    reportIds = [];
    reportsToDelete = "";
    var urlPrefix = "https://api.mongolab.com/api/1/databases/communityalert/collections/reports/";
    var urlSuffix = "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32";

    if(String(userReports).length > 1) {
        reportIds = userReports.split(",");
    } 
    else if(String(userReports).length == 1) { 
        reportIds = [userReports];
    }
    else {
        reportIds = [];   
    }
    
    var countOfReportsRequsted = 1;
    var countOfRequestsForDeletedReports = 0;
    var numberOfReportsFound = reportIds.length;
    
    if (reportIds.length >= 1) {
        for(i = 0; i < reportIds.length; i++)
        {   
            $.ajax({
                url: urlPrefix + reportIds[i] + urlSuffix,
                        type: 'get',                                                                                
            })
            .done(function(data) 
            {
                reportInformation = JSON.stringify(data,undefined,1);
                var obj = JSON.parse(reportInformation);
                var reportTitle = obj['title'];
                var reportDescription = obj['reportDescription'];
                var dateTime = obj['dateTime'];
                var reportID = obj['_id'];
                var lat = obj['lat'];
                var lng = obj['lng'];
                var stationName = obj['stationName'];
                var stationPhoneNum = obj['stationPhoneNum'];
                var report = new Report(reportTitle, reportDescription, dateTime, reportID, 
                                        lat, lng, stationName, stationPhoneNum);
                reports[reportID] = report;  
                displayReportInDiv(reports[reportID], numberOfReportsFound, countOfReportsRequsted);
                countOfReportsRequsted++;
            })
            .fail(function(xhr, textStatus, errorThrown) {
                var failedUrl = this.url.replace(urlPrefix, "");
                var failedReportId = failedUrl.replace(urlSuffix, "");
                reportsToDelete = reportsToDelete + "," + failedReportId;
                countOfReportsRequsted++;
                countOfRequestsForDeletedReports++;

                if (countOfRequestsForDeletedReports == numberOfReportsFound) {
                    sweetAlert("No Alerts found.", "You have no relevant reports.", "error");           
                }
            })
        }
    }
    else {
        sweetAlert("No Alerts found.", "You have no relevant reports.", "error");       
    }
}

function displayReportInDiv(index, numberOfReportsFound, countOfReportsDownloaded)
{
    var mainDiv = document.getElementById("mainDiv");
    var innerDiv = document.createElement('div');
    innerDiv.className = 'innerDiv';
    var uniqueReportID = index.getUniqueReportId();
    innerDiv.innerHTML = '<img class="edit_pic" id="' + uniqueReportID 
                            + '" onclick="editExpandCollapseImage(this.id)" src="images/expandim.png">';
    var time = document.createElement('h3');
    var title = document.createElement('h3');
    time.innerHTML = index.getTimeAndDate();
    title.innerHTML = index.getTitle();
    innerDiv.appendChild(time);
    innerDiv.appendChild(title);
    
    var reportContent = document.createElement('div');
    reportContent.className = "content";
 
    var description = document.createElement('h3');
    description.innerHTML = index.getDescription();
    
    var stationName = document.createElement('h3');
    stationName.innerHTML = index.getStationName();
    
    var stationPhoneNum = document.createElement('h3');
    stationPhoneNum.innerHTML = index.getStationPhoneNum();
    
    reportContent.appendChild(description);
    reportContent.appendChild(stationName);
    reportContent.appendChild(stationPhoneNum);
    innerDiv.appendChild(reportContent);
    
    var hr = document.createElement('hr');
    mainDiv.appendChild(innerDiv);
    mainDiv.appendChild(hr);
    
    $('img#'+uniqueReportID).click(function()
    {
        $header = $(this);
        $content = $header.next().next().next();
        $content.slideToggle(500, function () 
        {
            this.src = "";
        });
    });
    
    if (numberOfReportsFound == countOfReportsDownloaded)
    {
        removeDeletedReportsFromUsersReportList();
    }
}

function removeDeletedReportsFromUsersReportList()
{
    if (reportsToDelete != "")
    {
        reportsToDelete = reportsToDelete.slice(1);
        reportIdsToDelete = reportsToDelete.split(",");
        
        for (var i = 0; i < reportIdsToDelete.length; i++)
        {
            var index = reportIds.indexOf(reportIdsToDelete[i]);
            
            if (index > -1) 
            {
                reportIds.splice(index, 1);
            }    
        }
        
        var newListWithDeletedReportsRemoved = reportIds.join();
        updateUsersListofReports(newListWithDeletedReportsRemoved);  
    }
}

function updateUsersListofReports(newListWithDeletedReportsRemoved)
{
    var url = "https://api.mongolab.com/api/1/databases/communityalert/collections/users/" + username + 
        "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32";

    $.ajax(
    { 
        url: url,
        data: JSON.stringify( { "$set" : {"reports" : newListWithDeletedReportsRemoved} }),
        type: "PUT",
        async: false,
        contentType: "application/json" 
    })
}

function editExpandCollapseImage(uniqueReportID)
{
    var src = document.getElementById(uniqueReportID).src;
    
    var imageName = src.slice(-12);
    if (imageName == "expandim.png")
    {
        document.getElementById(uniqueReportID).src = "images/collapse.png";
    }
    else 
    {
        document.getElementById(uniqueReportID).src = "images/expandim.png";  
    }
}
