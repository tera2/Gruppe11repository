/*
XMLHttpRequest:
https://en.wikipedia.org/wiki/XMLHttpRequest

CouchDB:
http://guide.couchdb.org/draft/tour.html
https://wiki.apache.org/couchdb/HTTP_Document_API
http://docs.couchdb.org/en/1.6.1/config/intro.html
http://docs.couchdb.org/en/1.6.1/config/http.html#cross-origin-resource-sharing
http://docs.couchdb.org/en/1.6.1/intro/curl.html

HTML(5):
http://www.w3schools.com/html/default.asp
http://www.w3schools.com/jsref/default.asp

CouchDB configuration (Mac OS X):
~/Library/Application Support/CouchDB/etc/couchdb/local.ini
/Applications/Apache CouchDB.app/Contents/Resources/couchdbx-core/etc/couchdb/local.ini
CouchDB configuration (Windows):
C:\Program Files (x86)\Apache Software Foundation\CouchDB\etc\couchdb\local.ini
start/stop/restart: Control Panel --> Services --> Apache CouchDB

[httpd]
enable_cors = true
bind_address = 0.0.0.0  <-- for access from other devices, 127.0.0.1: local device only
...

[cors]
origins = *

*/

var request = new XMLHttpRequest();

request.onreadystatechange = function() {
	// console.log("onreadystatechange: " + request.readyState + ", " +  request.status);
	// console.log(request.responseText);
	if (request.readyState == 4) {
		if (request.status == 200) {
			var response = JSON.parse(request.responseText);
			handlers[response._id](response);
		}
		if (request.status == 404) {
			console.log("not found: " + request.responseText);
		}
	}
};

function get(variable) {
	// console.log("get " + variable);
	request.open("GET", dburl + variable, false);
	request.send();
}

function update() {
	for (var name in handlers) {
		// console.log("updating " + name);
		get(name);
	}
}

// request updates with a fixed interval (ms)
/*
var intervalID = setInterval(update, 200);

///////////////////////////////////////////////////////////////////////////////
// your code below

var dbname = "hci1";
var dburl = "http://127.0.0.1:5984/" + dbname + "/";
var handlers = {
	"animal" : updateAnimal,
	"showCounter" : showCounter,
	"counter" : updateCounter,
	"mytext" : updateText,
	// add further handlers here
};

function updateAnimal(response) {
	document.getElementById(response._id).src = response.src;
	document.getElementById(response._id).width = response.width;
}

function updateCounter(response) {
	document.getElementById(response._id).innerHTML =
		showCounter ? response.value : "";
}

var showCounter = true;

function showCounter(response) {
	showCounter = response.checked;
}

function updateText(response) {
	document.getElementById("mytext").innerHTML = response.value;
}         

*/




//actually our code...

//could theoretically save input in simple vars
var location_start = "Hannover";
var location_destination = "Berlin";
var location_via = [];
var traveller_count;
var time_start, time_destination;
var break_count, break_time;

var booked_journeys = [];//finished bookings
//... etc.


//---------FUNCTIONS---------//

function setPageStart()
{
    var newContent="";

    if(booked_journeys.length > 0){
        //TODO: add header with currently booked travel info
    }
    
    //add start page buttons
    newContent=newContent + 
    '<span style="">' + //could change to different style here as well, i.e. for padding towards the top (to keep button distance the same for with(out) header info) 
    '<button type="button" class="bigButton" onclick="setPageNewJourney()">Reise Planen</button><br /><br />' +
    '<button type="button" class="bigButton" onclick="setPagePreviousJourneys()">Letzte Reisen</button><br /><br />' +  
    '<button type="button" class="bigButton" onclick="setPageProfile()">Profil</button>' +
    '</span>';

    document.getElementById("content").innerHTML = newContent;
}


function setPageNewJourney(focusDocument="")
{
    //content of first page when you start a new journey ("Reise Planen" / "paper1_leer")  
    var newContent='<p><label>Startort</label>' +
                   '<input type="text" oninput="setStartLocation(this)" value="'+location_start+'"></p>' +
                   '<p><label>Zielort</label>' +
                   '<input type="text" oninput="setDestinationLocation(this)" value="'+location_destination+'"></p>';
  
    //add "via" destinations
    for(i=0; i<location_via.length+1; i++){
        newContent=newContent + '<p><label>via</label><input type="text" id="via'+i+'" oninput="setViaLocation(this, '+i+')"';
        if(location_via.length>i && location_via[i].length>0){
            newContent=newContent + ' value="'+location_via[i]+'"';
        }
        newContent=newContent + '></p>';
    }           
                   
    newContent=newContent+ 
                   '<br /><hr>' +
                   '<p><label>Anzahl der Reisenden</label>' +
                   '<input type="text" oninput="setTravellerCount(this)"></p>' +  
                   '<br /><hr>' +
                   '<p><label>Abfahrtszeit</label>' +
                   '<input type="text" oninput="setStartTime(this)"></p>' +
                   '<p><label>Ankunftszeit</label>' +
                   '<input type="text" oninput="setDestinationTime(this)"></p>' +
                   '<br /><hr>' +
                   '<p><label>Anzahl der Pausen</label>' +
                   '<input type="text" style="width:5%" oninput="setBreakCount(this)"></p>' +
                   '<p><label>Pausenlänge</label>' +
                   '<input type="text" style="width:5%" oninput="setBreakTime(this)"></p>';
           
                   
    //back/next button
    newContent=newContent+'<br /><br />'+
                          '<button type="button" class="smallButton" onclick="setPageStart()" style="margin-right:24px">Zurück</button>'+
                          '<button type="button" class="smallButton" onclick="setPageLuggage()" style="margin-left:24px">Weiter</button>';
    
    document.getElementById("content").innerHTML = newContent;
    
    if(focusDocument.length>0){//set focus to previous "via" after adding a new line
      var previousVia=document.getElementById(focusDocument);
      previousVia.focus();
      previousVia.setSelectionRange(previousVia.value.length, previousVia.value.length);
    }
}



//TODO: setPagePreviousJourneys(), setPageProfile(), setPageLuggage() and over 9000 other pages

 
 
                 
//---INPUT-HELPER-FUNCTIONS---//
//todo: need sanity checks for only numerical inputs (anzahl der reisenden usw.)
function setStartLocation(document)
{
    location_start=document.value;
}                

function setDestinationLocation(document)
{
    location_destination=document.value;
}    
  
function setViaLocation(document, index)
{
    while(location_via.length<=index){
        location_via.push("");
    }
    
    location_via[index]=document.value;  
    
    //add new "via" line
    var empty_line=false;                     
    for(i=0; i<location_via.length && empty_line==false; i++){
        if(location_via[i].length==0){
            empty_line=true;
        }
    }
    if(empty_line==false){  
        setPageNewJourney(document.id);
    }
}
                        
function setTravellerCount(document)
{
    traveller_count=document.value;
} 
   
function setStartTime(document)
{
    time_start=document.value;//TODO: sanity check & override of destination time
}
    
function setDestinationTime(document)
{
    time_destination=document.value;//TODO: sanity check & override of start time
} 
   
function setBreakCount(document)
{
    break_count=document.value;
} 
   
function setBreakTime(document)
{
    break_time=document.value;
}    