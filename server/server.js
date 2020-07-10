require('./config/config');

const express = require('express');
const mongoose = require('mongoose');

const app = express();

const bodyParser = require('body-parser');
// const app = require('./routes/usuario');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//configuración global de rutas
app.use(require('./routes/index'));


mongoose.connect(process.env.urlDB, { useNewUrlParser: true, useCreateIndex: true },
    (err, res) => {
        if (err)
            console.log('base de datos offline, no se pudo conectar');
        else
            console.log('Base de datos ONLINE');
    });

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', process.env.PORT);
});