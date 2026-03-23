import { useState, useEffect } from 'react';
import { List, Calendar, ZoomIn, ZoomOut } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ListView } from './components/ListView';
import { tasksView } from './components/tasksView';
import { useProjects } from './hooks/useProjects';
import { ViewMode, ZoomLevel, Task } from './types';
import { formatDate } from './utils/dateHelpers';

function App() {
  const {
    projects,
    groups,
    tasks,
    dependencies,
    addProject,
    updateProject,
    deleteProject,
    addGroup,
    updateGroup,
    deleteGroup,
    addTask,
    updateTask,
    deleteTask,
    addDependency
  } = useProjects();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('tasks');
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('week');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [connectingMode, setConnectingMode] = useState(false);
  const [connectingFromTaskId, setConnectingFromTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        if (selectedProjectId) {
          const projectGroups = groups.filter(g => g.projectId === selectedProjectId);
          if (projectGroups.length > 0) {
            handleAddTask(projectGroups[0].id);
          }
        }
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        if (selectedProjectId) {
          handleAddGroup();
        }
      } else if (e.key === 'Delete') {
        e.preventDefault();
        if (selectedTaskId) {
          const task = tasks.find(t => t.id === selectedTaskId);
          if (task && confirm(`Delete task "${task.title}"?`)) {
            deleteTask(selectedTaskId);
            setSelectedTaskId(null);
          }
        }
      } else if (e.key === 'Escape') {
        if (connectingMode) {
          handleCancelConnecting();
        } else {
          setSelectedTaskId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProjectId, groups, selectedTaskId, tasks, connectingMode]);

  const currentGroups = groups.filter(g => g.projectId === selectedProjectId).sort((a, b) => a.order - b.order);
  const currentTasks = tasks.filter(t => currentGroups.some(g => g.id === t.groupId));
  const currentDependencies = dependencies.filter(d => d.projectId === selectedProjectId);

  const handleAddGroup = () => {
    if (!selectedProjectId) return;
    const groupName = prompt('Enter group name:');
    if (groupName?.trim()) {
      addGroup(selectedProjectId, groupName.trim());
    }
  };

  const handleAddTask = (groupId: string) => {
    const taskName = prompt('Enter task name:');
    if (taskName?.trim()) {
      const today = new Date();
      const newTask: Omit<Task, 'id'> = {
        title: taskName.trim(),
        assignee: 'Unassigned',
        status: 'Backlog',
        priority: 'Medium',
        startDate: formatDate(today),
        endDate: formatDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)),
        storyPoints: 0,
        groupId
      };
      addTask(groupId, newTask);
    }
  };

  const handleStartConnecting = (taskId: string) => {
    setConnectingMode(true);
    setConnectingFromTaskId(taskId);
  };

  const handleCompleteConnection = (toTaskId: string) => {
    if (connectingFromTaskId && selectedProjectId) {
      addDependency(connectingFromTaskId, toTaskId, selectedProjectId);
    }
    handleCancelConnecting();
  };

  const handleCancelConnecting = () => {
    setConnectingMode(false);
    setConnectingFromTaskId(null);
  };

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        onAddProject={addProject}
        onUpdateProject={(id, name) => updateProject(id, { name })}
        onDeleteProject={deleteProject}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {projects.find(p => p.id === selectedProjectId)?.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {currentTasks.length} tasks across {currentGroups.length} groups
              </p>
            </div>

            <div className="flex items-center gap-4">
              {connectingMode && (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                  <span>Connecting tasks...</span>
                  <button
                    onClick={handleCancelConnecting}
                    className="text-yellow-600 hover:text-yellow-800 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {viewMode === 'tasks' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoomLevel('week')}
                    className={`p-2 rounded transition-colors ${
                      zoomLevel === 'week' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="Week View"
                  >
                    <ZoomIn size={20} />
                  </button>
                  <button
                    onClick={() => setZoomLevel('month')}
                    className={`p-2 rounded transition-colors ${
                      zoomLevel === 'month' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="Month View"
                  >
                    <ZoomOut size={20} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List size={18} />
                  <span className="text-sm font-medium">List</span>
                </button>
                <button
                  onClick={() => setViewMode('tasks')}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                    viewMode === 'tasks' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Calendar size={18} />
                  <span className="text-sm font-medium">tasks</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'list' ? (
          <ListView
            groups={currentGroups}
            tasks={currentTasks}
            onAddGroup={handleAddGroup}
            onUpdateGroup={updateGroup}
            onDeleteGroup={deleteGroup}
            onAddTask={handleAddTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
          />
        ) : (
          <tasksView
            groups={currentGroups}
            tasks={currentTasks}
            dependencies={currentDependencies}
            zoomLevel={zoomLevel}
            onAddGroup={handleAddGroup}
            onUpdateGroup={updateGroup}
            onDeleteGroup={deleteGroup}
            onAddTask={handleAddTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
            connectingMode={connectingMode}
            connectingFromTaskId={connectingFromTaskId}
            onStartConnecting={handleStartConnecting}
            onCompleteConnection={handleCompleteConnection}
            onCancelConnecting={handleCancelConnecting}
          />
        )}
      </div>
    </div>
  );
}

export default App;
