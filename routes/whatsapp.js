const express = require('express');
const router = express.Router();
const sessions = {}; // Almacena las sesiones activas

// Endpoint para comprobar si la sesión está activa
router.get('/check-session', (req, res) => {
    const sessionActive = sessions[req.ip] !== undefined;
    res.json({ loggedIn: sessionActive });
});

// Endpoint para guardar la sesión cuando se inicia
router.post('/save-session', (req, res) => {
    const sessionData = req.body.session;
    sessions[req.ip] = sessionData; // Asigna la sesión a la IP del cliente
    res.json({ status: 'Sesión guardada' });
});

module.exports = router;
