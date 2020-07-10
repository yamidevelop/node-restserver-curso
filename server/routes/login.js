const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
            token //: token como son iguales los nombres se elimina esta redundancia, ECM6

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

module.exports = app;