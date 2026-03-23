import { Project, Group, Task, Dependency } from '../types';
import { formatDate, addDays } from './dateHelpers';

const STORAGE_KEYS = {
  PROJECTS: 'tasks_projects',
  GROUPS: 'tasks_groups',
  TASKS: 'tasks_tasks',
  DEPENDENCIES: 'tasks_dependencies',
  INITIALIZED: 'tasks_initialized'
};

export function getProjects(): Project[] {
  const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return data ? JSON.parse(data) : [];
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
}

export function getGroups(): Group[] {
  const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
  return data ? JSON.parse(data) : [];
}

export function saveGroups(groups: Group[]): void {
  localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
}

export function getTasks(): Task[] {
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  return data ? JSON.parse(data) : [];
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

export function getDependencies(): Dependency[] {
  const data = localStorage.getItem(STORAGE_KEYS.DEPENDENCIES);
  return data ? JSON.parse(data) : [];
}

export function saveDependencies(dependencies: Dependency[]): void {
  localStorage.setItem(STORAGE_KEYS.DEPENDENCIES, JSON.stringify(dependencies));
}

export function isInitialized(): boolean {
  return localStorage.getItem(STORAGE_KEYS.INITIALIZED) === 'true';
}

export function markInitialized(): void {
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function initializeSeedData(): void {
  if (isInitialized()) return;

  const today = new Date();
  const projectId = generateId();

  const project: Project = {
    id: projectId,
    name: 'My App v1.0',
    order: 0
  };

  const groups: Group[] = [
    { id: generateId(), title: 'Frontend', projectId, collapsed: false, order: 0 },
    { id: generateId(), title: 'Backend', projectId, collapsed: false, order: 1 },
    { id: generateId(), title: 'DevOps', projectId, collapsed: false, order: 2 }
  ];

  const tasks: Task[] = [
    {
      id: generateId(),
      title: 'Design Component Library',
      assignee: 'Sarah Chen',
      status: 'Done',
      priority: 'High',
      startDate: formatDate(addDays(today, -14)),
      endDate: formatDate(addDays(today, -7)),
      storyPoints: 8,
      groupId: groups[0].id
    },
    {
      id: generateId(),
      title: 'Build User Dashboard',
      assignee: 'Mike Johnson',
      status: 'In Progress',
      priority: 'Critical',
      startDate: formatDate(addDays(today, -5)),
      endDate: formatDate(addDays(today, 7)),
      storyPoints: 13,
      groupId: groups[0].id
    },
    {
      id: generateId(),
      title: 'Implement Responsive Navigation',
      assignee: 'Sarah Chen',
      status: 'In Review',
      priority: 'Medium',
      startDate: formatDate(addDays(today, -3)),
      endDate: formatDate(addDays(today, 2)),
      storyPoints: 5,
      groupId: groups[0].id
    },
    {
      id: generateId(),
      title: 'Setup REST API Structure',
      assignee: 'David Park',
      status: 'Done',
      priority: 'Critical',
      startDate: formatDate(addDays(today, -21)),
      endDate: formatDate(addDays(today, -14)),
      storyPoints: 8,
      groupId: groups[1].id
    },
    {
      id: generateId(),
      title: 'Implement Authentication Service',
      assignee: 'David Park',
      status: 'In Progress',
      priority: 'High',
      startDate: formatDate(addDays(today, -7)),
      endDate: formatDate(addDays(today, 5)),
      storyPoints: 13,
      groupId: groups[1].id
    },
    {
      id: generateId(),
      title: 'Database Schema Migration',
      assignee: 'Emma Wilson',
      status: 'Backlog',
      priority: 'High',
      startDate: formatDate(addDays(today, 5)),
      endDate: formatDate(addDays(today, 12)),
      storyPoints: 8,
      groupId: groups[1].id
    },
    {
      id: generateId(),
      title: 'Configure CI/CD Pipeline',
      assignee: 'Alex Kumar',
      status: 'Done',
      priority: 'Critical',
      startDate: formatDate(addDays(today, -28)),
      endDate: formatDate(addDays(today, -21)),
      storyPoints: 8,
      groupId: groups[2].id
    },
    {
      id: generateId(),
      title: 'Setup Monitoring & Logging',
      assignee: 'Alex Kumar',
      status: 'In Progress',
      priority: 'High',
      startDate: formatDate(addDays(today, -10)),
      endDate: formatDate(addDays(today, 3)),
      storyPoints: 5,
      groupId: groups[2].id
    },
    {
      id: generateId(),
      title: 'Production Deployment',
      assignee: 'Alex Kumar',
      status: 'Blocked',
      priority: 'Critical',
      startDate: formatDate(addDays(today, 10)),
      endDate: formatDate(addDays(today, 14)),
      storyPoints: 3,
      groupId: groups[2].id
    }
  ];

  const dependencies: Dependency[] = [
    {
      id: generateId(),
      fromTaskId: tasks[0].id,
      toTaskId: tasks[1].id,
      projectId
    },
    {
      id: generateId(),
      fromTaskId: tasks[3].id,
      toTaskId: tasks[4].id,
      projectId
    },
    {
      id: generateId(),
      fromTaskId: tasks[4].id,
      toTaskId: tasks[5].id,
      projectId
    }
  ];

  saveProjects([project]);
  saveGroups(groups);
  saveTasks(tasks);
  saveDependencies(dependencies);
  markInitialized();
}
