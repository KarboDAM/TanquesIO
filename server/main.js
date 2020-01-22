var tamanoTablero=20;
var tablero[tamanoTablero][tamanoTablero];

function Jugador(nombre) {
    this.nombre=nombre;
    this.puntuacion=0;
    this.miTanque=new Tanque();
};

function Tanque() {

    /*
    Posiciones:
        0 - Derecha
        1 - Izquierda
        2 - Arriba
        3 - Abajo
    */
    this.positionX=generaPosicion();
    this.positionY=generaPosicion();
    this.retraso=3;
    this.vidas=2;
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
    //JULIO: Genera posicion: Devolver un valor al azar en el tablero.
    this.generaPosicion=function(){}
    //MANOLO: Modifica las variables posicionX y posicionY del tanque en funcion metodo.
    //Mueve de uno en uno.
    //TODO: Mantener pulsado.
    this.mueveDerecha=function(){}
    this.mueveIzquierda=function(){}
    this.mueveArriba=function(){}
    this.mueveAbajo=function(){}
    //llama a un metodo u otro en funcion del parametro pasado.
    this.mueve=function (direccion){
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
    //TODO: Getters & Setters
};

