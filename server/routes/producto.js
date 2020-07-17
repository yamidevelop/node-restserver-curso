const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');
let app = express();
let Producto = require('../models/producto');
const categoria = require('../models/categoria');

//==============================
// Obtener productos
//==============================
app.get('/productos', verificaToken, (req, res) => {

    let desde = req.params.desde || 0; //req.params.desde tambien puede ser
    desde = Number(desde);

    let limite = req.params.limite || 5;
    limite = Number(limite); //se transforma a numero porque es string

    Producto.find({ disponible: true })
        .populate('categoria', 'nombre')
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .exec((err, ProductoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                Productos: ProductoDB
            });
        });
    //trae todos los productos
    //populate: usuario categoria
    //paginado
})

//==============================
// Obtener un producto por ID
//==============================
app.get('/productos/:id', (req, res) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Id no existe'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });
    //populate: usuario categoria

});


//==============================
// Buscar productos
//==============================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, Productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                Productos
            })
        });
})

//==============================
// Crear un nuevo producto
//==============================
app.post('/productos', verificaToken, (req, res) => {

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precio,
        descripcion: body.desc,
        categoria: body.categoria,
        usuario: req.usuario._id // tengo el id del usuario en el token ---> req.usuario._id que tiene un token valido
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    });

    //grabar el usuario 
    //grabar una categoría del listado

})

//==============================
// Actualizar un nuevo producto
//==============================
app.put('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id; //este es el mismo id que tengo en /:id
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precio;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.desc;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                producto: productoGuardado
            });

        });
    });
    //grabar el usuario 
    //grabar una categoría del listado

})

//==============================
// Borrar un producto
//==============================
app.delete('/productos/:id', (req, res) => {
    //NO eliminar el producto físico, sino cambiar Disponible a false
    let body = req.body;
    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        productoDB.disponible = false;

        productoDB.save((err, productoBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoBorrado,
                message: 'Producto eliminado de stock'
            });
        });
    });

    //mi solucion que funcionó
    // let id = req.params.id;
    // let NoDisponible = {
    //     disponible: false
    // }
    // Producto.findByIdAndUpdate(id, NoDisponible, (err, productoDB) => {
    //     if (err) {
    //         return res.status(500).json({
    //             ok: false,
    //             err
    //         });
    //     }

    //     if (!productoDB) {
    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 message: 'Producto no existe'
    //             }
    //         });
    //     }

    //     res.json({
    //         ok: true,
    //         productoDB
    //     })
    // });

})

module.exports = app;