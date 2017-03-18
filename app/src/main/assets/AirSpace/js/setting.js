$(document).ready(function(){
    
    //載入 WF8266R 元件
    GPIO.init();
    console.log(document.getElementById("device").getAttribute("ip"));
//    console.log(localStorage.getItem("ip"));
    var ip = android.getIP();
    console.log("ip: "+ip);
    if(ip != "null" && ip != null){
        document.getElementById("device").setAttribute("ip",ip);
        console.log("after: "+document.getElementById("device").getAttribute("ip"));
    }
    
    // check what mode now is, and update the element status
    var mode =android.getMode();
    console.log("mode="+mode);
    if(mode=="null" || mode=="real"){
        document.getElementById("real").checked = true;
    }
    else if(mode=="period"){
        document.getElementById("period").checked = true;
    }else if(mode=="single"){
        
    }
    
    // add listener, if on change another checked status
    $("#real").on("change",function(){
        console.log(this.value,this.checked);
        if(this.checked==true){
            document.getElementById("period").checked = false;
//            localStorage.setItem("mode","real");
            android.setMode("real");
        }
    });
    $("#period").on("change",function(){
        if(this.checked==true){
            document.getElementById("real").checked = false;
//            localStorage.setItem("mode","period");
        android.setMode("period");
        }
    });
    
    $(".item").on("click",function(){
        console.log("yo",this.id);
        document.getElementById("period").checked = false;
        document.getElementById("real").checked = false;
//        localStorage.setItem("mode","single");

        if(this.id == "blue")
            changeColor(0,0,128);
        if(this.id == "darkblue")
            changeColor(0,0,255);
        if(this.id == "red")
            changeColor(255,0,0);
        if(this.id == "orange")
            changeColor(255,165,0);
        if(this.id == "yellow")
            changeColor(255,255,0);
        if(this.id == "green")
            changeColor(0,128,0);
        if(this.id == "darkgreen")
            changeColor(0,255,0);
        if(this.id == "purple")
            changeColor(255,0,255);
        android.setMode("single");
    });
    
    $("#setIP").on("click",function(){
        var input = prompt("輸入WF8266R的IP：");
//        localStorage.setItem("ip",input);
        android.setIP(input);
        ip = input;
        document.getElementById("device").setAttribute("ip",ip);
    });
    
    
});

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