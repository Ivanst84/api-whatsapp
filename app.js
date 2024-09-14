const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3004;

// Importar rutas
const whatsappRoutes = require('./routes/whatsapp');

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Filtrar cabeceras innecesarias
app.use((req, res, next) => {
    delete req.headers['connection'];
    delete req.headers['keep-alive'];
    delete req.headers['content-type']; // Puedes eliminar otras cabeceras si es necesario
    delete req.headers['postman-token'];
    next();
});

// Usar rutas
app.use('/api/whatsapp', whatsappRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
