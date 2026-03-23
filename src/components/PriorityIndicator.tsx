import { Priority } from '../types';

interface PriorityIndicatorProps {
  priority: Priority;
  showLabel?: boolean;
}

const priorityColors: Record<Priority, string> = {
  'Critical': 'bg-red-500',
  'High': 'bg-orange-500',
  'Medium': 'bg-yellow-500',
  'Low': 'bg-green-500'
};

export function PriorityIndicator({ priority, showLabel = false }: PriorityIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${priorityColors[priority]}`} title={priority} />
      {showLabel && <span className="text-sm text-gray-600">{priority}</span>}
    </div>
  );
}
