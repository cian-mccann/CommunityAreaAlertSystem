function infoCorrectMessage(username)
{  
    swal("Information Correct!", "Next enter the phone number of your station." +
         "\n Please ensure you enter the phone numeber correctly as this will be displayed on all alerts.", "success");
}

function createUrlSuffix() 
{
    var parameters = getUserValuesFromUrl();   
    recievedUsername = getUrlValue(parameters[0]);
    recievedPassword = getUrlValue(parameters[1]);
    var phoneNumber = document.getElementById("number_input").value;
    return "?username="+recievedUsername+"&password="+recievedPassword +"&phoneNumber="+phoneNumber;
}

function checkFormValid() 
{
    validatePhoneNumber();
    checkUserErrorMessage("sign_up3.html");
}

function isPhoneNumberValid(phoneNum)
{
    var phoneNumRegularExpression = /'|^\s*\(?\s*\d{1,4}\s*\)?\s*[\d\s]{5,10}\s*$|'/;
    if(phoneNumRegularExpression.test(phoneNum)) {
        return true;
    }
    else {
        return false;   
    }
        
}

function validatePhoneNumber()
{
    var phoneNum = document.getElementById("number_input").value;
    
    if(isEmpty(phoneNum)) {
         updateUserErrorMessage("You must enter your stations phone number.");      
    }
    else if (!(isPhoneNumberValid(phoneNum))) {
        updateUserErrorMessage("You need to enter your stations phone number correctly."); 
    }    
}