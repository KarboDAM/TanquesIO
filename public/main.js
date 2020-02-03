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
  //Limpiar tablero con cada llegada de datos nuevos.
  $(`#tablero`).empty();
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
    let posicionX = bala.posX*45;
    let posicionY = bala.posY*25;
    //todos los tanques son rojos en principio
    let color = "red";
    // pero miro si el tanque es mio o de otro usurio, 
    //para ello comparo el nombre del usuario que es dueño con mi variable "minombre"
    //si es mi tanque lo pinto de azul, y sera el tanque que maneje
    if(bala.nombre==minombre) {
        color = "blue";
    }

    $("#tablero").append(`<div class="bala" id="bala-${bala.nombre}" 
      style="position: absolute; top: ${posicionY}px; left: ${posicionX}px; 
      border-radius:50%; width: 25px; height: 25px; background-color: ${color}"> </div>`);
}

function mueveTanque(tanque) {

  let posicionX = tanque.positionX*45;
  let posicionY = tanque.positionY*25;
  let direccion = dameLetra(tanque.posicionCanon);
  //todos los tanques son rojos en principio
  let color = "r";
  // pero miro si el tanque es mio o de otro usurio, para ello comparo el nombre del usuario que es dueño con mi variable "minombre"
  //si es mi tanque lo pinto de azul, y sera el tanque que maneje
  if(tanque.nombre==minombre) {
      color = "b";
      //elimino el div del login, ya no me interesa poder introducir mas tanques con ese usuario
      $("#login").empty();
      $("#tablero").append(`<div class="tanque" id="tanque-${tanque.nombre}" style="position: absolute; top: ${posicionY}px; left: ${posicionX}px; width: 45px; height: 25px;"><img src="tank/${color}${direccion}.png"></img> </div>`);
  }else{
      $("#tablero").append(`<div class="tanque" id="tanque-${tanque.nombre}" style="position: absolute; top: ${posicionY}px; left: ${posicionX}px; width: 45px; height: 25px;"><img src="tank/${color}${direccion}.png"></img> </div>`);
  }
}
//recibe mensaje y refresca usuarios refistrados en el ranking
socket.on('datosusuarios',function(usuarios){
    mostrarUsuarios(usuarios);
});
//recibe mensaje de que el user enviado ya esta en partida en otro cliente
socket.on('yaestasjugando',function(){
    alert("Ya estas jugando en otro cliente chaval!");
});
//recibe mensaje de que el usuario ya existe pero la contraseña es incorrecta
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
    //todos los tanques son rojos en principio
    // pero miro si el tanque es mio o de otro usurio, para ello comparo el nombre del usuario que es dueño con mi variable "minombre"
    //si es mi tanque lo pinto de azul, y sera el tanque que maneje
    if(jugador.username==minombre) {
      jugadorActual = jugador;
    }

});
function dameLetra(posicionCanon){
  var direccion = "";
  switch(posicionCanon){
    case 0:
      direccion="r";
      break;
    case 1:
      direccion="l";
      break;
    case 2:
      direccion="u";
      break;
    case 3:
      direccion="d";
      break;
    default:
      direccion="r";
      break;
  }
  return direccion;

}
//parte que envia desde cliente al server el movimiento y quien lo debe hacer
var direccion = 69;
//este event listener se encarga de detectar las teclas para el movimiento del tanque
document.addEventListener('keydown',presionar);
//en esta funcion cambiamos el valor de la variable direccion para el movimiento del tanque
function presionar(e){
  if( jugadorActual!= null) {
    if(e.keyCode === 87){
        direccion = 2;
        socket.emit("direccion",direccion,jugadorActual);
        console.log(jugadorActual.username);
    }
    if(e.keyCode === 68){
        direccion = 0;
        socket.emit("direccion",direccion,jugadorActual);
        console.log(jugadorActual.username);
    }
    if(e.keyCode === 83){
        direccion = 3;
        socket.emit("direccion",direccion,jugadorActual);
        console.log(jugadorActual.username);
    }
    if(e.keyCode === 65){
        direccion = 1;
        socket.emit("direccion",direccion,jugadorActual);
        console.log(jugadorActual.username);
    }
  }
  return direccion;

}
//Este event listener se encarga de detectar las teclas 
//para el movimiento de la torreta al disparar
document.addEventListener('keydown',presionarTorreta);
/*
  En esta funcion cambiamos la direccion de la torreta dependiendo de la tecla que se pulse
  @params:
    e -> TeclaPulsada.
*/
function presionarTorreta(e){
  let direccionT = 69;

  if(e.keyCode === 38){
      direccionT = 2;
      console.log(direccionT);
      socket.emit("direccionT",direccionT,jugadorActual);
  }
  if(e.keyCode === 39){
      direccionT = 0;
      console.log(direccionT);
      socket.emit("direccionT",direccionT,jugadorActual);
  }
  if(e.keyCode === 40){
      direccionT = 3;
      console.log(direccionT);
      socket.emit("direccionT",direccionT,jugadorActual);
  }
  if(e.keyCode === 37){
      direccionT = 1;
      console.log(direccionT);
      socket.emit("direccionT",direccionT,jugadorActual);
  }

}
//este event listener se encarga de detectar la barra espaciadora para realizar el disparo
document.addEventListener('keydown',presionaDispara);
//en la funcion simplemente llamamos a la function dispara
function presionaDispara(e){
  if(e.keyCode === 32){
    dispara();
    console.log("Dispara");
  }

}
