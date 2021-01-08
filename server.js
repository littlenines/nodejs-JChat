//Nemanja Galbinovic
//Dec 2020
//Jan 2021 few changes
//JChat
var express = require("express");
var app = express();
const path = require('path');
var server = require("http").createServer(app);
var mongoose = require("mongoose");

//Cluster mongoDB
//Input your mongo db cluster in order to work
//In case your cluster doesn't work you have to give it Network Access -> Add Ip Address -> Add current Ip address
var mongodb = "mongodb+srv://admin:<password>@cluster0.ncd9v.mongodb.net/<dbname>?retryWrites=true&w=majority";

//Getting the date 
var today = new Date();
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(months[today.getMonth()]).padStart(2, '0'); 
var yyyy = today.getFullYear();
today = dd + '/' + mm + '/' + yyyy;

//User list
nicknames = [];

var io = require("socket.io")(server);
//Listening on port 3000
server.listen(3000);

//Mongo connection
mongoose.connect(mongodb,{ useNewUrlParser: true,useUnifiedTopology: true }).then(() => {
    console.log("Connected to DB");
  }).catch((err) => console.log(err));

//Creating database Schema
var chatSchema = new mongoose.Schema({
  nick: String,
  msg: String,
  date: String,
  created: { type: Date, default: Date.now },
});
//Creating Collection [messages]
var chat = mongoose.model("Message", chatSchema);

app.use(express.static(path.join(__dirname,'public')));

//User connects
io.on("connection", (socket) => {
  //Get messages from db 
  chat.find().then((result) => {
    socket.emit("output-message", result);
  });
  //test if user connected
  console.log("a user connected: " + socket.id);

  //On user disconnect
  socket.on("disconnect", (data) => {
    console.log("user disconnected");
    //Removing the user 
    if (!socket.nickname) return;
    nicknames.splice(nicknames.indexOf(socket.nickname), 1);
    io.emit("usernames", nicknames);
  });
  //User is typing
  socket.on('typing', function(data){
    socket.broadcast.emit('typing',data, socket.nickname);
 });

  //Push the user in the list
  socket.on("chatuser", function (data, callback) {
    if (nicknames.indexOf(data) != -1) {
      callback(false);
    } else {
      callback(true);
      socket.nickname = data;
      nicknames.push(socket.nickname);
      io.emit("usernames", nicknames);
    }
  });
  //Listening for a message and saving it to db
  socket.on("chatmessage", (msg) => {
    var newMsg = new chat({ msg: msg, nick: socket.nickname , date: today });

    newMsg.save().then(() => {io.emit("message", { msg: msg, nick: socket.nickname , date: today});
    });
  });
});
