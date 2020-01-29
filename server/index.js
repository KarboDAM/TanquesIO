//Necesario para ejecutar en local sin xampp/wamp.
var express = require('express');
var app = express();
var server = require('http').Server(app);
//
var io = require('socket.io')(server);
// npm i -S -body-parser ===> 
//Instalamos una libreria que nos permite todos esos mensajes de tipo res (como los POST), parsearslos, tratar y recogerlos 
const bodyParser = require("body-parser");//TODO: Mirar si sobra.
//Instalamos librería mongoose para utilizar mongodb en nuestro proyecto. (npm i -S mongoose)
const mongoose = require('mongoose');
//variables globales donde almaceno los jugadores...
let usuariosbd = [];
let jugadores = [];
let jugadorActual = null;
async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}
//traigo esquema de datos de usuario
const Usuario = require('../models/usuario');
//Creamos el tablero. Aqui se almacenaran los tanques
var tamanoTablero=20;
var tablero=new Array(tamanoTablero);
for (var i = 0; i < tablero.length; i++) {
        tablero[i]=new Array(tamanoTablero);
}


mongoose.set('useFindAndModify', false);//Lo hizo un mago, no tocar.

//añadimos esas capas a nuestro server express
app.use(bodyParser.urlencoded({ extended: false }));//TODO: Mirar si sobra.
app.use(bodyParser.json());

//middelwhere? express donde le indicamos la parte publica que queremos que sea estatica
app.use(express.static('public'));

//aqui escuchamos la ruta raiz, si pusiesemos '/hello' escuchariamos en esa ruta, RUTAS RES.
app.get('/hello', function(req,res){
    res.status(200).send("Bienvenido a la batalla!");
});

mongoose.connect('mongodb://localhost:27017/tanques' ,{ useUnifiedTopology: true, useNewUrlParser: true },(err,res) => {
    if(err) {
        return console.log(`Error al conectarse a la BD.  Error: ${err}`);
    } else {
        console.log(`Conexión a la base de datos establecida...`);
    }
//TODO: Mirar }

/*
con socket escuchamos mensaje que llege
servidor de socket es IO, no app
escucha mensaje que llege de navegador u otro server.

io.on('connection', function(socket){ //le pasamos el socket que esta abierto en ese momento, cliente we que manda mensaje
        console.log('alguien se ha conectado con sockets');
    });
*/
io.sockets.on('connection', function(socket){
    console.log("se ha conectado alguien desde "+socket.handshake.address);
    //Cuando se conecta alguien le mandamos los usurios al ranking.
    Usuario.find({}, (err,usuarios) =>{
        if(err) {
            console.log(`Error al intentar obtener los usuarios: ${err}`)
        } else {
            console.log({usuarios});
            socket.emit('datosusuarios',usuarios);
        }
    });

    //
    for ( var j=0; j<jugadores.length; j++ ) {
        io.emit('newjugador',jugadores[j]);

    }

    socket.on('dispara', function(jugador){
        console.log("recibo disparo con el jugador en server");
        for(let i=0; i<jugadores.length; i++) {
            if(jugadores[i].username=jugador.username) {
                jugadorActual = jugadores[i];
                console.log(jugadores[i].miTanque);
                jugadores[i].miTanque.dispara();


            }

        }

    });



    
    //Crea un usuario, lo registra en la BD y lo envia al cliente con la clave 'newJugador'.
	socket.on('datosLogin', function(datosLogin) {
        //Cuando meten datosLogin para acceder un usuario--->
        console.log(`El usuario se llama ${datosLogin.username} con contraseña ${datosLogin.password}`);
        
        let usuario = new Usuario();
        usuario._id = datosLogin.username;
        usuario.password = datosLogin.password;
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
                            let error = err.toString();
                            console.log(error.substring(12,18));
                            if( error.substring(12,18) == "E11000" ) {// Si lo intentamos guardar pero ya existe el nombre
                                console.log("USUARIO YA EXISTE EN LA BD, CONTRASEÑA INCORRECTA")
                                socket.emit('ContraseñaIncorrecta');
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
                            let player = new Jugador(datosLogin.username,0);
                            jugadores.push(player);
                            //Acceder----> Crear tanque para este nuevo usuario
                            accederJuego(player);
                        }    
                    }); 
                } else {
                    
                    var estaJugando = false;
                    //Compruebo que el usuario no este jugando ya...
                    for ( var j=0; j<jugadores.length; j++ ) {
                        if( datosLogin.username==jugadores[j].username ) {
                            estaJugando = true;
                            socket.emit('yaestasjugando');
                        }                
                    }
                    if(!estaJugando) {
                        //TODO: Acceder a mongo para leer la puntuacion.
                    //Existe ese usuario con ese nombre y contraseña
                    //Añado jugador a nuestro array jugadores
                    let player = new Jugador(datosLogin.username, 0);
                    jugadores.push(player);
                    //Acceder-----> Crear tanque para ese usuario
                    accederJuego(player);

                    }
                    
                } 
            }
        });
    });
});

//Mandar objeto jugador a todos los clientes con la clave 'newJugador'.
function accederJuego(jugador) {
    //Meter un nuevo tanque al juego.
    //Codigo que genera tanque de ese jugador 
    //Codigo que manda ese jugador con tanque a los clientes---->
    io.emit('newjugador',jugador);
}

//Magia negra del final, no tocar.
server.listen( 8080, function () {
    console.log('servidor corriendo');
    });
});
//

//Devuelve un array con todos los tanques que hay en el servidor.
function getTanques()
{
	Tanques = new Array(jugadores.length);

	for (var i =0;i <  jugadores.length; i++) {
		Tanques[i]=jugadores[i].miTanque;
	}

	return Tanques;
}

//TODO: Cliente. Modificacion del color del tanque.
class Jugador {
    constructor(username, puntuacion) {
        //this.id;
        this.username = username;
        this.puntuacion = puntuacion;
        this.miTanque = new Tanque();
    }
};

class Tanque {
    /*
    Posiciones:
        0 - Derecha
        1 - Izquierda
        2 - Arriba
        3 - Abajo
    */
    //Los metodos dentro del constructor son "privates" mientras las que estan fuera "public".
    //window.tablero es para acceder a la variable global.
    constructor() {

        let variables=generaPosicion();
        this.positionX=variables[0];
        this.positionY=variables[1];
        this.retraso=3;
        this.vidas=2;
        this.bala=null;
        this.horaUltimoDisparo;
        //JAIRO: Asignacion de imagen.
        this.imagen;
        //Asignamos una posicion del canon por defecto.
        this.posicionCanon=0;
        
        //Metodos
        /*
        TODO:
        this.dispara=function(){
            //Tener en cuenta la posicion canon
            if(horaUltimoDisparo-horaActual>=retraso){
                //Mata.
            }
        }
        */
        //Devuelve un array con posX-posY libres en el tablero.
        function generaPosicion() {
            let ocupada = true;
            let posx = 0;
            let posy = 0;
            while (ocupada) {
                ocupada = false;
                posx = Math.floor(Math.random() * 19)+1;
                posy = Math.floor(Math.random() * 19)+1;
                for (let i = 0; i < jugadores.length; i++) {
                    if ((posx - jugadores[i].miTanque.positionX ==-1 || posx - jugadores[i].miTanque.positionX==0 || posx - jugadores[i].miTanque.positionX==1) && (posy - jugadores[i].miTanque.positionY ==-1 || posy - jugadores[i].miTanque.positionY ==0 || posy - jugadores[i].miTanque.positionY ==1)) {
                        ocupada = true;
                    }
                }
            }

            let variables=[];
            variables.push(posx);
            variables.push(posy);

            return variables;
        };
        //MANOLO: Modifica las variables posicionX y posicionY del tanque en funcion metodo.
        //Mueve de uno en uno.
        //TODO: Mantener pulsado.
        function mueveDerecha(){}
        function mueveIzquierda(){}
        function mueveArriba(){}
        function mueveAbajo(){}
        //llama a un metodo u otro en funcion del parametro pasado.
        function mueve(direccion){
            switch(direccion)
            {
                case 0:
                    mueveDerecha();
                    break;
                case 1:
                    mueveIzquierda();
                    break;
                case 2:
                    mueveArriba();
                    break;
                case 3:
                    mueveAbajo();
                    break;
                default:
                    break;
            }
        }
        //Que devuelva true/false si hay o no un tanque en esa posicion
        function compruebaPosicion(posX, posY){
            return (window.tablero!=null)
        }
        function actualizaPosicion(){
            window.tablero[this.positionX][this.positionY]=this;
        }
        //TODO: Getters & Setters
    }

    dispara = function() {
        this.bala = new Bala(this.positionX,this.positionY,this.posicionCanon);
        this.bala.mueveBala();
    }


};

class Bala {

    constructor(posX,posY) {

        this.posX=posX;
        this.posY=posY;
        this.posicionCanon=2;
           
    }

    apuntaTorreta = function(direccionT) {
        this.posicionCanon = direccionT;

    }
    mueveBala = async function() {

        switch(this.posicionCanon) {
            case 0:
                while(this.posX<19){
                    this.posX++;
                    await sleep(300);
                    io.emit('balaVa',jugadorActual);    
            }
                break;
            case 1:
                while(this.posX>0){
                    this.posX--;
                    await sleep(300);
                    io.emit('balaVa',jugadorActual);    
            }
                break;
            case 2:
                while(this.posY>0){
                    this.posY--;
                    await sleep(300);
                    io.emit('balaVa',jugadorActual);    
            }
                break;
            case 3:
                while(this.posY<19){
                    this.posY++;
                    await sleep(300);
                    io.emit('balaVa',jugadorActual);    
            }
                break;



        }
     
        


    }


}