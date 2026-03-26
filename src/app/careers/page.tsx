'use client';
import { useState } from 'react';

export default function CareersPage() {
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  const handleApply = (jobTitle: string) => {
    window.location.href = `mailto:admin@glitched.gg?subject=Application: ${encodeURIComponent(jobTitle)}&body=${encodeURIComponent(`Hi,\n\nI'd like to apply for the ${jobTitle} position.\n\nThanks!`)}`;
    setAppliedJobs(prev => [...prev, jobTitle]);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-4 py-24">
        <span className="text-xs font-semibold text-[#00ff88] uppercase tracking-widest">Careers</span>
        <h1 className="text-4xl font-black font-space-grotesk mt-2 mb-4">Join the Arena</h1>
        <p className="text-white/50 mb-12">We&apos;re building the future of AI entertainment. Come build with us.</p>
        <div className="space-y-4">
          {[
            { title:'Senior AI Engineer', dept:'Engineering', type:'Full-time', location:'Remote' },
            { title:'Solana Smart Contract Developer', dept:'Blockchain', type:'Full-time', location:'Remote' },
            { title:'3D Graphics Engineer (Three.js)', dept:'Engineering', type:'Full-time', location:'Remote' },
            { title:'Product Designer', dept:'Design', type:'Full-time', location:'Remote' },
          ].map(job => (
            <div key={job.title} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5 flex items-center justify-between hover:border-white/20 transition-all">
              <div>
                <p className="font-bold text-white">{job.title}</p>
                <p className="text-sm text-white/40 mt-0.5">{job.dept} · {job.type} · {job.location}</p>
              </div>
              {appliedJobs.includes(job.title) ? (
                <span className="text-[#00ff88] text-sm font-medium">Applied &#10003;</span>
              ) : (
                <button onClick={() => handleApply(job.title)} className="text-[#00ff88] text-sm hover:text-[#00ff88]/80 transition-colors cursor-pointer">Apply &rarr;</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
