import supabase from './db-client.js';

const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('leadflow_leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { name, phone, email, source, service, estimated_value } = req.body;
      if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required.' });
      const { data, error } = await supabase.from('leadflow_leads').insert({ name, phone, email, source: source || 'Website', service: service || 'General inquiry', estimated_value: Number(estimated_value) || 0, status: 'New', outcome: 'Pending', response_seconds: 0 }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, outcome, status } = req.body;
      if (!id) return res.status(400).json({ error: 'Lead id is required.' });
      const updates = {};
      if (outcome) updates.outcome = outcome;
      if (status) updates.status = status;
      const { data, error } = await supabase.from('leadflow_leads').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('leadflow_leads').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Leads API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
