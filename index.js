const express = require('express');
const app = express();
const allowedIP = '45.232.149.146'; // 🔹 Cambia esto por la IP autorizada

app.use(express.json());

// 🛡️ Middleware para filtrar IPs
app.use((req, res, next) => {
  const clientIP =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '';

  if (
    clientIP.includes(allowedIP) ||      // IP autorizada
    clientIP.includes('127.0.0.1') ||    // localhost
    clientIP.includes('::1') ||          // IPv6 localhost
    clientIP.includes('10.') ||          // red interna Render
    clientIP.includes('172.') ||
    clientIP.includes('192.168')
  ) {
    next();
  } else {
    console.warn(`❌ Acceso bloqueado desde IP: ${clientIP}`);
    return res.status(403).json({ message: 'Acceso denegado: IP no autorizada' });
  }
});

// 🔹 Tus rutas aquí
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente ✅');
});

// 🔹 Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));


