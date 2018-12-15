
//test file
var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var LED = new Gpio(4, 'out'); //use GPIO pin 4 as output
var pushButton = new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled
var tgals = 0;



http.listen(8080); //listen to port 8080
var mytime = new Date();

function handler (req, res) { //create server
  fs.readFile(__dirname + '/public/indexa.html', function(err, data) { //read file index.html in public folder
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
      return res.end("404 Not Found");
    } 
    res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
    res.write(data); //write data from index.html
    return res.end();
  });
}

io.sockets.on('connection', function (socket) {// WebSocket Connection
  console.log(" A user is connected...");
  
  var lightvalue = 0; //static variable for current status
  var total = 0; // i added this timer variable
  
  pushButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
      return;
    }
    lightvalue = value;
    
    
    socket.emit('light', lightvalue); //send button status to client
    
    
    if (lightvalue != LED.readSync()) { //only change LED if status has changed
		LED.writeSync(lightvalue); //turn LED on or off
		var ss = new Date();
		console.log(lightvalue);
		if (lightvalue) {
			socket.emit("mess", lightvalue); // this should be a message that burner is firing
			elapsed = 0;
		
            st = ss.getTime();
            console.log(" Burner is running");
            
            
        } else {
		  socket.emit("mess", lightvalue); // this should be a message that burner is firing	
		  var n = new Date();
		  nn = n.getTime();
		  
		  
		  elapsed = (nn - st) / 1000;
		  var relapsed = Math.round(elapsed);
		  
		  total = total + relapsed;
		  var newtotal = total / 60;
	
		  
		  var seconds = Math.round(elapsed);
		  
		  var mins = seconds / 60;
		 
		  var tsec = total + elapsed;
		  var hrs = mins / 60;
		  mins = mins.toFixed(2);// i added
		  var gals = hrs * .75
		  tgals = tgals + gals;
		  gals = gals.toFixed(3);
		  hrs = hrs.toFixed(3);
		  //tgals = tgals.toFixed(3);
		  
		  
		  console.log("Burner is idle", "   ", seconds, "seconds have elapsed");
		  socket.emit("thiscycle", {words: "Previous burn cycle in minutes = ", secs: mins});
		  console.log("elapsed burn time is ", total);
		  socket.emit("thatcycle", {words: "Gallons used during last burn cycle = ", secs: gals});
		  socket.emit("TotMess", {words: "Total burn time in hours =  ", secs: hrs});  //there was a curly bracket}
		  console.log("Total gallons used to date = ", tgals);
		  socket.emit("mytime", {words: "Monitor start date =  ", secs: mytime});
          socket.emit("totgals", {words: "Total gallons used to date = ", secs: tgals}); } 
            
            
            
            
            
    
  

		  
		  
		  
		 
    }
  });
});

process.on('SIGINT', function () { //on ctrl+c
  LED.writeSync(0); // Turn LED off
  LED.unexport(); // Unexport LED GPIO to free resources
  pushButton.unexport(); // Unexport Button GPIO to free resources
  process.exit(); //exit completely
});


