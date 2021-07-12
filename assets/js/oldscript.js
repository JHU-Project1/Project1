var searchBtnEl = document.getElementById("searchBtn");
var searchTxtEl = document.getElementById("searchText");
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
    /*Back button functionality
        //var eventForm = document.querySelector("#myForm");
        //console.log(eventForm);
        //eventForm.addEventListener("submit", searchEvent);
        //getSearchFromURL();
    */

    if (localStorage.getItem("savedTicketInfo")) {
        savedTicketInfo = JSON.parse(localStorage.getItem("savedTicketInfo"));
        makeButtonsFromSaved(savedTicketInfo)
    }
}

//Turn saved info into event buttons
function makeButtonsFromSaved(savedTicketInfo) {
    for (var i = 0; i < savedTicketInfo.length; i++) {
        var btnx = document.createElement("button");
        btnx.textContent = savedTicketInfo[i].eventName;
        btnx.classList.add("saveBtn", "event"); 
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
function search() {
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
        errorMessageEl.setAttribute("style", "display: block");
        return;
    }
    else {
            errorMessageEl.setAttribute("style", "display: none");
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
            document.getElementById(removeButtonID).remove();
            savedTicketInfo.shift();
        }
        
        savedTicketInfo.push(newEventInfo);
        localStorage.setItem("savedTicketInfo", JSON.stringify(savedTicketInfo));
        var btn = document.createElement("button");
        btn.textContent = newEventInfo.eventName;
        btn.setAttribute("id", newEventInfo.recordID);
        btn.classList.add("saveBtn", "event");
        eventListEl.appendChild(btn);
    }

    //Clear parent elements to prevent old results from showing in the results list
    for (var i=0; i < 5; i++) {
        if (document.getElementById("imageParentResult"+i)) {
            document.getElementById("imageParentResult"+i).innerHTML = "";
        };
        if (document.getElementById("contentParentResult"+i)) {
            document.getElementById("contentParentResult"+i).innerHTML = "";
        };
        if (document.getElementById("seatMapParentResult"+i)) {
            document.getElementById("seatMapParentResult"+i).innerHTML = "";
        };
        if (document.getElementById("brewRLParentResult"+i)) {
            document.getElementById("brewRLParentResult"+i).innerHTML = "";
        };
        if (document.getElementById("brewMapParentResult"+i)) {
            document.getElementById("brewMapParentResult"+i).innerHTML = "";
        };
    }

    //Loop through our events and pull out useful content for display.  Display it to the screen.
    for (var i=0; i < data._embedded.events.length; i++) {

        let imageParentEl = document.getElementById("imageParentResult"+i);
        let contentParentEl = document.getElementById("contentParentResult"+i);
        let brewRLParentEl = document.getElementById("brewRLParentResult"+i);
        let seatMapParentEl = document.getElementById("seatMapParentResult"+i);
        let brewMapParentEl = document.getElementById("brewMapParentResult"+i);

        resultEl = document.getElementById('result'+ i);

        var baseData = data._embedded.events[i];
        var eventTitle = baseData.name;


        //If a venue exists then pull more data and post results on screen for the event (could have 0-5 results)
        if (eventTitle) {
            
            if (baseData.hasOwnProperty("_embedded")){
                var baseData2 = baseData._embedded.venues[0];
            }

            //Event image
            if (baseData.hasOwnProperty("images")){
                var eventImage = baseData.images[0].url;

                var eventImageEl = document.createElement("img");
                eventImageEl.src = eventImage;
                eventImageEl.setAttribute("id", "result"+i+"ImageLink");
                imageParentEl.appendChild(eventImageEl);
            }

            //Event Title
            var eventTitleEl = document.createElement("h3");
            eventTitleEl.setAttribute("id", "result"+i+"eventTitle");
            eventTitleEl.textContent = "Event: " + eventTitle + " ";
            contentParentEl.appendChild(eventTitleEl);

            var eventVenueEl = document.createElement("p");
            if (baseData.hasOwnProperty("_embedded")){
                //Venue details
                if (baseData2.hasOwnProperty("name")){
                    var eventVenue = baseData2.name;
                    eventVenueEl.setAttribute("id", "result"+i+"Venue");
                    eventVenueEl.textContent = "Venue: " + eventVenue + " ";
                    contentParentEl.appendChild(eventVenueEl);
                }
                if (baseData2.hasOwnProperty("city")){
                    var eventCity = baseData2.city.name;

                    var eventCityEl = document.createElement("span");
                    eventCityEl.setAttribute("id", "result"+i+"City");
                    eventCityEl.textContent = "Location: " + eventCity + ", ";
                    eventVenueEl.appendChild(eventCityEl);
                }
                if (baseData2.hasOwnProperty("state")){
                    var eventState = baseData2.state.stateCode;

                    eventCityEl.textContent = "Location: " + eventCity + ", " + eventState + " ";
                    eventVenueEl.appendChild(eventCityEl);
                }
                if (baseData2.hasOwnProperty("location")){
                    //Get lat/lon and set a url for brewery results
                    var eventLat = baseData2.location.latitude;
                    var eventLon = baseData2.location.longitude;
                    var brewRL = "https://api.openbrewerydb.org/breweries?per_page=3&page=1&by_dist="+eventLat+","+eventLon;
                }            
            }
    
            
            if (baseData.dates.hasOwnProperty("start")){
                //Start Date and Time
                if (baseData.dates.start.hasOwnProperty("localDate")){
                    var startDate = baseData.dates.start.localDate;
                    startDate = moment(startDate, "YYYY-MM-DD").format("MM/DD/YYYY");
                } else {
                    localDate = "Date Not specified";
                }
                
                if (baseData.dates.start.hasOwnProperty("localTime")){
                var localTime = baseData.dates.start.localTime;
                localTime = moment(localTime, "HH-mm-ss").format("h:mm A");
                } else {
                    localTime = "Time Not specified";
                }

                var eventStartDateEl = document.createElement("span");
                eventStartDateEl.setAttribute("id", "result"+i+"startDate");
                eventStartDateEl.textContent = "Day/Time: " + startDate + " " + localTime;
                eventVenueEl.appendChild(eventStartDateEl);
            }
    
            //Buy Tickets Link
            var url = baseData.url;
            var eventUrlEl = document.createElement("div");
            eventUrlEl.setAttribute("id", "result"+i+"Url");
                eventUrlEl.innerHTML = "<a href=" + url + "><button> Buy Tickets </button></a>";
                eventUrlEl.classList.add("newBtn");
                contentParentEl.appendChild(eventUrlEl);
    
            //Cost
            if (baseData.hasOwnProperty("priceRanges")){
                var priceRangeMin = baseData.priceRanges[0].min;
                var priceRangeMax = baseData.priceRanges[0].max;

                var eventPriceRangeEl = document.createElement("span");
                eventPriceRangeEl.setAttribute("id", "result"+i+"priceRange");
                eventPriceRangeEl.textContent = "Min Cost: $" + priceRangeMin + " Max Cost: $" + priceRangeMax + " ";
                eventVenueEl.appendChild(eventPriceRangeEl);
            }

            //Seat Map
            if (baseData.hasOwnProperty("seatmap")){
                var seatMap = baseData.seatmap.staticUrl;

                var seatMapEl = document.createElement("img");
                seatMapEl.src = seatMap;
                seatMapEl.setAttribute("id", "result"+i+"seatMap");
                seatMapParentEl.appendChild(seatMapEl);
            }

            //Get brewery results from venue lat/lon and generated url
            if (brewRL) {
                fetch(brewRL, {
    
                })
                .then(function (response) {
                    return response.json();
                })
                .then(function (brew) {
                    var brewRLChild = [];
                    var latLon = [];
                    //Get data of the 3 brewery results for each event result
                    for (var i=0; i < 3; i++) {
                        //Check to see if there is a website.  Not all breweries have websites.
                        if (brew[i].website_url === null) {
                            brewRLChild.push("<button class='disabled' disabled>" + brew[i].name + " (no website)</button><br>");
                        } else {
                            brewRLChild.push("<a href=" + brew[i].website_url + " class='newBtn'>" + brew[i].name + "</a><br>");
                        }
                        latLon.push(brew[i].latitude + "," + brew[i].longitude + "|");
                    }
                    brewRLParentEl.innerHTML = brewRLChild[0] + brewRLChild[1] + brewRLChild[2];
 
                    //Plot the brewery results on a map using the lat/lon from the brewery API call
                    var latLonJoined = latLon.join("");

                    var mapURL = "https://maps.googleapis.com/maps/api/staticmap?&size=300x300&markers=color:blue|label:B|" + latLonJoined + "&key=AIzaSyAIWx_G_5naZts10KidHOhvxj9mzJHP_Jw";
                    
                    var brewMapEl = document.createElement("img");
                    
                    brewMapEl.src = mapURL;
                    brewMapEl.setAttribute("id", "result"+i+"brewMap");
                    
                    brewMapParentEl.appendChild(brewMapEl);
                });
            }
        } 
            resultEl.classList.remove("hide");
    }
            
    //Show Search Results Div
        searchResultsParent.classList.remove("hide");
        //Hide results that are not returned
        for (var i=data._embedded.events.length; i < 5; i++) {
            if (document.getElementById("result"+i)) {
                var tempResult = document.getElementById("result"+i);
                tempResult.classList.add("hide");
            }
        }
        
    //Empty the search window
    searchText.value = "";
}

/*
function getSearchFromURL() {
    // get search params
    var searchQuery = new URLSearchParams(window.location.search)
    // check if an event is in the URL
    if (searchQuery.has("event")) {
        console.log("search query has an event");
      // get event name and show it on screen
      eventName = searchQuery.get("event")
      //showEventNameOnScreen(eventName)
      search()
    } else {
        console.log("I'm here");

      //showEventNameOnScreen("")
    }
  }

  function searchEvent(event) {
    console.log("In searchEvent function");
    event.preventDefault();
    // get value of input
    var eventNameTemp = searchTxtEl.value
    // save to url
    var pageUrl = '?event=' + window.encodeURIComponent(eventNameTemp);
    window.history.pushState('', '', pageUrl);
    // update screen
    //showEventNameOnScreen(eventName);  
  }
  //function showEventNameOnScreen(eventName) {
  //  document.querySelector("#searchedEvent").textContent = eventName
  //}
  // listen for state on back
  window.addEventListener("popstate", function (event) {
    event.preventDefault();
    getSearchFromURL()
  });
  */

init();
searchBtnEl.addEventListener("click", getEvent);

searchTxtEl.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        searchBtnEl.click();
    }
});

eventListEl.addEventListener("click", previousEvent);
//brewMapParentEl.addEventListener("click", showBrewMap);
