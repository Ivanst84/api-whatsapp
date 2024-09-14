// routes/whatsapp.js
const express = require('express');
const router = express.Router();
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');

// Inicializar el cliente de WhatsApp
const client = new Client({
    puppeteer: {
        headless: true, // Ejecuta sin abrir el navegador
        args: ['--no-sandbox', '--disable-setuid-sandbox']

    },
});


let receivedMessages = []; // Arreglo para almacenar los mensajes recibidos
let qrCodeUrl = ''; // Variable para almacenar el código QR

client.on('qr', (qr) => {
    console.log('QR code generated');
    qrcode.toDataURL(qr, (err, url) => {
        if (err) {
            console.error('Error al generar el código QR:', err);
            return;
        }
        qrCodeUrl = url; // Guardar el QR en formato de URL base64
    });
});



client.on('ready', async () => {
    console.log('Client is ready!');
    
    // Enviar un mensaje de prueba al número 51 6864631530
    try {
        const chatId = '516864631530@c.us'; // Número de destino con formato internacional
        const message = 'Mensaje de prueba enviado automáticamente al iniciar sesión';
        
        await client.sendMessage(chatId, message);
        console.log('Mensaje de prueba enviado al número 51 6864631530');
    } catch (error) {
        console.error('Error al enviar el mensaje de prueba:', error);
    }
});

client.on('message_create', (message) => {
    console.log('Mensaje recibido:', message.body);

    // Guardar los mensajes entrantes
    receivedMessages.push({
        id: message.id._serialized,
        from: message.from,
        body: message.body,
        timestamp: message.timestamp,
    });

    // Ejemplo de respuesta a un comando específico
    if (message.body === '!ping') {
        message.reply('pong');
    }
});

client.initialize();

// Endpoint para enviar un mensaje
router.post('/send', async (req, res) => {
    const { numeroDestino, mensaje } = req.body;

    if (!numeroDestino || !mensaje) {
        return res.status(400).json({ error: 'Número de destino y mensaje son requeridos' });
    }

    try {
        const chatId = `${numeroDestino}@c.us`;
        const response = await client.sendMessage(chatId, mensaje);
        res.json({ message: 'Mensaje enviado', response });
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        res.status(500).json({ error: 'Error al enviar mensaje' });
    }
});

// Endpoint para obtener los mensajes recibidos
router.get('/messages', (req, res) => {
    res.json({ messages: receivedMessages });
});
// Endpoint para verificar si la sesión está activa
router.get('/check-session', (req, res) => {
    const sessionActive = client.info !== undefined; // Verificar si la sesión está activa
    res.json({ loggedIn: sessionActive });
});


// Endpoint para obtener el código QR en formato base64
router.get('/qr', (req, res) => {
    if (qrCodeUrl) {
        res.json({ qrCode: qrCodeUrl });
    } else {
        res.status(500).json({ error: 'QR no disponible' });
    }
});

module.exports = router;
