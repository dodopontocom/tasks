import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Group, Task, Status, Priority } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityIndicator } from './PriorityIndicator';

interface ListViewProps {
  groups: Group[];
  tasks: Task[];
  onAddGroup: () => void;
  onUpdateGroup: (id: string, updates: Partial<Group>) => void;
  onDeleteGroup: (id: string) => void;
  onAddTask: (groupId: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
}

const STATUS_OPTIONS: Status[] = ['Backlog', 'In Progress', 'In Review', 'Done', 'Blocked'];
const PRIORITY_OPTIONS: Priority[] = ['Critical', 'High', 'Medium', 'Low'];

export function ListView({
  groups,
  tasks,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  selectedTaskId,
  onSelectTask
}: ListViewProps) {
  const [editingCell, setEditingCell] = useState<{ taskId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEditing = (taskId: string, field: string, currentValue: string | number | undefined) => {
    setEditingCell({ taskId, field });
    setEditValue(String(currentValue || ''));
  };

  const saveEdit = (taskId: string, field: keyof Task) => {
    if (editingCell) {
      let value: string | number = editValue;
      if (field === 'storyPoints') {
        value = editValue ? parseInt(editValue) : 0;
      }
      onUpdateTask(taskId, { [field]: value });
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, taskId: string, field: keyof Task) => {
    if (e.key === 'Enter') {
      saveEdit(taskId, field);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="min-w-[1000px]">
        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
          <div className="flex items-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
            <div className="w-80">Task</div>
            <div className="w-40">Assignee</div>
            <div className="w-36">Status</div>
            <div className="w-32">Priority</div>
            <div className="w-32">Start Date</div>
            <div className="w-32">End Date</div>
            <div className="w-24">Points</div>
            <div className="w-16"></div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {groups.map(group => {
            const groupTasks = tasks.filter(t => t.groupId === group.id);
            return (
              <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateGroup(group.id, { collapsed: !group.collapsed })}
                      className="hover:bg-gray-200 p-1 rounded transition-colors"
                    >
                      {group.collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <input
                      type="text"
                      value={group.title}
                      onChange={(e) => onUpdateGroup(group.id, { title: e.target.value })}
                      className="font-semibold text-gray-800 bg-transparent border-none outline-none focus:bg-white focus:px-2 focus:py-1 focus:rounded"
                    />
                    <span className="text-sm text-gray-500">({groupTasks.length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAddTask(group.id)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={14} />
                      Add Task
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete group "${group.title}"?`)) {
                          onDeleteGroup(group.id);
                        }
                      }}
                      className="p-2 hover:bg-red-100 rounded transition-colors text-red-600"
                      title="Delete Group"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {!group.collapsed && (
                  <div>
                    {groupTasks.map(task => (
                      <div
                        key={task.id}
                        className={`flex items-center px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          selectedTaskId === task.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => onSelectTask(task.id)}
                      >
                        <div className="w-80">
                          {editingCell?.taskId === task.id && editingCell?.field === 'title' ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveEdit(task.id, 'title')}
                              onKeyDown={(e) => handleKeyDown(e, task.id, 'title')}
                              className="w-full px-2 py-1 border border-blue-500 rounded outline-none"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(task.id, 'title', task.title);
                              }}
                              className="cursor-text hover:bg-gray-100 px-2 py-1 rounded"
                            >
                              {task.title}
                            </div>
                          )}
                        </div>

                        <div className="w-40">
                          {editingCell?.taskId === task.id && editingCell?.field === 'assignee' ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveEdit(task.id, 'assignee')}
                              onKeyDown={(e) => handleKeyDown(e, task.id, 'assignee')}
                              className="w-full px-2 py-1 border border-blue-500 rounded outline-none text-sm"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(task.id, 'assignee', task.assignee);
                              }}
                              className="cursor-text hover:bg-gray-100 px-2 py-1 rounded text-sm"
                            >
                              {task.assignee}
                            </div>
                          )}
                        </div>

                        <div className="w-36">
                          <select
                            value={task.status}
                            onChange={(e) => onUpdateTask(task.id, { status: e.target.value as Status })}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent border-none outline-none cursor-pointer"
                          >
                            {STATUS_OPTIONS.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <div className="mt-1">
                            <StatusBadge status={task.status} />
                          </div>
                        </div>

                        <div className="w-32">
                          <select
                            value={task.priority}
                            onChange={(e) => onUpdateTask(task.id, { priority: e.target.value as Priority })}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent border-none outline-none cursor-pointer"
                          >
                            {PRIORITY_OPTIONS.map(priority => (
                              <option key={priority} value={priority}>{priority}</option>
                            ))}
                          </select>
                          <div className="mt-1">
                            <PriorityIndicator priority={task.priority} showLabel />
                          </div>
                        </div>

                        <div className="w-32">
                          <input
                            type="date"
                            value={task.startDate}
                            onChange={(e) => onUpdateTask(task.id, { startDate: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="w-32">
                          <input
                            type="date"
                            value={task.endDate}
                            onChange={(e) => onUpdateTask(task.id, { endDate: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="w-24">
                          {editingCell?.taskId === task.id && editingCell?.field === 'storyPoints' ? (
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveEdit(task.id, 'storyPoints')}
                              onKeyDown={(e) => handleKeyDown(e, task.id, 'storyPoints')}
                              className="w-full px-2 py-1 border border-blue-500 rounded outline-none text-sm"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(task.id, 'storyPoints', task.storyPoints);
                              }}
                              className="cursor-text hover:bg-gray-100 px-2 py-1 rounded text-sm text-center"
                            >
                              {task.storyPoints || '-'}
                            </div>
                          )}
                        </div>

                        <div className="w-16 flex justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete task "${task.title}"?`)) {
                                onDeleteTask(task.id);
                              }
                            }}
                            className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                            title="Delete Task"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={onAddGroup}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors w-full"
          >
            <Plus size={16} />
            Add Group
          </button>
        </div>
      </div>
    </div>
  );
}
