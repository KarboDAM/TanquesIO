var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);


// npm i -S -body-parser ===> 
//Instalamos una libreria que nos permite todos esos mensajes de tipo res (como los POST), parsearslos, tratar y recogerlos 
const bodyParser = require("body-parser");
//Instalamos librería mongoose para utilizar mongodb en nuestro proyecto. (npm i -S mongoose)
const mongoose = require('mongoose');

//traigo esquema de datos de usuario
const Usuario = require('../models/usuario');

mongoose.set('useFindAndModify', false);

//añadimos esas capas a nuestro server express
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//middelwhere? express donde le indicamos la parte publica que queremos que sea estatica
app.use(express.static('public'));

//api-res lo que hace es escuchar rutas que ponemos en el navegador


//aqui escuchamos la ruta raiz, si pusiesemos '/hello' escuchariamos en esa ruta, RUTAS RES.
app.get('/hello', function(req,res){
res.status(200).send("Hello World!");

});

//con socket escuchamos mensaje que llege
//servidor de socket es IO, no app
//escucha mensaje que llege de navegador u otro server.

/*
io.on('connection', function(socket){ //le pasamos el socket que esta abierto en ese momento, cliente we que manda mensaje
    console.log('alguien se ha conectado con sockets');
    
    });

    */
mongoose.connect('mongodb://localhost:27017/tanques' ,{ useUnifiedTopology: true, useNewUrlParser: true },(err,res) => {

if(err) {
    return console.log(`Error al conectarse a la BD.  Error: ${err}`);
} else {
    console.log(`Conexión a la base de datos establecida...`);
}

io.sockets.on('connection', function(socket) {
    console.log("se ha conectado alguien desde "+socket.handshake.address);

    Usuario.find({}, (err,usuarios) =>{
        if(err) {
            console.log(`Error al intentar obtener los usuarios: ${err}`)
        } else {
            console.log({usuarios});
            io.emit('datosusuarios',usuarios);
        }
    });
    
	socket.on('datos', function(datos) {
        console.log(`El usuario se llama ${datos.username} con contraseña ${datos.password}`);
        
        let usuario = new Usuario();
        usuario._id = datos.username;
        usuario.password = datos.password;
        usuario.puntuacion = 0;
        

        usuario.save((err,usuarioGuardado) => {
            if(err) {
                console.log(`Error al intentar guardar en la bd: ${err}`)
            } else {
                console.log({usuario: usuarioGuardado});
                Usuario.find({}, (err,usuarios) =>{
                    if(err) {
                        console.log(`Error al intentar obtener los usuarios: ${err}`)
                    } else {
                        console.log({usuarios});
                        io.emit('datosusuarios',usuarios);
                    }
                });
            }    
        });  
    });
    
    
	
});



server.listen( 8080, function () {
    console.log('servidor corriendo');
    
    });
});