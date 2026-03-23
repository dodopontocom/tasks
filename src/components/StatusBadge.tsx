import { Status } from '../types';

interface StatusBadgeProps {
  status: Status;
  onClick?: () => void;
}

const statusColors: Record<Status, string> = {
  'Backlog': 'bg-gray-100 text-gray-700 border-gray-300',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-300',
  'In Review': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Done': 'bg-green-100 text-green-700 border-green-300',
  'Blocked': 'bg-red-100 text-red-700 border-red-300'
};

export function StatusBadge({ status, onClick }: StatusBadgeProps) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[status]} ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      }`}
      onClick={onClick}
    >
      {status}
    </span>
  );
}
