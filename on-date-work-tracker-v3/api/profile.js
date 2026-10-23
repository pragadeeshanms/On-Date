import { db } from 'hatchable';
export const access = 'user';
export const methods = ['GET','POST'];
export default async function(req,res) {
  if(req.method==='GET') {
    const {rows}=await db.query('SELECT display_name, role_label FROM user_profiles LIMIT 1');
    return res.json({profile:rows[0]||null});
  }
  const name=String(req.body?.display_name||'').trim().slice(0,70)||'Praga';
  const role=String(req.body?.role_label||'').trim().slice(0,100)||'Personal workspace';
  const {rows}=await db.query('INSERT INTO user_profiles (display_name,role_label) VALUES ($1,$2) ON CONFLICT (user_id) DO UPDATE SET display_name=EXCLUDED.display_name, role_label=EXCLUDED.role_label, updated_at=now() RETURNING display_name,role_label',[name,role]);
  return res.json({profile:rows[0]});
}