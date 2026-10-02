import { kv } from '@vercel/kv';

const NS = 'hotwheels-speedoflove:';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id || typeof id !== 'string' || id.length > 20) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const raw = await kv.get(`${NS}${id}`);
    if (!raw) {
      return res.status(404).json({ error: 'No encontrado o expirado' });
    }
    const payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return res.status(200).json(payload);
  } catch (err) {
    console.error('Error leyendo KV:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}
