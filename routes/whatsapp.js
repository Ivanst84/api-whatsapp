const express = require('express');
const router = express.Router();
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');

// Inicializar dos clientes de WhatsApp
const client1 = new Client({
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

const client2 = new Client({
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

let qrCodeUrl1 = ''; // QR para el primer cliente
let qrCodeUrl2 = ''; // QR para el segundo cliente

// QR para el cliente 1
client1.on('qr', (qr) => {
    console.log('QR code generated for client 1');
    qrcode.toDataURL(qr, (err, url) => {
        if (err) {
            console.error('Error al generar el código QR para el cliente 1:', err);
            return;
        }
        qrCodeUrl1 = url;
    });
});

// QR para el cliente 2
client2.on('qr', (qr) => {
    console.log('QR code generated for client 2');
    qrcode.toDataURL(qr, (err, url) => {
        if (err) {
            console.error('Error al generar el código QR para el cliente 2:', err);
            return;
        }
        qrCodeUrl2 = url;
    });
});
// Iniciar ambos clientes
client1.initialize();
client2.initialize();

// Verificar si ambos están listos
client1.on('ready', () => console.log('Client 1 is ready!'));
client2.on('ready', () => console.log('Client 2 is ready!'));

// Endpoint para obtener el código QR del cliente 1
router.get('/qr1', (req, res) => {
    if (qrCodeUrl1) {
        res.json({ qrCode: qrCodeUrl1 });
    } else {
        res.status(500).json({ error: 'QR para cliente 1 no disponible' });
    }
});

// Endpoint para obtener el código QR del cliente 2
router.get('/qr2', (req, res) => {
    if (qrCodeUrl2) {
        res.json({ qrCode: qrCodeUrl2 });
    } else {
        res.status(500).json({ error: 'QR para cliente 2 no disponible' });
    }
});

// Verificar si ambos clientes están listos
router.get('/check-sessions', (req, res) => {
    const session1Active = client1.info !== undefined;
    const session2Active = client2.info !== undefined;
    res.json({ session1Active, session2Active });
});

// Iniciar una conversación entre ambos números
router.post('/start-conversation', async (req, res) => {
    const chatId1 = 'NUMBER1@c.us'; // Número 1 en formato internacional
    const chatId2 = 'NUMBER2@c.us'; // Número 2 en formato internacional

    if (client1.info && client2.info) { // Verificar que ambos clientes estén activos
        try {
            await client1.sendMessage(chatId2, '¡Hola, soy el cliente 1!');
            await client2.sendMessage(chatId1, '¡Hola, soy el cliente 2!');
            res.json({ message: 'Conversación iniciada entre los dos clientes.' });
        } catch (error) {
            console.error('Error al iniciar la conversación:', error);
            res.status(500).json({ error: 'Error al iniciar la conversación.' });
        }
    } else {
        res.status(400).json({ error: 'Ambos clientes deben estar conectados.' });
    }
});

module.exports = router;
