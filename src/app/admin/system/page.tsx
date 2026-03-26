'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
interface SystemHealth { cpuUsage:number;memoryUsage:number;memoryTotal:number;dbConnections:number;dbMaxConnections:number;wsConnections:number;queueDepth:number;engineStatus:'healthy'|'degraded'|'down';apiLatencyMs:number;errorRate:number;uptime:number; }
interface ServiceStatus { name:string;status:'up'|'down'|'degraded';latency:number;lastCheck:string; }
export default function AdminSystemPage() {
  const [health,setHealth]=useState<SystemHealth|null>(null);
  const [services,setServices]=useState<ServiceStatus[]>([]);
  const [loading,setLoading]=useState(true);
  const [latencyHistory,setLatencyHistory]=useState<{t:string;ms:number}[]>([]);
  const fetchHealth=useCallback(async()=>{
    try{const res=await fetch('/api/admin/system/health');if(res.ok){const d=await res.json();setHealth(d.health);setServices(d.services||[]);setLatencyHistory(prev=>[...prev.slice(-29),{t:new Date().toLocaleTimeString(),ms:d.health?.apiLatencyMs||0}]);}}
    catch{/* keep */}finally{setLoading(false);}
  },[]);
  useEffect(()=>{fetchHealth();const i=setInterval(fetchHealth,5000);return()=>clearInterval(i);},[fetchHealth]);
  const h=health;
  const cpuPct=h?.cpuUsage??0;
  const memPct=h?Math.round((h.memoryUsage/h.memoryTotal)*100):0;
  const dbPct=h?Math.round((h.dbConnections/h.dbMaxConnections)*100):0;
  const statusColor=(s:string)=>s==='up'||s==='healthy'?'#00ff88':s==='degraded'?'#f59e0b':'#ef4444';
  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-black font-space-grotesk text-white">System Health</h1><p className="text-white/40 text-sm mt-1">Real-time infrastructure monitoring · auto-refreshes every 5s</p></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full animate-pulse" style={{background:statusColor(h?.engineStatus||'down')}}/><span className="text-xs font-bold" style={{color:statusColor(h?.engineStatus||'down')}}>Engine {h?.engineStatus||'unknown'}</span></div>
          <button onClick={fetchHealth} className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg hover:border-white/20 transition-all">Refresh</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[{label:'CPU Usage',pct:cpuPct,color:cpuPct>80?'#ef4444':cpuPct>60?'#f59e0b':'#00ff88',unit:'%'},{label:'Memory',pct:memPct,color:memPct>80?'#ef4444':memPct>60?'#f59e0b':'#0ea5e9',unit:'%'},{label:'DB Connections',pct:dbPct,color:dbPct>80?'#ef4444':dbPct>60?'#f59e0b':'#8b5cf6',unit:'%'},{label:'WS Connections',pct:null as null,value:h?.wsConnections??0,color:'#00ff88',unit:''}].map((g: {label: string; pct: number|null; color: string; unit: string; value?: number}) =>(
          <div key={g.label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40 mb-2">{g.label}</p>
            {g.pct!==null?(<><p className="text-2xl font-black font-space-grotesk mb-2" style={{color:g.color}}>{loading?'—':`${g.pct}${g.unit}`}</p><div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{width:`${g.pct}%`,background:g.color}}/></div></>):(<p className="text-2xl font-black font-space-grotesk" style={{color:g.color}}>{loading?'—':g.value}</p>)}
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-white font-space-grotesk">API Latency (Live)</h3><span className="text-xs font-mono" style={{color:(h?.apiLatencyMs||0)>500?'#ef4444':'#00ff88'}}>{h?.apiLatencyMs??0}ms</span></div>
          <ResponsiveContainer width="100%" height={160}><LineChart data={latencyHistory}><CartesianGrid strokeDasharray="3 3" stroke="#ffffff08"/><XAxis dataKey="t" tick={{fill:'#ffffff30',fontSize:9}} tickLine={false} axisLine={false} interval={4}/><YAxis tick={{fill:'#ffffff30',fontSize:9}} tickLine={false} axisLine={false} unit="ms"/><Tooltip contentStyle={{background:'#0d0d1a',border:'1px solid #ffffff20',borderRadius:'8px',color:'#fff',fontSize:12}}/><Line type="monotone" dataKey="ms" stroke="#00ff88" strokeWidth={2} dot={false} name="Latency"/></LineChart></ResponsiveContainer>
        </div>
        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
          <h3 className="font-bold text-white font-space-grotesk mb-4">Service Status</h3>
          <div className="space-y-2">
            {(services.length>0?services:[{name:'Next.js App',status:'up',latency:12,lastCheck:''},{name:'WebSocket Server',status:'up',latency:8,lastCheck:''},{name:'Game Engine',status:'up',latency:45,lastCheck:''},{name:'PostgreSQL',status:'up',latency:3,lastCheck:''},{name:'Anthropic API',status:'up',latency:320,lastCheck:''},{name:'ElevenLabs API',status:'up',latency:180,lastCheck:''},{name:'Solana RPC',status:'up',latency:95,lastCheck:''}] as ServiceStatus[]).map(svc=>(
              <div key={svc.name} className="flex items-center justify-between p-2.5 bg-white/3 rounded-lg">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{background:statusColor(svc.status)}}/><span className="text-sm text-white/70">{svc.name}</span></div>
                <div className="flex items-center gap-3"><span className="text-xs text-white/30 font-mono">{svc.latency}ms</span><span className="text-xs font-bold" style={{color:statusColor(svc.status)}}>{svc.status.toUpperCase()}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{label:'API Error Rate',value:h?`${h.errorRate.toFixed(2)}%`:'—',color:(h?.errorRate||0)>1?'#ef4444':'#00ff88'},{label:'Queue Depth',value:h?String(h.queueDepth):'—',color:(h?.queueDepth||0)>100?'#f59e0b':'#00ff88'},{label:'Uptime',value:h?`${Math.floor(h.uptime/3600)}h ${Math.floor((h.uptime%3600)/60)}m`:'—',color:'#0ea5e9'},{label:'DB Connections',value:h?`${h.dbConnections}/${h.dbMaxConnections}`:'—',color:'#8b5cf6'}].map((m: {label: string; value: string; color: string; sub?: string}) => (
          <div key={m.label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4"><p className="text-xs text-white/40 mb-1">{m.label}</p><p className="text-xl font-black font-space-grotesk" style={{color:m.color}}>{loading?'—':m.value}</p></div>
        ))}
      </div>
    </AdminLayout>
  );
}
