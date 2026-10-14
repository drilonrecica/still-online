// Little "buddy" figure, colored by presence. Original artwork.
import type { ContactStatus } from '@/content/types';

export const STATUS_COLORS: Record<ContactStatus, string> = {
  online: '#3aa83a',
  away: '#e8a317',
  busy: '#d6372f',
  offline: '#9a9a9a',
};

export const STATUS_LABELS: Record<ContactStatus, string> = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
};

export function StatusIcon({
  status,
  size = 16,
}: {
  status: ContactStatus;
  size?: number;
}) {
  const color = STATUS_COLORS[status];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      role="img"
      aria-label={STATUS_LABELS[status]}
      data-status={status}
    >
      <circle cx="8" cy="4.5" r="3" fill={color} />
      <path d="M2 14c0-3.6 2.7-5.5 6-5.5s6 1.9 6 5.5z" fill={color} />
    </svg>
  );
}
