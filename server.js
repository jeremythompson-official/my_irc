const io = require('socket.io')();
let userNbr = 1;
let users = {};
let clients = [];
let channel = null;
let channels = {};
let channelList = [];
let roomName = null;
let nameLength = null
let messageLength = null

// Affiche un message de connection & Envoie un message de Bienvenue
io.on('connection', function(socket) {        

    let userName = "user" + userNbr++;
    let lastName = userName;
    
    console.log('\x1b[42m' + userName + ' connected\x1b[49m');
    socket.emit('welcome', 'welcome ' + userName + '!');

    socket.broadcast.emit('broadcast', '\x1b[2m\x1b[3m\x1b[32m' + 
    userName + ' enter the chat\x1b[89m\x1b[23m\x1b[22m\x1b[0m');
    
    socket.userName = userName
    users[socket.userName] = socket;

    //fait une liste des utilisateurs
    clients.push(userName);

    socket.on('roomMate', function(message, room) {

                //Récupère les mots de l'input
                var keyWord = message.split(" ", 3);

                if (keyWord[0] == "/nick") {
                    //définit le surnom de l’utilisateur au sein du serveur
                    lastName = userName;
                    userName = keyWord[1];
                    socket.userName = userName
                    users[socket.userName] = socket;
        
                    clients.splice(clients.indexOf(lastName), 1);
                    clients.push(userName);
        
                    socket.broadcast.emit('broadcast', lastName + " change username as " + userName);
        
                    console.log(lastName + " change username as " + userName);
            
                }else if (keyWord[0] == "/list") {
                    //liste les channelList disponibles sur le serveur.
                    if(channelList == []){
                        socket.emit('broadcast', 'No channel created. Create a new channel with the command /create');
                    }else{
                        socket.emit('welcome', 'Channel\'s list: ' + channelList);
                    }
                    
                }else if (keyWord[0] == "/create") {
                    //créer un channel sur le serveur.
                    channel = keyWord[1];
        
                    if (channel in channels) {
                        socket.emit('broadcast', '\x1b[91m Channel\'s name already exists\x1b[39m');
                    }else{
                        channelList.push(channel);
                        socket.channel = channel
                        channels[socket.channel] = socket;
                        socket.emit('newChannel', channel);
                        socket.emit('broadcast', '\x1b[92mYou have created the channel ' + channel + '\x1b[39m');
                        socket.broadcast.emit('broadcast', '\x1b[2m\x1b[3m' + userName + 
                        ' has created ' + channel + '\x1b[23m\x1b[22m\x1b[0m');
                    }
                    
                    
                }else if (keyWord[0] == "/delete") {
                    //suppression du channel sur le serveur.
                    channel = keyWord[1]
                    socket.emit('isAdmin', channel);

                }else if (keyWord[0] == "/join") {
                    //rejoint un channel sur le serveur.
                    roomName = keyWord[1];
        
                    let res = channelList.find(function(element) {
                        return element == roomName;
                    })
        
                    if(res == roomName){
                        socket.join(roomName);
                        socket.emit('roomName', roomName);
            
                        io.sockets.in(roomName).emit('roomMate', '\x1b[2m\x1b[3m\x1b[32m' + 
                        userName + ' enter the room\x1b[89m\x1b[23m\x1b[22m\x1b[0m');
            
                        socket.broadcast.emit('welcome', '\x1b[2m\x1b[3m' + userName + 
                        ' joined the room ' + roomName + '\x1b[23m\x1b[22m\x1b[0m');
        
                    }else{
                        socket.emit('broadcast', 'This channel doesn\'t exist');
                    }
                    
                }else if (keyWord[0] == "/part") {
                    //quitte le channel.
                    roomName = keyWord[1];
                    if (roomName == null) {
                        socket.emit('welcome', 'No channel specified. Please, enter the channel\'s name');
                        
                    }else{
                        socket.leave(roomName);
                        socket.emit('roomLeave', roomName);
                        io.sockets.in(room).emit('roomMate', '\x1b[3m\x1b[2m\x1b[91m' + 
                        userName + ' left the chat\x1b[39m\x1b[22m\x1b[23m');
                    }


                }else if (keyWord[0] == "/leave") {
                    //quitte le channel.
                    roomName = keyWord[1];
                    if (roomName == null) {
                        socket.emit('welcome', 'No channel specified. Please, enter the channel\'s name');
                        
                    }else{
                        socket.leave(roomName);
                        socket.emit('roomLeave', roomName);
                        io.sockets.in(room).emit('roomMate', '\x1b[3m\x1b[2m\x1b[91m' + 
                        userName + ' left the chat\x1b[39m\x1b[22m\x1b[23m');
                    }
                    
                }else if (keyWord[0] == "/users") {
                    //liste les utilisateurs connectés au channel.
                    socket.emit('broadcast', clients +' dans le chat');
                    
                }else if (keyWord[0] == "/msg") {
                    //envoie un message à un utilisateur spécifique.
                    let name = keyWord[1];
                    //Compte le nbr de caractère de name
                    nameLength = name.length;
                
                    //compte le nbr de caractère de message
                    messageLength = message.length;
                    
                    startsAt = nameLength + 4 + 2;        
        
                    endsAt = startsAt + messageLength;            
        
        
                    let trueMessage = message.substring(startsAt, endsAt);      
        
                    prvmessage = trueMessage;
        
                    if(name in users) {
                        users[name].emit('prvmessage', '\x1b[1m\x1b[94m' + userName + 
                        '\x1b[22m\x1b[39m:\x1b[92m ' + prvmessage + ' (private)\x1b[39m', room) ;
                    }else{
                        socket.emit('broadcast', 'Unknown user')
                    }
                }

                socket.on('isAdmin', function(channel){

                    channelList.splice(channelList.indexOf(channel), 1);
                    socket.broadcast.emit('broadcast', '\x1b[2m\x1b[3m' + userName + 
                    ' has deleted ' + channel + '\x1b[23m\x1b[22m\x1b[0m');
            
                });
        
                if (message[0] !== '/' && message !== "") {
                    io.sockets.in(room).emit('roomMate', '\x1b[1m\x1b[94m' + userName+ 
                    '\x1b[22m\x1b[39m: ' + message, room);
                }
    })
    
    socket.on('chat', function(message) {
       
        
        //Récupère les mots de l'input
        var keyWord = message.split(" ", 3);

        if (keyWord[0] == "/nick") {
            //définit le surnom de l’utilisateur au sein du serveur
            lastName = userName;
            userName = keyWord[1];
            socket.userName = userName
            users[socket.userName] = socket;

            clients.splice(clients.indexOf(lastName), 1);
            clients.push(userName);

            socket.broadcast.emit('broadcast', lastName + " change username as " + userName);

            console.log(lastName + " change username as " + userName);
    
        }else if (keyWord[0] == "/list") {
            //liste les channelList disponibles sur le serveur.
            if(channelList == ""){
                socket.emit('broadcast', 'No channel created. Create a new channel with the command /create');
            }else{
                socket.emit('welcome', 'Channel\'s list: ' + channelList);
            }
            
        }else if (keyWord[0] == "/create") {
            //créer un channel sur le serveur.
            channel = keyWord[1];

            if (channel in channels) {
                socket.emit('broadcast', '\x1b[91m Channel\'s name already exists\x1b[39m');
            }else{
                channelList.push(channel);
                socket.channel = channel
                channels[socket.channel] = socket;
                socket.emit('newChannel', channel);
                socket.emit('broadcast', '\x1b[92mYou have created the channel ' + channel + '\x1b[39m');
                socket.broadcast.emit('broadcast', '\x1b[2m\x1b[3m' + userName + 
                ' has created ' + channel + '\x1b[23m\x1b[22m\x1b[0m');
            }
            
            
        }else if (keyWord[0] == "/delete") {
            //suppression du channel sur le serveur.
            channel = keyWord[1]
            socket.emit('isAdmin', channel);
            
            
        }else if (keyWord[0] == "/join") {
            //rejoint un channel sur le serveur.
            roomName = keyWord[1];

            let res = channelList.find(function(element) {
                return element == roomName;
            })

            if(res == roomName){
                socket.join(roomName);
                socket.emit('roomName', roomName);
    
                io.sockets.in(roomName).emit('roomMate', '\x1b[2m\x1b[3m\x1b[32m' + 
                userName + ' enter the room\x1b[89m\x1b[23m\x1b[22m\x1b[0m');
    
                socket.broadcast.emit('broadcast', '\x1b[2m\x1b[3m' + userName + 
                ' joined the room ' + roomName + '\x1b[23m\x1b[22m\x1b[0m');

            }else{
                socket.emit('broadcast', 'This channel doesn\'t exist');
            }
  
        }else if (keyWord[0] == "/part") {
            //quitte le channel.
            roomName = keyWord[1];
            if (roomName == null) {
                socket.emit('broadcast', 'No channel specified. Please, enter the channel\'s name');
                
            }else{
                socket.leave(roomName);
                socket.emit('roomLeave', roomName);
                io.sockets.in(room).emit('roomMate', '\x1b[3m\x1b[2m\x1b[91m' + 
                userName + ' left the chat\x1b[39m\x1b[22m\x1b[23m');
            }

        }else if (keyWord[0] == "/leave") {
            //quitte le channel.
            roomName = keyWord[1];
            if (roomName == null) {
                socket.emit('broadcast', 'No channel specified. Please, enter the channel\'s name');
 
            }else{
                socket.leave(roomName);
                socket.emit('roomLeave', roomName);
                io.sockets.in(room).emit('roomMate', '\x1b[3m\x1b[2m\x1b[91m' + 
                userName + ' left the chat\x1b[39m\x1b[22m\x1b[23m');
            }
            
        }else if (keyWord[0] == "/users") {
            //liste les utilisateurs connectés au channel.
            socket.emit('welcome', clients +' dans le chat');
            
        }else if (keyWord[0] == "/msg") {
            //envoie un message à un utilisateur spécifique.
            let name = keyWord[1];
            //Compte le nbr de caractère de name
            nameLength = name.length;
        
            //compte le nbr de caractère de message
            messageLength = message.length;
            
            startsAt = nameLength + 4 + 2;        

            endsAt = startsAt + messageLength;            


            let trueMessage = message.substring(startsAt, endsAt);      

            prvmessage = trueMessage;

            if(name in users) {
                users[name].emit('prvmessage', '\x1b[1m\x1b[94m' + 
                userName + '\x1b[22m\x1b[39m:\x1b[92m ' + prvmessage + ' (private)\x1b[39m') ;
            }else{
                socket.emit('broadcast', 'Unknown user')
            }
        }

        if (message[0] !== '/' && message !== "") {
            socket.broadcast.emit('broadcast', '\x1b[1m\x1b[94m' + 
            userName+ '\x1b[22m\x1b[39m: ' + message);
        }
    })

    socket.on('isAdmin', function(channel){

        channelList.splice(channelList.indexOf(channel), 1);
        socket.broadcast.emit('broadcast', '\x1b[2m\x1b[3m' + userName + 
        ' has deleted ' + channel + '\x1b[23m\x1b[22m\x1b[0m');

    });

    socket.on('disconnect', function(){
        console.log('\x1b[91m' + userName + ' disconnected\x1b[39m')
        socket.broadcast.emit('broadcast', '\x1b[3m\x1b[2m\x1b[91m' + userName + 
        ' has disconnected\x1b[39m\x1b[22m\x1b[23m');
        clients.splice(clients.indexOf(userName), 1);
     });

});

io.listen(3000);