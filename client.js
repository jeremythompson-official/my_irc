const readline = require('readline');

var socket = require('socket.io-client')('http://localhost:3000')
let inRoom = null;
let adminOf = [];

// Reçoit le message de bienvenue envoyé par le server
socket.on('welcome', function(message) {
    console.log(message);
})

// créer un nouveau channel
socket.on('newChannel', function(channel) {
    adminOf.push(channel);
})

// Affiche tous les messages
socket.on('broadcast', function(message) {
    if (inRoom == null) {
        console.log(message);
    } 
})

// Récupère le nom du channel
socket.on('roomName', function(roomName) {
    console.log('You are now connected to room ' + roomName);
    inRoom = roomName;
})

// Récupère le nom du channel
socket.on('roomMate', function(message, room) {
    if (inRoom == room) {
        console.log(message);
    } 
})

socket.on('roomLeave', function(room) {
    inRoom = null;
    console.log('You have left room ' + room)
})

socket.on('isAdmin', function(channel) {

    let res = adminOf.find(function(element) {
        return element == channel;
    })
    if(res == channel){
        socket.emit('isAdmin', channel);
        console.log('\x1b[92mYou deleted ' + channel + ' successfully\x1b[39m')
    }else{
        console.log('\x1b[91mYou don\'t have the rights or this channel doesn\'t exist\x1b[39m');
        console.log('\x1b[91mYou are admin of ' + adminOf + '\x1b[39m');
    }

})

// Affiche tous les messages privés
socket.on('prvmessage', function(message, room) {
    if (inRoom == room) {
        console.log(message);
    } 
})

//Permet de lire l'entrée client
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//émet le message vers le server
rl.on('line', function(input) {
    let message = input;

    if(inRoom == null) {
        socket.emit('chat', message);
    }else{
        socket.emit('roomMate', message, inRoom);
    }
    
    
  });
