const express = require('express');
const fileUpload = require('express-fileupload');
const { json } = require('body-parser');
const app = express();

const usuario = require('../models/usuario');
const producto = require('../models/producto');
const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) { //si no vienen archivos
        return res.status(400)

        .json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningun archivo'
            }
        });
    }

    //valida tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', ')
            }
        });
    }

    let archivo = req.files.archivo; //archivo es el nombre que se le va a colocar como key en el body
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    //Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg', 'pdf'];

    if (extensionesValidas.indexOf(extension) < 0) { //la extension del archivo no se encontró en el arreglo de las validadas
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }

    //cambiar nombre al archivo para no pisarlo si se sube otro con el mismo nombre y por el tema de la cache
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`

    // .mv es mover
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        //Aqui imagen cargada
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }

    });

});


function imagenUsuario(id, res, nombreArchivo) {
    //primero verificar si el id pasado por parametro del usuario existe

    usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        //todo esto es para reemplazar la imagen si ya existe para el usuario. Sino existe la crea
        borraArchivo(usuarioDB.img, 'usuarios');
        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        })

    });
}

function imagenProducto(id, res, nombreArchivo) {
    //primero verificar si el id pasado por parametro del usuario existe

    producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        //todo esto es para reemplazar la imagen si ya existe para el producto. Sino existe la crea
        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });

    });
}

function borraArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;