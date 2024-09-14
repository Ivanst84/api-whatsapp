const express = require('express');
const router = express.Router();
const { Client } = require('whatsapp-web.js');

let sessions = {}; // Manejar las sesiones activas por IP del cliente

router.post('/send-message', async (req, res) => {
  const { recipient, message } = req.body;
  const client = sessions[req.ip]; // Obtener el cliente activo por IP

  if (!client) return res.status(400).json({ error: 'Sesión no iniciada' });

  try {
    await client.sendMessage(`${recipient}@c.us`, message);
    res.json({ status: 'Mensaje enviado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
});

module.exports = router;

