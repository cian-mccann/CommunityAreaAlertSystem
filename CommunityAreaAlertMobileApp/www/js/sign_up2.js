function infoCorrectMessage(username)
{  
    swal("Information Correct!", "Next enter your date of birth." +
         "\n Enter your date of birth using the format \n dd/mm/yyyy \n Example:" + 
         "\n 01/08/1980" + 
         "\n Please ensure you enter the correct date.", "success");
}

function createUrlSuffix() 
{
    var parameters = getUserValuesFromUrl();   
    recievedUsername = getUrlValue(parameters[0]);
    recievedPassword = getUrlValue(parameters[1]);
    var dateOfBirth = document.getElementById("dob_input").value;
    return "?username="+recievedUsername+"&password="+recievedPassword +"&dateOfBirth="+dateOfBirth;
}

function checkDateOfBirth() {
    validateDateOfBirth();
    checkUserErrorMessage("sign_up3.html");
}

function isValidDate(dateString)
{
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
        return false;
    }

    var parts = dateString.split("/");
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);

    if(year < 1000 || year > 3000 || month == 0 || month > 12) {
        return false;
    }

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
        monthLength[1] = 29;
    }

    return ((day > 0) && (day <= monthLength[month - 1]));
};

function validateDateOfBirth()
{
    var dateOfBirth = document.getElementById("dob_input").value;
    
    if(isEmpty(dateOfBirth)) {
         updateUserErrorMessage("You must enter your date of birth.");      
    }
    else if (!(isValidDate(dateOfBirth))) {
        updateUserErrorMessage("You need to enter a valid date of birth. Of the form: \n dd/mm/yyyy"); 
    }    
}