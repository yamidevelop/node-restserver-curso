//================================
// Puerto
// ===============================

process.env.PORT = process.env.PORT || 3000;


//================================
// Entorno
// ===============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//================================
// Vencimiento del Token
// ===============================
// 60 segundos 
// 60 minutos 
// 24 horas
// 30 días
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30; //60seg * 60min = 1hr ------- * 24hrs * 30dias = para que expire en unos 30 dias

//================================
// SEED de autenticación
// ===============================
process.env.SEED = process.env.SEED || 'secret-desarrollo'; //significa que voy a declararme una variable en heroku que sea el zip de mi aplicacion

//================================
// Base de datos
// ===============================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.urlDB = urlDB;