// Voice Queue: manages sequential TTS generation to avoid rate limits
export interface VoiceQueueItem {
  id: string;
  agentId: string;
  text: string;
  priority: 'high' | 'normal' | 'low';
  createdAt: number;
  status: 'pending' | 'processing' | 'done' | 'failed';
}

class VoiceQueue {
  private queue: VoiceQueueItem[] = [];
  private processing = false;
  private maxConcurrent = 2;

  enqueue(agentId: string, text: string, priority: VoiceQueueItem['priority'] = 'normal'): string {
    const id = `vq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.queue.push({ id, agentId, text, priority, createdAt: Date.now(), status: 'pending' });
    this.queue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    return id;
  }

  dequeue(): VoiceQueueItem | null {
    const pending = this.queue.find(item => item.status === 'pending');
    if (pending) pending.status = 'processing';
    return pending || null;
  }

  complete(id: string, success: boolean): void {
    const item = this.queue.find(i => i.id === id);
    if (item) item.status = success ? 'done' : 'failed';
  }

  getStats() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(i => i.status === 'pending').length,
      processing: this.queue.filter(i => i.status === 'processing').length,
      done: this.queue.filter(i => i.status === 'done').length,
    };
  }
}

export const voiceQueue = new VoiceQueue();
