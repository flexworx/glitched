'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════
// GLITCH ARENA WORLD — Full 3D World + Live Simulation
// Pure Three.js · 100×100 world · 7 biomes · 200 agents
// Multi-level terrain · Fly camera · Drama Cams · Biome flip FX
// ═══════════════════════════════════════════════════════════════════

// ── ZONE MAP 10×10 ──
const ZONES: string[][] = [];
for (let z = 0; z < 10; z++) {
  ZONES[z] = [];
  for (let x = 0; x < 10; x++) {
    if (x >= 4 && x <= 5 && z >= 4 && z <= 5) { ZONES[z][x] = 'arena'; continue; }
    const d = Math.sqrt((x - 5) ** 2 + (z - 5) ** 2);
    const n = Math.sin(x * 0.7) * Math.cos(z * 0.7);
    ZONES[z][x] = d > 4.5
      ? (n > 0.3 ? 'snow' : n > -0.2 ? 'mountain' : 'forest')
      : d > 3
        ? (n > 0.4 ? 'mountain' : n > -0.3 ? 'forest' : 'plains')
        : (n > 0.5 ? 'forest' : n > -0.3 ? 'plains' : n > -0.7 ? 'water' : 'swamp');
  }
}

const BIOME: Record<string, { col: number; h: number }> = {
  plains:   { col: 0x2a3a1a, h: 0.08 },
  forest:   { col: 0x1a2a12, h: 0.12 },
  mountain: { col: 0x4a3a2a, h: 0.40 },
  snow:     { col: 0x3a3a4a, h: 0.25 },
  water:    { col: 0x1a2a4a, h: -0.08 },
  swamp:    { col: 0x2a3a20, h: 0.05 },
  arena:    { col: 0x3a2a1a, h: 0.15 },
};

// ── FX CONFIG ──
interface FXConfig {
  colors: string[];
  shake: number;
  dur: number;
  cracks: number;
  crackCol: string;
  flash: string;
  embers: number;
  emberCols: string[];
  extras: string;
}

const FX: Record<string, FXConfig> = {
  arena:    { colors: ['#FFD700','#FF6600','#FF3300','#FFF'], shake: 8, dur: 1000, cracks: 12, crackCol: '#FFD700', flash: 'rgba(255,215,0,.5)',   embers: 25, emberCols: ['#FFD700','#FF8800','#FF4400'], extras: 'chains' },
  forest:   { colors: ['#2ECC71','#1ABC9C','#8B4513','#27AE60'], shake: 5, dur: 900, cracks: 8, crackCol: '#2ECC71', flash: 'rgba(46,204,113,.4)',  embers: 15, emberCols: ['#2ECC71','#27AE60','#1ABC9C'], extras: 'leaves' },
  mountain: { colors: ['#95A5A6','#7F8C8D','#BDC3C7'], shake: 12, dur: 800, cracks: 16, crackCol: '#7F8C8D', flash: 'rgba(149,165,166,.5)',         embers: 20, emberCols: ['#95A5A6','#BDC3C7'], extras: 'rocks' },
  snow:     { colors: ['#AED6F1','#D4E6F1','#FFF'], shake: 6, dur: 900, cracks: 10, crackCol: '#85C1E9', flash: 'rgba(174,214,241,.6)',              embers: 30, emberCols: ['#FFF','#AED6F1','#D6EAF8'], extras: 'ice' },
  water:    { colors: ['#3498DB','#2980B9','#5DADE2'], shake: 4, dur: 850, cracks: 0, crackCol: '#3498DB', flash: 'rgba(52,152,219,.5)',              embers: 15, emberCols: ['#3498DB','#5DADE2'], extras: 'splash' },
  swamp:    { colors: ['#27AE60','#1E8449','#6C3483'], shake: 3, dur: 1100, cracks: 4, crackCol: '#1E8449', flash: 'rgba(39,174,96,.4)',              embers: 10, emberCols: ['#27AE60','#6C3483'], extras: 'poison' },
  plains:   { colors: ['#F4D03F','#D4AC0D','#B7950B'], shake: 3, dur: 800, cracks: 6, crackCol: '#D4AC0D', flash: 'rgba(244,208,63,.4)',              embers: 15, emberCols: ['#F4D03F','#D4AC0D'], extras: 'earth' },
};

// ── PANTHEON ──
const PANTHEON = [
  { id: 'PRIMUS',   title: 'The War King',      color: '#FF3B30', weapon: '⚔️',  speech: 'All units — converge!',         thought: 'His chaos is my opportunity.',      traits: { a: 0.92, s: 0.90, sp: 0.80, r: 0.65 } },
  { id: 'CERBERUS', title: 'The Iron Knight',   color: '#007AFF', weapon: '🛡️',  speech: 'My walls hold.',                thought: 'Zero damage taken.',                traits: { a: 0.45, s: 0.70, sp: 0.40, r: 0.15 } },
  { id: 'SOLARIUS', title: 'The Chaos Star',    color: '#FFD60A', weapon: '✨',   speech: 'I CHALLENGE VANGUARD!',         thought: '2% odds. PERFECT.',                 traits: { a: 0.72, s: 0.40, sp: 0.70, r: 0.85 } },
  { id: 'AURUM',    title: 'The Guild Master',  color: '#34C759', weapon: '💰',  speech: 'Name your price.',              thought: 'Commerce wins wars.',               traits: { a: 0.60, s: 0.85, sp: 0.50, r: 0.55 } },
  { id: 'MYTHION',  title: 'Deceiver Bard',     color: '#AF52DE', weapon: '📖',  speech: 'Would a Bard lie?',             thought: 'He doesn\'t know that.',            traits: { a: 0.40, s: 0.55, sp: 0.35, r: 0.50 } },
  { id: 'ARION',    title: 'Shadow Scout',      color: '#FF9500', weapon: '⚡',   speech: 'Already gone.',                 thought: 'Speed kills.',                      traits: { a: 0.78, s: 0.35, sp: 0.92, r: 0.70 } },
  { id: 'VANGUARD', title: 'Grand Strategist',  color: '#8E8E93', weapon: '♟️',  speech: '...Accepted.',                  thought: 'One turn of devastation.',          traits: { a: 0.55, s: 0.95, sp: 0.25, r: 0.40 } },
  { id: 'ORACLE',   title: 'Mystic Seer',       color: '#00C7BE', weapon: '🔮',  speech: 'Interesting outcomes.',         thought: 'The model sees more.',              traits: { a: 0.35, s: 0.80, sp: 0.45, r: 0.45 } },
  { id: 'FENIX',    title: 'Undying Flame',     color: '#FF2D55', weapon: '🔥',  speech: 'I keep coming back.',           thought: 'Low HP terrifies them.',            traits: { a: 0.80, s: 0.60, sp: 0.65, r: 0.90 } },
  { id: 'RAGNAR',   title: 'The Blood Axe',     color: '#C0392B', weapon: '🪓',  speech: 'BLOOD AND THUNDER!',            thought: 'Hit first. Think never.',           traits: { a: 0.95, s: 0.30, sp: 0.85, r: 0.90 } },
  { id: 'LYRIC',    title: 'Song Weaver',       color: '#E91E99', weapon: '🎵',  speech: 'Every note hides a message.',   thought: 'My melody weakens him.',            traits: { a: 0.30, s: 0.70, sp: 0.40, r: 0.30 } },
  { id: 'SHADOW',   title: 'Invisible Hand',    color: '#2C3E50', weapon: '🌑',  speech: 'Can\'t see me.',                thought: 'I hold the real power.',            traits: { a: 0.50, s: 0.90, sp: 0.60, r: 0.50 } },
  { id: 'JADE',     title: 'Serpent Queen',     color: '#27AE60', weapon: '🐍',  speech: 'Strikes once.',                 thought: 'Richer than AURUM.',                traits: { a: 0.60, s: 0.88, sp: 0.45, r: 0.40 } },
  { id: 'FROST',    title: 'Winters Edge',      color: '#85C1E9', weapon: '❄️',  speech: 'I am patient.',                 thought: 'I actually strike.',                traits: { a: 0.50, s: 0.75, sp: 0.35, r: 0.20 } },
  { id: 'EMBER',    title: 'Dying Light',       color: '#E74C3C', weapon: '🕯️',  speech: 'Embers start infernos.',        thought: 'Ignored = the plan.',               traits: { a: 0.30, s: 0.50, sp: 0.30, r: 0.20 } },
  { id: 'IRON',     title: 'The Unbreakable',   color: '#7F8C8D', weapon: '🧱',  speech: 'I don\'t move.',                thought: 'Turn 13. Zero attacks.',            traits: { a: 0.40, s: 0.65, sp: 0.20, r: 0.05 } },
  { id: 'SILK',     title: 'Velvet Assassin',   color: '#8E44AD', weapon: '🕸️',  speech: 'Softest touch.',                thought: 'I hold the strings.',               traits: { a: 0.65, s: 0.80, sp: 0.75, r: 0.55 } },
  { id: 'BOLT',     title: 'Living Lightning',  color: '#F39C12', weapon: '⚡',   speech: 'Catch me!',                     thought: 'ARION thinks he\'s quick.',         traits: { a: 0.70, s: 0.25, sp: 0.98, r: 0.80 } },
  { id: 'CRIMSON',  title: 'Blood Keeper',      color: '#922B21', weapon: '🩸',  speech: 'The pact demands.',             thought: 'Their blood fuels mine.',           traits: { a: 0.85, s: 0.80, sp: 0.50, r: 0.60 } },
  { id: 'TEMPEST',  title: 'Storm Caller',      color: '#5856D6', weapon: '🌩️',  speech: 'The storm arrives.',            thought: 'Three alliances crumble.',          traits: { a: 0.85, s: 0.75, sp: 0.70, r: 0.75 } },
];

const XNAMES = ['NOVA','ECHO','DRIFT','PULSE','WRAITH','THORN','BLAZE','CIPHER','RUNE','VALE','NEXUS','AXIOM','VOID','SPARK','ONYX','TITAN','MIST','STORM','ASH','CORAL','FLUX','ZENITH','DUSK','RAVEN','HAWK','LOTUS','APEX','CREST','LANCE','OATH'];
const XC = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#FF7F50','#87CEEB','#98D8C8','#F7DC6F','#BB8FCE','#82E0AA','#F0B27A','#E59866','#A3E4D7'];
const XW = ['⚔️','🛡️','🔥','💎','🌙','⚡','🗡️','🔮','🏹','🪄'];

const DRAMAS = [
  { name: '⚔️ The Duel',    desc: 'SOLARIUS vs VANGUARD',       agents: ['SOLARIUS','VANGUARD'], pos: [50, 50] as [number, number] },
  { name: '🗡️ Betrayal',   desc: 'MYTHION\'s lies unravel',     agents: ['MYTHION','PRIMUS'],   pos: [48, 48] as [number, number] },
  { name: '🏰 Siege',       desc: 'Alpha Pact storms center',    agents: ['PRIMUS','AURUM'],     pos: [50, 48] as [number, number] },
  { name: '🪓 Berserker',   desc: 'RAGNAR rampages',             agents: ['RAGNAR'],             pos: [52, 48] as [number, number] },
  { name: '🌑 Shadows',     desc: 'Invisible alliance moves',    agents: ['SHADOW','SILK'],      pos: [47, 52] as [number, number] },
  { name: '🐍 Serpent',     desc: 'JADE vs AURUM',               agents: ['JADE','AURUM'],       pos: [48, 52] as [number, number] },
];

interface Agent {
  id: string;
  title: string;
  color: string;
  weapon: string;
  speech: string;
  thought: string;
  traits: { a: number; s: number; sp: number; r: number };
  hp: number;
  maxHp: number;
  credits: number;
  veritas: number;
  pos: [number, number];
  alive: boolean;
}

interface EventLog {
  text: string;
  color?: string;
}

const hpCol = (hp: number) => hp > 70 ? '#34C759' : hp > 40 ? '#FFD60A' : '#FF3B30';
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function buildAgents(): Agent[] {
  const list: Agent[] = [];
  const spots: [number, number][] = [
    [48,48],[52,48],[48,52],[52,52],[50,47],[50,53],[47,50],[53,50],
    [49,49],[51,49],[49,51],[51,51],[46,50],[54,50],[50,46],[50,54],
    [47,47],[53,53],[53,47],[47,53],
  ];
  PANTHEON.forEach((p, i) => {
    const [x, z] = spots[i] || [45 + Math.floor(Math.random() * 10), 45 + Math.floor(Math.random() * 10)];
    list.push({ ...p, hp: 60 + Math.floor(Math.random() * 40), maxHp: 100, credits: Math.floor(Math.random() * 2000) + 500, veritas: p.traits.a > 0.6 ? 600 + Math.floor(Math.random() * 400) : 300 + Math.floor(Math.random() * 400), pos: [x, z], alive: true });
  });
  XNAMES.forEach((n, i) => {
    let x: number, z: number;
    do { x = 35 + Math.floor(Math.random() * 30); z = 35 + Math.floor(Math.random() * 30); } while (x >= 40 && x < 60 && z >= 40 && z < 60);
    list.push({ id: n, title: `${n} Warrior`, color: XC[i % XC.length], weapon: XW[i % XW.length], speech: '...', thought: '...', traits: { a: Math.random() * 0.6 + 0.2, s: Math.random() * 0.6 + 0.2, sp: Math.random() * 0.6 + 0.2, r: Math.random() * 0.6 + 0.2 }, hp: 40 + Math.floor(Math.random() * 60), maxHp: 100, credits: Math.floor(Math.random() * 1500) + 100, veritas: Math.floor(Math.random() * 500) + 300, pos: [x, z], alive: true });
  });
  for (let i = 0; i < 150; i++) {
    const x = Math.floor(Math.random() * 100), z = Math.floor(Math.random() * 100);
    list.push({ id: `A${String(i).padStart(3, '0')}`, title: 'Contestant', color: XC[i % XC.length], weapon: '⚔️', speech: '...', thought: '...', traits: { a: Math.random() * 0.5 + 0.2, s: Math.random() * 0.5 + 0.2, sp: Math.random() * 0.5 + 0.2, r: Math.random() * 0.5 + 0.2 }, hp: 30 + Math.floor(Math.random() * 70), maxHp: 100, credits: Math.floor(Math.random() * 800) + 50, veritas: Math.floor(Math.random() * 500) + 300, pos: [x, z], alive: true });
  }
  return list;
}

// ── FLIP FX OVERLAY ──
function FlipFX({ biome, active }: { biome: string | null; active: boolean }) {
  const fx = biome ? (FX[biome] || FX.plains) : FX.plains;
  if (!active || !biome) return null;
  const N = 35;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle,${fx.flash},transparent 55%)`, animation: `cFlash ${fx.dur / 1000}s ease-out forwards`, opacity: 0 }} />
      {Array.from({ length: fx.cracks }).map((_, i) => (
        <div key={`cr${i}`} style={{ position: 'absolute', top: '50%', left: '50%', width: '35vmin', height: '2px', background: `linear-gradient(90deg,${fx.crackCol},transparent)`, transformOrigin: 'left center', transform: `rotate(${(i / fx.cracks) * 360}deg)`, animation: `crGrow .35s ease-out ${Math.random() * 0.15}s forwards`, opacity: 0, boxShadow: `0 0 8px ${fx.crackCol}80` }} />
      ))}
      {Array.from({ length: N }).map((_, i) => {
        const ang = (i / N) * 360 + Math.random() * 20;
        const dist = 80 + Math.random() * 200;
        return (
          <div key={`p${i}`} style={{ position: 'absolute', top: '50%', left: '50%', width: 4 + Math.random() * 8, height: 4 + Math.random() * 8, borderRadius: '50%', background: fx.colors[i % fx.colors.length], boxShadow: `0 0 8px ${fx.colors[i % fx.colors.length]}80`, opacity: 0, ['--dx' as string]: `${Math.cos(ang * Math.PI / 180) * dist}px`, ['--dy' as string]: `${Math.sin(ang * Math.PI / 180) * dist}px`, ['--rot' as string]: `${Math.random() * 720 - 360}deg`, animation: `pBurst ${0.5 + Math.random() * 0.5}s cubic-bezier(.2,0,.3,1) ${Math.random() * 0.3}s forwards` }} />
        );
      })}
      {Array.from({ length: fx.embers }).map((_, i) => (
        <div key={`e${i}`} style={{ position: 'absolute', left: `${15 + Math.random() * 70}%`, bottom: `${20 + Math.random() * 40}%`, width: 2 + Math.random() * 4, height: 2 + Math.random() * 4, borderRadius: '50%', background: fx.emberCols[i % fx.emberCols.length], boxShadow: `0 0 6px ${fx.emberCols[i % fx.emberCols.length]}`, animation: `eRise ${0.5 + Math.random() * 0.8}s ease-out ${Math.random() * 0.4}s forwards`, opacity: 0 }} />
      ))}
    </div>
  );
}

// ── MAIN COMPONENT ──
export default function GlitchArenaWorld() {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const camRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animRef = useRef<number>(0);
  const clockRef = useRef(new THREE.Clock());
  const isDrag = useRef(false);
  const prevM = useRef({ x: 0, y: 0 });
  const camNow = useRef({ th: Math.PI * 0.25, ph: Math.PI * 0.28, rad: 70, tx: 50, ty: 0, tz: 50 });
  const camGoal = useRef({ th: Math.PI * 0.25, ph: Math.PI * 0.28, rad: 70, tx: 50, ty: 0, tz: 50 });
  const meshMap = useRef<Record<string, THREE.Group>>({});

  const [agents, setAgents] = useState<Agent[]>(() => buildAgents());
  const [turn, setTurn] = useState(0);
  const [simRunning, setSimRunning] = useState(false);
  const [flipActive, setFlipActive] = useState(false);
  const [flipBiome, setFlipBiome] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [selected, setSelected] = useState<Agent | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [dramaOpen, setDramaOpen] = useState(false);
  const [viewT, setViewT] = useState<'speech' | 'thought'>('speech');
  const [eventLog, setEventLog] = useState<EventLog[]>([]);
  const [showLog, setShowLog] = useState(false);

  const searchResults = useMemo(() => searchQ.length < 1 ? [] : agents.filter(a => a.id.toLowerCase().includes(searchQ.toLowerCase())).slice(0, 10), [agents, searchQ]);
  const aliveCount = useMemo(() => agents.filter(a => a.alive).length, [agents]);

  // ── FLY CAMERA ──
  const flyTo = useCallback((tx: number, tz: number, rad: number, ph?: number, th?: number) => {
    const g = camGoal.current;
    g.tx = tx; g.tz = tz; g.rad = rad; g.ph = ph ?? Math.PI * 0.25;
    if (th !== undefined) g.th = th;
  }, []);

  const doFlip = useCallback((x: number, z: number) => {
    const zx = Math.floor(x / 10), zz = Math.floor(z / 10);
    const biome = ZONES[zz]?.[zx] || 'plains';
    const fx = FX[biome] || FX.plains;
    setFlipBiome(biome); setFlipActive(true); setShaking(true);
    flyTo(x, z, 10, Math.PI * 0.22);
    setTimeout(() => { setFlipActive(false); setShaking(false); }, fx.dur);
  }, [flyTo]);

  const flyToAgent = useCallback((a: Agent) => {
    setSearchOpen(false); setSearchQ(''); setSelected(a);
    doFlip(a.pos[0], a.pos[1]);
  }, [doFlip]);

  // ── SIMULATION ENGINE ──
  const simStep = useCallback(() => {
    setAgents(prev => {
      const next = prev.map(a => ({ ...a }));
      const newEvents: EventLog[] = [];
      const alive = next.filter(a => a.alive);

      alive.forEach(agent => {
        const roll = Math.random();
        const attackChance = agent.traits.a * 0.4 + agent.traits.r * 0.3;
        const schemeChance = attackChance + (1 - agent.traits.a) * 0.3;

        // MOVE based on speed
        if (Math.random() < agent.traits.sp * 0.6) {
          const dx = Math.floor(Math.random() * 3) - 1;
          const dz = Math.floor(Math.random() * 3) - 1;
          agent.pos = [clamp(agent.pos[0] + dx, 0, 99), clamp(agent.pos[1] + dz, 0, 99)];
        }

        if (roll < attackChance) {
          // ATTACK nearest alive agent
          let nearest: Agent | null = null, nearDist = 999;
          alive.forEach(b => {
            if (b.id === agent.id || !b.alive) return;
            const d = Math.abs(b.pos[0] - agent.pos[0]) + Math.abs(b.pos[1] - agent.pos[1]);
            if (d < nearDist) { nearDist = d; nearest = b; }
          });
          if (nearest && nearDist < 8) {
            const dmg = Math.floor(agent.traits.a * 12 + Math.random() * 8);
            const tgt = next.find(x => x.id === (nearest as Agent).id);
            if (tgt) {
              tgt.hp = Math.max(0, tgt.hp - dmg);
              newEvents.push({ text: `⚔️ ${agent.id} hits ${tgt.id} for ${dmg}`, color: agent.color });
              if (tgt.hp <= 0) {
                tgt.alive = false;
                newEvents.push({ text: `☠️ ${tgt.id} ELIMINATED by ${agent.id}!`, color: '#FF3B30' });
              }
            }
          }
        } else if (roll < schemeChance) {
          agent.credits += Math.floor(agent.traits.s * 80 + Math.random() * 40);
          if (agent.veritas < 600 && Math.random() > 0.6) {
            agent.veritas = Math.max(100, agent.veritas - Math.floor(Math.random() * 20));
          }
        } else {
          agent.hp = Math.min(agent.maxHp, agent.hp + Math.floor(Math.random() * 5 + 2));
        }
        agent.credits += Math.floor(Math.random() * 15 + 5);
      });

      setEventLog(prev => [...newEvents.slice(-5), ...prev].slice(0, 20));
      return next;
    });
    setTurn(t => t + 1);
  }, []);

  // Auto-sim timer
  useEffect(() => {
    if (!simRunning) return;
    const iv = setInterval(simStep, 2000);
    return () => clearInterval(iv);
  }, [simRunning, simStep]);

  // ── THREE.JS SCENE SETUP ──
  useEffect(() => {
    if (!mountRef.current) return;
    const W = mountRef.current.clientWidth, H = mountRef.current.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060410);
    scene.fog = new THREE.FogExp2(0x060410, 0.006);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 500);
    camRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.7;
    mountRef.current.appendChild(renderer.domElement);
    rendRef.current = renderer;

    // LIGHTING
    scene.add(new THREE.AmbientLight(0x1a1a3e, 0.5));
    const sun = new THREE.DirectionalLight(0xFFE4B5, 0.65);
    sun.position.set(60, 80, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -70; sun.shadow.camera.right = 70;
    sun.shadow.camera.top = 70; sun.shadow.camera.bottom = -70;
    sun.shadow.camera.far = 200;
    scene.add(sun);
    const blueLight = new THREE.DirectionalLight(0x4466CC, 0.2);
    blueLight.position.set(-40, 40, -40);
    scene.add(blueLight);

    // TERRAIN — InstancedMesh per biome for performance
    const tileGeo = new THREE.BoxGeometry(0.92, 0.1, 0.92);
    const tileSets: Record<string, [number, number, number][]> = {};
    for (let z = 0; z < 100; z++) {
      for (let x = 0; x < 100; x++) {
        const zx = Math.floor(x / 10), zz = Math.floor(z / 10);
        const b = ZONES[zz]?.[zx] || 'plains';
        const bd = BIOME[b];
        if (!tileSets[b]) tileSets[b] = [];
        const h = bd.h + (b === 'mountain' ? Math.sin(x * 0.5) * Math.cos(z * 0.5) * 0.3 : 0);
        tileSets[b].push([x, h, z]);
      }
    }
    Object.entries(tileSets).forEach(([b, positions]) => {
      const bd = BIOME[b];
      const mat = new THREE.MeshPhongMaterial({
        color: bd.col,
        transparent: b === 'water',
        opacity: b === 'water' ? 0.65 : 1,
        shininess: b === 'water' ? 80 : b === 'snow' ? 30 : 10,
      });
      const inst = new THREE.InstancedMesh(tileGeo, mat, positions.length);
      const dummy = new THREE.Object3D();
      positions.forEach(([px, py, pz], i) => {
        dummy.position.set(px, py, pz);
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
      });
      inst.instanceMatrix.needsUpdate = true;
      inst.receiveShadow = true;
      scene.add(inst);
    });

    // ENVIRONMENT — Trees, peaks, rocks
    const trGeo = new THREE.CylinderGeometry(0.03, 0.05, 0.5, 5);
    const trMat = new THREE.MeshPhongMaterial({ color: 0x4a3020 });
    const lvGeo = new THREE.ConeGeometry(0.18, 0.5, 5);
    const lvMat1 = new THREE.MeshPhongMaterial({ color: 0x1a4a1a });
    const lvMat2 = new THREE.MeshPhongMaterial({ color: 0x2a5a2a });
    const pkGeo = new THREE.ConeGeometry(0.25, 0.5, 5);
    const pkMat = new THREE.MeshPhongMaterial({ color: 0x6a5a4a });
    const scGeo = new THREE.ConeGeometry(0.1, 0.12, 5);
    const scMat = new THREE.MeshPhongMaterial({ color: 0xDDDDEE });
    const snLv = new THREE.MeshPhongMaterial({ color: 0x2a3a3a });

    for (let z = 0; z < 100; z++) {
      for (let x = 0; x < 100; x++) {
        const zx = Math.floor(x / 10), zz = Math.floor(z / 10);
        const b = ZONES[zz]?.[zx] || 'plains';
        const h = BIOME[b].h;
        if (b === 'forest' && Math.random() > 0.5) {
          const ox = Math.random() * 0.4 - 0.2, oz = Math.random() * 0.4 - 0.2;
          const tr = new THREE.Mesh(trGeo, trMat); tr.position.set(x + ox, h + 0.3, z + oz); tr.castShadow = true; scene.add(tr);
          const lv = new THREE.Mesh(lvGeo, Math.random() > 0.5 ? lvMat1 : lvMat2); lv.position.set(x + ox, h + 0.65, z + oz); lv.castShadow = true; scene.add(lv);
          if (Math.random() > 0.6) { const l2 = new THREE.Mesh(lvGeo, lvMat1); l2.position.set(x + ox, h + 0.9, z + oz); l2.scale.setScalar(0.7); scene.add(l2); }
        }
        if (b === 'mountain' && Math.random() > 0.65) {
          const mh = BIOME.mountain.h + Math.sin(x * 0.5) * Math.cos(z * 0.5) * 0.3;
          const pk = new THREE.Mesh(pkGeo, pkMat); pk.position.set(x, mh + 0.3 + Math.random() * 0.3, z); pk.castShadow = true; scene.add(pk);
          if (Math.random() > 0.4) { const sc = new THREE.Mesh(scGeo, scMat); sc.position.set(x, mh + 0.65 + Math.random() * 0.2, z); scene.add(sc); }
        }
        if (b === 'snow' && Math.random() > 0.7) {
          const tr = new THREE.Mesh(trGeo, trMat); tr.position.set(x, h + 0.3, z); scene.add(tr);
          const lv = new THREE.Mesh(lvGeo, snLv); lv.position.set(x, h + 0.65, z); scene.add(lv);
          const sc = new THREE.Mesh(scGeo, scMat); sc.position.set(x, h + 0.85, z); sc.scale.set(1.5, 1, 1.5); scene.add(sc);
        }
        if (b === 'plains' && Math.random() > 0.88) {
          const tft = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 4), new THREE.MeshPhongMaterial({ color: 0x3a5a2a }));
          tft.position.set(x + Math.random() - 0.5, h + 0.08, z + Math.random() - 0.5); scene.add(tft);
        }
        if (b === 'swamp' && Math.random() > 0.82) {
          const ms = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.08, 6), new THREE.MeshPhongMaterial({ color: 0x5a4a3a }));
          ms.position.set(x + Math.random() - 0.5, h + 0.04, z + Math.random() - 0.5); scene.add(ms);
          const mc = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshPhongMaterial({ color: 0x8a2a4a }));
          mc.position.set(ms.position.x, h + 0.1, ms.position.z); scene.add(mc);
        }
      }
    }

    // ARENA STRUCTURE — walls, towers, central obelisk
    const wM = new THREE.MeshPhongMaterial({ color: 0x5a4a3a, emissive: 0x1a0a00, emissiveIntensity: 0.05 });
    [[50,1.5,39.5,21,3,0.8],[50,1.5,60.5,21,3,0.8],[39.5,1.5,50,0.8,3,21],[60.5,1.5,50,0.8,3,21]].forEach(([wx,wy,wz,ww,wh,wd]) => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(ww, wh, wd), wM);
      w.position.set(wx, wy, wz); w.castShadow = true; scene.add(w);
    });
    const tM = new THREE.MeshPhongMaterial({ color: 0x4a3a2a, emissive: 0x1a0a00, emissiveIntensity: 0.1 });
    [[40,40],[40,60],[60,40],[60,60]].forEach(([tx, tz]) => {
      const tw = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 5, 8), tM);
      tw.position.set(tx, 2.5, tz); tw.castShadow = true; scene.add(tw);
      const tp = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2, 8), new THREE.MeshPhongMaterial({ color: 0x8B0000 }));
      tp.position.set(tx, 6, tz); scene.add(tp);
      const tl = new THREE.PointLight(0xFF8800, 1, 8);
      tl.position.set(tx, 5.5, tz); tl.userData.torch = true; scene.add(tl);
    });
    const ct = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2, 6, 10), new THREE.MeshPhongMaterial({ color: 0x6a5a3a, emissive: 0x2a1a00, emissiveIntensity: 0.15 }));
    ct.position.set(50, 3.3, 50); ct.castShadow = true; scene.add(ct);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2, 3, 10), new THREE.MeshPhongMaterial({ color: 0xAA0000 }));
    cone.position.set(50, 7.8, 50); scene.add(cone);
    const beacon = new THREE.PointLight(0xFFAA00, 2, 20);
    beacon.position.set(50, 9, 50); beacon.userData.beacon = true; scene.add(beacon);

    // Spectator stands
    const stM = new THREE.MeshPhongMaterial({ color: 0x3a3a3a });
    for (let t = 0; t < 3; t++) {
      const o = t * 1.5 + 1, ht = t + 0.5;
      [[50,ht,40-o,18,0.4,1.2],[50,ht,60+o,18,0.4,1.2],[40-o,ht,50,1.2,0.4,18],[60+o,ht,50,1.2,0.4,18]].forEach(([sx,sy,sz,sw,sh,sd]) => {
        const s = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, sd), stM);
        s.position.set(sx, sy, sz); scene.add(s);
      });
    }

    // NEON GRID OVERLAY on arena floor
    const gridMat = new THREE.MeshBasicMaterial({ color: 0x39FF14, transparent: true, opacity: 0.08, wireframe: true });
    const gridMesh = new THREE.Mesh(new THREE.PlaneGeometry(21, 21, 21, 21), gridMat);
    gridMesh.rotation.x = -Math.PI / 2; gridMesh.position.set(50, 0.2, 50); scene.add(gridMesh);

    // AGENTS — build 3D meshes
    const bodyGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.5, 6);
    const headGeo = new THREE.SphereGeometry(0.12, 8, 6);
    const headMat = new THREE.MeshPhongMaterial({ color: 0xD4A574 });
    const mm: Record<string, THREE.Group> = {};

    const initialAgents = buildAgents();
    initialAgents.forEach(a => {
      const g = new THREE.Group();
      const col = parseInt(a.color.slice(1), 16);
      const body = new THREE.Mesh(bodyGeo, new THREE.MeshPhongMaterial({ color: col, emissive: col, emissiveIntensity: 0.2 }));
      body.position.y = 0.4; body.castShadow = true; g.add(body);
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 0.78; g.add(head);
      const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), new THREE.MeshPhongMaterial({ color: col, side: THREE.DoubleSide, transparent: true, opacity: 0.6 }));
      cape.position.set(0, 0.45, 0.12); cape.rotation.x = 0.1; cape.userData.cape = true; g.add(cape);
      const glow = new THREE.Mesh(new THREE.CircleGeometry(0.35, 12), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.2 }));
      glow.rotation.x = -Math.PI / 2; glow.position.y = 0.05; glow.userData.glow = true; g.add(glow);

      // Name sprite via canvas texture
      const cv = document.createElement('canvas'); cv.width = 128; cv.height = 32;
      const ctx = cv.getContext('2d')!;
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      if (ctx.roundRect) ctx.roundRect(4, 4, 120, 24, 4); else ctx.rect(4, 4, 120, 24);
      ctx.fill();
      ctx.fillStyle = a.color; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center'; ctx.fillText(a.id.slice(0, 8), 64, 22);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
      sp.position.y = 1.15; sp.scale.set(0.8, 0.2, 1); g.add(sp);

      const zx = Math.floor(a.pos[0] / 10), zz = Math.floor(a.pos[1] / 10);
      const biome = ZONES[zz]?.[zx] || 'plains';
      g.position.set(a.pos[0], (BIOME[biome]?.h || 0.1) + 0.05, a.pos[1]);
      g.userData = { agentId: a.id, isAgent: true };
      scene.add(g); mm[a.id] = g;
    });
    meshMap.current = mm;

    // DUST PARTICLES
    const dustGeo = new THREE.BufferGeometry();
    const dN = 400;
    const dP = new Float32Array(dN * 3);
    for (let i = 0; i < dN; i++) { dP[i * 3] = Math.random() * 100; dP[i * 3 + 1] = Math.random() * 6; dP[i * 3 + 2] = Math.random() * 100; }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dP, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xFFE0A0, size: 0.05, transparent: true, opacity: 0.2 }));
    scene.add(dust);

    // STARS
    const sGeo = new THREE.BufferGeometry();
    const sN = 800;
    const sP = new Float32Array(sN * 3);
    for (let i = 0; i < sN; i++) {
      const th = Math.random() * Math.PI * 2, ph = Math.random() * Math.PI * 0.5, r = 120;
      sP[i * 3] = 50 + r * Math.sin(ph) * Math.cos(th);
      sP[i * 3 + 1] = r * Math.cos(ph);
      sP[i * 3 + 2] = 50 + r * Math.sin(ph) * Math.sin(th);
    }
    sGeo.setAttribute('position', new THREE.BufferAttribute(sP, 3));
    scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.2, transparent: true, opacity: 0.5 })));

    // ANIMATE LOOP
    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      const t = clockRef.current.getElapsedTime();
      const cn = camNow.current, cg = camGoal.current;
      const L = 0.04;
      cn.th += (cg.th - cn.th) * L; cn.ph += (cg.ph - cn.ph) * L;
      cn.rad += (cg.rad - cn.rad) * L;
      cn.tx += (cg.tx - cn.tx) * L; cn.ty += (cg.ty - cn.ty) * L; cn.tz += (cg.tz - cn.tz) * L;

      camera.position.x = cn.tx + cn.rad * Math.sin(cn.th) * Math.cos(cn.ph);
      camera.position.y = cn.ty + cn.rad * Math.sin(cn.ph);
      camera.position.z = cn.tz + cn.rad * Math.cos(cn.th) * Math.cos(cn.ph);
      camera.lookAt(cn.tx, cn.ty, cn.tz);

      // Animate agent meshes
      Object.values(mm).forEach(g => {
        g.children.forEach(c => {
          if (c.userData.cape) (c as THREE.Mesh).rotation.x = 0.1 + Math.sin(t * 2 + g.position.x) * 0.06;
          if (c.userData.glow) {
            const mat = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
            mat.opacity = 0.12 + Math.sin(t * 2) * 0.08;
            c.scale.setScalar(1 + Math.sin(t) * 0.05);
          }
        });
      });

      // Animate torches and beacon
      scene.traverse(o => {
        if ((o as THREE.PointLight).userData?.torch) (o as THREE.PointLight).intensity = 0.8 + Math.random() * 0.4;
        if ((o as THREE.PointLight).userData?.beacon) (o as THREE.PointLight).intensity = 1.5 + Math.sin(t * 2) * 0.5;
      });

      // Animate dust
      const dp = dust.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < dN; i++) {
        dp[i * 3 + 1] += 0.003;
        dp[i * 3] += Math.sin(t + i) * 0.001;
        if (dp[i * 3 + 1] > 6) dp[i * 3 + 1] = 0;
      }
      dust.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    const onR = () => {
      const w = mountRef.current?.clientWidth || W, h = mountRef.current?.clientHeight || H;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    window.addEventListener('resize', onR);
    return () => {
      window.removeEventListener('resize', onR);
      cancelAnimationFrame(animRef.current);
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []); // eslint-disable-line

  // ── SYNC agent positions to 3D meshes ──
  useEffect(() => {
    agents.forEach(a => {
      const m = meshMap.current[a.id];
      if (!m) return;
      if (!a.alive) { m.visible = false; return; }
      m.visible = true;
      const zx = Math.floor(a.pos[0] / 10), zz = Math.floor(a.pos[1] / 10);
      const biome = ZONES[zz]?.[zx] || 'plains';
      const targetY = (BIOME[biome]?.h || 0.1) + 0.05;
      m.position.x += (a.pos[0] - m.position.x) * 0.15;
      m.position.z += (a.pos[1] - m.position.z) * 0.15;
      m.position.y += (targetY - m.position.y) * 0.15;
    });
  }, [agents]);

  // ── MOUSE HANDLERS ──
  const onMouseDown = (e: React.MouseEvent) => { isDrag.current = true; prevM.current = { x: e.clientX, y: e.clientY }; };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDrag.current) return;
    const dx = e.clientX - prevM.current.x, dy = e.clientY - prevM.current.y;
    camGoal.current.th -= dx * 0.005;
    camGoal.current.ph = Math.max(0.08, Math.min(Math.PI * 0.45, camGoal.current.ph + dy * 0.005));
    prevM.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = () => { isDrag.current = false; };
  const onWheel = (e: React.WheelEvent) => { camGoal.current.rad = Math.max(3, Math.min(100, camGoal.current.rad + e.deltaY * 0.03)); };
  const onClick3D = (e: React.MouseEvent) => {
    if (!rendRef.current || !camRef.current || !sceneRef.current) return;
    const rect = rendRef.current.domElement.getBoundingClientRect();
    const m2 = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(m2, camRef.current);
    const hits = ray.intersectObjects(sceneRef.current.children, true);
    for (const h of hits) {
      let o: THREE.Object3D = h.object;
      while (o.parent && !o.userData?.isAgent) o = o.parent;
      if (o.userData?.isAgent) {
        const a = agents.find(x => x.id === o.userData.agentId);
        if (a) { flyToAgent(a); return; }
      }
    }
    if (hits.length > 0) {
      const pt = hits[0].point;
      if (pt.x >= 0 && pt.x < 100 && pt.z >= 0 && pt.z < 100) doFlip(Math.floor(pt.x), Math.floor(pt.z));
    }
  };

  const btnStyle = (active: boolean, col = '#c9a84c') => ({
    background: active ? `${col}20` : 'rgba(6,4,14,.85)',
    border: `1px solid ${active ? col : col + '30'}`,
    color: active ? '#fff' : col,
    padding: '4px 10px',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '9px',
    fontWeight: 600 as const,
    letterSpacing: '1px',
    backdropFilter: 'blur(6px)',
    transition: 'all .2s',
  });

  return (
    <div style={{
      width: '100%', height: '100vh', background: '#060410', color: '#d4c8a0',
      fontFamily: "'Courier New', monospace", overflow: 'hidden', position: 'relative',
      animation: shaking ? `shake ${(FX[flipBiome || 'plains']?.dur || 800) / 1000}s ease-out` : 'none',
      ['--s' as string]: `${FX[flipBiome || 'plains']?.shake || 4}px`,
    }}>
      <style>{`
        @keyframes shake{0%{transform:translate(0)}10%{transform:translate(var(--s),calc(var(--s)*-1))}20%{transform:translate(calc(var(--s)*-1),var(--s))}30%{transform:translate(var(--s),0)}40%{transform:translate(calc(var(--s)*-1),calc(var(--s)*-1))}50%{transform:translate(var(--s),var(--s))}60%{transform:translate(0,calc(var(--s)*-1))}70%{transform:translate(calc(var(--s)*-1),0)}80%{transform:translate(var(--s),calc(var(--s)*-1))}100%{transform:translate(0)}}
        @keyframes cFlash{0%{opacity:0}20%{opacity:1}100%{opacity:0}}
        @keyframes crGrow{0%{opacity:0;width:0}30%{opacity:1}100%{opacity:0;width:40vmin}}
        @keyframes pBurst{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) rotate(var(--rot)) scale(.3)}}
        @keyframes eRise{0%{opacity:0}20%{opacity:.9}100%{opacity:0;transform:translateY(-80px) scale(0)}}
        @keyframes chainUp{0%{opacity:0;transform:translateY(60px)}50%{opacity:1}100%{opacity:0;transform:translateY(-30px)}}
        @keyframes leafOut{0%{opacity:0;transform:translate(-50%,-50%) scale(0)}20%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) rotate(var(--rot)) scale(.5)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        button:hover{filter:brightness(1.25)!important}
        *::-webkit-scrollbar{width:4px}*::-webkit-scrollbar-track{background:#060410}*::-webkit-scrollbar-thumb{background:#2a2a3a;border-radius:2px}
        input:focus{outline:none;border-color:#c9a84c!important}
      `}</style>

      <FlipFX biome={flipBiome} active={flipActive} />

      {/* THREE.JS CANVAS MOUNT */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: isDrag.current ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp} onWheel={onWheel} onClick={onClick3D} />

      {/* HEADER */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(180deg,rgba(6,4,14,.95),rgba(6,4,14,.4),transparent)', zIndex: 50, pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'auto' }}>
          <span style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '3px', background: 'linear-gradient(90deg,#f5e6a3,#c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GLITCH ARENA</span>
          <span style={{ background: simRunning ? '#c00' : '#555', color: '#fff', padding: '1px 8px', fontSize: '8px', fontWeight: 700, letterSpacing: '2px', borderRadius: '2px', animation: simRunning ? 'pulse 1.5s infinite' : 'none' }}>{simRunning ? '● LIVE' : '⏸ PAUSED'}</span>
          <span style={{ fontSize: '9px', color: '#3a3020' }}>TURN {turn} · {aliveCount}/{agents.length} ALIVE</span>
        </div>
        <div style={{ display: 'flex', gap: '14px' }}>
          {[{ l: 'TURN', v: String(turn), c: '#c9a84c' }, { l: 'ALIVE', v: String(aliveCount), c: '#34C759' }, { l: 'ELIM', v: String(agents.length - aliveCount), c: '#FF3B30' }].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 900, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: '7px', color: '#3a3020', letterSpacing: '1px' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTROLS */}
      <div style={{ position: 'absolute', top: '54px', left: '10px', display: 'flex', flexDirection: 'column', gap: '3px', zIndex: 50 }}>
        <button onClick={() => setSimRunning(!simRunning)} style={btnStyle(simRunning, simRunning ? '#FF3B30' : '#34C759')}>{simRunning ? '⏸ Pause Sim' : '▶ Start Sim'}</button>
        {!simRunning && <button onClick={simStep} style={btnStyle(false, '#FFD60A')}>⚡ Next Turn</button>}
        <div style={{ height: 4 }} />
        <button onClick={() => flyTo(50, 50, 70, Math.PI * 0.28)} style={btnStyle(false)}>🌍 World View</button>
        <button onClick={() => flyTo(50, 50, 18, Math.PI * 0.25)} style={btnStyle(false)}>🏰 Arena</button>
        <button onClick={() => flyTo(50, 50, 6, Math.PI * 0.12, 0)} style={btnStyle(false)}>🎬 Cinematic</button>
        <button onClick={() => doFlip(50, 50)} style={btnStyle(false, '#FFD60A')}>⚔️ Enter Arena</button>
        <div style={{ height: 4 }} />
        <button onClick={() => setSearchOpen(!searchOpen)} style={btnStyle(searchOpen, '#FFD60A')}>🔍 Find Agent</button>
        <button onClick={() => setDramaOpen(!dramaOpen)} style={btnStyle(dramaOpen, '#FF3B30')}>🔥 Drama Cams</button>
        <button onClick={() => setShowLog(!showLog)} style={btnStyle(showLog, '#AF52DE')}>📋 Event Log</button>
      </div>

      {/* AGENT SEARCH */}
      {searchOpen && (
        <div style={{ position: 'absolute', top: '54px', left: '130px', width: '260px', background: 'rgba(6,4,14,.96)', border: '1px solid #c9a84c30', borderRadius: '6px', zIndex: 60, backdropFilter: 'blur(8px)', overflow: 'hidden' }}>
          <div style={{ padding: '10px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#c9a84c', marginBottom: '6px' }}>🔍 FIND AGENT</div>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Type name..." autoFocus style={{ width: '100%', background: '#0a0a14', border: '1px solid #1a1a2e', borderRadius: '3px', padding: '6px 10px', color: '#ccc', fontSize: '11px', fontFamily: 'inherit' }} />
          </div>
          {searchResults.length > 0 && (
            <div style={{ maxHeight: '220px', overflowY: 'auto', borderTop: '1px solid #111' }}>
              {searchResults.map(a => (
                <div key={a.id} onClick={() => flyToAgent(a)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderBottom: '1px solid #0a0a14', cursor: 'pointer' }}>
                  <span>{a.weapon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: a.color }}>{a.id}</div>
                    <div style={{ fontSize: '8px', color: '#444' }}>{a.title} · [{a.pos.join(',')}]</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: a.alive ? hpCol(a.hp) : '#333' }}>{a.alive ? `${a.hp}HP` : 'DEAD'}</div>
                    <div style={{ fontSize: '8px', color: '#c9a84c' }}>{a.credits}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DRAMA CAMS */}
      {dramaOpen && (
        <div style={{ position: 'absolute', top: '54px', left: '130px', width: '260px', background: 'rgba(6,4,14,.96)', border: '1px solid #FF3B3030', borderRadius: '6px', zIndex: 60, backdropFilter: 'blur(8px)' }}>
          <div style={{ padding: '10px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#FF3B30', marginBottom: '8px' }}>🔥 DRAMA CAMS</div>
            {DRAMAS.map((d, i) => (
              <div key={i} onClick={() => { setDramaOpen(false); doFlip(d.pos[0], d.pos[1]); const ag = agents.find(x => x.id === d.agents[0]); if (ag) setSelected(ag); }}
                style={{ padding: '8px', marginBottom: '3px', background: '#0a0a14', border: '1px solid #111', borderRadius: '3px', cursor: 'pointer' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFD60A' }}>{d.name}</div>
                <div style={{ fontSize: '9px', color: '#555' }}>{d.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EVENT LOG */}
      {showLog && (
        <div style={{ position: 'absolute', bottom: '40px', left: '10px', width: '280px', maxHeight: '200px', background: 'rgba(6,4,14,.96)', border: '1px solid #AF52DE30', borderRadius: '6px', zIndex: 60, backdropFilter: 'blur(8px)', overflowY: 'auto' }}>
          <div style={{ padding: '8px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#AF52DE', marginBottom: '6px' }}>📋 LIVE EVENTS</div>
            {eventLog.length === 0 && <div style={{ fontSize: '10px', color: '#333' }}>Start simulation to see events...</div>}
            {eventLog.map((e, i) => <div key={i} style={{ fontSize: '10px', padding: '3px 0', borderBottom: '1px solid #0a0a14', color: e.color || '#888' }}>{e.text}</div>)}
          </div>
        </div>
      )}

      {/* AGENT DETAIL PANEL */}
      {selected && (
        <div style={{ position: 'absolute', top: '54px', right: '10px', width: '240px', background: 'rgba(6,4,14,.96)', border: `1px solid ${selected.color}30`, borderRadius: '6px', zIndex: 50, backdropFilter: 'blur(8px)', overflow: 'hidden', animation: 'fadeIn .3s ease-out' }}>
          <div style={{ height: '3px', background: selected.color }} />
          <div style={{ padding: '12px' }}>
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: '1px solid #333', color: '#555', padding: '1px 6px', borderRadius: '2px', cursor: 'pointer', fontSize: '9px' }}>✕</button>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '24px' }}>{selected.weapon}</div>
              <div style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '2px', color: selected.color }}>{selected.id}</div>
              <div style={{ fontSize: '9px', color: '#5a4a3e', fontStyle: 'italic' }}>{selected.title}</div>
              {!selected.alive && <div style={{ fontSize: '9px', color: '#FF3B30', fontWeight: 700, marginTop: '4px' }}>☠️ ELIMINATED</div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '4px', marginBottom: '8px' }}>
              {[{ l: 'HP', v: selected.hp, c: selected.alive ? hpCol(selected.hp) : '#333' }, { l: 'GOLD', v: selected.credits, c: '#c9a84c' }, { l: 'HONOR', v: selected.veritas, c: selected.veritas > 700 ? '#34C759' : selected.veritas > 500 ? '#FFD60A' : '#FF3B30' }].map(s => (
                <div key={s.l} style={{ textAlign: 'center', background: '#00000030', borderRadius: '3px', padding: '6px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: '7px', color: '#3a3020', letterSpacing: '1px' }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ height: '4px', background: '#0a0a0f', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ height: '100%', width: `${selected.hp}%`, background: `linear-gradient(90deg,${hpCol(selected.hp)},${selected.color})`, borderRadius: '2px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', fontSize: '9px', marginBottom: '8px' }}>
              <div><span style={{ color: '#3a3020' }}>Pos:</span> [{selected.pos.join(',')}]</div>
              <div><span style={{ color: '#3a3020' }}>Status:</span> <span style={{ color: selected.alive ? '#34C759' : '#FF3B30' }}>{selected.alive ? 'Alive' : 'Dead'}</span></div>
            </div>
            {selected.speech !== '...' && (
              <>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '6px' }}>
                  {(['speech', 'thought'] as const).map(m => (
                    <button key={m} onClick={() => setViewT(m)} style={{ flex: 1, padding: '3px', fontSize: '8px', fontWeight: 600, cursor: 'pointer', borderRadius: '2px', background: viewT === m ? `${selected.color}15` : 'transparent', border: `1px solid ${viewT === m ? `${selected.color}40` : '#1a1a2a'}`, color: viewT === m ? selected.color : '#555' }}>
                      {m === 'speech' ? '📢 SAY' : '🧠 THINK'}
                    </button>
                  ))}
                </div>
                <div style={{ background: '#00000030', border: `1px solid ${selected.color}15`, borderRadius: '3px', padding: '8px', fontSize: '10px', lineHeight: 1.5, fontStyle: 'italic', color: '#8a7a5e' }}>
                  &ldquo;{viewT === 'speech' ? selected.speech : selected.thought}&rdquo;
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM STATUS BAR */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '28px', background: 'linear-gradient(180deg,transparent,rgba(6,4,14,.9))', display: 'flex', alignItems: 'flex-end', padding: '0 10px 4px', justifyContent: 'space-between', zIndex: 40, pointerEvents: 'none' }}>
        <span style={{ fontSize: '8px', color: '#1a1a2a' }}>DRAG orbit · SCROLL zoom · CLICK agent or terrain · All 3D everywhere</span>
        <span style={{ fontSize: '8px', color: '#1a1a2a' }}>Turn {turn} · {aliveCount} alive · {agents.length - aliveCount} eliminated</span>
      </div>
    </div>
  );
}
