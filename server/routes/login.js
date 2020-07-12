const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        let token = jwt.sign({
                usuario: usuarioDB
            }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }) //60seg * 60min = 1hr ------- * 24hrs * 30dias = para que expire en unos 30 dias
        res.json({
            ok: true,
            usuario: usuarioDB,
            token, //: token como son iguales los nombres se elimina esta redundancia, ECM6
            alejandro: 'Probando cambio para heroku'

            //para verificar el token resultante se puede ir a https://jwt.io/

            /**
             * ver nota en Endnote paigna Token, Ebook
             * no aparecerá el password gracias a la configuracion del modelo. Se excluyó
             * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjp7InJvbGUiOiJVU0VSX1JPTEUiLCJlc3RhZG8iOnRydWUsImdvb2dsZSI6dHJ1ZSwiX2lkIjoiNWVmOTM1YzY4Y2I2NWQ0ZDZjNzNkODJmIiwibm9tYnJlIjoiVGVzdCAxIiwiZW1haWwiOiJ0ZXN0MUBnbWFpbC5jb20iLCJfX3YiOjB9LCJpYXQiOjE1OTM5OTUxNTAsImV4cCI6MTU5NjU4NzE1MH0.o4Q2LVYLY6ca1jR89T56KH0DHci3t4gFwrJ8KPCGz6Y
             * es 
             * {
                "usuario": {
                "role": "USER_ROLE",
                "estado": true,
                "google": true,
                "_id": "5ef935c68cb65d4d6c73d82f",
                "nombre": "Test 1",
                "email": "test1@gmail.com",
                "__v": 0
            },
            "iat": 1593995150,
            "exp": 1596587150
        }
        * 
        */
        });

    });

});

//Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload(); //con el payload ya tengo todo lo del usuario (nombre, email, imagen...)

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                err: e
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //si ya existe el usuario en mi bd logueado debo revisar si se ha autenticado por Google
        if (usuarioDB) {
            if (usuarioDB.google === false) { // ya esta autenticado pero no por google. Estaá ahora intentando autenticarse por Google.. no debe ser permitido
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usar su autenticación normal'
                    }
                });
            } else { //realmente fue autenticado por google previamente, entonces RENUEVO su token (el token personalizado mio y lo regreso)
                let token = jwt.sign({
                        usuario: usuarioDB
                    }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }) //60seg * 60min = 1hr ------- * 24hrs * 30dias = para que expire en unos 30 dias

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            //si el usuario no existe en nuestra BD. Primera vez que se está autenticando
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'; //solo para pasar la validacion porque es requerido pero el hash hara 10 vueltas para encriptacion y no lo dejará pasar

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                //genero un nuevo token aqui
                let token = jwt.sign({
                        usuario: usuarioDB
                    }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }) //60seg * 60min = 1hr ------- * 24hrs * 30dias = para que expire en unos 30 dias

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token

                });


            });
        }
    });

});
module.exports = app;