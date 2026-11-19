const cacheKey = userId => `devotion-offline-notes:${userId}`;
const pendingKey = userId => `devotion-pending-notes:${userId}`;
const read = (storage,key) => {try {const value=JSON.parse(storage.getItem(key)||'[]');return Array.isArray(value)?value:[];}catch{return [];}};
export function readOfflineNotes(storage,userId) {return read(storage,cacheKey(userId)).filter(note=>note.user_id===userId);}
export function readPendingNotes(storage,userId) {return read(storage,pendingKey(userId)).filter(item=>item.note?.user_id===userId);}
export function cacheOfflineNotes(storage,userId,notes) {storage.setItem(cacheKey(userId),JSON.stringify(notes.filter(note=>note.user_id===userId)));}
export function queueOfflineNote(storage,userId,note,baseUpdatedAt) {
  if(note.user_id!==userId)throw new Error('Note owner mismatch');
  const pending=readPendingNotes(storage,userId);const old=pending.find(item=>item.note.id===note.id);
  const next={note,baseUpdatedAt:old?old.baseUpdatedAt:baseUpdatedAt||null};
  storage.setItem(pendingKey(userId),JSON.stringify([...pending.filter(item=>item.note.id!==note.id),next]));
}
export function mergeOfflineNotes(notes,pending) {const map=new Map(notes.map(note=>[note.id,note]));pending.forEach(item=>map.set(item.note.id,item.note));return [...map.values()];}
export function clearOfflineCache(storage,userId) {storage.removeItem(cacheKey(userId));}
export async function syncOfflineNotes(storage,client,userId) {
  const pending=readPendingNotes(storage,userId);let saved=0;let conflicts=0;
  for(const item of pending){
    const note=item.note;
    const result=await client.from('devotion_notes').select('id,updated_at').eq('user_id',userId).eq('id',note.id).limit(1);
    if(result.error)throw result.error;
    const remote=result.data?.[0];
    if((remote&&remote.updated_at!==item.baseUpdatedAt)||(!remote&&item.baseUpdatedAt)){conflicts++;continue;}
    const write=remote
      ? await client.from('devotion_notes').update(note).eq('id',note.id).eq('user_id',userId).eq('updated_at',item.baseUpdatedAt).select('id')
      : await client.from('devotion_notes').insert(note).select('id');
    if(write.error)throw write.error;
    if(!write.data?.length){conflicts++;continue;}
    const remaining=readPendingNotes(storage,userId).filter(entry=>entry.note.id!==note.id||entry.note.updated_at!==note.updated_at).map(entry=>entry.note.id===note.id?{...entry,baseUpdatedAt:note.updated_at}:entry);
    storage.setItem(pendingKey(userId),JSON.stringify(remaining));saved++;
  }
  return {saved,conflicts};
}
export function forkPendingNote(storage,userId,noteId,newId){
  if(!newId||newId===noteId)throw new Error('A separate note ID is required');
  const pending=readPendingNotes(storage,userId);const item=pending.find(entry=>entry.note.id===noteId);
  if(!item)throw new Error('Pending note is unavailable');
  const copy={...item.note,id:newId,title:`${item.note.title}（離線版本）`,created_at:new Date().toISOString()};
  storage.setItem(pendingKey(userId),JSON.stringify([...pending.filter(entry=>entry.note.id!==noteId),{note:copy,baseUpdatedAt:null}]));
  return copy;
}
