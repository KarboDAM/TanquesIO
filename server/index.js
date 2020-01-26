var express = require('express');
var app = express();
let usuariosbd = [];
var server = require('http').Server(app);
var io = require('socket.io')(server);
let jugadores = [];


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
    //Cuando se conecta alguien le mandamos los usurios al ranking.
    Usuario.find({}, (err,usuarios) =>{
        if(err) {
            console.log(`Error al intentar obtener los usuarios: ${err}`)
        } else {
            console.log({usuarios});
            io.emit('datosusuarios',usuarios);
            
        }
    });
    
	socket.on('datos', function(datos) {
        //Cuando meten datos para acceder un usuario--->


        console.log(`El usuario se llama ${datos.username} con contraseña ${datos.password}`);
        
        let usuario = new Usuario();
        usuario._id = datos.username;
        usuario.password = datos.password;
        usuario.puntuacion = 0;

        //Compruebo si el usuario introducido está en la bd
        Usuario.find({ $and: [ { _id: usuario._id } , { password: usuario.password } ] }, (err,usuarios) =>{
            if(err) {
                console.log(`Error al intentar obtener los usuarios: ${err}`)
            } else {
                console.log(`Resultado de la busqueda: ${usuarios} que son  ${usuarios.length}  numero de usuarios` );
                usuariosbd=usuarios;

                if(usuariosbd.length == 0) { //No esxite ningun usuario en la bd con esos datos, lo guardamos
                    usuario.save((err,usuarioGuardado) => {
                        if(err) {
                            console.log(`Error al intentar guardar en la bd: ${err}`)
                            //Acceder if(err==)---->
                            let error = err.toString();
                            console.log(error.substring(12,18));
                            if( error.substring(12,18) == "E11000" ) {  // Si lo intentamos guardar pero ya existe el nombre
                                console.log("USUARIO YA EXISTE EN LA BD, CONTRASEÑA INCORRECTA")
                            }
                        } else { //Ha podido guardar, ergo mandamos los usuarios a los clientes incluyendo el nuevo
                            console.log({usuario: usuarioGuardado});
                            Usuario.find({}, (err,usuarios) =>{
                                if(err) {
                                    console.log(`Error al intentar obtener los usuarios: ${err}`)
                                } else {
                                    console.log({usuarios});
                                    io.emit('datosusuarios',usuarios);
                                }
                            });
                            //Añado ese jugador a nuestros jugadores
                            let player = new Jugador(datos.username, 0);
                            jugadores.push(player);
                            //Acceder----> Crear tanque para este nuevo usuario
                            accederJuego(player);


                            

                        }    
                    }); 
        
                } else { //Existe ese usuario con ese nombre y contraseña
                    //Añado jugador a nuestro array jugadores
                    let player = new Jugador(datos.username, 0);
                    jugadores.push(player);
                    //Acceder-----> Crear tanque para ese usuario
                    accederJuego(player);


                } 
            }
        });
    });
});

//Mandar objeto jugador a todos los clientes
function accederJuego(jugador) {

//Meter un nuevo tanque al juego.
//Codigo que genera tanque de ese jugador 



//Codigo que manda ese jugador con tanque a los clientes---->
io.emit('newjugador',jugador);






}



server.listen( 8080, function () {
    console.log('servidor corriendo');
    
    });
});



class Jugador {
    constructor(username, puntuacion) {
        this.username = username;
        this.puntuacion = puntuacion;
        this.miTanque = new Tanque();
    }
};


class Tanque {
    constructor() {
        this.positionX=generaPosicion("x");
        this.positionY=generaPosicion("y");
      
        function generaPosicion(cual) {
            let ocupada = true;
            let posx = 0;
            let posy = 0;
            while (ocupada) {
                ocupada = false;
                posx = Math.floor(Math.random() * 19)+1;
                posy = Math.floor(Math.random() * 19)+1;
                for (let i = 0; i < jugadores.length; i++) {
                    if (posx == jugadores[i].miTanque.positionX && posy == jugadores[i].miTanque.positionY && jugadores[i].miTanque.positionX==this.positionX ) {
                        ocupada = true;
                    }
                }
            }

            if(cual==="x"){
                return posx;
            }else{
                return posy;
            }
        };
    }
};