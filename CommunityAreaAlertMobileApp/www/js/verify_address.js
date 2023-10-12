function infoCorrectMessage(username)
{   
    getUserDetails();
    swal("Account Created! \n Username = "+recievedUsername, 
         "Before you can use this app you need to verify your address."+ 
            "To verify your address you need a document such as a driving licence," + 
                "passport or a recent bill which contains your name and address.", "success");
}

function getOriginalWidthOfImg(img_element) {
    var t = new Image();
    t.src = (img_element.getAttribute ? img_element.getAttribute("src") : false) || img_element.src;
    return t.width;
}

function getOriginalHeightOfImg(img_element) {
    var t = new Image();
    t.src = (img_element.getAttribute ? img_element.getAttribute("src") : false) || img_element.src;
    return t.height;
}

function getUserDetails()
{
    var parameters = getUserValuesFromUrl();
    recievedUsername = getUrlValue(parameters[0]);
    recievedPassword = getUrlValue(parameters[1]);
    recievedDateOfBirth = getUrlValue(parameters[2]);
    recievedLat = getUrlValue(parameters[3]);
    recievedLng = getUrlValue(parameters[4]);
    recievedAddress = getUrlValue(parameters[5]);
}

function captureCamera()
{
    intel.xdk.camera.takePicture(10,true,"png");
}

function displayCapturedImageInContainer(container, imgSCR)
{   
    container.setAttribute("src", imgSCR);
    container.style.visibility = "";
    container.style.height = "150px";   
}

function displayButton(button)
{
    button.style.visibility = "";
    button.style.width = "";
    button.style.height = "";  
}

function changeElementText(element, newText)
{
    element.value=newText;
}

function updatePageAfterImageCaptured(url)
{   
    var capturedImageContainer = document.getElementById("captured_image");
    displayCapturedImageInContainer(capturedImageContainer, url);

    var uploadButton = document.getElementById("uploadBtn"); 
    displayButton(uploadButton);

    var captureImageButton = document.getElementById("captureBtn");
    changeElementText(captureImageButton, "Retake");
    
    captureImageButton.style.marginRight = "5px";
    document.getElementById("image_btn_container").style.paddingBottom = "5px";
}

document.addEventListener("intel.xdk.camera.picture.add",function(event) 
{
    var name = event.filename;
    var url = intel.xdk.camera.getPictureURL(name);
    
    updatePageAfterImageCaptured(url);
}); 

document.addEventListener("intel.xdk.camera.picture.busy",function()
{
    alert("Camera is already in use");
});
        
document.addEventListener("intel.xdk.camera.picture.cancel",function()
{
    alert("You pressed the cancel button");
});

function scaleToCanvasSize(maxW, maxH, currW, currH){
    var ratio = currH / currW;

    if(currW >= maxW && ratio <= 1) {
        currW = maxW;
        currH = currW * ratio;
    } 
    else if(currH >= maxH) {
        currH = maxH;
        currW = currH / ratio;
    }

    return [currW, currH];
}

function getBase64Image(img) {
    var canvas, ctxs, dataURL, imageRatio, portraitImage;

    canvas = document.createElement("canvas");
    
    originalWidth = getOriginalWidthOfImg(img);
    originalHeight = getOriginalHeightOfImg(img);
      
    var dimensions = scaleToCanvasSize(500, 500, originalWidth, originalHeight);

    canvas.width = dimensions[0];
    canvas.height = dimensions[1];
    
    ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, dimensions[0], dimensions[1]);

    dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

function uploadForVefification()
{  
    var img = document.getElementById("captured_image");
    var data = getBase64Image(img);
     
    var test = "<h2>User Account Verification</h2>                                                                                                          <h4>The following user would like to verfiy their account:</h4>"
                    + recievedUsername +                                                                                                                        "<p> They entered the address: </p>"                                                                                                        + recievedAddress +                                                                                                                         "<p>At the coordinates of: </p>"                                                                                                            + recievedLat + " , " + recievedLng; + "<img src='cid:IMAGECID.png'>";                                                              
    
    $.ajax({
        type: "POST",
        url: "https://mandrillapp.com/api/1.0/messages/send.json",
        data: {
            'key': 'kE0NNP5dNDn70hAfGxB57Q',
            'message': 
            {
                'from_email': 'commnityareaalert1@gmail.com',
                'to': 
                [
                    {
                        'email': 'commnityareaalert1@gmail.com',
                        'name': 'Admin',
                        'type': 'to'
                    }
                ],
                "images": 
                [
                    {
                        "type": "image/png",
                        "name": "IMAGECID.png",
                        "content": data
                    }
                ],
                'autotext': 'true',
                'subject': 'User Verfification',
                'html': test
            }
        }
    }).done(function(response) 
    {
        var urlSuffix = "?username="+recievedUsername;
        openNextPage("sign_in.html", urlSuffix);
    });   
}



