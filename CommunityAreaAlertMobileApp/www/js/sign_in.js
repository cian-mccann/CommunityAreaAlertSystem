function firstTimeSignIn()
{
    var parameters = getUserValuesFromUrl();
    var newUserIndicationString = getUrlValue(parameters[0]);

    if(!(newUserIndicationString == "undefined")) {
        displayInfoMessage(newUserIndicationString);   
        var elem = document.getElementById("username_input");
        elem.value = newUserIndicationString;
    }
}

function displayInfoMessage(username)
{
    swal("Email Sent", 
        "You can now Sign In to your account using your username and password.\n" +
            "You will then recieve a notification when your verification email is reviewed.", "success");
}
        
function isEmpty(str) 
{
    return (!str || 0 === str.length);
}

function getUserInput()
{
    enteredUsername = document.getElementById("username_input").value;
    enteredPassword = document.getElementById("password_input").value;  
}

function checkValidInput()
{
    getUserInput();
    if ((!isEmpty(enteredUsername)) && (!isEmpty(enteredPassword))) {
        return true;
    }
    return false;
}

function checkUserCredentials()
{
    if(checkValidInput()) {
        $.ajax({
            url: "https://api.mongolab.com/api/1/databases/communityalert/collections/users/" + 
                    enteredUsername +"?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
                    type: 'get',                                                                                
        })
        .done(function(data) {
            userAccountInformation = JSON.stringify(data,undefined,1);
            var obj = JSON.parse(userAccountInformation);
            var storedPassword = obj['password'];

            if(enteredPassword == storedPassword) {
                var verifiedStatus = obj['verified'];
                var lat = obj['lat'];
                var lng = obj['lng'];
                var gpsRaduis = obj['gpsRaduis'];
                var notifications = obj['notifications'];
                var community = obj['community'];
                
                if (verifiedStatus == true) {
                    openNextPage("AccountHomepage.html", "?username="+enteredUsername 
                                 + "&lat=" + lat + "&lng=" + lng + "&notifications=" + notifications 
                                 + "&gpsRaduis=" + gpsRaduis + "&community=" + community);
                }
                else {
                    openNextPage("notVerified.html", "?username="+enteredUsername 
                                 + "&lat=" + lat + "&lng=" + lng + "&notifications=" + notifications 
                                 + "&gpsRaduis=" + gpsRaduis + "&community=" + community);   
                }
            }
            else {
                sweetAlert("Oops...", "Unknown username or wrong password.", "error");   
            }
        })
        .fail(function(request,status,error) {
            sweetAlert("Oops...", "Unknown username or wrong password.", "error");
        })
    }
    else {
        sweetAlert("Oops...", "You must enter a username and password.", "error");   
    }
}

