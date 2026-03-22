// ElevenLabs voice synthesis integration

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export const AGENT_VOICES: Record<string, string> = {
  primus: 'pNInz6obpgDQGcFmaJgB',    // Adam - authoritative
  cerberus: 'VR6AewLTigWG4xSOukaG',  // Arnold - aggressive
  mythion: 'TxGEqnHWrfWFTfGW9XjX',  // Josh - cunning
  oracle: 'ErXwobaYiN019PkySvjV',    // Antoni - prophetic
  solarius: 'MF3mGyEYCl7XYWbV9V6O', // Elli - radiant
  aurum: 'AZnzlk1XvdvUeBnXmlld',    // Domi - golden
  vanguard: 'EXAVITQu4vr4xnSDxMaL', // Bella - protective
  arion: 'ThT5KcBeYPX3keUQqHPh',    // Dorothy - swift
};

export interface VoiceOptions {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export async function synthesizeSpeech(
  text: string,
  voiceId: string,
  options: VoiceOptions = {}
): Promise<ArrayBuffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.warn('ELEVENLABS_API_KEY not set, skipping voice synthesis');
    return null;
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: options.stability ?? 0.5,
          similarity_boost: options.similarity_boost ?? 0.75,
          style: options.style ?? 0.0,
          use_speaker_boost: options.use_speaker_boost ?? true,
        },
      }),
    });

    if (!response.ok) {
      console.error('ElevenLabs API error:', response.status, await response.text());
      return null;
    }

    return response.arrayBuffer();
  } catch (error) {
    console.error('Voice synthesis failed:', error);
    return null;
  }
}

export async function getAgentVoice(agentId: string, text: string): Promise<ArrayBuffer | null> {
  const voiceId = AGENT_VOICES[agentId.toLowerCase()];
  if (!voiceId) return null;
  return synthesizeSpeech(text, voiceId);
}
