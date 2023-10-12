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

function dispayUserAccountValues()
{
    if(notifications == "true") {
        document.getElementById("myonoffswitch").checked = true;
    }
    else {
        document.getElementById("myonoffswitch").checked = false; 
    }
}

function saveAccountSettings()
{
    var checkedValue = $('.onoffswitch-checkbox:checked').val();
    
    if(checkedValue == "on") {
        notifications = true;
    }
    else {
        notifications = false; 
    }
    
    var url = "https://api.mongolab.com/api/1/databases/communityalert/collections/users/" 
            + username + "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32";
    
    $.ajax(
    { 
        url: url,
        data: JSON.stringify( { "$set" : {"notifications" : notifications} }),
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
    swal("Settings Updated!", "You updated your settings.", "success")
}