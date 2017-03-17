
function getUserLocation(method){
     if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(method);	// this method can only operate in secure mode (in some browser)
        
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function showLocation(position){
    console.log("Latitude: " + position.coords.latitude);
    console.log("Longitude: " + position.coords.longitude);
}


function getUserCity(position){
    const lat=position.coords.latitude;
    const lng=position.coords.longitude;
    // degeocode using Google Map API
    const gmap_api = "http://maps.google.com/maps/api/geocode/json?latlng="+lat+","+lng+"&language=zh-TW";
    
    $.getJSON(gmap_api)
        .done(function(data){
            console.log(data.status);
//            console.log(data.results);
            var result = data.results.find(function (element){
                return element.types["0"] == "administrative_area_level_3"; 
            });
            var city_name = result.address_components["1"].long_name;
            var area_name = result.address_components["0"].long_name;
            var pos = window.document.getElementById("position");
            pos.innerHTML = city_name +" "+ area_name;

        });
    
}

function loadAirInfo(){
    const info_api = "http://opendata.epa.gov.tw/ws/Data/REWXQA/?$orderby=County&$skip=0&$top=1000&format=json";
    $.getJSON(info_api+'&callBack=?')  // resolve the "XMLHttpRequest cannot load" problem
        .done(function(data){
            console.log("num =",data.length);
            for(var i =0;i<data.length;i++){
//                console.log(data[i]);
                console.log("<option>"+data[i]['County'],data[i]['SiteName']+"</option>");
            }
        console.log("=================");
            var result = data.filter(function(item){return item['County']=="新竹縣"}); 
//            console.log(result);
            for(var i =0;i<result.length;i++){
                console.log(result[i].County,result[i].SiteName);
            }
        });
}

function do_peroid(){
    var i = 0;
    setInterval(function(){
        var p = window.document.getElementById("counter");
        p.innerHTML = i;
        i++;
    },500);
}

//getUserLocation(showLocation);
//getUserLocation(getUserCity);
loadAirInfo();
//do_peroid();