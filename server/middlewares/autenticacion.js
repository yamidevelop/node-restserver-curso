const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

//==============================================
//Verificar Token
//==============================================
let verificaToken = (req, res, next) => {
    let token = req.get('token'); //si es Autherization como parametro en el header seria 'Autherization'


    //en el decoded está la info del usuario. (param header, nombre firma, callback)
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({ //401 error de autorizacion
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next(); //ejecutar el 3er parametro porque sino donde se llame la funcion se va a detener
    });



};


//==============================================
//Verifica AdminRole
//==============================================
let VerificaAdmin_Role = (req, res, next) => {

    let usuario = req.usuario;
    let UsuarioDB = Usuario.find({ id: usuario.id })

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {

        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        })
    }
}


module.exports = {
    verificaToken,
    VerificaAdmin_Role
}