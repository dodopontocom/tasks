export type Status = 'Backlog' | 'In Progress' | 'In Review' | 'Done' | 'Blocked';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  title: string;
  assignee: string;
  status: Status;
  priority: Priority;
  startDate: string;
  endDate: string;
  storyPoints?: number;
  groupId: string;
}

export interface Group {
  id: string;
  title: string;
  projectId: string;
  collapsed: boolean;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  order: number;
}

export interface Dependency {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  projectId: string;
}

export type ViewMode = 'tasks' | 'list';

export type ZoomLevel = 'week' | 'month';
