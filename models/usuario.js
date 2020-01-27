'use strict'

const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const UsuarioSchema = Schema ({
	_id: String, 
	puntuacion: Number,
	password: String
});

module.exports = mongoose.model('usuario', UsuarioSchema);