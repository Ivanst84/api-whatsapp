const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const router = express.Router();

// Sesiones activas
let sessions = {};

const createClient = (sessionId) => {
    const client = new Client({
        puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
        session: sessions[sessionId],  // Cargar sesión si existe
    });

    // Guardar QR para que el cliente lo escanee
    client.on('qr', (qr) => {
        console.log(`QR Code generado para el cliente ${sessionId}`);
        qrcode.toDataURL(qr, (err, url) => {
            if (err) {
                console.error(`Error generando QR para el cliente ${sessionId}:`, err);
                return;
            }
            sessions[sessionId].qr = url;  // Guardar el QR en la sesión
        });
    });

    // Guardar sesión cuando esté lista
    client.on('ready', () => {
        console.log(`Cliente ${sessionId} está listo`);
        sessions[sessionId].ready = true;
    });

    // Guardar estado de la sesión
    client.on('authenticated', (sessionData) => {
        console.log(`Cliente ${sessionId} autenticado`);
        sessions[sessionId].session = sessionData;
        fs.writeFileSync(`./session-${sessionId}.json`, JSON.stringify(sessionData));
    });

    client.initialize();

    return client;
};

// Endpoint para obtener el código QR del cliente
router.get('/qr/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    if (!sessions[sessionId]) {
        sessions[sessionId] = {}; // Crear sesión vacía
        createClient(sessionId);   // Inicializar cliente para esa sesión
    }

    const qrCode = sessions[sessionId].qr;
    if (qrCode) {
        res.json({ qrCode });
    } else {
        res.status(500).json({ error: 'QR no disponible' });
    }
});

// Endpoint para enviar mensaje
router.post('/send-message', async (req, res) => {
    const { sessionId, recipient, message } = req.body;
    const client = sessions[sessionId]?.client;

    if (!client || !sessions[sessionId].ready) {
        return res.status(400).json({ error: 'Sesión no iniciada o no lista' });
    }

    try {
        await client.sendMessage(`${recipient}@c.us`, message);
        res.json({ status: 'Mensaje enviado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al enviar el mensaje' });
    }
});

module.exports = router;
