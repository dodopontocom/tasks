import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Group, Task, Dependency, ZoomLevel } from '../types';
import {
  parseDate,
  daysBetween,
  getWeeksInRange,
  getMonthsInRange,
  formatMonthYear,
  formatWeekRange,
  formatDate,
  addDays
} from '../utils/dateHelpers';
import { StatusBadge } from './StatusBadge';
import { PriorityIndicator } from './PriorityIndicator';

interface tasksViewProps {
  groups: Group[];
  tasks: Task[];
  dependencies: Dependency[];
  zoomLevel: ZoomLevel;
  onAddGroup: () => void;
  onUpdateGroup: (id: string, updates: Partial<Group>) => void;
  onDeleteGroup: (id: string) => void;
  onAddTask: (groupId: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
  connectingMode: boolean;
  connectingFromTaskId: string | null;
  onStartConnecting: (taskId: string) => void;
  onCompleteConnection: (toTaskId: string) => void;
  onCancelConnecting: () => void;
}

const ROW_HEIGHT = 48;
const DAY_WIDTH_WEEK = 20;
const DAY_WIDTH_MONTH = 8;

export function tasksView({
  groups,
  tasks,
  dependencies,
  zoomLevel,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  selectedTaskId,
  onSelectTask,
  connectingMode,
  connectingFromTaskId,
  onStartConnecting,
  onCompleteConnection,
  onCancelConnecting
}: tasksViewProps) {
  const [dragState, setDragState] = useState<{
    taskId: string;
    type: 'move' | 'resize-start' | 'resize-end';
    startX: number;
    originalStartDate: string;
    originalEndDate: string;
  } | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);

  const dayWidth = zoomLevel === 'week' ? DAY_WIDTH_WEEK : DAY_WIDTH_MONTH;

  const allDates = tasks.flatMap(t => [parseDate(t.startDate), parseDate(t.endDate)]);
  const minDate = allDates.length > 0 ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date();
  const maxDate = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : new Date();

  const timelineStart = addDays(minDate, -14);
  const timelineEnd = addDays(maxDate, 14);

  const timelineUnits = zoomLevel === 'week'
    ? getWeeksInRange(timelineStart, timelineEnd)
    : getMonthsInRange(timelineStart, timelineEnd);

  const today = new Date();
  const todayOffset = daysBetween(timelineStart, today) * dayWidth;

  const getTaskPosition = (task: Task) => {
    const start = parseDate(task.startDate);
    const end = parseDate(task.endDate);
    const left = daysBetween(timelineStart, start) * dayWidth;
    const width = Math.max(daysBetween(start, end) * dayWidth, 20);
    return { left, width };
  };

  const handleMouseDown = (
    e: React.MouseEvent,
    taskId: string,
    type: 'move' | 'resize-start' | 'resize-end'
  ) => {
    e.stopPropagation();
    if (connectingMode) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setDragState({
      taskId,
      type,
      startX: e.clientX,
      originalStartDate: task.startDate,
      originalEndDate: task.endDate
    });
  };

  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragState.startX;
      const deltaDays = Math.round(deltaX / dayWidth);

      if (deltaDays === 0) return;

      const originalStart = parseDate(dragState.originalStartDate);
      const originalEnd = parseDate(dragState.originalEndDate);

      if (dragState.type === 'move') {
        const newStart = addDays(originalStart, deltaDays);
        const newEnd = addDays(originalEnd, deltaDays);
        onUpdateTask(dragState.taskId, {
          startDate: formatDate(newStart),
          endDate: formatDate(newEnd)
        });
      } else if (dragState.type === 'resize-start') {
        const newStart = addDays(originalStart, deltaDays);
        if (newStart < originalEnd) {
          onUpdateTask(dragState.taskId, {
            startDate: formatDate(newStart)
          });
        }
      } else if (dragState.type === 'resize-end') {
        const newEnd = addDays(originalEnd, deltaDays);
        if (newEnd > originalStart) {
          onUpdateTask(dragState.taskId, {
            endDate: formatDate(newEnd)
          });
        }
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, dayWidth, onUpdateTask]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-green-500';
      case 'In Progress': return 'bg-blue-500';
      case 'In Review': return 'bg-yellow-500';
      case 'Blocked': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const handleBarClick = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    if (connectingMode && connectingFromTaskId) {
      if (taskId !== connectingFromTaskId) {
        onCompleteConnection(taskId);
      }
    } else {
      onSelectTask(taskId);
    }
  };

  const handleBarEdgeClick = (e: React.MouseEvent, taskId: string, edge: 'left' | 'right') => {
    e.stopPropagation();
    if (!connectingMode && edge === 'right') {
      onStartConnecting(taskId);
    }
  };

  let currentRowIndex = 0;

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      <div className="w-80 border-r border-gray-200 overflow-y-auto flex-shrink-0">
        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-3 z-10">
          <div className="font-semibold text-sm text-gray-700">Task List</div>
        </div>

        <div className="p-2">
          {groups.map(group => {
            const groupTasks = tasks.filter(t => t.groupId === group.id);
            const groupRowStart = currentRowIndex;
            currentRowIndex++;
            if (!group.collapsed) {
              currentRowIndex += groupTasks.length;
            }

            return (
              <div key={group.id}>
                <div
                  className="flex items-center justify-between px-2 py-2 hover:bg-gray-50 rounded"
                  style={{ height: ROW_HEIGHT }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                      onClick={() => onUpdateGroup(group.id, { collapsed: !group.collapsed })}
                      className="hover:bg-gray-200 p-1 rounded transition-colors flex-shrink-0"
                    >
                      {group.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <span className="font-semibold text-sm truncate">{group.title}</span>
                    <span className="text-xs text-gray-500">({groupTasks.length})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAddTask(group.id)}
                      className="p-1 hover:bg-blue-100 rounded transition-colors text-blue-600"
                      title="Add Task"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete group "${group.title}"?`)) {
                          onDeleteGroup(group.id);
                        }
                      }}
                      className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                      title="Delete Group"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {!group.collapsed && groupTasks.map(task => (
                  <div
                    key={task.id}
                    className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                      selectedTaskId === task.id ? 'bg-blue-50' : ''
                    } ${connectingMode && connectingFromTaskId === task.id ? 'bg-yellow-50' : ''}`}
                    style={{ height: ROW_HEIGHT }}
                    onClick={() => !connectingMode && onSelectTask(task.id)}
                  >
                    <div className="flex items-start gap-2 h-full">
                      <PriorityIndicator priority={task.priority} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{task.title}</div>
                        <div className="text-xs text-gray-500 truncate">{task.assignee}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          <button
            onClick={onAddGroup}
            className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors w-full mt-2"
          >
            <Plus size={14} />
            Add Group
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative" ref={timelineRef}>
        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 z-20">
          <div className="flex" style={{ height: 48 }}>
            {timelineUnits.map((date, i) => (
              <div
                key={i}
                className="border-r border-gray-200 px-2 py-2 text-xs font-medium text-gray-700"
                style={{
                  minWidth: zoomLevel === 'week' ? 140 : 240,
                  width: zoomLevel === 'week' ? 140 : 240
                }}
              >
                {zoomLevel === 'week' ? formatWeekRange(date) : formatMonthYear(date)}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          {todayOffset >= 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{ left: todayOffset }}
            >
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full"></div>
            </div>
          )}

          {(() => {
            let rowIdx = 0;
            return groups.map(group => {
              const groupTasks = tasks.filter(t => t.groupId === group.id);
              const groupRow = rowIdx;
              rowIdx++;

              const taskRows = !group.collapsed ? groupTasks.map((task, i) => {
                const row = rowIdx;
                rowIdx++;
                return { task, row };
              }) : [];

              return (
                <div key={group.id}>
                  <div
                    className="border-b border-gray-100"
                    style={{ height: ROW_HEIGHT }}
                  />

                  {taskRows.map(({ task, row }) => {
                    const { left, width } = getTaskPosition(task);
                    const isConnecting = connectingMode && connectingFromTaskId === task.id;
                    const isConnectable = connectingMode && connectingFromTaskId && connectingFromTaskId !== task.id;

                    return (
                      <div
                        key={task.id}
                        className="border-b border-gray-100 relative"
                        style={{ height: ROW_HEIGHT }}
                      >
                        <div
                          className={`absolute top-2 h-8 rounded shadow-sm cursor-pointer transition-all ${getStatusColor(task.status)} ${
                            selectedTaskId === task.id ? 'ring-2 ring-blue-500' : ''
                          } ${isConnecting ? 'ring-2 ring-yellow-500' : ''} ${
                            isConnectable ? 'ring-2 ring-green-400 animate-pulse' : ''
                          }`}
                          style={{ left, width }}
                          onClick={(e) => handleBarClick(e, task.id)}
                          onMouseDown={(e) => handleMouseDown(e, task.id, 'move')}
                        >
                          <div
                            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black hover:bg-opacity-20"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleMouseDown(e, task.id, 'resize-start');
                            }}
                            onClick={(e) => handleBarEdgeClick(e, task.id, 'left')}
                          />

                          <div className="px-2 py-1 text-xs text-white font-medium truncate pointer-events-none">
                            {task.title}
                          </div>

                          <div
                            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black hover:bg-opacity-20"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleMouseDown(e, task.id, 'resize-end');
                            }}
                            onClick={(e) => handleBarEdgeClick(e, task.id, 'right')}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            });
          })()}
        </div>

        <svg
          className="absolute top-0 left-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          {dependencies.map(dep => {
            const fromTask = tasks.find(t => t.id === dep.fromTaskId);
            const toTask = tasks.find(t => t.id === dep.toTaskId);

            if (!fromTask || !toTask) return null;

            let fromRowIndex = 0;
            let toRowIndex = 0;
            let currentRow = 0;

            for (const group of groups) {
              currentRow++;
              if (!group.collapsed) {
                const groupTasks = tasks.filter(t => t.groupId === group.id);
                for (const task of groupTasks) {
                  if (task.id === fromTask.id) fromRowIndex = currentRow;
                  if (task.id === toTask.id) toRowIndex = currentRow;
                  currentRow++;
                }
              }
            }

            const fromPos = getTaskPosition(fromTask);
            const toPos = getTaskPosition(toTask);

            const x1 = fromPos.left + fromPos.width;
            const y1 = fromRowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
            const x2 = toPos.left;
            const y2 = toRowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;

            const midX = (x1 + x2) / 2;

            return (
              <g key={dep.id}>
                <path
                  d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                  stroke="#6366f1"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          })}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#6366f1" />
            </marker>
          </defs>
        </svg>
      </div>
    </div>
  );
}
