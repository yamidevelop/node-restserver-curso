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
process.env.CADUCIDAD_TOKEN = '48h'; //60seg * 60min = 1hr ------- * 24hrs * 30dias = para que expire en unos 30 dias

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


//================================
// Google Client ID
// ===============================
process.env.CLIENT_ID = process.env.CLIENT_ID || '943475747563-24397tpsgrl50d0ivt6gpitca11uq36a.apps.googleusercontent.com';
// esto es porque desde Herokuu puedo cammbiarlo. El client id es el que me dio Google para esta app