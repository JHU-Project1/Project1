var searchBtnEl = document.getElementById("searchBtn");
var errorMessageEl = document.querySelector(".errorMessage");
var showDataEl = document.querySelector(".showData");
var eventListEl = document.getElementById("eventList");

var baseApiUrl = "https://app.ticketmaster.com/";
var base2ApiUrl = "discovery/v2/events.json?";
var apiKey = "&apikey=SPbppXACrSXrFuZja5OQe7e47oQVPVkO";
var pageSize = "&size=5";

var savedTicketInfo = [];
var eventName;
var keyword;

//Get content from local storage for use
function init() {

    if (localStorage.getItem("savedTicketInfo") === null) {
        return;
    } else {
        savedTicketInfo = JSON.parse(localStorage.getItem("savedTicketInfo"));
        return savedTicketInfo;
    }
}

//Turn saved info into city buttons
function makeButtonsFromSaved() {
    for (var i = 0; i < savedTicketInfo.length; i++) {
        var btnx = document.createElement("button");
        btnx.textContent = savedTicketInfo[i].city; //Need to replace city here
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


//Take in city and get weather
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
      });
} 

searchBtnEl.addEventListener("click", getEvent);