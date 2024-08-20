const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mysql = require('mysql2');
const myConnection = require('express-myconnection');

const app = express();

// Importar rutas
const customerRoutes = require('./routes/customer');

// Configuraciones
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(morgan('dev'));
app.use(myConnection(mysql, {
    host: 'ARN: DATABASE point',
    user: 'admin',
    password: 'passwordfromAWS',
    port: 3306,
    database: 'database name'
}, 'single'));
app.use(express.urlencoded({ extended: false }));

// Rutas
app.use('/', customerRoutes);

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar el servidor
app.listen(app.get('port'), () => {
    console.log(`Servidor en el puerto ${app.get('port')}`);
});
