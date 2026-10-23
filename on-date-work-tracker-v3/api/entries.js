import { db } from 'hatchable';

export const access = 'user';
export const methods = ['GET', 'POST', 'PUT', 'DELETE'];

const fields = ['title','work_date','start_time','end_time','duration_minutes','category','status','priority','description','project_name','tags','technologies_used','challenges_faced','solution_outcome','additional_notes'];
const asText = (v, max=10000) => String(v ?? '').trim().slice(0,max);
function clean(body={}) {
  const title=asText(body.title,200);
  if (!title) throw new Error('Work title is required.');
  const date=asText(body.work_date,10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Choose a valid work date.');
  const start=asText(body.start_time,5), end=asText(body.end_time,5);
  if (start && !/^([01]\d|2[0-3]):[0-5]\d$/.test(start)) throw new Error('Invalid start time.');
  if (end && !/^([01]\d|2[0-3]):[0-5]\d$/.test(end)) throw new Error('Invalid end time.');
  let duration=Number(body.duration_minutes)||0;
  if (start && end) {
    const [sh,sm]=start.split(':').map(Number),[eh,em]=end.split(':').map(Number);
    duration=eh*60+em-sh*60-sm;
    if(duration<=0) throw new Error('End time must be later than start time.');
  }
  const categories=['Development','Meeting','Learning','Research','Design','Testing','Documentation','Planning','Other'];
  const statuses=['Not Started','In Progress','Completed','On Hold'];
  const priorities=['Low','Medium','High','Urgent'];
  const tags=Array.isArray(body.tags)?body.tags.slice(0,30).map(t=>asText(t,50)).filter(Boolean):[];
  return {
    title,work_date:date,start_time:start||null,end_time:end||null,duration_minutes:Math.min(duration,1440),
    category:categories.includes(body.category)?body.category:'Other',
    status:statuses.includes(body.status)?body.status:'In Progress',
    priority:priorities.includes(body.priority)?body.priority:'Medium',
    description:asText(body.description),project_name:asText(body.project_name,200),tags,
    technologies_used:asText(body.technologies_used,2000),challenges_faced:asText(body.challenges_faced),
    solution_outcome:asText(body.solution_outcome),additional_notes:asText(body.additional_notes)
  };
}
export default async function(req,res) {
  try {
    const userId=String(req.user.id);
    if(req.method==='GET') {
      const {rows}=await db.query('SELECT id, title, work_date::text AS work_date, start_time, end_time, duration_minutes, category, status, priority, description, project_name, tags, technologies_used, challenges_faced, solution_outcome, additional_notes, created_at, updated_at FROM work_entries WHERE user_id=$1 ORDER BY work_date DESC, start_time DESC NULLS LAST, id DESC',[userId]);
      return res.json({entries:rows});
    }
    if(req.method==='POST') {
      const x=clean(req.body||{});
      const {rows}=await db.query('INSERT INTO work_entries (user_id,title,work_date,start_time,end_time,duration_minutes,category,status,priority,description,project_name,tags,technologies_used,challenges_faced,solution_outcome,additional_notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16) RETURNING id, title, work_date::text AS work_date, start_time, end_time, duration_minutes, category, status, priority, description, project_name, tags, technologies_used, challenges_faced, solution_outcome, additional_notes, created_at, updated_at',[userId,x.title,x.work_date,x.start_time,x.end_time,x.duration_minutes,x.category,x.status,x.priority,x.description,x.project_name,JSON.stringify(x.tags),x.technologies_used,x.challenges_faced,x.solution_outcome,x.additional_notes]);
      return res.status(201).json({entry:rows[0]});
    }
    const id=Number((req.body||{}).id);
    if(!Number.isSafeInteger(id)||id<1) return res.status(400).json({error:'A valid entry id is required.'});
    if(req.method==='DELETE') {
      const result=await db.query('DELETE FROM work_entries WHERE id=$1 AND user_id=$2 RETURNING id',[id,userId]);
      if(!result.rows.length) return res.status(404).json({error:'Work entry not found.'});
      return res.json({ok:true});
    }
    const x=clean(req.body||{});
    const {rows}=await db.query('UPDATE work_entries SET title=$3,work_date=$4,start_time=$5,end_time=$6,duration_minutes=$7,category=$8,status=$9,priority=$10,description=$11,project_name=$12,tags=$13::jsonb,technologies_used=$14,challenges_faced=$15,solution_outcome=$16,additional_notes=$17,updated_at=now() WHERE id=$1 AND user_id=$2 RETURNING id,title,work_date::text AS work_date,start_time,end_time,duration_minutes,category,status,priority,description,project_name,tags,technologies_used,challenges_faced,solution_outcome,additional_notes,created_at,updated_at',[id,userId,x.title,x.work_date,x.start_time,x.end_time,x.duration_minutes,x.category,x.status,x.priority,x.description,x.project_name,JSON.stringify(x.tags),x.technologies_used,x.challenges_faced,x.solution_outcome,x.additional_notes]);
    if(!rows.length) return res.status(404).json({error:'Work entry not found.'});
    return res.json({entry:rows[0]});
  } catch(e) {
    const message=e.message||'Could not process this work entry.';
    return res.status(message.includes('required')||message.includes('valid')||message.includes('time')?400:500).json({error:message});
  }
}