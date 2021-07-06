var searchBtnEl = document.getElementById("searchBtn");
var errorMessageEl = document.querySelector(".errorMessage");
var showDataEl = document.querySelector(".showData");
var eventListEl = document.getElementById("eventList");

var resultParentEl = document.getElementById("searchResultsParent");


var baseApiUrl = "https://app.ticketmaster.com/";
var base2ApiUrl = "discovery/v2/events.json?";
var apiKey = "&apikey=SPbppXACrSXrFuZja5OQe7e47oQVPVkO";
var pageSize = "&size=5";

var savedTicketInfo = [];
var newEventInfo = [];
var eventName;
var keyword;

//Get content from local storage for use
function init() {

    if (localStorage.getItem("savedTicketInfo") === null) {
        return;
    } else {
        savedTicketInfo = JSON.parse(localStorage.getItem("savedTicketInfo"));
        makeButtonsFromSaved(savedTicketInfo)
        return savedTicketInfo;
    }

}

//Turn saved info into event buttons
function makeButtonsFromSaved(savedTicketInfo) {
    for (var i = 0; i < savedTicketInfo.length; i++) {
        var btnx = document.createElement("button");
        btnx.textContent = savedTicketInfo[i].eventName; //Need to replace city here
        btnx.classList.add("saveBtn", "event"); //Add appropriate classes here and when they are first created in current session
        btnx.setAttribute("id", savedTicketInfo[i].recordID);
        eventListEl.appendChild(btnx);
    }
}

//Capture the event name from search button
function getEvent(event) {
    event.preventDefault();
    eventName = searchText.value.toUpperCase();
    search();
}

//Use the event name from previously generated buttons
function previousEvent(event) {
    event.preventDefault();
    eventName = event.target.textContent;
    search();
}


//Take in event and get API response
function search(event) {
    keyword = "keyword=" + eventName;
    //Query the API for an event based upon keyword and pagesize
    var specURL = baseApiUrl + base2ApiUrl + keyword + pageSize + apiKey;

    fetch(specURL, {
        dataType: "json"
    })
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data);
        playWithData(data);
      });
} 

function playWithData(data) {
    //If a bad search was performed, no data will be returned.
    if (!data.hasOwnProperty("_embedded")) {
        searchText.value = "";
        errorMessageEl.setAttribute("style", "display: block"); //Would like to use show class here and remove hide class
        return;
    }

    var recordID = Math.floor(Math.random() * 1000000);
    //Left as an object for potential future use.
    newEventInfo = { 
        eventName,
        recordID
    }

    //  Save to local storage.  Ensure that search hasn't already been done before and then save.
    var found = savedTicketInfo.findIndex(x => x.eventName === newEventInfo.eventName);
    if (found === -1) {
        //Only remember the last 3 searches when page refreshed and remove old buttons
        if (savedTicketInfo.length > 2) {
            var removeButtonID = savedTicketInfo[0].recordID;
            console.log(removeButtonID);
            document.getElementById(removeButtonID).remove();
            savedTicketInfo.shift();
        }
        
        savedTicketInfo.push(newEventInfo);
        localStorage.setItem("savedTicketInfo", JSON.stringify(savedTicketInfo));
        var btn = document.createElement("button");
        btn.textContent = newEventInfo.eventName;
        console.log(newEventInfo.recordID);
        btn.setAttribute("id", newEventInfo.recordID);
        btn.classList.add("saveBtn", "event"); //Add whatever classes you want for style
        eventListEl.appendChild(btn);
    }

    for (var i=0; i < 4; i++) {
        if (document.getElementById("imageParentResult"+i)) {
            document.getElementById("imageParentResult"+i).innerHTML = "";
        };
        if (document.getElementById("contentParentResult"+i)) {
            document.getElementById("contentParentResult"+i).innerHTML = "";
        };
        if (document.getElementById("seatMapParentResult"+i)) {
            document.getElementById("seatMapParentResult"+i).innerHTML = "";
        };
    
    }

    //Loop through our events and pull out useful content for display.  Display it to the screen.
    for (var i=0; i < data._embedded.events.length; i++) {

        //resultListEli = document.getElementById("result"+i);
        imageParentEl = document.getElementById("imageParentResult"+i);
        contentParentEl = document.getElementById("contentParentResult"+i);
        seatMapParentEl = document.getElementById("seatMapParentResult"+i);

        var baseData = data._embedded.events[i];
        var baseData2 = baseData._embedded.venues[0];
        
        var eventVenue = baseData2.name;

        //If a venue exists then post results on screen for the event (could have 0-5 results)
        if (eventVenue) {
            //Add a statement here to unhide resultListEli (this should then only display content for 0-5 results returned)
            

            if (baseData.hasOwnProperty("images")){
                var eventImage = baseData.images[0].url;

                var eventImageEl = document.createElement("img");
                eventImageEl.src = eventImage;
                eventImageEl.setAttribute("id", "result"+i+"ImageLink");
                imageParentEl.appendChild(eventImageEl);
            }

            var eventTitle = baseData.name;
            var eventTitleEl = document.createElement("h3");
            eventTitleEl.setAttribute("id", "result"+i+"eventTitle");
            eventTitleEl.textContent = "Event: " + eventTitle + " ";
            contentParentEl.appendChild(eventTitleEl);


            var eventVenueEl = document.createElement("p");
            eventVenueEl.setAttribute("id", "result"+i+"Venue");
            eventVenueEl.textContent = "Venue: " + eventVenue + " ";
            contentParentEl.appendChild(eventVenueEl);
    
            if (baseData2.hasOwnProperty("city")){
                var eventCity = baseData2.city.name;

                var eventCityEl = document.createElement("span");
                eventCityEl.setAttribute("id", "result"+i+"City");
                eventCityEl.textContent = "Location: " + eventCity + ", ";
                eventVenueEl.appendChild(eventCityEl);
            }
            if (baseData2.hasOwnProperty("state")){
                var eventState = baseData2.state.stateCode;

                var eventStateEl = document.createElement("span");
                eventStateEl.setAttribute("id", "result"+i+"State");
                eventStateEl.textContent = eventState + " ";
                eventVenueEl.appendChild(eventStateEl);
            }
    
            if (baseData.dates.hasOwnProperty("start")){
                var startDate = baseData.dates.start.localDate;
                var localTime = baseData.dates.start.localTime;
                startDate = moment(startDate, "YYYY-MM-DD").format("MM/DD/YYYY");
                localTime = moment(localTime, "HH-mm-ss").format("h:mm A");

                var eventStartDateEl = document.createElement("span");
                eventStartDateEl.setAttribute("id", "result"+i+"startDate");
                eventStartDateEl.textContent = "Day/Time: " + startDate + " " + localTime;
                eventVenueEl.appendChild(eventStartDateEl);
            }
    
            var url = baseData.url;
            var eventUrlEl = document.createElement("span");
            eventUrlEl.setAttribute("id", "result"+i+"Url");
            eventUrlEl.innerHTML = "<a href=" + url + "> Buy Tickets </a></span>";
            eventVenueEl.appendChild(eventUrlEl);
    
            if (baseData.hasOwnProperty("priceRanges")){
                var priceRangeMin = baseData.priceRanges[0].min;
                var priceRangeMax = baseData.priceRanges[0].max;

                var eventPriceRangeEl = document.createElement("span");
                eventPriceRangeEl.setAttribute("id", "result"+i+"priceRange");
                eventPriceRangeEl.textContent = "Min Cost: $" + priceRangeMin + " Max Cost: $" + priceRangeMax + " ";
                eventVenueEl.appendChild(eventPriceRangeEl);
            }

            if (baseData.hasOwnProperty("seatmap")){
                var seatMap = baseData.seatmap.staticUrl;

                var seatMapEl = document.createElement("img");
                seatMapEl.src = seatMap;
                seatMapEl.setAttribute("id", "result"+i+"seatMap");
                seatMapParentEl.appendChild(seatMapEl);
            }
    
            var tempObject = {eventName, eventVenue, eventCity, eventState, startDate, localTime, eventImage, seatMap, url, priceRangeMin, priceRangeMax};
            console.log("Item: " + i)
            console.log(tempObject);
    
        }
        
    }
    //Empty the search window
    searchText.value = "";
}


init();
searchBtnEl.addEventListener("click", getEvent);
eventListEl.addEventListener("click", previousEvent);