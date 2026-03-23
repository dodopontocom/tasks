import { useState, useEffect } from 'react';
import { Project, Group, Task, Dependency } from '../types';
import {
  getProjects,
  saveProjects,
  getGroups,
  saveGroups,
  getTasks,
  saveTasks,
  getDependencies,
  saveDependencies,
  initializeSeedData,
  generateId
} from '../utils/storageHelpers';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);

  useEffect(() => {
    initializeSeedData();
    setProjects(getProjects());
    setGroups(getGroups());
    setTasks(getTasks());
    setDependencies(getDependencies());
  }, []);

  useEffect(() => {
    if (projects.length > 0) saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (groups.length > 0) saveGroups(groups);
  }, [groups]);

  useEffect(() => {
    if (tasks.length > 0) saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveDependencies(dependencies);
  }, [dependencies]);

  const addProject = (name: string) => {
    const newProject: Project = {
      id: generateId(),
      name,
      order: projects.length
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    setGroups(groups.filter(g => g.projectId !== id));
    const projectGroupIds = groups.filter(g => g.projectId === id).map(g => g.id);
    setTasks(tasks.filter(t => !projectGroupIds.includes(t.groupId)));
    setDependencies(dependencies.filter(d => d.projectId !== id));
  };

  const addGroup = (projectId: string, title: string) => {
    const projectGroups = groups.filter(g => g.projectId === projectId);
    const newGroup: Group = {
      id: generateId(),
      title,
      projectId,
      collapsed: false,
      order: projectGroups.length
    };
    setGroups([...groups, newGroup]);
  };

  const updateGroup = (id: string, updates: Partial<Group>) => {
    setGroups(groups.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
    setTasks(tasks.filter(t => t.groupId !== id));
  };

  const addTask = (groupId: string, task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      groupId
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    setDependencies(dependencies.filter(d => d.fromTaskId !== id && d.toTaskId !== id));
  };

  const addDependency = (fromTaskId: string, toTaskId: string, projectId: string) => {
    const exists = dependencies.some(
      d => d.fromTaskId === fromTaskId && d.toTaskId === toTaskId
    );
    if (!exists) {
      const newDependency: Dependency = {
        id: generateId(),
        fromTaskId,
        toTaskId,
        projectId
      };
      setDependencies([...dependencies, newDependency]);
    }
  };

  const removeDependency = (id: string) => {
    setDependencies(dependencies.filter(d => d.id !== id));
  };

  return {
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
    addDependency,
    removeDependency
  };
}
