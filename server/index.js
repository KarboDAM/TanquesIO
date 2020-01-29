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
let jugadorActual = null;//Que coño hace esto?
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

//traigo esquema de datos de usuario
const Usuario = require('../models/usuario');
//Creamos el tablero. Aqui se almacenaran los tanques
var tamanoTablero=20;
var tablero=new Array(tamanoTablero);
for (var i = 0; i < tablero.length; i++) {
    tablero[i]=new Array(tamanoTablero);
}

//Lo hizo un mago, no tocar.
mongoose.set('useFindAndModify', false);

//TODO: Mirar si sobra.
//añadimos esas capas a nuestro server express
app.use(bodyParser.urlencoded({ extended: false }));
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
        console.log("recibo disparon con el jugador en server");
        for(let i=0; i<jugadores.length; i++) {
            if(jugadores[i].username=jugador.username) {
                jugadorActual = jugadores[i];
                console.log(jugadores[i].miTanque);
                jugadores[i].miTanque.dispara();
            }
        }
    });

    socket.on('direccion',function(direccion){
        //Jugador.miTanque.mueve(direccion);
        console.log(`Recibiendo datos movimiento ${direccion}`);
    });
  socket.on('direccion',function(direccion,jugador){
    for ( let i=0; i<jugadores.length; i++) {
      if(jugadores[i].username==jugador.username) {
        jugadorActual = jugadores[i];
        jugadores[i].miTanque.mueve(direccion);

      }

    }
    //Jugador.miTanque.mueve(direccion);
    console.log(`Recibiendo datos movimiento ${direccion}`);
  });

  socket.on('direccionT',function(direccionT,jugador){
    for(let i=0; i<jugadores.length;i++){
      if(jugadores[i].username==jugador.username){
        jugadorActual = jugadores[i];
        jugadores[i].miTanque.mueveTorreta(direccionT);
      }
    }
  });

    //Crea un usuario, lo registra en la BD y lo envia al cliente con la clave 'newJugador'.
	socket.on('datosLogin', function(datosLogin){
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


class Jugador {
    constructor(username, puntuacion) {
        //this.id;
        this.username = username;
        this.puntuacion = puntuacion;
        this.miTanque = new Tanque();
    }
};

class Tanque {
    constructor() {
        this.nombre="PussyDestroyer";
        let posiciones=generaPosicion();
        this.positionX=posiciones[0];
        this.positionY=posiciones[1];
        this.retraso=3;
        this.vidas=2;
        this.bala=null;
        this.horaUltimoDisparo;
        this.posicionCanon=0;
        this.actualizaPosicion();

        /*
            Genera posiciones aleatorias hasta conseguir una libre.
                @return:
                    posiciones -> Array con posX e posY en los indices 0 y 1 respectivamente.
        */
        function generaPosicion() {
            let posx = 0;
            let posy = 0;

            do{
                posx = Math.floor(Math.random() * tamanoTablero);
                posy = Math.floor(Math.random() * tamanoTablero);
            }while(tablero[posx][posy]!=undefined) 

            let posiciones=[];
            posiciones.push(posx);
            posiciones.push(posy);

            return posiciones;
        };
    }

    /*
        Mueve el tanque dependiendo de los parametros.
        @params:
            sumaX -> Numero a sumar a positionX (para restar usar num negativos).
            sumaY -> Numero a sumar a positionY (para restar usar num negativos).
    */
    movimiento=function(sumaX, sumaY){
        var nuevaX=this.positionX+sumaX;
        var nuevaY=this.positionY+sumaY;

        //Primero comprobamos que las posiciones entran en el tablero
        if(nuevaX<tamanoTablero && nuevaX>=0 && nuevaY<tamanoTablero && nuevaY>=0 ){
            //Verificamos el contenido de la nueva pos.
            var contenido=this.compruebaPosicion(nuevaX,nuevaY);
            switch(contenido){
                case 0:
                    //Verificamos el contenido de la antigua posicion
                    //En caso de que haya quedado un tanque con nuestro nombre lo borramos.
                    contenido=this.compruebaPosicion(this.positionX,this.positionY);
                    if(contenido==1)
                        tablero[this.positionX][this.positionY]=undefined;

                    this.positionX=nuevaX;
                    this.positionY=nuevaY;
                    break;
                case 1:
                    //Si hay un tanque con nuestro nombre tenemos un problema.
                    console.log("Error: tenemos tanque duplicado");
                    break;
                case 2:
                    //Si hay una bala con nuestro nombre tenemos otro problema.
                    console.log("Error: como llego esa bala ahi?");
                    break;
                default:
                    break;
            }
        }
    }
    /*
        Verifica lo que hay en el tablero en las posX e posY.
        @params:
            posX -> Columna.
            posY -> Fila.
        @returns:
            0 -> No hay nada.
            1 -> Hay un tanque con nuestro nombre.
            2 -> Hay una bala con nuestro nombre.
            3 -> Otros
    */
    compruebaPosicion=function(posX, posY){
        if(tablero[posX][posY]===undefined){
            return 0;
        }
        else{
            console.log(tablero[posX][posY].getNombre()==this.getNombre());
            if(tablero[posX][posY].getNombre()==this.getNombre()){
                if(tablero[posX][posY].toString()=="Tanque")
                    return 1;
                else
                    return 2;
            }
            else{
                return 3;
            }
        }
    }
    /*
        Guarda al tanque en el tablero en la posicion que le corresponde.
        Ej: Un tanque con las posX=5,posY=4 se guardaria en tablero[5][4].
    */
    actualizaPosicion=function(){
        tablero[this.positionX][this.positionY]=this;
    }
    dispara = function() {
        this.bala = new Bala(this.positionX,this.positionY,this.posicionCanon,this.nombre);
    }
    /*
        Llama al metodo movimiento dependiendo del parametro.
        @param:
            direccion -> numero que representa la direccion (0 dch, 1izq, 2arr, 3abj).
    */
    mueve = function(direccion){
        switch(direccion)
        {
            case 0:
            this.movimiento(1,0);
                break;
            case 1:
            this.movimiento(-1,0);
                break;
            case 2:
            this.movimiento(0,-1);
                break;
            case 3:
            this.movimiento(0,+1);
                break;
            default:
                break;
        }
        this.actualizaPosicion();
        io.emit('mueveTanque',jugadorActual);
    }
    /*
        Modifica la direccion de la torreta.
        @param:
            direccionT -> numero que representa la direccion (0 dch, 1izq, 2arr, 3abj).
    */
    mueveTorreta = function(direccionT){
      if(direccionT!=69)
        this.posicionCanon=direccionT;
    }
    toString=function(){
        return "Tanque";
    }
    getNombre=function(){
        return this.nombre;
    }
};

class Bala {

    constructor(posX,posY,posicionCanon,nombre) {

        this.nombre=nombre;
        this.direccion=posicionCanon;
        this.posX=posX;
        this.posY=posY;
        this.sigue=true;

        function mueveBala(){
            while(this.sigue){//Agregar condicion del tablero
                movimiento(this.direccion);
                sleep(1000).then(() => {
                        io.emit('balaVa',jugadorActual);
                });
            }
        }
        function mueveDerecha(){}
        function mueveIzquierda(){}
        function mueveArriba(){}
        function mueveAbajo(){}
        function movimiento(direccion){
            switch(direccion){
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
    }

    toString=function(){
        return "Bala";
    }
}
