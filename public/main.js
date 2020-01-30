var socket = io.connect('http://localhost:8080' , { 'forceNew': true }); //le paso atributo de configuracion forcenew
//creo variable donde guardo el nombre del usuario que esta jugando en ese cliente
var minombre="";
var jugadores = [];
var jugadorActual = null;
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
socket.on('actualizaTablero', function(tablero)
{
  //console.log(tablero);
  for (var i = 0; i < tablero.length; i++) {
    for (var j = 0; j < tablero.length; j++) {

        if(tablero[i][j]!=undefined){
          console.log(tablero[i][j]);
          console.log("En "+i+" - "+j+" hay algo"+tablero[i][j].tipo);

          if(tablero[i][j].tipo=="Tanque"){
            console.log("Es un tanque");
            mueveTanque(tablero[i][j]);
          }
          else if(tablero[i][j].tipo=="Bala"){
            console.log("Es una bala");
            dibujaBala(tablero[i][j]);
          }
        }
    }
  }
});

function dibujaBala(bala){
    console.log(bala);
    $(`#bala-${bala.nombre}`).remove();
    let posicionX = bala.posX*45;
    let posicionY = bala.posY*25;
    //todos los tanques son rojos en principio
    let color = "red";
    // pero miro si el tanque es mio o de otro usurio, para ello comparo el nombre del usuario que es dueño con mi variable "minombre"
    //si es mi tanque lo pinto de azul, y sera el tanque que maneje
    if(bala.nombre==minombre) {
        color = "blue";
        //elimino el div del login, ya no me interesa poder introducir mas tanques con ese usuario
    }

    $("#tablero").append(`<div class="bala" id="bala-${bala.nombre}" style="position: absolute; top: ${posicionY}px; left: ${posicionX}px; border-radius:50%; width: 25px; height: 25px;background-color: ${color}"> </div>`);

    console.log(posicionX);
}

socket.on('balaVa', function(jugador){
    console.log(jugador);
    $(`#bala-${jugador.username}`).remove();
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

//recibir datos del movimiento del tanque desde el server
socket.on('mueveTanque',function(jugador){
    mueveTanque(jugador);
});




socket.on('yaestasjugando',function(){
    alert("Ya estas jugando en otro cliente chaval!");
});
socket.on('ContraseñaIncorrecta',function(){
    alert("Contraseña Incorrecta!");
});

function mueveTanque(tanque) {

  $(`#tanque-${tanque.nombre}`).remove();
  let posicionX = tanque.positionX*45;
  let posicionY = tanque.positionY*25;
  //todos los tanques son rojos en principio
  let color = "red";
  // pero miro si el tanque es mio o de otro usurio, para ello comparo el nombre del usuario que es dueño con mi variable "minombre"
  //si es mi tanque lo pinto de azul, y sera el tanque que maneje
  if(tanque.nombre==minombre) {
      color = "blue";
      //elimino el div del login, ya no me interesa poder introducir mas tanques con ese usuario
      $("#login").empty();
      $("#tablero").append(`<div class="tanque" id="tanque-${tanque.nombre}" style="position: absolute; top: ${posicionY}px; left: ${posicionX}px; width: 45px; height: 25px;"><img src="tank/ab.png"></img> </div>`);
  }else{
      $("#tablero").append(`<div class="tanque" id="tanque-${tanque.nombre}" style="position: absolute; top: ${posicionY}px; left: ${posicionX}px; width: 45px; height: 25px;"><img src="tank/rb.png"></img> </div>`);
  }


}
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
    jugadorActual = jugador;
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

//parte que envia desde cliente al server el movimiento y quien lo debe hacer
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
      socket.emit("direccion",direccion,jugadorActual);

      console.log(direccion);
    }
  }
  if(e.keyCode === 68){
    dch = true;
    if(dch==true){
      direccion = 0;
      socket.emit("direccion",direccion,jugadorActual);

      console.log(direccion);
    }
  }
  if(e.keyCode === 83){
    abajo = true;
    if(abajo==true){
      direccion = 3;
      socket.emit("direccion",direccion,jugadorActual);

      console.log(direccion);
    }
  }
  if(e.keyCode === 65){
    izq = true;
    if(izq==true){
      direccion = 1;
      socket.emit("direccion",direccion,jugadorActual);

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
var arribaT = false;
var abajoT = false;
var izqT = false;
var dchT = false;
var direccionT = 69;
document.addEventListener('keydown',presionarTorreta);
function presionarTorreta(e){
  if(e.keyCode === 38){
    arribaT = true;
    if(arribaT==true){
      direccionT = 2;
      console.log(direccionT);
      socket.emit("direccionT",direccionT,jugadorActual);
    }
  }
  if(e.keyCode === 39){
    dchT=true;
    if(dchT==true){
      direccionT = 0;
      console.log(direccionT);
      socket.emit("direccionT",direccionT,jugadorActual);
    }
  }
  if(e.keyCode === 40){
    abajoT=true;
    if(abajoT==true){
      direccionT = 3;
      console.log(direccionT);
      socket.emit("direccionT",direccionT,jugadorActual);
    }
  }
  if(e.keyCode === 37){
    izqT=true;
    if(izqT==true){
      direccionT = 1;
      console.log(direccionT);
      socket.emit("direccionT",direccionT,jugadorActual);
    }
  }
}
document.addEventListener('keyup',soltarTorreta);
function soltarTorreta(e){
  if(e.keyCode === 38){
    arribaT = false;
    if(arribaT==false){
      direccionT = 69;
      console.log(direccionT);
    }
  }
  if(e.keyCode === 39){
    dchT=false;
    if(dchT==false){
      direccionT = 69;
      console.log(direccionT);
    }
  }
  if(e.keyCode === 40){
    abajoT=false;
    if(abajoT==false){
      direccionT = 69;
      console.log(direccionT);
    }
  }
  if(e.keyCode === 37){
    izqT=false;
    if(izq==false){
      direccionT = 69;
      console.log(direccionT);
    }
  }
}
