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

function logout()
{
    window.location.href = "index.html";
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

function isEmpty(str) 
{
    return (!str || 0 === str.length);
}

function checkValidInput()
{
    enteredUsername = document.getElementById("usernameInput").value;
    if (!isEmpty(enteredUsername)) {
        getUserAccountInfo(enteredUsername);
    }
    else {
        sweetAlert("Oops...", "You must enter a username..", "error");     
    }
}

function getUserAccountInfo(username)
{
    $.ajax({
        url: "https://api.mongolab.com/api/1/databases/communityalert/collections/users/" + username +
                    "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
                type: 'get',                                                                                
    })
    .done(function(data) {
                userAccountInformation = JSON.stringify(data,undefined,1);
                var obj = JSON.parse(userAccountInformation);
                var dateOfBirth = obj['dob'];
                var formattedAddress = obj['formattedAddress'];
                displayUserAccountInfo(username, dateOfBirth, formattedAddress);
    })
    .fail(function(request,status,error) {
                sweetAlert("Oops...", "Could not find user.", "error");
    })
}

function displayUserAccountInfo(username, dateOfBirth, formattedAddress)
{
    jQuery("#userInfoHeading").removeClass('userInfoHidden');
    jQuery("#verify_btn").removeClass('userInfoHidden');
    
    var divToUpdate = document.getElementById("usernameInfoDisplay");
    divToUpdate.innerHTML = "Username: " + username;
    jQuery("#usernameInfoDisplay").removeClass('userInfoHidden');
    
    divToUpdate = document.getElementById("dobInfoDisplay");
    divToUpdate.innerHTML = "Date of Birth: " + dateOfBirth;
    jQuery("#dobInfoDisplay").removeClass('userInfoHidden');
    
    divToUpdate = document.getElementById("addressInfoDisplay");
    divToUpdate.innerHTML = "Address: " + formattedAddress;
    jQuery("#addressInfoDisplay").removeClass('userInfoHidden');
}

function verifyUser()
{
    var url = "https://api.mongolab.com/api/1/databases/communityalert/collections/users/" + enteredUsername +
                    "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32";
    $.when($.ajax(
    { 
        url: url,
        data: JSON.stringify( { "$set" : {"verified" : true} }),
        type: "PUT",
        contentType: "application/json" 
    }))
    .then(verificationCompleteMessage);
}

function verificationCompleteMessage()
{
    swal("Account Verified!", "The user account " + enteredUsername + " has been verified.", "success");
    jQuery("#userInfoHeading").addClass('userInfoHidden');
    jQuery("#verify_btn").addClass('userInfoHidden');
    jQuery("#usernameInfoDisplay").addClass('userInfoHidden');
    jQuery("#addressInfoDisplay").addClass('userInfoHidden'); 
    jQuery("#dobInfoDisplay").addClass('userInfoHidden');
    var usernameInputForm = document.getElementById("usernameInput");
    usernameInputForm.value = "";
}