function isUsernameLengthCorrect(enteredUsername)
{
    return (enteredUsername.length > 3 && enteredUsername.length < 13);
}

function isPasswordLengthCorrect(enteredPassword)
{
    return (enteredPassword.length > 3 && enteredPassword.length < 16);
}

function createUrlSuffix() 
{
    return "?username="+username+"&password="+password;
}

function checkSignUpValues() {
    validateUsername();
    validatePassword();
    checkUserErrorMessage("sign_up2.html");
}

function validateUsername()
{
    username = document.getElementById("username_input").value;
    if(!(isEmpty(username))) {
        if(!(isUsernameLengthCorrect(username))) {
            updateUserErrorMessage("Username must be contain minimum 4 charachters and a max of 12."); 
        }        
    }
    else { 
        updateUserErrorMessage("You must enter a username."); 
    }
}

function validatePassword()
{
    password = document.getElementById("password_input").value;
    var retypedPassword = document.getElementById("password_input2").value;
    
    if(isEmpty(password)) {
         updateUserErrorMessage("You must enter a password.");      
    }
    else { 
        if(isPasswordLengthCorrect(password)) {
            if((compareStrings(password, retypedPassword)) != 0) {
                updateUserErrorMessage("Passwords must match.");
            }
        }  
        else {
            updateUserErrorMessage("Password must be between 4 and 15 charachters.");
        }
    }
}