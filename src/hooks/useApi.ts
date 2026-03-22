'use client'

import useSWR from 'swr'
import { mutate } from 'swr'

// Types
export interface Project {
  id: string
  name: string
  description: string | null
  color: string
  createdAt: string
  updatedAt: string
  _count?: {
    accounts: number
    databases: number
    tasks: number
  }
}

export interface Account {
  id: string
  phone: string
  name: string
  status: 'ONLINE' | 'OFFLINE' | 'LIMITED' | 'WARMING'
  folder: 'WORK' | 'ADMINS' | 'PERSONAL'
  projectId: string
  
  proxyType: string | null
  proxyHost: string | null
  proxyPort: string | null
  proxyUser: string | null
  proxyPassword: string | null
  
  tdataPath: string | null
  messagesSent: number
  invitesSent: number
  lastActiveAt: string | null
  warmupProgress: number | null
  warmupDays: number | null
  
  createdAt: string
  updatedAt: string
}

export interface Database {
  id: string
  name: string
  source: string
  count: number
  data: string | null
  projectId: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  name: string
  type: 'PARSING' | 'INVITING' | 'MESSAGING' | 'WARMUP' | 'COMMENTING'
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ERROR'
  progress: number
  target: number
  completed: number
  speed: string | null
  eta: string | null
  config: string | null
  error: string | null
  projectId: string
  accountId: string | null
  createdAt: string
  updatedAt: string
}

// Fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json())

// ==================== PROJECTS ====================

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<Project[]>('/api/projects', fetcher)
  
  const createProject = async (project: { name: string; description?: string; color?: string }) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    })
    if (!res.ok) throw new Error('Failed to create project')
    const newProject = await res.json()
    mutate()
    return newProject
  }
  
  const updateProject = async (id: string, data: Partial<Project>) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to update project')
    const updated = await res.json()
    mutate()
    return updated
  }
  
  const deleteProject = async (id: string) => {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete project')
    mutate()
  }
  
  return {
    projects: data || [],
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    mutate
  }
}

export function useProject(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Project>(
    id ? `/api/projects/${id}` : null,
    fetcher
  )
  
  return { project: data, isLoading, error, mutate }
}

// ==================== ACCOUNTS ====================

export function useAccounts(projectId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Account[]>(
    projectId ? `/api/accounts?projectId=${projectId}` : null,
    fetcher
  )
  
  const createAccount = async (account: {
    phone: string
    name: string
    projectId: string
    folder?: string
    proxyType?: string
    proxyHost?: string
    proxyPort?: string
    proxyUser?: string
    proxyPassword?: string
    tdataPath?: string
  }) => {
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account)
    })
    if (!res.ok) throw new Error('Failed to create account')
    const newAccount = await res.json()
    mutate()
    return newAccount
  }
  
  const updateAccount = async (id: string, data: Partial<Account>) => {
    const res = await fetch(`/api/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to update account')
    const updated = await res.json()
    mutate()
    return updated
  }
  
  const deleteAccount = async (id: string) => {
    const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete account')
    mutate()
  }
  
  return {
    accounts: data || [],
    isLoading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    mutate
  }
}

// ==================== DATABASES ====================

export function useDatabases(projectId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Database[]>(
    projectId ? `/api/databases?projectId=${projectId}` : null,
    fetcher
  )
  
  const createDatabase = async (database: {
    name: string
    source: string
    projectId: string
    count?: number
    data?: unknown[]
  }) => {
    const res = await fetch('/api/databases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(database)
    })
    if (!res.ok) throw new Error('Failed to create database')
    const newDb = await res.json()
    mutate()
    return newDb
  }
  
  const deleteDatabase = async (id: string) => {
    const res = await fetch(`/api/databases/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete database')
    mutate()
  }
  
  return {
    databases: data || [],
    isLoading,
    error,
    createDatabase,
    deleteDatabase,
    mutate
  }
}

// ==================== TASKS ====================

export function useTasks(projectId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Task[]>(
    projectId ? `/api/tasks?projectId=${projectId}` : null,
    fetcher,
    { refreshInterval: 3000 } // Auto-refresh every 3 seconds
  )
  
  const createTask = async (task: {
    name: string
    type: string
    projectId: string
    accountId?: string
    target?: number
    config?: Record<string, unknown>
  }) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    })
    if (!res.ok) throw new Error('Failed to create task')
    const newTask = await res.json()
    mutate()
    return newTask
  }
  
  const updateTask = async (id: string, data: Partial<Task>) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to update task')
    const updated = await res.json()
    mutate()
    return updated
  }
  
  const deleteTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete task')
    mutate()
  }
  
  const startTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}/start`, { method: 'POST' })
    if (!res.ok) throw new Error('Failed to start task')
    mutate()
  }
  
  const pauseTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}/pause`, { method: 'POST' })
    if (!res.ok) throw new Error('Failed to pause task')
    mutate()
  }
  
  const stopTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}/stop`, { method: 'POST' })
    if (!res.ok) throw new Error('Failed to stop task')
    mutate()
  }
  
  return {
    tasks: data || [],
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    startTask,
    pauseTask,
    stopTask,
    mutate
  }
}

// Global mutate for cache invalidation
export { mutate }
