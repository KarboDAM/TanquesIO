function Jugador() {
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
    this.imagen;
    //Asignamos una posicion del canon por defecto.
    this.posicionCanon=0;
    //Metodos
    this.dispara=function() {}
    this.generaPosicion=function(){}
    this.mueveDerecha=function(){}
    this.mueveIzquierda=function(){}
    this.mueveArriba=function(){}
    this.mueveAbajo=function(){}
    this.mueve=function (direccion) {
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

};

