function getAccountValues()
{
    var parameters = getUserValuesFromUrl();
    username = getUrlValue(parameters[0]);
    lat = getUrlValue(parameters[1]);
    lng = getUrlValue(parameters[2]);
    notifications = getUrlValue(parameters[3]);
    gpsRaduis = getUrlValue(parameters[4]);
    community = getUrlValue(parameters[5]);
    pollForUpdates();
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

function pollForUpdates()
{
    $.ajax({
        url: "https://api.mongolab.com/api/1/databases/communityalert/collections/users/" + 
                    username +"?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
                type: 'get',                                                                                
    })
    .done(function(data) {
        var reportInfo = JSON.stringify(data,undefined,1);
        var obj = JSON.parse(reportInfo);
        var verifiedStatus = obj['verified'];
        if(verifiedStatus == true) {
            sendNotificationToUser();
        }
        else {
            setTimeout(function() { 
                pollForUpdates(); 
            }, 10000);
        }
    })
    .fail(function(request,status,error) {
        sweetAlert("Error", "Check your internet connection.", "error");
    })  
}

function sendNotificationToUser()
{
    window.plugin.notification.local.add({
        autoCancel: true,
        title:   'Community Area Alert',
        message: 'Your account has been verified!.'
    });
    
    window.plugin.notification.local.onclick = function (id, state, json) {
        openHomepage();
    };
}

function openHomepage()
{
    window.location.href = "AccountHomepage.html"+ "?username="+username 
                     + "&lat=" + lat + "&lng=" + lng + "&notifications=" + notifications 
                     + "&gpsRaduis=" + gpsRaduis + "&community=" + community;
}

function nextPage()
{  
    var userDetails = createUrlSuffix();
    openNextPage("verify_address.html", userDetails);
}

function openNextPage(pageName, urlSuffix)
{
    window.location.href = pageName+urlSuffix; 
}

function createUrlSuffix()
{
    return "?username=" + username + "&password=" + "&lat=" + lat + "&long=" + lng + "&address=Use lat/ lng to verify.";
}
