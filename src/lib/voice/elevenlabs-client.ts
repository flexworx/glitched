// ElevenLabs Voice Client
export interface VoiceConfig {
  voiceId: string;
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
}

export const AGENT_VOICES: Record<string, VoiceConfig> = {
  primus: { voiceId: 'pNInz6obpgDQGcFmaJgB', stability: 0.8, similarityBoost: 0.9, style: 0.3, useSpeakerBoost: true },
  cerberus: { voiceId: 'VR6AewLTigWG4xSOukaG', stability: 0.5, similarityBoost: 0.8, style: 0.7, useSpeakerBoost: true },
  mythion: { voiceId: 'EXAVITQu4vr4xnSDxMaL', stability: 0.6, similarityBoost: 0.7, style: 0.5, useSpeakerBoost: false },
  oracle: { voiceId: 'MF3mGyEYCl7XYWbV9V6O', stability: 0.9, similarityBoost: 0.9, style: 0.1, useSpeakerBoost: false },
  showrunner: { voiceId: 'TxGEqnHWrfWFTfGW9XjX', stability: 0.7, similarityBoost: 0.85, style: 0.6, useSpeakerBoost: true },
};

export async function generateSpeech(
  text: string,
  agentId: string,
  outputPath?: string
): Promise<Buffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  const voiceConfig = AGENT_VOICES[agentId] || AGENT_VOICES.showrunner;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceConfig.voiceId}`,
    {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: {
          stability: voiceConfig.stability,
          similarity_boost: voiceConfig.similarityBoost,
          style: voiceConfig.style,
          use_speaker_boost: voiceConfig.useSpeakerBoost,
        },
      }),
    }
  );

  if (!response.ok) return null;

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
