var searchBtnEl = document.getElementById("searchBtn");
var baseApiUrl = "https://www.loc.gov/";

//Take in city and get weather
function search(event) {
    event.preventDefault();
    
    fetch(baseApiUrl + type + "/" + "?q=" + text + specApiUrl, {

    })
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data);
      });
} 

searchBtnEl.addEventListener("click", search);