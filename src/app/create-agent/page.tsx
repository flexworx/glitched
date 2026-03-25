import type { Metadata } from 'next';
import { WizardShell } from '@/components/creator/WizardShell';

export const metadata: Metadata = {
  title: 'Create Agent | Glitched.gg',
  description: 'Build your custom AI agent with 34 personality traits, arena tools, and unique detractors. Deploy to the Glitch Arena.',
};

export default function CreateAgentPage() {
  return <WizardShell />;
}
