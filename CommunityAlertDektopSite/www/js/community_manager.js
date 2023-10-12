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

function getUserValuesFromUrl()
{
    return parameters = location.search.substring(1).split("&");
}

function logout()
{
    window.location.href = "index.html";
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

var map;
var marker;
var geocoder;

function toggleBounce() 
{
    if (marker.getAnimation() != null) {
      marker.setAnimation(null);
    } 
    else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}

function initialize() {
    createMap(lat, lng); 
    createMarker(lat, lng);
}

function createMap(lat, lng) 
{
    var mapOptions = { 
        center: new google.maps.LatLng(lat, lng), 
        zoom: 12,
        scrollwheel: false,
        streetViewControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP 
    };
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
}

function createMarker(lat, lng)
{
    marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),
        map: map,
        draggable:true,
        animation: google.maps.Animation.DROP,
        title: 'Your Location'   
    });
    google.maps.event.addListener(marker, 'click', toggleBounce);
}

function getMarkerLat()
{
    return marker.getPosition().lat();
}

function getMarkerLng()
{
    return marker.getPosition().lng();
}

function isEmpty(str) 
{
    return (!str || 0 === str.length);
}

function checkValidInput()
{
    enteredCommunityName = document.getElementById("nameInput").value;
    if (!isEmpty(enteredCommunityName)) {
        createCommunity(enteredCommunityName);
    }
    else {
        sweetAlert("Oops...", "You must enter a name..", "error");     
    }
}

function createCommunity(enteredCommunityName)
{
    var lat = getMarkerLat();
    var lng = getMarkerLng();
    var url = "https://api.mongolab.com/api/1/databases/communityalert/collections/" + 
                    "communities?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32";
    $.when($.ajax(
    { 
        url: url,
        data: JSON.stringify( { "_id" : enteredCommunityName, 
                                 "station" : username,
                                 "lat" : lat,
                                 "lng" : lng    
                                } ),
        type: "POST",
        contentType: "application/json" 
    }))
    .then(getStationsCommunities(enteredCommunityName));
}

function getStationsCommunities(enteredCommunityName)
{
    var stationsCommunities;
     $.ajax({
            url: "https://api.mongolab.com/api/1/databases/communityalert/collections/stations/"+ username + 
                                "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32",
            type: 'get',                                                                                
    })
    .done(function(data) {
        var stationInfo = JSON.stringify(data,undefined,1);
        var obj = JSON.parse(stationInfo);
        stationsCommunities = obj['communities'];
        createNewListOfStationCommunities(stationsCommunities, enteredCommunityName);
    })
    .fail(function(request,status,error) {
        sweetAlert("Oops...", "Unknown username or wrong password.", "error");
    })
}

function createNewListOfStationCommunities(stationsCommunities, enteredCommunityName)
{
    var newStationCommunityList;
    if(isEmpty(stationsCommunities)) {
        newStationCommunityList = enteredCommunityName;  
    }
    else {
       newStationCommunityList = stationsCommunities + "," + enteredCommunityName;
    }
    
    communities = newStationCommunityList;
    updateStationsCommunityList(newStationCommunityList);   
}

function updateStationsCommunityList(newStationCommunityList)
{
    var url = "https://api.mongolab.com/api/1/databases/communityalert/collections/stations/" + username 
                        + "?apiKey=ieVJfwfcyWKcpXwdIU61AGa8qWkAoE32";
    $.when($.ajax(
    { 
        url: url,
        data: JSON.stringify( { "$set" : {"communities" : newStationCommunityList} }),
        type: "PUT",
        contentType: "application/json" 
    }))
    .then(communityCreatedSuccessfullyMessage); 
}

function communityCreatedSuccessfullyMessage()
{
    swal({   title: "Community Created!",   
            text: "The Community has been created successfully.",   
            type: "success",   
            showCancelButton: false,   
            confirmButtonColor: "#AEDEF4",   
            confirmButtonText: "OK",   
            closeOnConfirm: false,   
            closeOnCancel: false }, 
            function(isConfirm)
            {   
                openCommunityManager();   
            }
    );
}

jQuery(document).ready(function() 
{
    jQuery("#newCommunity").click(function()
    {
        jQuery(this).next("#newCommunityContent").slideToggle(500);
        editExpandCollapseImage("newCommunityExpandLogo");
    });
    
    jQuery("#addMember").click(function()
    {
        jQuery(this).next("#addMemberContent").slideToggle(500);
        editExpandCollapseImage("addMemberToCommunityLogo");
    });
    
    jQuery("#editCommunity").click(function()
    {
        jQuery(this).next("#editCommunityContent").slideToggle(500);
        editExpandCollapseImage("editCommunityLogo");
    });
});

function editExpandCollapseImage(uniqueReportID)
{
    var src = document.getElementById(uniqueReportID).src;
    
    var imageName = src.slice(-14);
    if (imageName == "c_triangle.png")
    {
        document.getElementById(uniqueReportID).src = "images/e_triangle.png";
    }
    else 
    {
        document.getElementById(uniqueReportID).src = "images/c_triangle.png";  
    }
}