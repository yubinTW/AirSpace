var air = null; // data from api json
var city_name = null;
var area_name = null;
var targetData = null;    // one record we need to update

var mode = android.getMode();
console.log("hi index.js~");
//alert("mode= "+mode);

$(document).ready(function(){
//android.showToast("Hi Java~");
    var ip = android.getIP();
    console.log(document.getElementById("device"));
    if(ip != "null" ){
        document.getElementById("device").setAttribute("ip",ip);
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
            android.setAirDataString(JSON.stringify(data));
//            android.showToast(android.getAirDataString());
            method();
            console.log("getAirData!");
            if(mode == "null" || mode==null || mode=="real")
                talkDevice();
        });
}

function loadAirInfo(){
//    for(var i =0;i<air.length;i++){
//        console.log(air[i]);
//    }
//    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@");
    var findResult = false;
    var results = [];
    
    var air = JSON.parse(android.getAirDataString());
    console.log("air: "+air);
//    results = air.filter(function(item){return item["SiteName"]==area_name;});  // find is have same siteName
    for(var i=0;i<air.length;i++){
        if(air[i]["SiteName"] == area_name)
            results.push(air[i]);
    }
//    alert(air.length+" __ "+results.length);
    console.log("results: "+results);
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
            targetData = results[0];
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
            targetData = results[maxIndex];
//            alert(data);
        }
    }
//    alert("target: "+JSON.stringify(targetData));
    android.setTargetDataString(JSON.stringify(targetData));
//    console.log(data);

    // set siteName selector
    var selector = document.getElementById("siteName");
    for(var i =0;i<selector.length;i++)
        if(selector[i].text.split(" ")[1] == targetData["SiteName"]){
            selector.selectedIndex = i;
            console.log("selected: "+i);
            break;
        }

    updateAirInfo();
}

function updateAirInfo(){

    document.getElementById("last-update").innerHTML = "更新時間：" + targetData["PublishTime"].split(" ")[1];
    document.getElementById("pm25-value").innerHTML = targetData["PM2.5"];
    document.getElementById("air-quality").innerHTML = targetData["Status"];
    var icon = document.getElementById("qualityIcon");
    var pm25 = targetData["PM2.5"];
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


    
//    localStorage.setItem("airData",JSON.stringify(data));   // pass the obj to airDetail.html
//    alert("mode: "+mode);
    if(mode=="real" || mode==null || mode == "null"){
        talkDevice();
    }
    
}

function changeTargetData(){
    var selector = document.getElementById("siteName");
    var siteName = selector[selector.selectedIndex].text.split(" ")[1];
    var air = JSON.parse(android.getAirDataString());
    targetData = air.filter(function(item){return item["SiteName"]==siteName})[0];
    android.setTargetDataString(JSON.stringify(targetData));
    console.log("set: "+JSON.stringify(targetData));
//    console.log(data);
    updateAirInfo();
}

function updateLocation(position){
    const lat=position.coords.latitude;
    const lng=position.coords.longitude;
//    alert("location:  "+lat+"  "+lng);
    // degeocode using Google Map API
    const gmap_api = "http://maps.google.com/maps/api/geocode/json?latlng="+lat+","+lng+"&language=zh-TW";
//    alert("載入location完畢");
    $.getJSON(gmap_api)
        .done(function(data){
            console.log("get location:",data.results);
//            alert("get location:"+data.status);
            var result =null;
            // not find find() method
            for(var i=0;i<data.results.length;i++)
                if(data.results[i].types["0"] == "administrative_area_level_3")
                    result = data.results[i];

            city_name = result.address_components["1"].long_name;
            area_name = result.address_components["0"].long_name;
            var loc = window.document.getElementById("location");
            loc.innerHTML = city_name +" "+ area_name;

        });
        changeTargetData();
}

function updateDate(){
    var date = new Date();
    var today = document.getElementById("today");
    var days=["日","一","二","三","四","五","六"];
    today.innerHTML=date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate()+" ("+days[date.getDay()]+")";
}

// ask wf8266r to do something
function talkDevice(){
    
    if( mode == "real" || mode == null || mode == "null"){
        console.log("real mode action~");

        var pm = targetData["PM2.5"];
        console.log("pm: "+pm);
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