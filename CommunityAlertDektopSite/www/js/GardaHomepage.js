function logout()
{
    window.location.href = "index.html";
}

function getAccountValues()
{
    var parameters = getUserValuesFromUrl();
    username = getUrlValue(parameters[0]);
}

function getUserValuesFromUrl()
{
    return parameters = location.search.substring(1).split("&");
}

function getUrlValue(index)
{
    var temp = index.split("=");
    return unescape(temp[1]);  
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

function downloadAccountInfo()
{
    $.ajax({
        url: "https://api.mongolab.com/api/1/databases/communityalert/collections/stations/" 
            + username +"?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
        type: 'get',                                                                                
    })
    .done(function(data) {
        stationAccountInformation = JSON.stringify(data,undefined,1);
        var obj = JSON.parse(stationAccountInformation);
        lat = obj['lat'];
        lng = obj['lng'];
        phoneNum = obj['phoneNum'];
        communities = obj['communities'];
        updateHomePageToUserValues();
    })
    .fail(function(request,status,error) {
        sweetAlert("Oops...", "Cannot download account info.", "error");
    }) 
}

function updateHomePageToUserValues()
{
    var div = document.getElementById("phone");
    div.innerHTML = phoneNum + " - " + username;
    
    var div = document.getElementById("usernameDisplay");
    div.innerHTML = username;
}