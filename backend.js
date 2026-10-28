(()=>{
 const c=window.QUALIFIER_CONFIG;
 const settings=c.supabase||{};
 const valid=()=>{
  const key=settings.publishableKey||'';
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(settings.url||'')||!key||/service_role|sb_secret_/.test(key))return false;
  if(key.startsWith('sb_publishable_'))return true;
  try{return JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).role==='anon';}catch{return false;}
 };
 // Apenas chave publicável. O formulário nunca usa a sessão da equipe.
 window.QualifierBackend={
  configured:valid(),
  async submit(payload,website=''){
   if(!valid())throw Error('unconfigured');
   const r=await fetch(settings.url+'/rest/v1/rpc/tp_submit_lead',{method:'POST',headers:{'Content-Type':'application/json',apikey:settings.publishableKey},body:JSON.stringify({p_submission_id:payload.submission_id,p_answers:payload.answers,p_source:payload.source,p_notice_version:payload.notice_version,p_website:website}),signal:AbortSignal.timeout(15000)});
   if(!r.ok)throw Error('submit_failed');
   const data=await r.json();
   if(data.submission_id!==payload.submission_id||typeof data.stored!=='boolean')throw Error('receipt_invalid');
   return data;
  },
  client(){if(!valid()||!window.supabase) return null;return window.supabase.createClient(settings.url,settings.publishableKey,{auth:{storage:sessionStorage,storageKey:'3pilares-team',persistSession:true,detectSessionInUrl:false}});}
 };
})();
