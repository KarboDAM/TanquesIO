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

