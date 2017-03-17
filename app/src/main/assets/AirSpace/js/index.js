var air = null; // data from api json
var city_name = null;
var area_name = null;
var data = null;    // one record we need to update

var mode = localStorage.getItem("mode");
console.log("hi index.js~");
$(function () {
        
    });	
$(document).ready(function(){

    console.log(document.getElementById("device"));
    if(localStorage.getItem("ip") != null ){
        document.getElementById("device").setAttribute("ip",localStorage.getItem("ip"));
    }
    console.log("device ip:",document.getElementById("device").getAttribute("ip"));
    //載入 WF8266R 元件
        GPIO.init();
    getUserLocation(updateLocation);

    getAirInfo(loadAirInfo);
    updateDate();
    document.getElementById("siteName").addEventListener("change",changeTargetData);
    
    if(mode == "period"){
        setTimeout(function(){periodDevice();},2000);
        
    }
    
});

function getUserLocation(method){
     if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(method);	// this method can only operate in secure mode (in some browser)
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function getAirInfo(method){
    const info_api = "http://opendata.epa.gov.tw/ws/Data/REWXQA/?$orderby=County&$skip=0&$top=1000&format=json";
    $.getJSON(info_api+'&callBack=?')  // resolve the "XMLHttpRequest cannot load" problem
        .done(function(data){
//            console.log("@"+data);
            air = data;
            method();
            console.log("getAirData!");
            talkDevice();
        });
}

function loadAirInfo(){
//    for(var i =0;i<air.length;i++){
//        console.log(air[i]);
//    }
//    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@");
    var findResult = false;
    var results = null;
    
    
    results = air.filter(function(item){return item["SiteName"]==area_name;});  // find is have same siteName
    if(results.length > 0)
        findResult = true;
    else {
        results = air.filter(function(item){return item["County"]==city_name
            || (city_name=="台北市"&&item["County"]=="臺北市")
            || (city_name=="台南市"&&item["County"]=="臺南市")
            || (city_name=="台中市"&&item["County"]=="臺中市")
            || (city_name=="台東市"&&item["County"]=="臺東市") ;}); // find is have same cityName, and handle the problem of the funcking chinese word
        if(results.length ==1 ){  // if only one site in city , show that
            findResult = true;
            data = results[0];
        }
        else if(results.length >1 ){ // if many site in city, show the hightest PM2.5 data
            var max = -1;
            var maxIndex = -1;
            for(var i = 0;i<results.length;i++){
                if(max < parseInt(results[i]["PM2.5"]) ){
                    max = parseInt(results[i]["PM2.5"]);
                    maxIndex = i ;
                }
            }
            findResult = true;
            data = results[maxIndex];
        }
    }
//    console.log(data);
    updateAirInfo();
}

function updateAirInfo(){
    document.getElementById("last-update").innerHTML = "更新時間：" + data["PublishTime"].split(" ")[1];
    document.getElementById("pm25-value").innerHTML = data["PM2.5"];
    document.getElementById("air-quality").innerHTML = data["Status"];
    var icon = document.getElementById("qualityIcon");
    var pm25 = data["PM2.5"];
    if(pm25>=0 && pm25<=35)
        icon.setAttribute("src","img/face_1.png");
    if(pm25>=36 && pm25<=53)
        icon.setAttribute("src","img/face_2.png");
    if(pm25>=54 && pm25<=64)
        icon.setAttribute("src","img/face_3.png");
    if(pm25>=65 && pm25<=70)
        icon.setAttribute("src","img/face_4.png");
    if(pm25>70)
        icon.setAttribute("src","img/face_5.png");
    var selector = document.getElementById("siteName");
    var selectedIndex = -1;     // find matched sitename, update the selectedIndex of the select list
    for(var i =0 ;i<selector.length ;i++)
        if(selector[i].text.split(" ")[1] == data["SiteName"])
            selectedIndex = i;
    document.getElementById("siteName").selectedIndex = selectedIndex;
    
    localStorage.setItem("airData",JSON.stringify(data));   // pass the obj to airDetail.html
    
    if(mode=="real" || mode==null){
        talkDevice();
    }
    
}

function changeTargetData(){
    var selector = document.getElementById("siteName");
    var siteName = selector[selector.selectedIndex].text.split(" ")[1];
    data = air.filter(function(item){return item["SiteName"]==siteName})[0];
    console.log(data);
    updateAirInfo();
}

function updateLocation(position){
    alert("yo");
    const lat=position.coords.latitude;
    const lng=position.coords.longitude;
    // degeocode using Google Map API
    const gmap_api = "http://maps.google.com/maps/api/geocode/json?latlng="+lat+","+lng+"&language=zh-TW";
    alert("載入location完畢");
    $.getJSON(gmap_api)
        .done(function(data){
            console.log("get location:",data.status);
            var result = data.results.find(function (element){
                return element.types["0"] == "administrative_area_level_3"; 
            });
            city_name = result.address_components["1"].long_name;
            area_name = result.address_components["0"].long_name;
            var loc = window.document.getElementById("location");
            loc.innerHTML = city_name +" "+ area_name;
        });    
}

function updateDate(){
    var date = new Date();
    var today = document.getElementById("today");
    var days=["日","一","二","三","四","五","六"];
    today.innerHTML=date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate()+" ("+days[date.getDay()]+")";
}

// ask wf8266r to do something
function talkDevice(){
    
    if( mode == "real" || mode == null){
        console.log("real mode action~");
        var pm = data["PM2.5"];
        console.log("pm",pm);
        if(pm>=0 && pm<=35)
            changeColor(0,255,0);
        if(pm>=36 && pm<=53)
            changeColor(128,128,0);
        if(pm>=54 && pm<=64)
            changeColor(255,165,0);
        if(pm>=65 && pm<=70)
            changeColor(255,100,0);
        if(pm>70)
            changeColor(255,0,0);
    }
    
}

function periodDevice(){
    console.log("period mode action");
    var ms = 2000;
    setTimeout(function(){changeColor(0,0,255);},0);
    setTimeout(function(){changeColor(0,0,128);},ms);
    setTimeout(function(){changeColor(0,128,0);},ms*2);
    setTimeout(function(){changeColor(0,255,0);},ms*3);
    setTimeout(function(){changeColor(255,255,0);},ms*4);
    setTimeout(function(){changeColor(255,165,0);},ms*5);
    setTimeout(function(){changeColor(255,0,0);},ms*6);
    // period loop
    setInterval(function(){
        setTimeout(function(){changeColor(0,0,255);},0);
        setTimeout(function(){changeColor(0,0,128);},ms);
        setTimeout(function(){changeColor(0,128,0);},ms*2);
        setTimeout(function(){changeColor(0,255,0);},ms*3);
        setTimeout(function(){changeColor(255,255,0);},ms*4);
        setTimeout(function(){changeColor(255,165,0);},ms*5);
        setTimeout(function(){changeColor(255,0,0);},ms*6);
    },ms*7);
}

function changeColor(r,g,b){
    console.log("changeColor",r,g,b);
    // call API direct
    r = r/255.0*1023;
    g = g/255.0*1023;
    b = b/255.0*1023;
    var ledr = window.document.getElementById("r");
    var ledg = window.document.getElementById("g");
    var ledb = window.document.getElementById("b");
    GPIO.toggle(ledr, r, 'ledR');
    GPIO.toggle(ledg, g, 'ledG');
    GPIO.toggle(ledb, b, 'ledB');
}

function sleep(miliseconds) {
    var currentTime = new Date().getTime();
    while (currentTime + miliseconds >= new Date().getTime()) {
    }
}