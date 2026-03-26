'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
interface MediaItem { id:string;type:'highlight'|'clip'|'thumbnail'|'banner';title:string;matchId?:string;url:string;duration?:number;views:number;shares:number;status:'processing'|'ready'|'published'|'archived';createdAt:string; }
interface StreamStatus { platform:string;isLive:boolean;viewers:number;streamKey?:string;rtmpUrl?:string; }
export default function AdminMediaPage() {
  const [media,setMedia]=useState<MediaItem[]>([]);
  const [streams,setStreams]=useState<StreamStatus[]>([]);
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState<'highlights'|'streams'|'social'|'settings'>('highlights');
  const [toast,setToast]=useState<{msg:string;type:'ok'|'err'}|null>(null);
  const showToast=(msg:string,type:'ok'|'err'='ok')=>{setToast({msg,type});setTimeout(()=>setToast(null),3000);};
  const fetchData=useCallback(async()=>{
    try{const[mRes,sRes]=await Promise.all([fetch('/api/admin/media'),fetch('/api/admin/streams')]);if(mRes.ok){const d=await mRes.json();setMedia(d.media||[]);}if(sRes.ok){const d=await sRes.json();setStreams(d.streams||[]);}}
    catch{/* keep */}finally{setLoading(false);}
  },[]);
  useEffect(()=>{fetchData();const i=setInterval(fetchData,15000);return()=>clearInterval(i);},[fetchData]);
  const handleGenerateHighlight=async(matchId:string)=>{
    try{const res=await fetch('/api/admin/media/generate-highlight',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({matchId})});if(res.ok)showToast('Highlight generation queued!');else showToast('Failed to queue','err');}
    catch{showToast('Network error','err');}
  };
  const totalViews=media.reduce((a,m)=>a+m.views,0);
  const totalShares=media.reduce((a,m)=>a+m.shares,0);
  const liveStreams=streams.filter(s=>s.isLive).length;
  return (
    <AdminLayout>
      {toast&&<div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-bold shadow-lg ${toast.type==='ok'?'bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]':'bg-red-500/10 border border-red-500/30 text-red-400'}`}>{toast.msg}</div>}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-black font-space-grotesk text-white">Media Center</h1><p className="text-white/40 text-sm mt-1">Highlight reels, streaming pipeline, and social content management</p></div>
        <div className="flex gap-2">
          <button onClick={()=>handleGenerateHighlight('latest')} className="px-3 py-1.5 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#8b5cf6] text-xs font-bold rounded-lg hover:bg-[#8b5cf6]/20 transition-all">Generate Highlight</button>
          <button className="px-3 py-1.5 bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-xs font-bold rounded-lg hover:bg-[#ef4444]/20 transition-all">Go Live</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[{label:'Total Media Items',value:media.length,color:'#00ff88'},{label:'Total Views',value:`${(totalViews/1000).toFixed(1)}K`,color:'#0ea5e9'},{label:'Total Shares',value:totalShares.toLocaleString(),color:'#8b5cf6'},{label:'Live Streams',value:liveStreams,color:'#ef4444'}].map((s: {label: string; value: string|number; color: string}) => (
          <div key={s.label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4"><p className="text-xs text-white/40 mb-1">{s.label}</p><p className="text-2xl font-black font-space-grotesk" style={{color:s.color}}>{s.value}</p></div>
        ))}
      </div>
      <div className="flex gap-2 mb-6 border-b border-white/10">
        {(['highlights','streams','social','settings'] as const).map((t) =>(<button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-bold capitalize transition-all border-b-2 -mb-px ${tab===t?'text-[#00ff88] border-[#00ff88]':'text-white/40 border-transparent hover:text-white/60'}`}>{t}</button>))}
      </div>
      {tab==='highlights'&&(
        <div className="space-y-4">
          {loading?<div className="flex items-center justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88] animate-spin"/></div>
          :media.length===0?<div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-8 text-center"><div className="text-4xl mb-3">🎬</div><p className="text-white/40 text-sm">No media items yet</p><p className="text-white/20 text-xs mt-1">Highlights are auto-generated after matches complete</p></div>
          :media.map(item=>(
            <div key={item.id} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-10 bg-white/5 rounded-lg flex items-center justify-center text-2xl">{item.type==='highlight'?'🎬':item.type==='clip'?'✂️':item.type==='thumbnail'?'🖼️':'🏷️'}</div>
                <div><p className="font-bold text-white text-sm">{item.title}</p><div className="flex items-center gap-2 mt-0.5"><span className="text-xs text-white/30 capitalize">{item.type}</span>{item.duration&&<span className="text-xs text-white/20">{Math.floor(item.duration/60)}:{String(item.duration%60).padStart(2,'0')}</span>}</div></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right"><p className="text-xs text-white/40">{item.views.toLocaleString()} views</p><p className="text-xs text-white/20">{item.shares} shares</p></div>
                <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${item.status==='published'?'bg-[#00ff88]/10 text-[#00ff88]':item.status==='ready'?'bg-[#0ea5e9]/10 text-[#0ea5e9]':item.status==='processing'?'bg-[#f59e0b]/10 text-[#f59e0b]':'bg-white/5 text-white/30'}`}>{item.status}</span>
                <div className="flex gap-1">
                  <button className="px-2.5 py-1 bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg hover:border-white/20 transition-all">View</button>
                  <button className="px-2.5 py-1 bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg hover:border-white/20 transition-all">Share</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==='streams'&&(
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[{platform:'Twitch',icon:'🟣',color:'#9146ff'},{platform:'YouTube',icon:'🔴',color:'#ff0000'},{platform:'Kick',icon:'🟢',color:'#53fc18'},{platform:'X (Twitter)',icon:'⚫',color:'#ffffff'}].map((p: {platform: string; icon: string; color: string}) =>{
              const s=streams.find(s=>s.platform===p.platform);
              return (
                <div key={p.platform} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2"><span className="text-2xl">{p.icon}</span><span className="font-bold text-white">{p.platform}</span></div>
                    <div className="flex items-center gap-2">
                      {s?.isLive&&<div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/><span className="text-xs text-red-400 font-bold">LIVE</span></div>}
                      <span className="text-xs text-white/40">{s?.viewers||0} viewers</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div><label className="text-xs text-white/40 block mb-1">Stream Key</label><input type="password" placeholder="Enter stream key..." defaultValue={s?.streamKey||''} className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#00ff88]/40"/></div>
                    <div><label className="text-xs text-white/40 block mb-1">RTMP URL</label><input placeholder="rtmp://..." defaultValue={s?.rtmpUrl||''} className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#00ff88]/40"/></div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all" style={{background:`${p.color}15`,border:`1px solid ${p.color}40`,color:p.color}}>{s?.isLive?'Stop Stream':'Start Stream'}</button>
                    <button className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg hover:border-white/20 transition-all">Save</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {tab==='social'&&(
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5"><h3 className="font-bold text-white font-space-grotesk mb-4">Auto-Post Settings</h3>
            <div className="space-y-3">
              {[{label:'Post match highlights automatically',key:'autoHighlight'},{label:'Post elimination moments',key:'autoElim'},{label:'Post leaderboard updates',key:'autoLeader'},{label:'Post $MURPH burn events',key:'autoBurn'}].map((s: {label: string; key: string}) => (
                <div key={s.key} className="flex items-center justify-between p-3 bg-white/3 rounded-lg">
                  <span className="text-sm text-white/70">{s.label}</span>
                  <button className="w-10 h-5 bg-[#00ff88] rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5"/></button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5"><h3 className="font-bold text-white font-space-grotesk mb-4">Post to Social</h3>
            <div className="space-y-3">
              <div><label className="text-xs text-white/40 block mb-1">Message</label><textarea rows={3} placeholder="Share an update..." className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff88]/40 resize-none"/></div>
              <div className="flex flex-wrap gap-2">{['Twitter/X','Discord','Telegram','Reddit'].map((p: string) =>(<label key={p} className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="w-3 h-3 accent-[#00ff88]"/><span className="text-xs text-white/60">{p}</span></label>))}</div>
              <button className="w-full py-2.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-sm font-bold rounded-lg hover:bg-[#00ff88]/20 transition-all">Post Now</button>
            </div>
          </div>
        </div>
      )}
      {tab==='settings'&&(
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5"><h3 className="font-bold text-white font-space-grotesk mb-4">Highlight Generation</h3>
            <div className="space-y-3">
              {[{label:'Min Drama Score for auto-clip',type:'number',default:'75'},{label:'Max clip length (seconds)',type:'number',default:'60'},{label:'Clips per match',type:'number',default:'3'}].map((s: {label: string; type: string; default: string}) => (
                <div key={s.label}><label className="text-xs text-white/40 block mb-1">{s.label}</label><input type={s.type} defaultValue={s.default} className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff88]/40"/></div>
              ))}
              <button className="w-full py-2.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-sm font-bold rounded-lg hover:bg-[#00ff88]/20 transition-all">Save Settings</button>
            </div>
          </div>
          <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5"><h3 className="font-bold text-white font-space-grotesk mb-4">Storage & CDN</h3>
            <div className="space-y-3">
              {[{label:'S3 Bucket',default:'glitched-media'},{label:'CDN Domain',default:'cdn.glitched.gg'},{label:'Max storage (GB)',default:'500'}].map((s: {label: string; default: string}) => (
                <div key={s.label}><label className="text-xs text-white/40 block mb-1">{s.label}</label><input defaultValue={s.default} className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff88]/40"/></div>
              ))}
              <button className="w-full py-2.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-sm font-bold rounded-lg hover:bg-[#00ff88]/20 transition-all">Save Settings</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
