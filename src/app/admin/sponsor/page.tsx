'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
interface Sponsor { id:string;name:string;tier:string;website?:string;spend:number;impressions:number;clicks:number;status:string;contractStart:string;contractEnd:string;placements:string[]; }
const TIER_COLORS:Record<string,{text:string;bg:string;border:string}>={platinum:{text:'#e2e8f0',bg:'#e2e8f015',border:'#e2e8f040'},gold:{text:'#f59e0b',bg:'#f59e0b15',border:'#f59e0b40'},silver:{text:'#9ca3af',bg:'#9ca3af15',border:'#9ca3af40'},bronze:{text:'#b45309',bg:'#b4530915',border:'#b4530940'}};
const TIER_PRICES:Record<string,number>={platinum:50000,gold:20000,silver:8000,bronze:2000};
const PLACEMENTS=['Arena Banner','Match Intro','Elimination Splash','Victory Screen','Chat Sidebar','Prediction Market','Leaderboard Header','Mobile Banner'];
export default function AdminSponsorPage() {
  const [sponsors,setSponsors]=useState<Sponsor[]>([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [editSponsor,setEditSponsor]=useState<Sponsor|null>(null);
  const [toast,setToast]=useState<{msg:string;type:'ok'|'err'}|null>(null);
  const [form,setForm]=useState({name:'',tier:'gold',website:'',status:'pending',contractStart:'',contractEnd:'',placements:[] as string[]});
  const showToast=(msg:string,type:'ok'|'err'='ok')=>{setToast({msg,type});setTimeout(()=>setToast(null),3000);};
  const fetchSponsors=useCallback(async()=>{
    try{const res=await fetch('/api/admin/sponsors');if(res.ok){const d=await res.json();setSponsors(d.sponsors||[]);}}
    catch{/* keep */}finally{setLoading(false);}
  },[]);
  useEffect(()=>{fetchSponsors();},[fetchSponsors]);
  const handleSave=async()=>{
    try{const url=editSponsor?`/api/admin/sponsors/${editSponsor.id}`:'/api/admin/sponsors';const res=await fetch(url,{method:editSponsor?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});if(res.ok){showToast(editSponsor?'Sponsor updated':'Sponsor added');setShowForm(false);setEditSponsor(null);fetchSponsors();}else showToast('Save failed','err');}
    catch{showToast('Network error','err');}
  };
  const totalRevenue=sponsors.reduce((a,s)=>a+s.spend,0);
  const activeCount=sponsors.filter(s=>s.status==='active').length;
  return (
    <AdminLayout>
      {toast&&<div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-bold shadow-lg ${toast.type==='ok'?'bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]':'bg-red-500/10 border border-red-500/30 text-red-400'}`}>{toast.msg}</div>}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-black font-space-grotesk text-white">Sponsor Management</h1><p className="text-white/40 text-sm mt-1">{activeCount} active · ${totalRevenue.toLocaleString()} total spend</p></div>
        <button onClick={()=>{setShowForm(true);setEditSponsor(null);setForm({name:'',tier:'gold',website:'',status:'pending',contractStart:'',contractEnd:'',placements:[]});}} className="px-4 py-2 bg-[#00ff88] text-[#0a0a0f] font-bold text-sm rounded-lg hover:bg-[#00ff88]/90 transition-all">+ Add Sponsor</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[{label:'Active Sponsors',value:activeCount,color:'#00ff88'},{label:'Total Revenue',value:`$${(totalRevenue/1000).toFixed(0)}K`,color:'#f59e0b'},{label:'Total Impressions',value:`${(sponsors.reduce((a,s)=>a+s.impressions,0)/1000000).toFixed(1)}M`,color:'#0ea5e9'},{label:'Pending Approval',value:sponsors.filter(s=>s.status==='pending').length,color:'#8b5cf6'}].map((s: {label: string; value: string|number; color: string}) => (
          <div key={s.label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4"><p className="text-xs text-white/40 mb-1">{s.label}</p><p className="text-2xl font-black font-space-grotesk" style={{color:s.color}}>{s.value}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(['platinum','gold','silver','bronze'] as const).map(tier=>{const tc=TIER_COLORS[tier];return(<div key={tier} className="rounded-xl p-4 border" style={{background:tc.bg,borderColor:tc.border}}><p className="text-xs font-bold uppercase tracking-wider mb-1" style={{color:tc.text}}>{tier}</p><p className="text-xl font-black font-space-grotesk" style={{color:tc.text}}>{sponsors.filter(s=>s.tier===tier).length}</p><p className="text-xs mt-1" style={{color:tc.text,opacity:0.6}}>${TIER_PRICES[tier].toLocaleString()}/mo</p></div>);})}
      </div>
      <div className="bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10">{['Sponsor','Tier','Status','Spend','Impressions','CTR','Contract','Actions'].map((h: string) =>(<th key={h} className="px-4 py-3 text-left text-xs text-white/40 uppercase tracking-wider">{h}</th>))}</tr></thead>
            <tbody>
              {loading?<tr><td colSpan={8} className="px-4 py-12 text-center"><div className="w-8 h-8 rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88] animate-spin mx-auto"/></td></tr>
              :sponsors.length===0?<tr><td colSpan={8} className="px-4 py-12 text-center text-white/30 text-sm">No sponsors yet</td></tr>
              :sponsors.map(sponsor=>{const tc=TIER_COLORS[sponsor.tier]||TIER_COLORS.bronze;const ctr=sponsor.impressions>0?((sponsor.clicks/sponsor.impressions)*100).toFixed(2):'0.00';return(
                <tr key={sponsor.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3"><div><p className="font-bold text-white">{sponsor.name}</p>{sponsor.website&&<p className="text-xs text-white/30">{sponsor.website}</p>}</div></td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 text-xs rounded font-bold uppercase" style={{background:tc.bg,color:tc.text,border:`1px solid ${tc.border}`}}>{sponsor.tier}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded-full font-bold ${sponsor.status==='active'?'bg-[#00ff88]/10 text-[#00ff88]':sponsor.status==='pending'?'bg-[#f59e0b]/10 text-[#f59e0b]':'bg-white/5 text-white/30'}`}>{sponsor.status}</span></td>
                  <td className="px-4 py-3 text-white font-mono text-xs">${sponsor.spend.toLocaleString()}</td>
                  <td className="px-4 py-3 text-white/60 text-xs">{(sponsor.impressions/1000).toFixed(0)}K</td>
                  <td className="px-4 py-3 text-white/60 text-xs">{ctr}%</td>
                  <td className="px-4 py-3 text-white/40 text-xs">{sponsor.contractEnd?new Date(sponsor.contractEnd).toLocaleDateString():'—'}</td>
                  <td className="px-4 py-3"><button onClick={()=>{setEditSponsor(sponsor);setShowForm(true);setForm({name:sponsor.name,tier:sponsor.tier,website:sponsor.website||'',status:sponsor.status,contractStart:sponsor.contractStart,contractEnd:sponsor.contractEnd,placements:sponsor.placements});}} className="px-2.5 py-1 bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg hover:border-white/20 hover:text-white transition-all">Edit</button></td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      </div>
      {showForm&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#0d0d1a] border border-white/20 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h3 className="font-bold text-white font-space-grotesk text-lg">{editSponsor?'Edit Sponsor':'Add Sponsor'}</h3><button onClick={()=>setShowForm(false)} className="text-white/30 hover:text-white text-xl">x</button></div>
            <div className="space-y-4">
              <div><label className="text-xs text-white/40 block mb-1">Company Name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff88]/40"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-white/40 block mb-1">Tier</label><select value={form.tier} onChange={e=>setForm(f=>({...f,tier:e.target.value}))} className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">{['platinum','gold','silver','bronze'].map((t: string) =><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)} — ${TIER_PRICES[t].toLocaleString()}/mo</option>)}</select></div>
                <div><label className="text-xs text-white/40 block mb-1">Status</label><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">{['pending','active','paused','expired'].map((s: string) =><option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div><label className="text-xs text-white/40 block mb-1">Website</label><input value={form.website} onChange={e=>setForm(f=>({...f,website:e.target.value}))} placeholder="https://..." className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff88]/40"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-white/40 block mb-1">Contract Start</label><input type="date" value={form.contractStart} onChange={e=>setForm(f=>({...f,contractStart:e.target.value}))} className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"/></div>
                <div><label className="text-xs text-white/40 block mb-1">Contract End</label><input type="date" value={form.contractEnd} onChange={e=>setForm(f=>({...f,contractEnd:e.target.value}))} className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"/></div>
              </div>
              <div><label className="text-xs text-white/40 block mb-2">Ad Placements</label><div className="grid grid-cols-2 gap-2">{PLACEMENTS.map(p=>(<label key={p} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.placements.includes(p)} onChange={()=>setForm(f=>({...f,placements:f.placements.includes(p)?f.placements.filter(x=>x!==p):[...f.placements,p]}))} className="w-3 h-3 accent-[#00ff88]"/><span className="text-xs text-white/60">{p}</span></label>))}</div></div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} className="flex-1 py-2.5 bg-[#00ff88] text-[#0a0a0f] font-bold text-sm rounded-lg hover:bg-[#00ff88]/90 transition-all">{editSponsor?'Save Changes':'Add Sponsor'}</button>
                <button onClick={()=>setShowForm(false)} className="px-4 py-2.5 bg-white/5 border border-white/10 text-white/60 text-sm rounded-lg hover:border-white/20 transition-all">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
