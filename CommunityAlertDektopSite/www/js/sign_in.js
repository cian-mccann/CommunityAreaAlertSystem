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
    swal("Account Created", 
        "You can now Sign In to your stations account using your username and password.", "success");
}
        
function isEmpty(str) {
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
            url: "https://api.mongolab.com/api/1/databases/communityalert/collections/stations/" + enteredUsername 
                    +"?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
                    type: 'get',                                                                                
        })
        .done(function(data) {
            userAccountInformation = JSON.stringify(data,undefined,1);
            var obj = JSON.parse(userAccountInformation);
            var storedPassword = obj['password'];
            if(enteredPassword == storedPassword) {
                openNextPage("GardaHomepage.html", "?username="+enteredUsername);
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

