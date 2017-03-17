$(document).ready(function(){
    
    updateInfo();
    
});

function updateInfo(){
    var data = JSON.parse(localStorage.getItem("airData"));
    console.log(data);
    document.getElementById("County").innerHTML = data["County"];
    document.getElementById("SiteName").innerHTML = data["SiteName"];
    document.getElementById("PSI").innerHTML = data["PSI"];
    document.getElementById("MajorPollutant").innerHTML = data["MajorPollutant"];
    document.getElementById("Status").innerHTML = data["Status"];
    document.getElementById("SO2").innerHTML = data["SO2"];
    document.getElementById("CO").innerHTML = data["CO"];
    document.getElementById("O3").innerHTML = data["O3"];
    document.getElementById("PM10").innerHTML = data["PM10"];
    document.getElementById("PM2.5").innerHTML = data["PM2.5"];
    document.getElementById("NO2").innerHTML = data["NO2"];
    document.getElementById("WindSpeed").innerHTML = data["WindSpeed"];
    document.getElementById("WindDirec").innerHTML = data["WindDirec"];
    document.getElementById("PublishTime").innerHTML = data["PublishTime"];
}