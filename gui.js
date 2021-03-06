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
var traveller_count = "";
var traveller_count_kids = 0;
var time_start = ""; 
var time_destination = "";
var break_count = 0;
var break_time = 0;

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
	var newContent = '<p><h3>Letzte Reisen</h3></p>'
	if(booked_journeys.length == 0){
		newContent = newContent + '<label>Keine alten Reisen</label><br /><br />';
	}else{
		for(i=0; i <booked_journeys.length ; i++){
					newContent = newContent +'Reise von '+booked_journeys[i].start+' nach '+booked_journeys[i].end_destenation+'<br>'+
					'Abfahrt um '+booked_journeys[i].timestart+' und Ankunft um '+booked_journeys[i].timedestination+'<br>';
					newContent = newContent + '<button type="button" class="smallButton" onclick="bookOldJouney('+i+')" style="margin-right:24px">Reise erneut buchen</button>'
					newContent = newContent+ '<br /><br />';
		}
		newContent = newContent + '<br /><br />';
	}
	newContent = newContent + '<button type="button" class="smallButton" onclick="setPageStart()" style="margin-right:24px">Zur�ck</button>';
	document.getElementById("content").innerHTML = newContent;
}

function bookOldJouney(count){
	location_start = booked_journeys[count].start;
	location_destination = booked_journeys[count].end_destenation;
	setPageNewJourney();
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
        newContent=newContent + '<p><label>Zwischenstopp</label><input type="text" id="via'+i+'" oninput="setViaLocation(this, '+i+')"';
        if(location_via.length>i && location_via[i].length>0){
            newContent=newContent + ' value="'+location_via[i]+'"';
        }
        newContent=newContent + '></p>';
    }           
                   
    newContent=newContent+ 
                   '<br /><hr>' +
                   '<p><label>Reisende �ber 12 Jahre</label>' +
                   '<input type="text" oninput="setTravellerCount(this)"></p>' + 
				           '<p><label>Reisende unter 12 Jahre</label>' +
                   '<input type="text" oninput="setTravellerCountKids(this)"></p>' + 
                   '<br /><hr>' +
                   '<p><label>Abfahrtszeit</label>' +
                   '<input type="datetime-local" id="starttime" oninput="setStartTime(this)"></p>' +
                   '<p><label>Ankunftszeit</label>' +
                   '<input type="datetime-local" id="arrivaltime" oninput="setDestinationTime(this)"></p>' +
                   '<br /><hr>' +
                   '<p><label>Anzahl der Pausen</label>' +
                   '<input type="text" style="width:5%" oninput="setBreakCount(this)"></p>' +
                   "<p><label>Pausenl�nge<font size='2'> in min</font></label>" +
                   '<input type="text" style="width:5%" oninput="setBreakTime(this)"></p>';
           
                   
    //back/next button
    newContent=newContent+'<br /><br />'+
                          '<button type="button" class="smallButton" onclick="setPageStart()" style="margin-right:24px">Zur�ck</button>'+
                          '<button type="button" class="smallButton" onclick="checkInput('+skipToBill+')" style="margin-left:24px">Weiter</button>';
    
    document.getElementById("content").innerHTML = newContent;
	
    if(focusDocument.length>0){//set focus to previous "via" after adding a new line
      var previousVia=document.getElementById(focusDocument);
      previousVia.focus();
      previousVia.setSelectionRange(previousVia.value.length, previousVia.value.length);
    }   
	
	setPageNumber(1);
}

function checkInput(skipToBill){
	var nextPage = true;
	var error = "";
	if(location_start == ""){
		error += 'Abfahrtsort nicht angegeben\n';
		nextPage = false;
	}
	if(location_destination == ""){
		error += 'Ankunftsort nicht angegeben\n';
		nextPage = false;
	}
	if(traveller_count == ""){
		error += 'Anzahl der Person nicht angegeben\n';
		nextPage = false;		
	}
	if(time_start == ""){
		error += 'Abfahrtszeit nicht angegeben\n';
		nextPage = false;		
	}
	if(time_destination == ""){
		error += 'Ankunftszeit nicht angegeben\n';
		nextPage = false;		
	}
	if(nextPage == true){  
    if(time_start.search("T")!=-1){
        var date = new Date(time_start);
        date.setHours(date.getHours()+(date.getTimezoneOffset()/60));    
        time_start=date.toLocaleString();
    }        
    if(time_destination.search("T")!=-1){  
        var date = new Date(time_destination);
        date.setHours(date.getHours()+(date.getTimezoneOffset()/60));
        time_destination=date.toLocaleString();
    }
		if(skipToBill == true){
			setPageBill();
		}else{
			setPageMap();
		}
	}else{
		alert(error);
	}
}

function setPageMap(){
	
    
	
	var newContent = "";
    
	
	newContent += '<div style="height:400px; width:600px; margin: 0 auto;"><div id=map ></div></div>';
	
	newContent+= '<div id="travel_times" ><label>Abfahrt: ' + time_start + ' Uhr<br /></label><label>' + 'Ankunft: ' + time_destination + ' Uhr </label>' +
					'</div>';
	
	newContent = newContent + '<br /><br />'+
                            '<button type="button" class="smallButton" onclick="setPageNewJourney()" style="margin-right:24px">Zur�ck</button>'+
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

function setPageBaggage(skipToBill=false){
	var newContent = 	"<div><h1>Gep�ck</h1></div>"					
						
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
						
						+"<p><label><font size='5'>Anh�ngerkupplung</font><font size='2'> /Stk. "+PRICE_COUPLING+",-</font></label>"
						+"<input type='checkbox' onchange='setHaengerValues(this)' "+(haengerValues!=0 ? "checked" : "")+">"
						+"</p>"
						
						
						+"<p><label><font size='5'>Hundebox</font><font size='2'> /Stk. "+PRICE_DOGBOX+",- </font><img src='frage.jpg' title='Hundebox wird nicht gestellt' alt='zzzzz' width='20' height='20'></label>"
						+"<input type='number' oninput='setDogBoxValues(this) 'min='0' max='5' value='"+dogBoxValues+"'>"
						+"</p>"																		
						
            //TODO: SETTER
						+"<p><label><font size='5'>Sonstiges</font><font size='2'> /Stk. "+PRICE_MISC+",-</font></label>"
						+"<input type='number' min='0' max='90' value='0' style = 'width : 5%'>"
						+"<input type='number' min='0' max='90' value='0' style = 'width : 5%'>"
						+"<input type='number' min='0' max='90' value='0' style = 'width : 5%'> (Ma�e cm x cm x cm)"
						+"</p>"
            
						
						
						
	
	newContent = newContent + '<br /><br />'+
                          '<button type="button" class="smallButton" onclick="setPageMap()" style="margin-right:24px">Zur�ck</button>'+
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
						
						+"<p><label><font size='5'>Mini-Bar </font><img src='frage.jpg' title='Bezahlung bei Entnahme' alt='zzzzz' width='20' height='20'></label>"
						+"<input type='checkbox' onchange='setBarValues(this)' "+(barValues!=0 ? "checked" : "")+">"					
						
						+"</p>"
						
						+"<p><label><font size='5'>Fernseher</font><font size='2'> "+PRICE_TV+",-</font></label>"
						+"<input type='checkbox' onchange='setFernValues(this)' "+(fernValues!=0 ? "checked" : "")+">"
						+"</p>"
						
						/*+"<p><label><font size='5'>Kindersitze</font><font size='2'> /Stk. 0,-</font></label>"
						+"<input type='number' oninput='setChildrenseatValues(this)' min='0' max='3' value='"+childrenseatValues+"'>"
						+"</p>"*/
						
						+"<p><label><font size='5'>Privatreise <img src='frage.jpg' title='Es werden ihnen keine weiteren Fahrg�ste zugeteilt.' alt='zzzzz' width='20' height='20'></font><font size='2'> "+PRICE_PRIVATE+",-</font></label>"
						+"<input type='checkbox' onchange='setPrivateValues(this)' "+(privatValues!=0 ? "checked" : "")+">"
						+"</p>"	

					
						
	
	newContent = newContent + '<br /><br />'+
                          '<button type="button" class="smallButton" onclick="setPageBaggage()" style="margin-right:24px">Zur�ck</button>'+
                          '<button type="button" class="smallButton" onclick="setPageBill()" style="margin-left:24px">Weiter</button>';
			
	document.getElementById("content").innerHTML = newContent;  
  
    setPageNumber(4);
}




function setPageBill(){
	//content of billpage, overview of all prices
	var newContent="<p><label><h2>Reise�bersicht</h2></label>" +
			'<button type="button" class="smallButton" onclick="setPageNewJourney(\'\', true)" style="float: right">�ndern</button></p>' + 
			"<p><label>Start: " + location_start + "</label></p>" + 
			"<p><label>Ziel: " + location_destination + "</label></p>";

	for(i=0; i<location_via.length ;i++){
		newContent=newContent + "<p><label>via: " + location_via[i] + "</label></p>";
	}

	newContent=newContent + "<p><label>Abfahrtszeit: " + time_start + "</label></p>" + 
		"<p><label>Ankunftszeit: " + time_destination + "</label></p>" + "<br /><hr>";

	//Variables f�r Zusatzoptionen(Gep�ck)
		newContent=newContent + "<p><label>Gep�ck: " + sumLuggage() + " �</label>" +
				'<button type="button" class="smallButton" onclick="setPageBaggage(true)" style="float: right">�ndern</button></p>';
		if(bicycleValues != 0){ newContent=newContent + "<p><label>Fahrr�der: " + bicycleValues*PRICE_BICYCLE + " �</label></p>";}
		if(skiValues != 0) { newContent=newContent + "<p><label>Ski: " + skiValues*PRICE_SKI + " �</label></p>";}
		if(surfValues != 0) { newContent=newContent + "<p><label>Surfboard: " + surfValues*PRICE_SURF + " �</label></p>";}
		if(snowValues != 0) { newContent=newContent + "<p><label>Snowboard: " + snowValues*PRICE_SNOW + " �</label></p>";}
		if(haengerValues != 0) { newContent=newContent + "<p><label>Anh�ngerkupplung: " + haengerValues + " �</label></p>";}
		if(dogBoxValues != 0) {newContent=newContent + "<p><label>Hundebox: " + dogBoxValues*PRICE_DOGBOX + " �</label></p>";}
		newContent=newContent + "<br /><hr>";
	//Ende von Zusatzoptionen

	//Variablen f�r Zusatzfeatures
		newContent=newContent + "<p><label>Minibar: " + (barValues? "Ja" : "Nein") + "</label>" +
				'<button type="button" class="smallButton" onclick="setPageExtra()" style="float: right">�ndern</button></p>';
		if(wlanValues != 0){ newContent=newContent + "<p><label>Wlan: " + wlanValues + " �</label></p>";}
		if(doseValues != 0){ newContent=newContent + "<p><label>Steckdosen: " + doseValues + " �</label></p>";}
		if(fernValues != 0){ newContent=newContent + "<p><label>Fernseher: " + fernValues + " �</label></p>";}
		if(childrenseatValues != 0){ newContent=newContent + "<p><label>Kindersitze: " + childrenseatValues + " Stck. 0 �</label></p>";}
		if(privatValues != 0){ newContent=newContent + "<p><label>Privatreise: " + privatValues + " �</label></p>";}
		newContent=newContent + "<br /><hr>";
	//Ende von Zusatzfeatures

	newContent=newContent+ "<p><label>Kosten: " + 
			sum() +
			//pauschal f�r jede Reise (150+Gep�ckvalues+Featurevalues) + //Rechnung 
			" �</label></p>" + "<br /><hr>";

	newContent=newContent+'<br /><br />'+
                          '<button type="button" class="smallButton" onclick="setPageExtra()" style="margin-right:24px">Zur�ck</button>'+
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
	newContent = newContent + 'W�hlen Sie Ihre Pl�tze aus';
	newContent = newContent +'<br />'
				+'<button type="button" class="smallButton" onclick="setResrvation(1)" style="margin-right:24px" id="1">Platz w�hlen</button>'
				+'<button type="button" class="smallButton" onclick="setResrvation(2)" style="margin-right:24px" id="2">Platz w�hlen</button>'
				+'<button type="button" class="smallButton" onclick="setResrvation(3)" style="margin-right:24px" id="3">Platz w�hlen</button>'
				+'<br />'
				+'<button type="button" class="smallButton" onclick="setResrvation(4)" style="margin-right:24px" id="4">Platz w�hlen</button>'
				+'<button type="button" class="smallButton" onclick="setResrvation(5)" style="margin-right:24px" id="5">Platz w�hlen</button>'
				+'<br />'
				+'<button type="button" class="smallButton" onclick="setResrvation(6)" style="margin-right:24px" id="6">Platz w�hlen</button>'
				+'<button type="button" class="smallButton" onclick="setResrvation(7)" style="margin-right:24px" id="7">Platz w�hlen</button>'
				+'<button type="button" class="smallButton" onclick="setResrvation(8)" style="margin-right:24px" id="8">Platz w�hlen</button>';
				
	newContent = newContent +'<br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><hr>'
				+'<label>Bezahlmethode w�hlen:</label><br>'
				+'<button type="button" class="smallButton" onclick="finishBooking()" style="margin-right:24px">Paypal</button>'
				+'<button type="button" class="smallButton" onclick="finishBooking()" style="margin-right:24px">Kreditkarte</button>'
				+'<button type="button" class="smallButton" onclick="finishBooking()" style="margin-right:24px">�berweisung</button>'
				+'<br /><br /><br />'
				+'<button type="button" class="smallButton" onclick="cancelBooking()" style="margin-right:24px">Abbruch</button>'
				+'<button type="button" class="smallButton" onclick="confirmBooking()" style="margin-right:24px" id="9" disabled>Best�tigen</button>';
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
	if(reservation == parseInt(traveller_count)+ parseInt(traveller_count_kids)){
		for(i=1;i<9;i++){
			var e = document.getElementById(i);
			e.setAttribute('disabled','disabled');
		}
	}
 }
function confirmBooking(){
	var lastjounal = {start : location_start,end_destenation : location_destination, timestart : time_start, timedestination : time_destination};
	booked_journeys[booked_journeys.length] = lastjounal;
	reservation = 0;
	setPageStart();
}

function cancelBooking(){
	reservation = 0;
	setPageStart();
}

function setTravelTimeDestination(doc){
	var directionsService = new google.maps.DirectionsService();
	var duration_traveltime;       
  var nonDatefield=true;
	
	var date = new Date();
  if((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0 || (!!window.chrome && !!window.chrome.webstore)){
     date=new Date(doc.value);   
     nonDatefield=false;
  }else{//non-chrome & opera: just hour:minutes
	   date.setHours(time_start.substring(0,2), time_start.substring(3,5));
  }
	
	var waypoints_array= [];
	
	for(var i= 0; i<location_via.length ;i++){
    if(location_via[i].length>0){
  		waypoints_array.push({
  			location:location_via[i],
  			stopover:true
  		});
    }
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
        date.setTime(date.getTime()+duration_in_sec*1000);
				/*date.setMinutes( date.getMinutes() + duration_in_sec/60 );
				
				var minutes;
				
				if( date.getMinutes().toString().length == 1){
					minutes = '0' + date.getMinutes().toString();
				}else minutes = date.getMinutes().toString();
				
				time_destination = date.getHours() + ':' + minutes;*/
        date.setHours(date.getHours()+(date.getTimezoneOffset()/60));
                                                                 
        time_destination=date.toLocaleString();	
				if(nonDatefield==false){
            document.getElementById("arrivaltime").value = convertToDatefield(time_destination);
        }else{
				    document.getElementById("arrivaltime").value = time_destination;
        }
        	
			}else { alert("Directions failed: "+status); }
		});	
}

function setTravelTimeStart(doc){     
	var directionsService = new google.maps.DirectionsService();
	var duration_traveltime;
  var nonDatefield=true;
	
	var date = new Date();          
  if((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0 || (!!window.chrome && !!window.chrome.webstore)){
     date=new Date(doc.value);
     nonDatefield=false;
  }else{//non-chrome & opera: just hour:minutes
	   date.setHours(time_destination.substring(0,2), time_destination.substring(3,5)); 
  }
	
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
        date.setTime(date.getTime()-duration_in_sec*1000);
				/*date.setMinutes( date.getMinutes() - duration_in_sec/60 );
				
				var minutes;
				
				if( date.getMinutes().toString().length == 1){
					minutes = '0' + date.getMinutes().toString();
				}else minutes = date.getMinutes().toString();
				
				time_start = date.getHours() + ':' + minutes;*/     
        date.setHours(date.getHours()+(date.getTimezoneOffset()/60));
                                                    
        time_start=date.toLocaleString();	
				if(nonDatefield==false){
            document.getElementById("starttime").value = convertToDatefield(time_start);
        }else{
				    document.getElementById("starttime").value = time_start;
        }
			}else { alert("Directions failed: "+status); }
		});	
		
	
}

function convertToDatefield(date)
{
    date = new Date(date);
    return (date.getFullYear()+"-"+(date.getMonth()+1<10?"0":"")+(date.getMonth()+1)+"-"+(date.getDate()<10?"0":"")+date.getDate()+"T"+(date.getHours()<10?"0":"")+date.getHours()+":"+(date.getMinutes()<10?"0":"")+date.getMinutes());
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

function setTravellerCountKids(doc)
{
    traveller_count_kids=doc.value;
	childrenseatValues = doc.value;
}  
   
function setStartTime(doc)
{     
    time_start=doc.value;
    if(doc.value.length>0){//block destination time
	     document.getElementById("arrivaltime").readOnly=true;   
	     document.getElementById("arrivaltime").disabled=true;
    }else{ //unblock destination time
	     document.getElementById("arrivaltime").readOnly=false;   
	     document.getElementById("arrivaltime").disabled=false;
    }
    setTravelTimeDestination(doc);
}
    
function setDestinationTime(doc)
{
    time_destination=doc.value;
    if(doc.value.length>0){//block start time
	     document.getElementById("starttime").readOnly=true;  
	     document.getElementById("starttime").disabled=true;  
    }else{ //unblock start time
	     document.getElementById("starttime").readOnly=false;  
	     document.getElementById("starttime").disabled=false;  
    }
    setTravelTimeStart(doc);     
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
