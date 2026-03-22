'use client';
import { ModerationQueue } from './ModerationQueue';

export function ContentModeration() {
  return (
    <div>
      <h3 className="font-bold text-white font-space-grotesk mb-4">Content Moderation</h3>
      <ModerationQueue />
    </div>
  );
}
export default ContentModeration;
