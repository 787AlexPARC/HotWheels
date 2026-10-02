import { kv } from '@vercel/kv';

const NS = 'hotwheels-speedoflove:';

function generateShortId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cars, defaultCar } = req.body || {};

    if (!Array.isArray(cars) || cars.length === 0) {
      return res.status(400).json({ error: 'No hay carritos para guardar' });
    }

    let id = generateShortId();
    let attempts = 0;
    while (await kv.exists(`${NS}${id}`)) {
      id = generateShortId();
      attempts++;
      if (attempts > 5) return res.status(500).json({ error: 'No se pudo generar ID único' });
    }

    const payload = { cars, defaultCar, createdAt: Date.now() };
    await kv.set(`${NS}${id}`, JSON.stringify(payload), { ex: 60 * 60 * 24 * 90 });

    return res.status(200).json({ id });
  } catch (err) {
    console.error('Error guardando en KV:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}
