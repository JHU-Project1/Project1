var searchBtnEl = document.getElementById("searchBtn");
var errorMessageEl = document.querySelector(".errorMessage");
var showDataEl = document.querySelector(".showData");
var eventListEl = document.getElementById("eventList");

var baseApiUrl = "https://app.ticketmaster.com/";
var base2ApiUrl = "discovery/v2/events/";
var apiKey = "&apikey=SPbppXACrSXrFuZja5OQe7e47oQVPVkO";
var pageSize = "&5";

var savedTicketInfo = [];

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


//Take in city and get weather
function search(event) {
    //event.preventDefault();
    var keyword = "Coldplay";
    var specURL = baseApiUrl + base2ApiUrl + "?" + keyword + pageSize + apiKey;

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

search();

//searchBtnEl.addEventListener("click", search);