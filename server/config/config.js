//==============================
//Puerto
//==============================
process.env.PORT = process.env.PORT || 3000

//==============================
//Entorno
//==============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

//==============================
//Base de datos
//==============================
let urlDB;

if( process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe'
} else {
    urlDB = 'mongodb+srv://root:wA2P5i7Z3vNLi3EW@cluster0-qukqc.mongodb.net/cafe'
}

process.env.URLDB = urlDB