var socket = io.connect('http://localhost:8080' , { 'forceNew': true }); //le paso atributo de configuracion forcenew

function meterUsuario() {
    socket.emit('datosLogin',{
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

var arriba = false;
var abajo = false;
var izq = false;
var dch = false;
var direccion = 69;
document.addEventListener('keydown',presionar);
function presionar(e){
  if(e.keyCode === 87){
    arriba = true;
    if(arriba==true){
      direccion = 2;
      socket.emit("direccion",direccion);

      console.log(direccion);
    }
  }
  if(e.keyCode === 68){
    dch = true;
    if(dch==true){
      direccion = 0;
      socket.emit("direccion",direccion);

      console.log(direccion);
    }
  }
  if(e.keyCode === 83){
    abajo = true;
    if(abajo==true){
      direccion = 3;
      socket.emit("direccion",direccion);

      console.log(direccion);
    }
  }
  if(e.keyCode === 65){
    izq = true;
    if(izq==true){
      direccion = 1;
      socket.emit("direccion",direccion);

      console.log(direccion);
    }
  }
}
document.addEventListener('keyup',soltar);
function soltar(e){
  if(e.keyCode === 87){
    arriba = false;
    if(arriba==false){
      direccion = 69;
      console.log(direccion);
    }
  }
  if(e.keyCode === 68){
    dch = false;
    if(dch==false){
      direccion = 69;
      console.log(direccion);
    }
  }
  if(e.keyCode === 83){
    abajo = false;
    if(abajo==false){
      direccion = 69;
      console.log(direccion);
    }
  }
  if(e.keyCode === 65){
    izq = false;
    if(izq==false){
      direccion = 69;
      console.log(direccion);
    }
  }
}
