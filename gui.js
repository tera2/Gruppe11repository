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
var location_start = "";
var location_destination = "";
var location_via = [];
var traveller_count;
var time_start, time_destination;
var break_count, break_time;

var booked_journeys = [];//finished bookings
var reservation = 0;
var smallLuggage = 0;
var medLuggage = 0;
var hugeLuggage = 0;
var bicycleValues = 0;
var skiValues = 0;
var surfValues = 0;
var snowValues = 0;
var haengerValues = 0;
var dogBoxValues = 0;
var wlanValues = 0;
var doseValues = 0;
var barValues = 0;
var fernValues = 0;
var childrenseatValues=0;
var privatValues = 0;
//... etc.

//PRICING
const PRICE_BICYCLE=10.;
const PRICE_SKI=10.;
const PRICE_SURF=10.;
const PRICE_SNOW=10.;
const PRICE_COUPLING=10.;
const PRICE_DOGBOX=15.;
const PRICE_MISC=15.;
const PRICE_WIFI=10.;
const PRICE_SOCKET=2.;
const PRICE_TV=9.;
const PRICE_PRIVATE=20.;

const PAGE_MAX=6;


//---------FUNCTIONS---------//

function setPageStart()
{
    var newContent="";

    if(booked_journeys.length > 0){
        //TODO: add header with currently booked travel info
    		for(i=0; i<booked_journeys.length;i++){
    			newContent = newContent +'Reise von '+booked_journeys[i].start+' nach '+booked_journeys[i].end_destenation+'<br>'+
    			'Abfahrt um '+booked_journeys[i].timestart+' und Ankunft um '+booked_journeys[i].timedestination+'<br>';
    			newContent = newContent+ '<br />';
    		}
    		newContent = newContent+ '<br /><br /><br />';
    }
    
    //add start page buttons
    newContent=newContent + 
    '<span style="">' + //could change to different style here as well, i.e. for padding towards the top (to keep button distance the same for with(out) header info) 
    '<button type="button" class="bigButton" onclick="setPageNewJourney()">Reise Planen</button><br /><br />' +
    '<button type="button" class="bigButton" onclick="setPagePreviousJourneys()">Letzte Reisen</button><br /><br />' +  
    '<button type="button" class="bigButton" onclick="setPageProfile()">Profil</button>' +
    '</span>';

    document.getElementById("content").innerHTML = newContent;
    
    setPageNumber(-1);
}
function setPagePreviousJourneys(){
	
}
function setPageProfile(){
	var newContent = '<p><h3>Profil</h3></p>'
					+'<img src="dog.jpg" alt="profilbild" width="180" height="200">'
					+'<br /><br />'
					+'<p><label>Name:</label> Max Dogman<br />'
					+'<label>E-mail:</label> Max.DOG@gmail.com</p><br />'
					+''
					+'';
	
	newContent=newContent+'<br /><br /><br /><br /><br />'+
                          '<button type="button" class="smallButton" onclick="setPageStart()" style="margin-right:24px">Zur�ck</button>';
                        
     document.getElementById("content").innerHTML = newContent;
}


function setPageNewJourney(focusDocument="", skipToBill=false)
{
    //content of first page when you start a new journey ("Reise Planen" / "paper1_leer")  
    var newContent='<p><label>Abfahrtsort</label>' +
                   '<input type="text" oninput="setStartLocation(this)"  value="'+location_start+'"></p>' +
                   '<p><label>Ankunftsort</label>' +
                   '<input type="text" oninput="setDestinationLocation(this)" value="'+location_destination+'"></p>';
  
    //add "via" destinations
    for(i=0; i<location_via.length+1; i++){
        newContent=newContent + '<p><label>Zwischenstop</label><input type="text" id="via'+i+'" oninput="setViaLocation(this, '+i+')"';
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
                   '<input type="text" id="starttime" oninput="setStartTime(this)" onchange="setTravelTimeDestination()"></p>' +
                   '<p><label>Ankunftszeit</label>' +
                   '<input type="text" id="arrivaltime" oninput="setDestinationTime(this)" onchange="setTravelTimeStart()"></p>' +
                   '<br /><hr>' +
                   '<p><label>Anzahl der Pausen</label>' +
                   '<input type="text" style="width:5%" oninput="setBreakCount(this)"></p>' +
                   '<p><label>Pausenlänge</label>' +
                   '<input type="text" style="width:5%" oninput="setBreakTime(this)"></p>';
           
                   
    //back/next button
    newContent=newContent+'<br /><br />'+
                          '<button type="button" class="smallButton" onclick="setPageStart()" style="margin-right:24px">Zurück</button>'+
                          '<button type="button" class="smallButton" onclick="'+(skipToBill ? 'setPageBill()' : 'setPageMap()')+'" style="margin-left:24px">Weiter</button>';
    
    document.getElementById("content").innerHTML = newContent;
	
    if(focusDocument.length>0){//set focus to previous "via" after adding a new line
      var previousVia=document.getElementById(focusDocument);
      previousVia.focus();
      previousVia.setSelectionRange(previousVia.value.length, previousVia.value.length);
    }   
	
	setPageNumber(1);
}


//TODO: setPagePreviousJourneys(), setPageProfile(), setPageLuggage() and over 9000 other pages

function setPageMap(){
	
    
	
	var newContent = "";
    
	
	newContent += '<div style="height:400px; width:600px; margin: 0 auto;"><div id=map ></div></div>';
	
	newContent+= '<div id="travel_times" ><label>Abfahrt: ' + time_start + ' Uhr ' + 'Ankunft: ' + time_destination + ' Uhr </label>' +
					'</div>';
	
	newContent = newContent + '<br /><br />'+
                            '<button type="button" class="smallButton" onclick="setPageNewJourney()" style="margin-right:24px">Zurück</button>'+
                            '<button type="button" class="smallButton" onclick="setPageBaggage()" style="margin-left:24px">Weiter</button>';
  			
  	document.getElementById("content").innerHTML = newContent;    
	
	var map;
	var mapOptions;
	var directionsDisplay = new google.maps.DirectionsRenderer();
	var directionsService = new google.maps.DirectionsService();
	
	mapOptions ={
		center: new google.maps.LatLng(52.375892,9.732010),
		zoom:4,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	
	map = new google.maps.Map(document.getElementById("map"),mapOptions);
	directionsDisplay.setMap(map);

	var waypoints_array= [];
	
	for(var i= 0; i<location_via.length ;i++){
		waypoints_array.push({
			location:location_via[i],
			stopover:true
		});
	}
	
	
	var request = {
		origin:location_start,
		destination:location_destination,
		waypoints:waypoints_array,
		travelMode: google.maps.TravelMode.DRIVING
	};
	
	directionsService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(result);
		}
	});

    setPageNumber(2);
}



	
	/*var newContent = "<iframe <iframe width=" + "600" + " height=" +"450" + " frameborder=" + "0" 
  	+ " src=" +"https://www.google.com/maps/embed?pb=!1m34!1m12!1m3!1d1259737.542931774!2d10.44684633767563!3d51.92620310268749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m19!3e0!4m5!1s0x47b00b514d494f85%3A0x425ac6d94ac4720!2sHannover!3m2!1d52.375891599999996!2d9.7320104!4m5!1s0x47a6f818200f2c73%3A0x93df80d2b9b4f552!2sLeipzig!3m2!1d51.3396955!2d12.3730747!4m5!1s0x47a84e373f035901%3A0x42120465b5e3b70!2sBerlin!3m2!1d52.520006599999995!2d13.404954!5e0!3m2!1sde!2sde!4v1483628183819" 
  	+ " allowfullscreen></iframe>";
  	
  	newContent = newContent + "<label>Abfahrt: "  + time_start + " Uhr " +
  			"Ankunft: "+ time_destination + " Uhr " + "</label>" 
  		
  	
     

}*/



function setPageBaggage(skipToBill=false){
	var newContent = 	"<div><h1>Gepäck</h1></div>"					
						
						+"<p><label><font size='5'>55 cm</font><font size='2'> /Stk.5,-</font></label>"
						+"<input type='number' oninput='setSmallLuggage(this)' min='0' max='5' value='"+smallLuggage+"'>"
						+"</p>"
						
						+"<p><label><font size='5'>74 cm</font><font size='2'> /Stk.6,-</font></label>"
						+"<input type='number' oninput='setMedLuggage(this)' min='0' max='5' value='"+medLuggage+"'>"
						+"</p>"
						
						+"<p><label><font size='5'>85 cm</font><font size='2'> /Stk.8,-</font></label>"
						+"<input type='number' oninput='setHugeLuggage(this)' min='0' max='5' value='"+hugeLuggage+"'>"
						+"</p>"		
						
						+"<br /><hr>"
						+"<br />"
						
						+"<p><label><font size='5'>Fahrrad</font><font size='2'> /Stk. "+PRICE_BICYCLE+",-</font></label>"
						+"<input type='number' oninput='setBicycleValues(this)'min='0' max='5' value='"+bicycleValues+"'>"
						+"</p>"
						
						+"<p><label><font size='5'>Ski</font><font size='2'> /Paar "+PRICE_SKI+",-</font></label>"
						+"<input type='number' oninput='setSkiValues(this)'min='0' max='5' value='"+skiValues+"'>"
						+"</p>"
						
						+"<p><label><font size='5'>Surfboard</font><font size='2'> /Stk. "+PRICE_SURF+",-</font></label>"
						+"<input type='number' oninput='setSurfValues(this)'min='0' max='5' value='"+surfValues+"'>"
						+"</p>"
						
						
						+"<p><label><font size='5'>Snowboard</font><font size='2'> /Stk. "+PRICE_SNOW+",-</font></label>"
						+"<input type='number' oninput='setSnowValues(this)' min='0' max='5' value='"+snowValues+"'>"
						+"</p>"
						
						+"<p><label><font size='5'>Anhängerkupplung</font><font size='2'> /Stk. "+PRICE_COUPLING+",-</font></label>"
						+"<input type='checkbox' onchange='setHaengerValues(this)' "+(haengerValues!=0 ? "checked" : "")+">"
						+"</p>"
						
						
						+"<p title='Hundebox wird nicht gestellt!'><label><font size='5'>Hundebox</font><font size='2'> /Stk. "+PRICE_DOGBOX+",-</font></label>"
						+"<input type='number' oninput='setDogBoxValues(this) 'min='0' max='5' value='"+dogBoxValues+"'>"
						+"</p>"						
						
            //TODO: SETTER
						+"<p><label><font size='5'>Sonstiges</font><font size='2'> /Stk. "+PRICE_MISC+",-</font></label>"
						+"<input type='number' min='0' max='90' value='0' style = 'width : 5%'>"
						+"<input type='number' min='0' max='90' value='0' style = 'width : 5%'>"
						+"<input type='number' min='0' max='90' value='0' style = 'width : 5%'> (Maße cm x cm x cm)"
						+"</p>"
            
						
						
						
	
	newContent = newContent + '<br /><br />'+
                          '<button type="button" class="smallButton" onclick="setPageMap()" style="margin-right:24px">Zurück</button>'+
                          '<button type="button" class="smallButton" onclick="'+(skipToBill ? 'setPageBill()' : 'setPageExtra()')+'" style="margin-left:24px">Weiter</button>';
			
	document.getElementById("content").innerHTML = newContent;  
  
    setPageNumber(3);
}

function setPageExtra(){
	var newContent = 	"<div><h1>Zusatzoptionen</h1></div>"						
						
						+"<p><label><font size='5'>W-Lan</font><font size='2'> "+PRICE_WIFI+",-</font></label>"
						+"<input type='checkbox' onchange='setWlanValues(this)' "+(wlanValues!=0 ? "checked" : "")+">"
						+"</p>"								
						
						+"<p><label><font size='5'>Steckdosen</font><font size='2'> "+PRICE_SOCKET+",-</font></label>"
						+"<input type='checkbox' onchange='setDoseValues(this)' "+(doseValues!=0 ? "checked" : "")+">"
						+"</p>"
						
						+"<p><label><font size='5'>Mini-Bar</font></label>"
						+"<input type='checkbox' onchange='setBarValues(this)' "+(barValues!=0 ? "checked" : "")+">"					
						
						+"</p>"
						
						+"<p><label><font size='5'>Fernseher</font><font size='2'> "+PRICE_TV+",-</font></label>"
						+"<input type='checkbox' onchange='setFernValues(this)' "+(fernValues!=0 ? "checked" : "")+">"
						+"</p>"
						
						+"<p><label><font size='5'>Kindersitze</font><font size='2'> /Stk. 0,-</font></label>"
						+"<input type='number' oninput='setChildrenseatValues(this)' min='0' max='3' value='"+childrenseatValues+"'>"
						+"</p>"
						
						+"<p title='Es besteht die Möglichkeit, dass weitere Fahrgäste ihnen der Reise zugeteilt werden. Ihre Reisedauer wird dabei nicht beeinflusst.'><label><font size='5'>Reise veröffentlichen</font><font size='2'> "+PRICE_PRIVATE+",-</font></label>"
						+"<input type='checkbox' onchange='setPrivateValues(this)' "+(privatValues!=0 ? "checked" : "")+">"
						+"</p>"	

					
						
	
	newContent = newContent + '<br /><br />'+
                          '<button type="button" class="smallButton" onclick="setPageBaggage()" style="margin-right:24px">Zurück</button>'+
                          '<button type="button" class="smallButton" onclick="setPageBill()" style="margin-left:24px">Weiter</button>';
			
	document.getElementById("content").innerHTML = newContent;  
  
    setPageNumber(4);
}




function setPageBill(){
	//content of billpage, overview of all prices
	var newContent="<p><label><h2>Reiseübersicht</h2></label>" +
			'<button type="button" class="smallButton" onclick="setPageNewJourney(\'\', true)" style="float: right">Ändern</button></p>' + 
			"<p><label>Start: " + location_start + "</label></p>" + 
			"<p><label>Ziel: " + location_destination + "</label></p>";

	for(i=0; i<location_via.length;i++){
		newContent=newContent + "<p><label>via: " + location_via[i] + "</label></p>";
	}

	newContent=newContent + "<p><label>Abfahrtszeit: " + time_start + "</label></p>" + 
		"<p><label>Ankunftszeit: " + time_destination + "</label></p>" + "<br /><hr>";

	//Variables für Zusatzoptionen(Gepäck)
		newContent=newContent + "<p><label>Gepäck: " + sumLuggage() + " €</label>" +
				'<button type="button" class="smallButton" onclick="setPageBaggage(true)" style="float: right">Ändern</button></p>';
		if(bicycleValues != 0){ newContent=newContent + "<p><label>Fahrräder: " + bicycleValues*PRICE_BICYCLE + " €</label></p>";}
		if(skiValues != 0) { newContent=newContent + "<p><label>Ski: " + skiValues*PRICE_SKI + " €</label></p>";}
		if(surfValues != 0) { newContent=newContent + "<p><label>Surfboard: " + surfValues*PRICE_SURF + " €</label></p>";}
		if(snowValues != 0) { newContent=newContent + "<p><label>Snowboard: " + snowValues*PRICE_SNOW + " €</label></p>";}
		if(haengerValues != 0) { newContent=newContent + "<p><label>Anhängerkupplung: " + haengerValues + " €</label></p>";}
		if(dogBoxValues != 0) {newContent=newContent + "<p><label>Hundebox: " + dogBoxValues*PRICE_DOGBOX + " €</label></p>";}
		newContent=newContent + "<br /><hr>";
	//Ende von Zusatzoptionen

	//Variablen für Zusatzfeatures
		newContent=newContent + "<p label='Bezahlung erfolgt vor Ort in Bar'><label>Minibar: " + (barValues? "Ja" : "Nein") + "</label>" +
				'<button type="button" class="smallButton" onclick="setPageExtra()" style="float: right">Ändern</button></p>';
		if(wlanValues != 0){ newContent=newContent + "<p><label>Wlan: " + wlanValues + " €</label></p>";}
		if(doseValues != 0){ newContent=newContent + "<p><label>Steckdosen: " + doseValues + " €</label></p>";}
		if(fernValues != 0){ newContent=newContent + "<p><label>Fernseher: " + fernValues + " €</label></p>";}
		if(childrenseatValues != 0){ newContent=newContent + "<p><label>Kindersitze: " + childrenseatValues + " Stck. 0 €</label></p>";}
		if(privatValues != 0){ newContent=newContent + "<p><label>Privatreise: " + privatValues + " €</label></p>";}
		newContent=newContent + "<br /><hr>";
	//Ende von Zusatzfeatures

	newContent=newContent+ "<p><label>Kosten: " + 
			sum() +
			//pauschal für jede Reise (150+Gepäckvalues+Featurevalues) + //Rechnung 
			" €</label></p>" + "<br /><hr>";

	newContent=newContent+'<br /><br />'+
                          '<button type="button" class="smallButton" onclick="setPageExtra()" style="margin-right:24px">Zurück</button>'+
                          '<button type="button" class="smallButton" onclick="setPagePlatz()" style="margin-left:24px">Weiter</button>';
	document.getElementById("content").innerHTML = newContent;        
  
    setPageNumber(5);
}

function sum(){
	return 150 + parseFloat(sumLuggage()) + parseFloat(bicycleValues)*PRICE_BICYCLE + parseFloat(skiValues)*PRICE_SKI + parseFloat(snowValues)*PRICE_SNOW + parseFloat(surfValues)*PRICE_SURF + parseFloat(haengerValues) + parseFloat(dogBoxValues)*PRICE_DOGBOX + parseFloat(wlanValues) + parseFloat(doseValues) /*+ parseFloat(barValues)*PRICE_*/ + parseFloat(fernValues) + parseFloat(privatValues);
}

function sumLuggage(){
	return smallLuggage * 5 + medLuggage * 6 + hugeLuggage * 8;
}

//Reservation Page/Booking page
 function setPagePlatz(){
	var newContent = '';//Todo Fahrzeugauswahl
	newContent = newContent + 'Wählen Sie Ihre Plätze aus';
	newContent = newContent +'<br />'
				+'<button type="button" class="smallButton" onclick="setResrvation(1)" style="margin-right:24px" id="1">Platz wählen</button>'
				+'<button type="button" class="smallButton" onclick="setResrvation(2)" style="margin-right:24px" id="2">Platz wählen</button>'
				+'<button type="button" class="smallButton" onclick="setResrvation(3)" style="margin-right:24px" id="3">Platz wählen</button>'
				+'<br />'
				+'<button type="button" class="smallButton" onclick="setResrvation(4)" style="margin-right:24px" id="4">Platz wählen</button>'
				+'<button type="button" class="smallButton" onclick="setResrvation(5)" style="margin-right:24px" id="5">Platz wählen</button>'
				+'<br />'
				+'<button type="button" class="smallButton" onclick="setResrvation(6)" style="margin-right:24px" id="6">Platz wählen</button>'
				+'<button type="button" class="smallButton" onclick="setResrvation(7)" style="margin-right:24px" id="7">Platz wählen</button>'
				+'<button type="button" class="smallButton" onclick="setResrvation(8)" style="margin-right:24px" id="8">Platz wählen</button>';
				
	newContent = newContent +'<br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><hr>'
				+'<button type="button" class="smallButton" onclick="finishBooking()" style="margin-right:24px">Paypal</button>'
				+'<button type="button" class="smallButton" onclick="finishBooking()" style="margin-right:24px">Kreditkarte</button>'
				+'<button type="button" class="smallButton" onclick="finishBooking()" style="margin-right:24px">Überweisung</button>'
				+'<br /><br /><br />'
				+'<button type="button" class="smallButton" onclick="cancelBooking()" style="margin-right:24px">Abbruch</button>'
				+'<button type="button" class="smallButton" onclick="confirmBooking()" style="margin-right:24px" id="9" disabled>Bestätigen</button>';
	document.getElementById("content").innerHTML = newContent;   
  
    setPageNumber(6);
 }
 
 function finishBooking(){
	alert("Bezahlung abgeschlossen.");
	document.getElementById(9).disabled = false;	
 }
 
 function setResrvation(id){
	var e = document.getElementById(id);
	e.innerHTML = "Platz von Ihnen reserviert";
	e.setAttribute('disabled','disabled');
	reservation= reservation +1;
	if(reservation == parseInt(traveller_count)){
		for(i=1;i<9;i++){
			var e = document.getElementById(i);
			e.setAttribute('disabled','disabled');
		}
	}
 }
function confirmBooking(){
	var lastjounal = {start : location_start,end_destenation : location_destination, timestart : time_start, timedestination : time_destination };
	booked_journeys[booked_journeys.length] = lastjounal;
	reservation = 0;
	setPageStart();
}

function cancelBooking(){
	reservation = 0;
	setPageStart();
}

function setTravelTimeDestination(){
	var directionsService = new google.maps.DirectionsService();
	var duration_traveltime;
	
	var date = new Date();
	date.setHours(time_start.substring(0,2), time_start.substring(3,5)); 
	
	
	var waypoints_array= [];
	
	for(var i= 0; i<location_via.length ;i++){
		waypoints_array.push({
			location:location_via[i],
			stopover:true
		});
	}
	
	var request = {
			origin:location_start,
			destination:location_destination,
			waypoints:waypoints_array,
			travelMode: google.maps.TravelMode.DRIVING
		};		
			
		directionsService.route(request, function(result, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				var duration_in_sec = result.routes[0].legs[0].duration.value;
				date.setMinutes( date.getMinutes() + duration_in_sec/60 );
				
				var minutes;
				
				if( date.getMinutes().toString().length == 1){
					minutes = '0' + date.getMinutes().toString();
				}else minutes = date.getMinutes().toString();
				
				time_destination = date.getHours() + ':' + minutes;	
				
				document.getElementById("arrivaltime").value= date.getHours() + ':' + minutes;	
			}else { alert("Directions failed: "+status); }
		});	
}

function setTravelTimeStart(){
	var directionsService = new google.maps.DirectionsService();
	var duration_traveltime;
	
	var date = new Date();
	date.setHours(time_destination.substring(0,2), time_destination.substring(3,5)); 
	
	
	var waypoints_array= [];
	
	for(var i= 0; i<location_via.length ;i++){
		waypoints_array.push({
			location:location_via[i],
			stopover:true
		});
	}
	
	var request = {
			origin:location_start,
			destination:location_destination,
			waypoints:waypoints_array,
			travelMode: google.maps.TravelMode.DRIVING
		};		
			
		directionsService.route(request, function(result, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				var duration_in_sec = result.routes[0].legs[0].duration.value;
				date.setMinutes( date.getMinutes() - duration_in_sec/60 );
				
				var minutes;
				
				if( date.getMinutes().toString().length == 1){
					minutes = '0' + date.getMinutes().toString();
				}else minutes = date.getMinutes().toString();
				
				time_start = date.getHours() + ':' + minutes;;
				
				document.getElementById("starttime").value = date.getHours() + ':' + minutes;
			}else { alert("Directions failed: "+status); }
		});	
		
	
}
                 
//---INPUT-HELPER-FUNCTIONS---//
//todo: need sanity checks for only numerical inputs (anzahl der reisenden usw.)
function setSmallLuggage(doc){
	smallLuggage = doc.value;
}

function setMedLuggage(doc){
	medLuggage = doc.value;
}

function setHugeLuggage(doc){
	hugeLuggage = doc.value;
}

function setBicycleValues(doc){
	bicycleValues = doc.value;
}

function setSkiValues(doc){
	skiValues = doc.value;
}

function setSurfValues(doc){
	surfValues = doc.value;
}

function setSnowValues(doc){
	snowValues = doc.value;
}

function setHaengerValues(doc){
	haengerValues = doc.checked? PRICE_COUPLING : 0;
}

function setDogBoxValues(doc){
	dogBoxValues = doc.value;
}

function setWlanValues(doc){
	wlanValues = doc.checked? PRICE_WIFI : 0;
}

function setDoseValues(doc){
	doseValues = doc.checked? PRICE_SOCKET : 0;
}

function setBarValues(doc){
	barValues = doc.checked;
}

function setFernValues(doc){
	fernValues = doc.checked? PRICE_TV : 0;
}

function setPrivateValues(doc){
	privatValues = doc.checked? PRICE_PRIVATE : 0;
}

function setStartLocation(doc)
{
    location_start=doc.value;
}                

function setDestinationLocation(doc)
{
    location_destination=doc.value;
}

function setChildrenseatValues(doc)
{
    childrenseatValues=doc.value;
}
  
function setViaLocation(doc, index)
{
    while(location_via.length<=index){
        location_via.push("");
    }
    
    location_via[index]=doc.value;  
    
    //add new "via" line
    var empty_line=false;                     
    for(i=0; i<location_via.length && empty_line==false; i++){
        if(location_via[i].length==0){
            empty_line=true;
        }
    }
    if(empty_line==false){  
        setPageNewJourney(doc.id);
    }
}
                        
function setTravellerCount(doc)
{
    traveller_count=doc.value;
} 
   
function setStartTime(doc)
{
    time_start=doc.value;//TODO: sanity check
    if(doc.value.length>0){//block destination time
	     document.getElementById("arrivaltime").readOnly=true;   
	     document.getElementById("arrivaltime").disabled=true;
    }else{ //unblock destination time
	     document.getElementById("arrivaltime").readOnly=false;   
	     document.getElementById("arrivaltime").disabled=false;
    }
	time_destination = '20:00';	
}
    
function setDestinationTime(doc)
{
    time_destination=doc.value;//TODO: sanity check
    if(doc.value.length>0){//block start time
	     document.getElementById("starttime").readOnly=true;  
	     document.getElementById("starttime").disabled=true;  
    }else{ //unblock start time
	     document.getElementById("starttime").readOnly=false;  
	     document.getElementById("starttime").disabled=false;  
    }
	time_start = '16:30';	
} 
   
function setBreakCount(doc)
{
    break_count=doc.value;
} 
   
function setBreakTime(doc)
{
    break_time=doc.value;
}  

function setPageNumber(pageNum)
{
    if(pageNum==-1){//remove number      
      	document.getElementById("footer").innerHTML = "";  
    }else{
        var pContent='<span style="font-size: 14px; font-weight: bold;">'+pageNum+' / '+PAGE_MAX+'</span>';
      	document.getElementById("footer").innerHTML = pContent;  
    }
}  
