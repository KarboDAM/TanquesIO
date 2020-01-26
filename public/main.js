var socket = io.connect('http://localhost:8080' , { 'forceNew': true }); //le paso atributo de configuracion forcenew

function meterUsuario() {
    socket.emit('datos',{
        username : $('#nombreuser').val(),
        password : $('#password').val()
    });
}

socket.on('datosusuarios',function(usuarios){
    mostrarUsuarios(usuarios);
});

function mostrarUsuarios(usuarios){

    $("#ranking").empty();
    for(var i=0; i<usuarios.length; i++) {
        $("#ranking").append(`<p>${usuarios[i]._id} - ${usuarios[i].puntuacion} puntos </p>`);
    }
}

//Cuando el server envia un jugador a los clientes
socket.on('newjugador',function(jugador){


    let posicionX = jugador.miTanque.positionX*45;
    let posicionY = jugador.miTanque.positionY*25;

    $("#tablero").append(`<div class="tanque" id="tanque-${jugador.username}" style="position: absolute; top: ${posicionY}px; left: ${posicionX}px; width: 45px; height: 25px;background-color: black"> </div>`);
});

