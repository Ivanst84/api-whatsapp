const express = require('express');
const router = express.Router();
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');

let clients = {}; // Manejamos las sesiones en el navegador

router.get('/generate-qr', (req, res) => {
  const client = new Client();
  clients[req.ip] = client; // Manejamos la sesión por dirección IP del cliente

  client.on('qr', (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
      if (err) return res.status(500).json({ error: 'Error al generar el QR' });
      res.json({ qrCode: url });
    });
  });

  client.initialize();
});

router.post('/send-message', async (req, res) => {
  const { recipient, message } = req.body;
  const client = clients[req.ip];

  if (!client) return res.status(400).json({ error: 'Sesión no iniciada' });

  try {
    await client.sendMessage(`${recipient}@c.us`, message);
    res.json({ status: 'Mensaje enviado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
});

module.exports = router;
