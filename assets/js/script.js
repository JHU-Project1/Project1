var searchBtnEl = document.getElementById("searchBtn");
var errorMessageEl = document.querySelector(".errorMessage");
var showDataEl = document.querySelector(".showData");
var eventListEl = document.getElementById("eventList");

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
        btnx.classList.add("saveBtn"); //Add appropriate classes here
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

    //Save info to local storage.  Left this as an object for potential later use.
    newEventInfo = { 
        eventName,
    }

    var found = savedTicketInfo.findIndex(x => x.eventName === newEventInfo.eventName);
    if (found === -1) {
        savedTicketInfo.push(newEventInfo);
        localStorage.setItem("savedTicketInfo", JSON.stringify(savedTicketInfo));
        var btn = document.createElement("button");
        btn.textContent = eventName;
        btn.classList.add("saveBtn", "event"); //Add whatever classes you want for style
        eventListEl.appendChild(btn);
    }

    //Loop through our events and pull out useful content for display
    for (var i=0; i < data._embedded.events.length; i++) {
        var baseData = data._embedded.events[i];
        var baseData2 = baseData._embedded.venues[0];
        
        var eventVenue = baseData2.name;

        if (baseData2.hasOwnProperty("city")){
            var eventCity = baseData2.city.name;
        }
        if (baseData2.hasOwnProperty("state")){
            var eventState = baseData2.state.stateCode;
        }

        if (baseData.hasOwnProperty("start")){
            var startDate = baseData.dates.start.localDate;
            var localTime = baseData.dates.start.localTime;
        }

        if (baseData.hasOwnProperty("images")){
            var eventImage = baseData.images[0].url;
        }
        if (baseData.hasOwnProperty("seatmap")){
            var seatMap = baseData.seatmap.staticUrl;
        }

        var url = baseData.url;

        if (baseData.hasOwnProperty("priceRanges")){
            var priceRangeMin = baseData.priceRanges[0].min;
            var priceRangeMax = baseData.priceRanges[0].max;
        }

        var tempObject = {eventName, eventVenue, eventCity, eventState, startDate, localTime, eventImage, seatMap, url, priceRangeMin, priceRangeMax};

        console.log(tempObject);

    }
    //Empty the search window
    searchText.value = "";
}


init();
searchBtnEl.addEventListener("click", getEvent);
eventListEl.addEventListener("click", previousEvent);