var socket = io.connect('http://localhost:8080' , { 'forceNew': true }); //le paso atributo de configuracion forcenew
//creo variable donde guardo el nombre del usuario que esta jugando en ese cliente
var minombre="";
var jugadores = [];
function meterUsuario() {
    socket.emit('datosLogin',{
        username : $('#nombreuser').val(),
        password : $('#password').val()
    });

    //Asigno el nombre enviado al server a la variable "minombre"
    minombre = $('#nombreuser').val();
}

function dispara() {
    for(let j=0; j<jugadores.length; j++) {
        if(jugadores[j].username==minombre) {
            socket.emit('dispara', jugadores[j]);
            console.log("dispara desde cliente");

        }

    }
}
socket.on('balaVa', function(jugador){
    console.log(jugador);

    let posicionX = jugador.miTanque.bala.posX*45;
    let posicionY = jugador.miTanque.bala.posY*25;
    //todos los tanques son rojos en principio
    let color = "red";
    // pero miro si el tanque es mio o de otro usurio, para ello comparo el nombre del usuario que es dueño con mi variable "minombre"
    //si es mi tanque lo pinto de azul, y sera el tanque que maneje
    if(jugador.username==minombre) {
        color = "blue";
        //elimino el div del login, ya no me interesa poder introducir mas tanques con ese usuario
    }

    $("#tablero").append(`<div class="bala" id="bala-${jugador.username}" style="position: absolute; top: ${posicionY}px; left: ${posicionX}px; border-radius:50%; width: 25px; height: 25px;background-color: ${color}"> </div>`);

    console.log(posicionX);
});
//
socket.on('datosusuarios',function(usuarios){
    mostrarUsuarios(usuarios);
});

socket.on('yaestasjugando',function(){
    alert("Ya estas jugando en otro cliente chaval!");
});
socket.on('ContraseñaIncorrecta',function(){
    alert("Contraseña Incorrecta!");
});

function mostrarUsuarios(usuarios){

    $("#ranking").empty();
    for(var i=0; i<usuarios.length; i++) {
        $("#ranking").append(`<p>${usuarios[i]._id} - ${usuarios[i].puntuacion} puntos </p>`);
    }
}

//Cuando el server envia un jugador a los clientes
socket.on('newjugador',function(jugador){
    //coloco el tanque
    jugadores.push(jugador);
    let posicionX = jugador.miTanque.positionX*45;
    let posicionY = jugador.miTanque.positionY*25;
    //todos los tanques son rojos en principio
    let color = "red";
    // pero miro si el tanque es mio o de otro usurio, para ello comparo el nombre del usuario que es dueño con mi variable "minombre"
    //si es mi tanque lo pinto de azul, y sera el tanque que maneje
    if(jugador.username==minombre) {
        color = "blue";
        //elimino el div del login, ya no me interesa poder introducir mas tanques con ese usuario
        $("#login").empty();
        $("#tablero").append(`<div class="tanque" id="tanque-${jugador.username}" style="position: absolute; top: ${posicionY}px; left: ${posicionX}px; width: 45px; height: 25px;"><img src="tank/ab.png"></img> </div>`);
    }else{
        $("#tablero").append(`<div class="tanque" id="tanque-${jugador.username}" style="position: absolute; top: ${posicionY}px; left: ${posicionX}px; width: 45px; height: 25px;"><img src="tank/rb.png"></img> </div>`);
    }
    
});

