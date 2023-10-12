function isEmpty(str) 
{
    return (!str || 0 === str.length);
}

function compareStrings(string1, string2)
{
    return string1.localeCompare(string2);
}

function openNextPage(pageName, urlSuffix)
{
    window.location.href = pageName+urlSuffix; 
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

function displayErrorMessage()
{
    sweetAlert("Oops...", window.myValue, "error");
    window.myValue = "";   
}

function updateUserErrorMessage(errorMessage)
{
    if(isEmpty(window.myValue)) {
        window.myValue = errorMessage;      
    }
    else {
        window.myValue = window.myValue + "\n" + errorMessage;
    }
}

function checkUserErrorMessage(nextPage)
{
    if(isEmpty(window.myValue)) {
        var userDetails = createUrlSuffix();
        openNextPage(nextPage, userDetails);     
    }
    else {
        displayErrorMessage();
    }
}