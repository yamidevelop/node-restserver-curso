const momngoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const usuario = require('./usuario');

let Schema = momngoose.Schema;

let categoriaSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'], },
    estado: { type: Boolean, default: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' } //para guardar el usuario que creo la categoria (logueado)
});

//para mostrar en el Json
categoriaSchema.methods.toJSON = function() {
    let categoria = this;
    let categoriaObject = categoria.toObject();

    return categoriaObject;
}

categoriaSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

//'Categoria' para que se llame así y no categoriaSchema
module.exports = momngoose.model('Categoria', categoriaSchema);