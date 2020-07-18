const express = require('express');

const fs = require('fs'); //file system
const path = require('path'); //para obtener el path absoluto

const { VerificaTokenImg } = require('../middlewares/autenticacion'); //para proteger la imagen

let app = express();

app.get('/imagen/:tipo/:img', VerificaTokenImg, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

    //si existe la imagen en el directorio enviado se muestra, sino se muestra la imagen not found
    if (fs.existsSync(pathImagen)) {
        res.sendfile(pathImagen);
    } else {
        let noImagePath = path.resolve(__dirname, '../assets/no-image-found.jpg');
        res.sendFile(noImagePath);
    }
});


module.exports = app;