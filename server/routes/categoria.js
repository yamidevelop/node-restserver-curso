const express = require('express');
let { verificaToken, VerificaAdmin_Role } = require('../middlewares/autenticacion');

let Categoria = require('../models/categoria');
const usuario = require('../models/usuario');
let app = express();

//==================================
// Mostrar todas las categorías
//==================================
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('nombre')
        .populate('usuario', 'nombre email') //va a revisar qué IDs existen en la categoria. QUiero mostrar solo el nombre y el email. El id siempre viene, por eso no es necesario especificarlo
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({ //500 porque es un error de db
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                categorias
            });
        });
});

//==================================
// Mostrar una categoría por ID
//==================================
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({ //500 porque es un error de db
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({ //500 porque es un error de db
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });


    })


});


//==================================
// Crear nueva categoría
//==================================
app.post('/categoria', verificaToken, (req, res) => {

    let body = req.body;

    let categoria = new Categoria({
        nombre: body.nombre,
        usuario: req.usuario._id // tengo el id del usuario en el token ---> req.usuario._id que tiene un token valido
    });

    categoria.save((err, categoriaDb) => {
        if (err) {
            return res.status(500).json({ //500 porque es un error de db
                ok: false,
                err
            });
        }

        if (!categoriaDb) {
            return res.status(400).json({
                ok: false,
                err //dirá el por qué no se creo la categoría
            })
        }

        // regresa la nueva categoria
        res.json({
            ok: true,
            categoria: categoriaDb
        })
    })
});

//==================================
// Actualizar categoría, el nombre
//==================================
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id; //este es el mismo id que tengo en /:id
    let body = req.body; //solo puede actualizar el nombre

    let nombreCategoria = {
        nombre: body.nombre
    }

    //2do parametro es lo que yo quiero actualizar, en este caso nombreCategoria
    Categoria.findByIdAndUpdate(id, nombreCategoria, { new: true, runValidators: true }, (err, categoriaDb) => {
        console.log(id);
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDb) { //no existe la categoria en la BD
            return res.status(400).json({
                ok: false,
                err //dirá el por qué no se creo la categoría
            })
        }

        //retorna solo el nombre de la categoria y no toda la categoría que devolvió el callback
        res.json({
            ok: true,
            categoria: categoriaDb.nombre
        });
    });
});


//==================================
// Borrar categoría
//==================================
app.delete('/categoria/:id', [verificaToken, VerificaAdmin_Role], (req, res) => {
    //solo un administrador puede borrar categorias. Obviamente tiene que pedir el token

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoría Borrada'
                // categoria: categoriaBorrada
        });
    });
    // Categoria.findByIdAndRemove algo asi
});

//al final grabar en el postman como Categorias:

module.exports = app;