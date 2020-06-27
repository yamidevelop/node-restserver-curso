require('./config/config');

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())

app.get('/usuario', function(req, res) {
    res.json('get Usuario')
});

app.post('/usuario', function(req, res) {

    //.body es el que va a aparecer cuando el bodyparser procese cualquier pageload que reciban las peticiones. Funciona para Post, Put, Delete
    let body = req.body;

    if (body.nombre === undefined) {
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario'
        });
    } else {
        res.json({
            persona: body
        });
    }
    res.json({
        persona: body
    });
});

app.put('/usuario/:id', function(req, res) {

    let id = req.params.id;

    //retorna lo que sea que mandé de parametro
    res.json({
        id
    });
});

app.delete('/usuario', function(req, res) {
    res.json('delete Usuario')
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', process.env.PORT);
});