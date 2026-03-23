import { useState } from 'react';
import { Plus, CreditCard as Edit2, Trash2, FolderOpen } from 'lucide-react';
import { Project } from '../types';

interface SidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onAddProject: (name: string) => void;
  onUpdateProject: (id: string, name: string) => void;
  onDeleteProject: (id: string) => void;
}

export function Sidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onAddProject,
  onUpdateProject,
  onDeleteProject
}: SidebarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      onAddProject(newProjectName.trim());
      setNewProjectName('');
      setIsAdding(false);
    }
  };

  const handleUpdateProject = (id: string) => {
    if (editingName.trim()) {
      onUpdateProject(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  const startEditing = (project: Project) => {
    setEditingId(project.id);
    setEditingName(project.name);
  };

  return (
    <div className="w-64 bg-[#1e1f25] text-white flex flex-col h-screen">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Tasks Manager</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase">Projects</h2>
          <button
            onClick={() => setIsAdding(true)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Add Project"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-1">
          {projects.map(project => (
            <div
              key={project.id}
              className={`group flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                selectedProjectId === project.id
                  ? 'bg-blue-600'
                  : 'hover:bg-gray-700'
              }`}
              onClick={() => onSelectProject(project.id)}
            >
              {editingId === project.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleUpdateProject(project.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateProject(project.id);
                    if (e.key === 'Escape') {
                      setEditingId(null);
                      setEditingName('');
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-gray-800 text-white px-2 py-1 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FolderOpen size={16} className="flex-shrink-0" />
                    <span className="text-sm truncate">{project.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(project);
                      }}
                      className="p-1 hover:bg-gray-600 rounded"
                      title="Rename"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete project "${project.name}"?`)) {
                          onDeleteProject(project.id);
                        }
                      }}
                      className="p-1 hover:bg-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {isAdding && (
            <div className="p-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onBlur={handleAddProject}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddProject();
                  if (e.key === 'Escape') {
                    setIsAdding(false);
                    setNewProjectName('');
                  }
                }}
                placeholder="Project name..."
                className="w-full bg-gray-800 text-white px-2 py-1 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span>Keyboard Shortcuts:</span>
          </div>
          <div className="ml-2 space-y-0.5">
            <div><kbd className="bg-gray-700 px-1.5 py-0.5 rounded">N</kbd> New Task</div>
            <div><kbd className="bg-gray-700 px-1.5 py-0.5 rounded">G</kbd> New Group</div>
            <div><kbd className="bg-gray-700 px-1.5 py-0.5 rounded">Del</kbd> Delete</div>
          </div>
        </div>
      </div>
    </div>
  );
}
