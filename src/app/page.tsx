'use client'

import * as React from 'react'
import useSWR, { mutate } from 'swr'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bell,
  Bot,
  CheckCircle,
  ChevronDown,
  Crown,
  Database,
  Edit,
  Flame,
  FolderSearch,
  Globe,
  HelpCircle,
  Home,
  MessageCircle,
  MessageSquare,
  Moon,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  Square,
  Sun,
  Target,
  TrendingUp,
  Trash2,
  Upload,
  User,
  UserPlus,
  UserSearch,
  Users,
  Briefcase,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

// ==================== TYPES ====================

type Page = 'dashboard' | 'accounts' | 'warmup' | 'parsing-groups' | 'parsing-members' | 'inviting' | 'commenting' | 'messaging' | 'analytics' | 'settings'
type AccountFolder = 'WORK' | 'ADMINS' | 'PERSONAL'

interface Project {
  id: string
  name: string
  description: string | null
  color: string
  createdAt: string
  updatedAt: string
  accounts?: Account[]
  databases?: Database[]
  tasks?: Task[]
}

interface Account {
  id: string
  phone: string
  name: string
  status: string
  folder: string
  projectId: string
  proxyHost?: string | null
  proxyPort?: string | null
  proxyType?: string | null
  messagesSent: number
  invitesSent: number
  warmupProgress?: number | null
  warmupDays?: number | null
  lastActiveAt?: string | null
  createdAt: string
}

interface Database {
  id: string
  name: string
  source: string
  count: number
  projectId: string
  createdAt: string
}

interface Task {
  id: string
  name: string
  type: string
  status: string
  progress: number
  target: number
  completed: number
  speed?: string | null
  eta?: string | null
  projectId: string
  accountId?: string | null
  createdAt: string
}

// ==================== FETCHER ====================

const fetcher = async (url: string) => {
  try {
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

// ==================== NAVIGATION ====================

const navItems = [
  { id: 'dashboard', label: 'Дашборд', icon: Home },
  { id: 'accounts', label: 'Аккаунты', icon: Users },
  { id: 'warmup', label: 'Прогрев', icon: Flame },
  { id: 'parsing-groups', label: 'Парсинг групп', icon: FolderSearch },
  { id: 'parsing-members', label: 'Парсинг участников', icon: UserSearch },
  { id: 'inviting', label: 'Инвайты', icon: UserPlus },
  { id: 'commenting', label: 'Комментинг', icon: MessageCircle },
  { id: 'messaging', label: 'Рассылки', icon: Send },
  { id: 'analytics', label: 'Аналитика', icon: TrendingUp },
]

const folderConfig = {
  WORK: { label: 'В работе', icon: Briefcase, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  ADMINS: { label: 'Админы', icon: Shield, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  PERSONAL: { label: 'Личные нужды', icon: User, color: 'text-green-400', bgColor: 'bg-green-500/20' },
}

const statusColors: Record<string, string> = {
  ONLINE: 'bg-green-500',
  OFFLINE: 'bg-gray-500',
  LIMITED: 'bg-yellow-500',
  WARMING: 'bg-orange-500',
}

const statusLabels: Record<string, string> = {
  ONLINE: 'Онлайн',
  OFFLINE: 'Офлайн',
  LIMITED: 'Ограничен',
  WARMING: 'Прогрев',
}

const chartConfig = {
  messages: { label: 'Сообщения', color: 'oklch(0.65 0.2 260)' },
  invites: { label: 'Инвайты', color: 'oklch(0.7 0.15 180)' },
} satisfies ChartConfig

// ==================== MAIN APP ====================

export default function TelegramComboApp() {
  const [currentPage, setCurrentPage] = React.useState<Page>('dashboard')
  const [darkMode, setDarkMode] = React.useState(true)

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useSWR<Project[]>('/api/projects', fetcher)
  const [currentProjectId, setCurrentProjectId] = React.useState<string | null>(null)
  
  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0]
  
  // Set first project as current when loaded
  React.useEffect(() => {
    if (projects.length > 0 && !currentProjectId) {
      setCurrentProjectId(projects[0].id)
    }
  }, [projects, currentProjectId])

  // Fetch project data
  const { data: accounts = [], mutate: mutateAccounts } = useSWR<Account[]>(
    currentProjectId ? `/api/accounts?projectId=${currentProjectId}` : null,
    fetcher
  )
  
  const { data: databases = [], mutate: mutateDatabases } = useSWR<Database[]>(
    currentProjectId ? `/api/databases?projectId=${currentProjectId}` : null,
    fetcher
  )
  
  const { data: tasks = [], mutate: mutateTasks } = useSWR<Task[]>(
    currentProjectId ? `/api/tasks?projectId=${currentProjectId}` : null,
    fetcher,
    { refreshInterval: 3000 }
  )

  // Dialogs
  const [showProjectDialog, setShowProjectDialog] = React.useState(false)
  const [editingProject, setEditingProject] = React.useState<Project | null>(null)
  const [showAccountDialog, setShowAccountDialog] = React.useState(false)
  const [editingAccount, setEditingAccount] = React.useState<Account | null>(null)

  return (
    <div className="dark">
      <SidebarProvider defaultOpen={true}>
        <Sidebar variant="sidebar" collapsible="icon" className="border-r border-sidebar-border">
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-lg font-bold text-sidebar-foreground">Telegram Комбайн</span>
                <span className="text-xs text-muted-foreground">v2.4.0</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {/* Current Project */}
            {currentProject && (
              <div className="p-3 group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: currentProject.color }} />
                  <span className="text-sm font-medium truncate flex-1">{currentProject.name}</span>
                </div>
              </div>
            )}

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Навигация
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={currentPage === item.id}
                        onClick={() => setCurrentPage(item.id as Page)}
                        tooltip={item.label}
                        className={cn(
                          'transition-all duration-200',
                          currentPage === item.id && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            {/* Active Tasks */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Активные задачи
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {tasks.filter(t => t.status === 'RUNNING').slice(0, 3).map((task) => (
                    <SidebarMenuItem key={task.id}>
                      <SidebarMenuButton tooltip={task.name} className="group-data-[collapsible=icon]:p-2">
                        <div className="relative">
                          <Activity className="h-5 w-5 text-blue-400" />
                          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        </div>
                        <div className="flex flex-col items-start gap-0.5 overflow-hidden">
                          <span className="text-sm truncate w-full">{task.name.slice(0, 18)}...</span>
                          <Progress value={task.progress} className="h-1 w-full" />
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setCurrentPage('settings')} tooltip="Настройки">
                  <Settings className="h-5 w-5" />
                  <span>Настройки</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          {/* Header */}
          <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-6" />

            {/* Project Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-[200px]">
                  {currentProject ? (
                    <>
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: currentProject.color }} />
                      <span className="truncate flex-1 text-left">{currentProject.name}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Выберите проект</span>
                  )}
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[280px]">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Проекты
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => { setEditingProject(null); setShowProjectDialog(true) }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {projectsLoading ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">Загрузка...</div>
                ) : (
                  projects.map((project) => (
                    <DropdownMenuItem
                      key={project.id}
                      onClick={() => setCurrentProjectId(project.id)}
                      className={cn('gap-2', currentProjectId === project.id && 'bg-accent')}
                    >
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                      <div className="flex-1">
                        <div className="font-medium">{project.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {project.accounts?.length || 0} аккаунтов
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => { e.stopPropagation(); setEditingProject(project); setShowProjectDialog(true) }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setEditingProject(null); setShowProjectDialog(true) }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Новый проект
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex-1">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск..."
                  className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
                />
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {currentPage === 'dashboard' && (
              <DashboardPage
                project={currentProject}
                accounts={accounts}
                tasks={tasks}
                databases={databases}
              />
            )}
            {currentPage === 'accounts' && (
              <AccountsPage
                project={currentProject}
                accounts={accounts}
                onAddAccount={() => setShowAccountDialog(true)}
                onEditAccount={(acc) => { setEditingAccount(acc); setShowAccountDialog(true) }}
                mutate={mutateAccounts}
              />
            )}
            {currentPage === 'warmup' && <WarmupPage project={currentProject} accounts={accounts} />}
            {currentPage === 'parsing-groups' && <ParsingGroupsPage project={currentProject} />}
            {currentPage === 'parsing-members' && (
              <ParsingMembersPage project={currentProject} databases={databases} />
            )}
            {currentPage === 'inviting' && (
              <InvitingPage project={currentProject} tasks={tasks.filter(t => t.type === 'INVITING')} />
            )}
            {currentPage === 'commenting' && <CommentingPage project={currentProject} accounts={accounts} />}
            {currentPage === 'messaging' && (
              <MessagingPage project={currentProject} tasks={tasks.filter(t => t.type === 'MESSAGING')} />
            )}
            {currentPage === 'analytics' && <AnalyticsPage project={currentProject} />}
            {currentPage === 'settings' && <SettingsPage />}
          </main>

          {/* Footer */}
          <footer className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur py-3 px-4 lg:px-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Telegram Комбайн v2.4.0</span>
                <Separator orientation="vertical" className="h-4" />
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Система активна
                </span>
              </div>
              {currentProject && (
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: currentProject.color }} />
                  {currentProject.name}
                </div>
              )}
            </div>
          </footer>
        </SidebarInset>
      </SidebarProvider>

      {/* Project Dialog */}
      <ProjectDialog
        open={showProjectDialog}
        onOpenChange={setShowProjectDialog}
        project={editingProject}
        onSuccess={() => {
          mutate('/api/projects')
          setShowProjectDialog(false)
          setEditingProject(null)
        }}
      />

      {/* Account Dialog */}
      <AccountDialog
        open={showAccountDialog}
        onOpenChange={setShowAccountDialog}
        account={editingAccount}
        projectId={currentProjectId}
        onSuccess={() => {
          mutateAccounts()
          setShowAccountDialog(false)
          setEditingAccount(null)
        }}
      />
    </div>
  )
}

// ==================== PROJECT DIALOG ====================

function ProjectDialog({
  open,
  onOpenChange,
  project,
  onSuccess
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  onSuccess: () => void
}) {
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [color, setColor] = React.useState('#8B5CF6')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (project) {
      setName(project.name)
      setDescription(project.description || '')
      setColor(project.color)
    } else {
      setName('')
      setDescription('')
      setColor('#8B5CF6')
    }
  }, [project, open])

  const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#06B6D4', '#84CC16']

  const handleSubmit = async () => {
    if (!name.trim()) return
    
    setLoading(true)
    try {
      if (project) {
        await fetch(`/api/projects/${project.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, color })
        })
      } else {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, color })
        })
      }
      onSuccess()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!project) return
    setLoading(true)
    try {
      await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
      onSuccess()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{project ? 'Редактировать проект' : 'Новый проект'}</DialogTitle>
          <DialogDescription>
            {project ? 'Измените настройки проекта' : 'Создайте новый проект'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Название</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Project" />
          </div>
          <div className="grid gap-2">
            <Label>Описание</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание проекта..."
              className="min-h-[80px]"
            />
          </div>
          <div className="grid gap-2">
            <Label>Цвет</Label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                    color === c ? 'border-white scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          {project && (
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button onClick={handleSubmit} disabled={loading || !name.trim()} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              {project ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ==================== ACCOUNT DIALOG ====================

function AccountDialog({
  open,
  onOpenChange,
  account,
  projectId,
  onSuccess
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: Account | null
  projectId: string | null
  onSuccess: () => void
}) {
  const [name, setName] = React.useState('')
  const [folder, setFolder] = React.useState<AccountFolder>('WORK')
  const [proxyHost, setProxyHost] = React.useState('')
  const [proxyPort, setProxyPort] = React.useState('')
  const [proxyType, setProxyType] = React.useState('socks5')
  const [proxyUser, setProxyUser] = React.useState('')
  const [proxyPassword, setProxyPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [tdataFiles, setTdataFiles] = React.useState<FileList | null>(null)
  const [tdataName, setTdataName] = React.useState('')
  const [isDragging, setIsDragging] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (account) {
      setName(account.name)
      setFolder(account.folder as AccountFolder)
      setProxyHost(account.proxyHost || '')
      setProxyPort(account.proxyPort || '')
      setProxyType(account.proxyType || 'socks5')
    } else {
      setName('')
      setFolder('WORK')
      setProxyHost('')
      setProxyPort('')
      setProxyType('socks5')
      setProxyUser('')
      setProxyPassword('')
      setTdataFiles(null)
      setTdataName('')
      setUploadProgress(0)
    }
  }, [account, open])

  const handleTdataDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processTdataFiles(files)
    }
  }

  const handleTdataSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processTdataFiles(files)
    }
  }

  const processTdataFiles = (files: FileList) => {
    setTdataFiles(files)
    // Auto-detect name from folder
    const firstFile = files[0]
    if (firstFile) {
      const pathParts = firstFile.webkitRelativePath?.split('/') || []
      if (pathParts.length > 0) {
        const detectedName = pathParts[0]
        setTdataName(detectedName)
        setName(prev => prev || detectedName)
      }
    }
  }

  const handleSubmit = async () => {
    if (!name.trim() || !projectId) return
    if (!account && !tdataFiles) return
    
    setLoading(true)
    setUploadProgress(0)
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      if (account) {
        await fetch(`/api/accounts/${account.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name, 
            folder, 
            proxyHost, 
            proxyPort, 
            proxyType,
            proxyUser,
            proxyPassword
          })
        })
      } else {
        // In production: upload tdata files to server
        await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            phone: `tdata_${tdataName}`, 
            name, 
            folder, 
            projectId, 
            proxyHost, 
            proxyPort, 
            proxyType,
            proxyUser,
            proxyPassword,
            tdataPath: tdataName,
            status: 'OFFLINE'
          })
        })
      }
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      setTimeout(() => {
        onSuccess()
        setTdataFiles(null)
        setTdataName('')
        setUploadProgress(0)
      }, 300)
      
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!account) return
    setLoading(true)
    try {
      await fetch(`/api/accounts/${account.id}`, { method: 'DELETE' })
      onSuccess()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = name.trim() && (account || tdataFiles)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{account ? 'Редактировать аккаунт' : 'Добавить аккаунт'}</DialogTitle>
          <DialogDescription>
            {account 
              ? `${account.name}` 
              : 'Загрузите папку tdata для добавления аккаунта'
            }
          </DialogDescription>
        </DialogHeader>

        {/* TData Upload - Only for new accounts */}
        {!account && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              // @ts-expect-error webkitdirectory is valid HTML attribute
              webkitdirectory=""
              directory=""
              multiple
              onChange={handleTdataSelect}
              className="hidden"
            />
            
            <div
              onClick={() => !loading && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleTdataDrop}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-all',
                loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                isDragging 
                  ? 'border-primary bg-primary/10 scale-[1.02]' 
                  : tdataFiles 
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
              )}
            >
              {loading && uploadProgress > 0 ? (
                <>
                  <RefreshCw className="h-10 w-10 mx-auto text-primary mb-3 animate-spin" />
                  <p className="text-sm font-medium mb-2">Загрузка tdata...</p>
                  <Progress value={uploadProgress} className="h-2 max-w-[200px] mx-auto" />
                </>
              ) : tdataFiles ? (
                <>
                  <CheckCircle className="h-10 w-10 mx-auto text-green-500 mb-3" />
                  <p className="text-sm font-medium mb-1 text-green-400">TData загружен!</p>
                  <p className="text-xs text-muted-foreground">
                    {tdataFiles.length} файлов • {tdataName}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm font-medium mb-1">Перетащите tdata папку сюда</p>
                  <p className="text-xs text-muted-foreground">или нажмите для выбора папки</p>
                </>
              )}
            </div>
            
            {tdataFiles && !loading && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-muted-foreground">Аккаунт:</span>
                <span className="font-medium text-green-400">{tdataName}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto h-6 px-2 text-muted-foreground hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); setTdataFiles(null); setTdataName('') }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Account Settings */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Название аккаунта</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Marketing Bot #1" 
            />
          </div>
          <div className="grid gap-2">
            <Label>Папка</Label>
            <Select value={folder} onValueChange={(v) => setFolder(v as AccountFolder)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="WORK">💼 В работе</SelectItem>
                <SelectItem value="ADMINS">🛡️ Админы</SelectItem>
                <SelectItem value="PERSONAL">👤 Личные нужды</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Proxy Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Прокси</Label>
            <span className="text-xs text-muted-foreground">Опционально</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-xs">Тип</Label>
              <Select value={proxyType} onValueChange={setProxyType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="socks5">SOCKS5</SelectItem>
                  <SelectItem value="socks4">SOCKS4</SelectItem>
                  <SelectItem value="http">HTTP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Хост</Label>
              <Input value={proxyHost} onChange={(e) => setProxyHost(e.target.value)} placeholder="proxy.com" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label className="text-xs">Порт</Label>
              <Input value={proxyPort} onChange={(e) => setProxyPort(e.target.value)} placeholder="1080" />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Логин</Label>
              <Input value={proxyUser} onChange={(e) => setProxyUser(e.target.value)} placeholder="user" />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Пароль</Label>
              <Input 
                type="password" 
                value={proxyPassword} 
                onChange={(e) => setProxyPassword(e.target.value)} 
                placeholder="••••" 
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {account && (
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Отмена
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !canSubmit} 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {uploadProgress > 0 ? `${uploadProgress}%` : 'Загрузка...'}
                </>
              ) : account ? 'Сохранить' : 'Добавить аккаунт'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ==================== PAGE COMPONENTS ====================

function DashboardPage({ project, accounts, tasks, databases }: { 
  project?: Project
  accounts: Account[]
  tasks: Task[]
  databases: Database[]
}) {
  const stats = [
    { label: 'Аккаунтов', value: accounts.length, icon: Users, color: 'text-blue-400' },
    { label: 'Онлайн', value: accounts.filter(a => a.status === 'ONLINE').length, icon: Activity, color: 'text-green-400' },
    { label: 'Задач', value: tasks.filter(t => t.status === 'RUNNING').length, icon: Target, color: 'text-purple-400' },
    { label: 'Баз данных', value: databases.length, icon: Database, color: 'text-cyan-400' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {project && <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />}
        <h1 className="text-2xl font-bold">{project?.name || 'Дашборд'}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={cn('h-5 w-5', stat.color)} />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Активные задачи</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {tasks.filter(t => t.status === 'RUNNING').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Нет активных задач</div>
            ) : (
              tasks.filter(t => t.status === 'RUNNING').map(task => (
                <div key={task.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{task.name}</span>
                    <Badge>Выполняется</Badge>
                  </div>
                  <Progress value={task.progress} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{task.completed.toLocaleString()} / {task.target.toLocaleString()}</span>
                    <span>{task.progress}%</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Базы данных</CardTitle></CardHeader>
          <CardContent>
            {databases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Нет сохранённых баз</div>
            ) : (
              <div className="space-y-2">
                {databases.slice(0, 5).map(db => (
                  <div key={db.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{db.name}</div>
                        <div className="text-xs text-muted-foreground">{db.source}</div>
                      </div>
                    </div>
                    <Badge variant="outline">{db.count.toLocaleString()}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FolderSection({ 
  folder, 
  accounts, 
  isOpen, 
  onToggle, 
  onAddAccount, 
  onEditAccount 
}: { 
  folder: AccountFolder
  accounts: Account[]
  isOpen: boolean
  onToggle: () => void
  onAddAccount: () => void
  onEditAccount: (acc: Account) => void
}) {
  const config = folderConfig[folder]

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', config.bgColor)}>
                  <config.icon className={cn('h-5 w-5', config.color)} />
                </div>
                <div>
                  <CardTitle className="text-base">{config.label}</CardTitle>
                  <CardDescription>{accounts.length} аккаунтов</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onAddAccount() }}>
                  <Plus className="h-4 w-4" />
                </Button>
                <ChevronDown className={cn('h-5 w-5 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {accounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Нет аккаунтов</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="rounded-lg border bg-muted/20 p-3 hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => onEditAccount(account)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs">
                              {account.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className={cn(
                            'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background',
                            statusColors[account.status] || 'bg-gray-500'
                          )} />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{account.name}</div>
                          <div className="text-xs text-muted-foreground">{account.phone}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="outline">
                        {statusLabels[account.status] || account.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {account.proxyHost && <Globe className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

function AccountsPage({ project, accounts, onAddAccount, onEditAccount, mutate }: {
  project?: Project
  accounts: Account[]
  onAddAccount: () => void
  onEditAccount: (acc: Account) => void
  mutate: () => void
}) {
  const [openFolders, setOpenFolders] = React.useState<AccountFolder[]>(['WORK', 'ADMINS', 'PERSONAL'])

  const toggleFolder = (folder: AccountFolder) => {
    setOpenFolders(prev => prev.includes(folder) ? prev.filter(f => f !== folder) : [...prev, folder])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {project && <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />}
          <div>
            <h1 className="text-2xl font-bold">Аккаунты</h1>
            <p className="text-muted-foreground">{accounts.length} аккаунтов</p>
          </div>
        </div>
        <Button onClick={onAddAccount} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Добавить аккаунт
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{accounts.length}</div><div className="text-xs text-muted-foreground">Всего</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{accounts.filter(a => a.status === 'ONLINE').length}</div><div className="text-xs text-muted-foreground">Онлайн</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{accounts.filter(a => a.folder === 'ADMINS').length}</div><div className="text-xs text-muted-foreground">Админов</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{accounts.filter(a => a.status === 'WARMING').length}</div><div className="text-xs text-muted-foreground">На прогреве</div></CardContent></Card>
      </div>

      <div className="space-y-4">
        <FolderSection 
          folder="WORK" 
          accounts={accounts.filter(a => a.folder === 'WORK')}
          isOpen={openFolders.includes('WORK')}
          onToggle={() => toggleFolder('WORK')}
          onAddAccount={onAddAccount}
          onEditAccount={onEditAccount}
        />
        <FolderSection 
          folder="ADMINS" 
          accounts={accounts.filter(a => a.folder === 'ADMINS')}
          isOpen={openFolders.includes('ADMINS')}
          onToggle={() => toggleFolder('ADMINS')}
          onAddAccount={onAddAccount}
          onEditAccount={onEditAccount}
        />
        <FolderSection 
          folder="PERSONAL" 
          accounts={accounts.filter(a => a.folder === 'PERSONAL')}
          isOpen={openFolders.includes('PERSONAL')}
          onToggle={() => toggleFolder('PERSONAL')}
          onAddAccount={onAddAccount}
          onEditAccount={onEditAccount}
        />
      </div>
    </div>
  )
}

// ==================== WARMUP SYSTEM ====================

const warmupPresets = [
  {
    id: 'cautious',
    name: 'Осторожный',
    duration: 14,
    description: 'Минимальный риск, медленный рост доверия',
    riskLevel: 'low',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    dailyActions: { min: 20, max: 40 },
    trustGrowth: 'Медленный',
    activities: {
      viewPosts: { enabled: true, min: 15, max: 25 },
      reactions: { enabled: true, min: 5, max: 10 },
      comments: { enabled: false, min: 0, max: 1 },
      saveMessages: { enabled: true, min: 2, max: 5 },
      joinChannels: { enabled: true, min: 1, max: 2 },
      stories: { enabled: true, min: 3, max: 5 },
      polls: { enabled: false, min: 0, max: 1 },
      voiceListen: { enabled: true, min: 2, max: 3 },
    }
  },
  {
    id: 'standard',
    name: 'Стандартный',
    duration: 10,
    description: 'Оптимальный баланс скорости и безопасности',
    riskLevel: 'medium',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    dailyActions: { min: 40, max: 80 },
    trustGrowth: 'Средний',
    activities: {
      viewPosts: { enabled: true, min: 20, max: 35 },
      reactions: { enabled: true, min: 10, max: 20 },
      comments: { enabled: true, min: 1, max: 3 },
      saveMessages: { enabled: true, min: 3, max: 7 },
      joinChannels: { enabled: true, min: 2, max: 4 },
      stories: { enabled: true, min: 5, max: 10 },
      polls: { enabled: true, min: 1, max: 3 },
      voiceListen: { enabled: true, min: 3, max: 5 },
    }
  },
  {
    id: 'fast',
    name: 'Быстрый',
    duration: 5,
    description: 'Агрессивный режим, повышенный риск',
    riskLevel: 'high',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    dailyActions: { min: 80, max: 150 },
    trustGrowth: 'Быстрый',
    activities: {
      viewPosts: { enabled: true, min: 40, max: 60 },
      reactions: { enabled: true, min: 20, max: 40 },
      comments: { enabled: true, min: 3, max: 8 },
      saveMessages: { enabled: true, min: 5, max: 15 },
      joinChannels: { enabled: true, min: 3, max: 6 },
      stories: { enabled: true, min: 10, max: 20 },
      polls: { enabled: true, min: 3, max: 6 },
      voiceListen: { enabled: true, min: 5, max: 10 },
    }
  },
  {
    id: 'custom',
    name: 'Кастомный',
    duration: 7,
    description: 'Полный контроль над всеми настройками',
    riskLevel: 'variable',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    dailyActions: { min: 30, max: 100 },
    trustGrowth: 'Зависит от настроек',
    activities: {
      viewPosts: { enabled: true, min: 10, max: 30 },
      reactions: { enabled: true, min: 5, max: 15 },
      comments: { enabled: true, min: 1, max: 3 },
      saveMessages: { enabled: true, min: 2, max: 8 },
      joinChannels: { enabled: true, min: 1, max: 3 },
      stories: { enabled: true, min: 3, max: 10 },
      polls: { enabled: true, min: 1, max: 3 },
      voiceListen: { enabled: true, min: 2, max: 5 },
    }
  },
]

const activityTypes = [
  { id: 'viewPosts', name: 'Просмотр постов', icon: '👁️', risk: 'low', description: 'Естественное чтение контента' },
  { id: 'reactions', name: 'Реакции', icon: '👍', risk: 'low', description: 'Эмодзи-реакции на посты' },
  { id: 'comments', name: 'Комментарии', icon: '💬', risk: 'medium', description: 'Осмысленные комментарии' },
  { id: 'saveMessages', name: 'Сохранения', icon: '🔖', risk: 'low', description: 'Сохранение в "Избранное"' },
  { id: 'joinChannels', name: 'Вступление в каналы', icon: '🚪', risk: 'medium', description: 'Подписка на новые каналы' },
  { id: 'stories', name: 'Просмотр историй', icon: '📱', risk: 'low', description: 'Stories в Telegram' },
  { id: 'polls', name: 'Участие в опросах', icon: '📊', risk: 'low', description: 'Голосование в опросах' },
  { id: 'voiceListen', name: 'Прослушивание голосовых', icon: '🎤', risk: 'low', description: 'Прослушивание войсов' },
]

const timeSlots = [
  { id: 'morning', name: 'Утро', time: '06:00 - 12:00', icon: '🌅' },
  { id: 'afternoon', name: 'День', time: '12:00 - 18:00', icon: '☀️' },
  { id: 'evening', name: 'Вечер', time: '18:00 - 22:00', icon: '🌆' },
  { id: 'night', name: 'Ночь', time: '22:00 - 06:00', icon: '🌙' },
]

interface WarmupActivity {
  enabled: boolean
  min: number
  max: number
}

interface WarmupConfig {
  preset: string
  duration: number
  timezone: string
  sleepStart: string
  sleepEnd: string
  activities: Record<string, WarmupActivity>
  schedule: Record<string, { enabled: boolean; intensity: number }>
  sourceChannels: string[]
  adaptToFloodWait: boolean
  adaptToErrors: boolean
  groupWarmup: boolean
}

interface WarmupAccount {
  id: string
  name: string
  status: 'IDLE' | 'WARMING' | 'PAUSED' | 'COMPLETED' | 'ERROR'
  day: number
  totalDays: number
  trustScore: number
  actionsToday: number
  maxActionsToday: number
  errors: number
  config: WarmupConfig
  stats: {
    viewPosts: number
    reactions: number
    comments: number
    saveMessages: number
    joinChannels: number
    stories: number
    polls: number
    voiceListen: number
  }
}

function WarmupPage({ project, accounts: projectAccounts }: { project?: Project; accounts?: Account[] }) {
  const accounts = projectAccounts || []
  const [warmupAccounts, setWarmupAccounts] = React.useState<WarmupAccount[]>([])
  const [showConfigDialog, setShowConfigDialog] = React.useState(false)
  const [configuringAccount, setConfiguringAccount] = React.useState<Account | null>(null)
  const [selectedPreset, setSelectedPreset] = React.useState('standard')
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  
  // Config state
  const [config, setConfig] = React.useState<WarmupConfig>(() => {
    const preset = warmupPresets.find(p => p.id === 'standard')!
    return {
      preset: 'standard',
      duration: preset.duration,
      timezone: 'Europe/Moscow',
      sleepStart: '00:00',
      sleepEnd: '07:00',
      activities: { ...preset.activities },
      schedule: {
        morning: { enabled: true, intensity: 30 },
        afternoon: { enabled: true, intensity: 40 },
        evening: { enabled: true, intensity: 25 },
        night: { enabled: false, intensity: 5 },
      },
      sourceChannels: [],
      adaptToFloodWait: true,
      adaptToErrors: true,
      groupWarmup: false,
    }
  })

  const updateActivity = (activityId: string, field: 'enabled' | 'min' | 'max', value: boolean | number) => {
    setConfig(prev => ({
      ...prev,
      activities: {
        ...prev.activities,
        [activityId]: {
          ...prev.activities[activityId],
          [field]: value
        }
      }
    }))
  }

  const applyPreset = (presetId: string) => {
    const preset = warmupPresets.find(p => p.id === presetId)
    if (!preset) return
    
    setSelectedPreset(presetId)
    setConfig(prev => ({
      ...prev,
      preset: presetId,
      duration: preset.duration,
      activities: { ...preset.activities },
    }))
  }

  const handleStartWarmup = (account: Account) => {
    const newWarmupAccount: WarmupAccount = {
      id: account.id,
      name: account.name,
      status: 'WARMING',
      day: 1,
      totalDays: config.duration,
      trustScore: 25,
      actionsToday: 0,
      maxActionsToday: config.dailyActions?.max || 80,
      errors: 0,
      config: { ...config },
      stats: {
        viewPosts: 0,
        reactions: 0,
        comments: 0,
        saveMessages: 0,
        joinChannels: 0,
        stories: 0,
        polls: 0,
        voiceListen: 0,
      }
    }
    setWarmupAccounts(prev => [...prev.filter(a => a.id !== account.id), newWarmupAccount])
  }

  const handlePauseWarmup = (accountId: string) => {
    setWarmupAccounts(prev => prev.map(a => 
      a.id === accountId ? { ...a, status: a.status === 'PAUSED' ? 'WARMING' : 'PAUSED' } : a
    ))
  }

  const handleStopWarmup = (accountId: string) => {
    setWarmupAccounts(prev => prev.filter(a => a.id !== accountId))
  }

  const availableAccounts = accounts.filter(a => !warmupAccounts.find(w => w.id === a.id))
  const preset = warmupPresets.find(p => p.id === selectedPreset)!

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {project && <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />}
          <div>
            <h1 className="text-2xl font-bold">Прогрев аккаунтов</h1>
            <p className="text-muted-foreground text-sm">Имитация естественного поведения для повышения доверия</p>
          </div>
        </div>
        {availableAccounts.length > 0 && (
          <Button 
            onClick={() => setShowConfigDialog(true)}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white"
          >
            <Flame className="h-4 w-4 mr-2" />
            Начать прогрев
          </Button>
        )}
      </div>

      {/* Trust Score Explanation */}
      <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-orange-500/20">
              <Shield className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Trust Score — Индекс доверия</h3>
              <p className="text-sm text-muted-foreground">
                Показатель "надёжности" аккаунта в глазах Telegram. Начинается с 20-30% для новых аккаунтов, 
                растёт при естественной активности и падает при ошибках/ограничениях. 
                Цель прогрева — достичь 70-80% для безопасной работы.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Warmup Sessions */}
      {warmupAccounts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Аккаунты на прогреве</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {warmupAccounts.map((wa) => (
              <Card key={wa.id} className="relative overflow-hidden">
                {/* Progress bar at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                    style={{ width: `${(wa.day / wa.totalDays) * 100}%` }}
                  />
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{wa.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{wa.name}</CardTitle>
                        <CardDescription>
                          День {wa.day} из {wa.totalDays}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant={wa.status === 'WARMING' ? 'default' : wa.status === 'PAUSED' ? 'secondary' : 'outline'}
                      className={cn(
                        wa.status === 'WARMING' && 'bg-green-500',
                        wa.status === 'PAUSED' && 'bg-yellow-500',
                        wa.status === 'ERROR' && 'bg-red-500'
                      )}
                    >
                      {wa.status === 'WARMING' ? '🔥 Прогрев' : wa.status === 'PAUSED' ? '⏸️ Пауза' : wa.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Trust Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Trust Score</span>
                      <span className="font-medium">{wa.trustScore}%</span>
                    </div>
                    <Progress value={wa.trustScore} className="h-2" />
                  </div>
                  
                  {/* Daily Actions */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Действий сегодня</span>
                    <span>{wa.actionsToday} / {wa.maxActionsToday}</span>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-muted/50">
                      <div className="font-medium">{wa.stats.viewPosts}</div>
                      <div className="text-muted-foreground">👁️</div>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <div className="font-medium">{wa.stats.reactions}</div>
                      <div className="text-muted-foreground">👍</div>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <div className="font-medium">{wa.stats.comments}</div>
                      <div className="text-muted-foreground">💬</div>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <div className="font-medium">{wa.stats.stories}</div>
                      <div className="text-muted-foreground">📱</div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handlePauseWarmup(wa.id)}
                    >
                      {wa.status === 'PAUSED' ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                      {wa.status === 'PAUSED' ? 'Продолжить' : 'Пауза'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStopWarmup(wa.id)}
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Accounts */}
      {availableAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Доступные аккаунты</CardTitle>
            <CardDescription>Выберите аккаунты для прогрева</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {availableAccounts.map((account) => (
                <div 
                  key={account.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{account.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{account.name}</div>
                      <div className="text-xs text-muted-foreground">{account.phone}</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => { setConfiguringAccount(account); setShowConfigDialog(true) }}
                  >
                    <Flame className="h-4 w-4 mr-1" />
                    Греть
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {accounts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Нет аккаунтов</h3>
            <p className="text-muted-foreground text-center mb-4">
              Добавьте аккаунты в проект для начала прогрева
            </p>
            <Button variant="outline" onClick={() => {}}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить аккаунт
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-400" />
              Настройка прогрева
            </DialogTitle>
            <DialogDescription>
              {configuringAccount ? `Настройка для ${configuringAccount.name}` : 'Выберите режим и параметры прогрева'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Preset Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Режим прогрева</Label>
              <div className="grid grid-cols-2 gap-3">
                {warmupPresets.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className={cn(
                      'p-4 rounded-lg border-2 cursor-pointer transition-all',
                      selectedPreset === p.id 
                        ? cn(p.borderColor, p.bgColor) 
                        : 'border-border hover:border-muted-foreground/50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{p.name}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', p.bgColor, p.color)}>
                        {p.duration} дней
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="text-muted-foreground">Риск:</span>
                      <span className={cn(
                        'font-medium',
                        p.riskLevel === 'low' && 'text-green-400',
                        p.riskLevel === 'medium' && 'text-yellow-400',
                        p.riskLevel === 'high' && 'text-red-400',
                      )}>
                        {p.riskLevel === 'low' ? 'Низкий' : p.riskLevel === 'medium' ? 'Средний' : 'Высокий'}
                      </span>
                      <Separator orientation="vertical" className="h-3" />
                      <span className="text-muted-foreground">{p.trustGrowth}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Duration & Timezone */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Длительность (дней)</Label>
                <Input 
                  type="number" 
                  value={config.duration}
                  onChange={(e) => setConfig(prev => ({ ...prev, duration: parseInt(e.target.value) || 7 }))}
                  min={1}
                  max={30}
                />
              </div>
              <div className="space-y-2">
                <Label>Часовой пояс</Label>
                <Select value={config.timezone} onValueChange={(v) => setConfig(prev => ({ ...prev, timezone: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Moscow">Москва (UTC+3)</SelectItem>
                    <SelectItem value="Europe/Kiev">Киев (UTC+2)</SelectItem>
                    <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                    <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Время "сна"</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={config.sleepStart}
                    onChange={(e) => setConfig(prev => ({ ...prev, sleepStart: e.target.value }))}
                    className="w-20"
                  />
                  <span>—</span>
                  <Input 
                    value={config.sleepEnd}
                    onChange={(e) => setConfig(prev => ({ ...prev, sleepEnd: e.target.value }))}
                    className="w-20"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Activities Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Активности</Label>
                <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
                  {showAdvanced ? 'Скрыть' : 'Подробнее'}
                </Button>
              </div>
              
              <div className="grid gap-3">
                {activityTypes.map((activity) => {
                  const actConfig = config.activities[activity.id]
                  return (
                    <div key={activity.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{activity.icon}</span>
                          <div>
                            <div className="font-medium">{activity.name}</div>
                            <div className="text-xs text-muted-foreground">{activity.description}</div>
                          </div>
                        </div>
                        <Switch 
                          checked={actConfig?.enabled ?? false}
                          onCheckedChange={(v) => updateActivity(activity.id, 'enabled', v)}
                        />
                      </div>
                      
                      {actConfig?.enabled && (
                        <div className="flex items-center gap-4 pt-2 border-t mt-2">
                          <div className="flex items-center gap-2 flex-1">
                            <Label className="text-xs">Мин:</Label>
                            <Input 
                              type="number"
                              value={actConfig.min}
                              onChange={(e) => updateActivity(activity.id, 'min', parseInt(e.target.value) || 0)}
                              className="w-16 h-8"
                              min={0}
                            />
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <Label className="text-xs">Макс:</Label>
                            <Input 
                              type="number"
                              value={actConfig.max}
                              onChange={(e) => updateActivity(activity.id, 'max', parseInt(e.target.value) || 0)}
                              className="w-16 h-8"
                              min={actConfig.min}
                            />
                          </div>
                          <Badge 
                            variant="outline"
                            className={cn(
                              activity.risk === 'low' && 'border-green-500 text-green-400',
                              activity.risk === 'medium' && 'border-yellow-500 text-yellow-400',
                              activity.risk === 'high' && 'border-red-500 text-red-400',
                            )}
                          >
                            {activity.risk === 'low' ? 'Низкий риск' : activity.risk === 'medium' ? 'Средний риск' : 'Высокий риск'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Schedule */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Расписание активности</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {timeSlots.map((slot) => {
                  const slotConfig = config.schedule[slot.id]
                  return (
                    <div key={slot.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg">{slot.icon}</span>
                        <Switch 
                          checked={slotConfig?.enabled ?? false}
                          onCheckedChange={(v) => setConfig(prev => ({
                            ...prev,
                            schedule: { ...prev.schedule, [slot.id]: { ...prev.schedule[slot.id], enabled: v } }
                          }))}
                        />
                      </div>
                      <div className="font-medium text-sm">{slot.name}</div>
                      <div className="text-xs text-muted-foreground">{slot.time}</div>
                      {slotConfig?.enabled && (
                        <div className="mt-2">
                          <Label className="text-xs">Интенсивность</Label>
                          <Input 
                            type="range"
                            value={slotConfig.intensity}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              schedule: { ...prev.schedule, [slot.id]: { ...prev.schedule[slot.id], intensity: parseInt(e.target.value) } }
                            }))}
                            min={0}
                            max={100}
                            className="h-2"
                          />
                          <div className="text-xs text-center text-muted-foreground">{slotConfig.intensity}%</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Advanced Options */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Дополнительные опции</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium">Адаптация к Flood Wait</div>
                    <div className="text-xs text-muted-foreground">Автоматически снижать активность при ограничениях</div>
                  </div>
                  <Switch 
                    checked={config.adaptToFloodWait}
                    onCheckedChange={(v) => setConfig(prev => ({ ...prev, adaptToFloodWait: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium">Адаптация к ошибкам</div>
                    <div className="text-xs text-muted-foreground">Увеличивать паузы при возникновении ошибок</div>
                  </div>
                  <Switch 
                    checked={config.adaptToErrors}
                    onCheckedChange={(v) => setConfig(prev => ({ ...prev, adaptToErrors: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium">Групповой прогрев</div>
                    <div className="text-xs text-muted-foreground">Аккаунты взаимодействуют друг с другом</div>
                  </div>
                  <Switch 
                    checked={config.groupWarmup}
                    onCheckedChange={(v) => setConfig(prev => ({ ...prev, groupWarmup: v }))}
                  />
                </div>
              </div>
            </div>

            {/* Source Channels */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Источники контента</Label>
              <Textarea
                placeholder="@channel1&#10;@channel2&#10;https://t.me/channel3"
                className="min-h-[80px]"
                value={config.sourceChannels.join('\n')}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  sourceChannels: e.target.value.split('\n').filter(c => c.trim()) 
                }))}
              />
              <p className="text-xs text-muted-foreground">
                Каналы для чтения и активности. Каждый канал с новой строки.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Отмена
            </Button>
            <Button 
              onClick={() => {
                if (configuringAccount) {
                  handleStartWarmup(configuringAccount)
                }
                setShowConfigDialog(false)
                setConfiguringAccount(null)
              }}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white"
            >
              <Flame className="h-4 w-4 mr-2" />
              Начать прогрев
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==================== GROUP PARSING SYSTEM ====================

const groupTypeOptions = [
  { id: 'public', label: 'Публичные', icon: '🌐' },
  { id: 'private', label: 'Приватные', icon: '🔒' },
  { id: 'channel', label: 'Каналы', icon: '📢' },
  { id: 'group', label: 'Группы', icon: '👥' },
]

const activityLevels = [
  { id: 'dead', label: 'Мёртвые', desc: '0 постов в неделю', color: 'text-red-400' },
  { id: 'low', label: 'Низкая', desc: '1-3 поста в неделю', color: 'text-orange-400' },
  { id: 'medium', label: 'Средняя', desc: '4-10 постов в неделю', color: 'text-yellow-400' },
  { id: 'high', label: 'Высокая', desc: '11+ постов в неделю', color: 'text-green-400' },
]

const languageOptions = [
  { id: 'ru', label: 'Русский', flag: '🇷🇺' },
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'zh', label: '中文', flag: '🇨🇳' },
  { id: 'ar', label: 'العربية', flag: '🇸🇦' },
  { id: 'all', label: 'Все языки', flag: '🌍' },
]

const featureOptions = [
  { id: 'stories', label: 'Истории', icon: '📱' },
  { id: 'discussions', label: 'Обсуждения', icon: '💬' },
  { id: 'topics', label: 'Темы (форум)', icon: '📋' },
  { id: 'verified', label: 'Верифицирован', icon: '✅' },
  { id: 'signup', label: 'Требуется вступление', icon: '🚪' },
]

const filterPresets = [
  { 
    id: 'crypto', 
    name: 'Крипто-сообщества', 
    desc: 'Активные криптовалютные группы',
    filters: { minMembers: 1000, languages: ['en', 'ru'], activity: ['medium', 'high'], hasKeywords: ['crypto', 'bitcoin', 'trading'] }
  },
  { 
    id: 'active', 
    name: 'Активные группы', 
    desc: 'Высокая активность постов',
    filters: { minMembers: 500, activity: ['high', 'medium'], hasFeatures: ['discussions'] }
  },
  { 
    id: 'large', 
    name: 'Крупные аудитории', 
    desc: 'Более 10 000 участников',
    filters: { minMembers: 10000, type: ['public'] }
  },
  { 
    id: 'growing', 
    name: 'Быстрорастущие', 
    desc: 'Рост 10%+ в месяц',
    filters: { growthRate: 10, minMembers: 500 }
  },
]

const customFilterOperators = [
  { id: 'equals', label: 'Равно' },
  { id: 'not_equals', label: 'Не равно' },
  { id: 'contains', label: 'Содержит' },
  { id: 'not_contains', label: 'Не содержит' },
  { id: 'starts_with', label: 'Начинается с' },
  { id: 'ends_with', label: 'Заканчивается на' },
  { id: 'greater', label: 'Больше' },
  { id: 'less', label: 'Меньше' },
  { id: 'between', label: 'Между' },
  { id: 'regex', label: 'Regex' },
]

const customFilterFields = [
  { id: 'title', label: 'Название', type: 'string' },
  { id: 'username', label: 'Username', type: 'string' },
  { id: 'description', label: 'Описание', type: 'string' },
  { id: 'members_count', label: 'Кол-во участников', type: 'number' },
  { id: 'online_count', label: 'Онлайн сейчас', type: 'number' },
  { id: 'posts_count', label: 'Кол-во постов', type: 'number' },
  { id: 'created_at', label: 'Дата создания', type: 'date' },
  { id: 'reaction_avg', label: 'Среднее реакции', type: 'number' },
  { id: 'views_avg', label: 'Средние просмотры', type: 'number' },
]

interface CustomFilter {
  id: string
  field: string
  operator: string
  value: string
  enabled: boolean
}

interface GroupFilters {
  keywords: string
  minMembers: number
  maxMembers: number
  types: string[]
  languages: string[]
  activity: string[]
  features: string[]
  excludeKeywords: string
  customFilters: CustomFilter[]
  logicOperator: 'AND' | 'OR'
}

interface ParsedGroup {
  id: string
  title: string
  username: string
  type: 'channel' | 'group'
  members: number
  online: number
  activity: string
  language: string
  verified: boolean
  features: string[]
  description: string
  postsPerWeek: number
  engagement: number
}

function ParsingGroupsPage({ project }: { project?: Project }) {
  const [isSearching, setIsSearching] = React.useState(false)
  const [results, setResults] = React.useState<ParsedGroup[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false)
  const [showCustomFilterDialog, setShowCustomFilterDialog] = React.useState(false)
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(null)
  
  // Filter state
  const [filters, setFilters] = React.useState<GroupFilters>({
    keywords: '',
    minMembers: 0,
    maxMembers: 0,
    types: ['public', 'group', 'channel'],
    languages: ['all'],
    activity: ['low', 'medium', 'high'],
    features: [],
    excludeKeywords: '',
    customFilters: [],
    logicOperator: 'AND',
  })

  const [newCustomFilter, setNewCustomFilter] = React.useState<CustomFilter>({
    id: '',
    field: 'title',
    operator: 'contains',
    value: '',
    enabled: true,
  })

  const updateFilter = <K extends keyof GroupFilters>(key: K, value: GroupFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setSelectedPreset(null)
  }

  const toggleArrayFilter = (key: 'types' | 'languages' | 'activity' | 'features', value: string) => {
    setFilters(prev => {
      const arr = prev[key] as string[]
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
      }
    })
    setSelectedPreset(null)
  }

  const applyPreset = (presetId: string) => {
    const preset = filterPresets.find(p => p.id === presetId)
    if (!preset) return
    
    setSelectedPreset(presetId)
    setFilters(prev => ({
      ...prev,
      minMembers: preset.filters.minMembers || 0,
      maxMembers: preset.filters.maxMembers || 0,
      languages: preset.filters.languages || ['all'],
      activity: preset.filters.activity || ['low', 'medium', 'high'],
      features: preset.filters.hasFeatures || [],
      keywords: preset.filters.hasKeywords?.join(', ') || '',
    }))
  }

  const addCustomFilter = () => {
    if (!newCustomFilter.value.trim()) return
    
    const filter: CustomFilter = {
      ...newCustomFilter,
      id: `filter_${Date.now()}`,
    }
    
    updateFilter('customFilters', [...filters.customFilters, filter])
    setNewCustomFilter({ id: '', field: 'title', operator: 'contains', value: '', enabled: true })
    setShowCustomFilterDialog(false)
  }

  const removeCustomFilter = (id: string) => {
    updateFilter('customFilters', filters.customFilters.filter(f => f.id !== id))
  }

  const handleSearch = async () => {
    setIsSearching(true)
    // Simulate search
    await new Promise(r => setTimeout(r, 2000))
    
    // Mock results
    const mockResults: ParsedGroup[] = [
      { id: '1', title: 'Crypto Trading Club', username: 'cryptotrading', type: 'group', members: 45600, online: 234, activity: 'high', language: 'en', verified: true, features: ['discussions', 'stories'], description: 'Daily crypto signals and analysis', postsPerWeek: 42, engagement: 8.5 },
      { id: '2', title: 'Bitcoin News', username: 'btcnews', type: 'channel', members: 120000, online: 890, activity: 'high', language: 'en', verified: true, features: ['stories'], description: 'Latest Bitcoin news and updates', postsPerWeek: 56, engagement: 5.2 },
      { id: '3', title: 'КриптоМир', username: 'cryptomir', type: 'group', members: 8500, online: 120, activity: 'medium', language: 'ru', verified: false, features: ['discussions', 'topics'], description: 'Русскоязычное сообщество криптоинвесторов', postsPerWeek: 15, engagement: 12.3 },
      { id: '4', title: 'DeFi Analytics', username: 'defianalytics', type: 'channel', members: 34500, online: 456, activity: 'high', language: 'en', verified: false, features: ['stories'], description: 'DeFi protocols analysis and research', postsPerWeek: 28, engagement: 6.7 },
      { id: '5', title: 'Trading Signals Pro', username: 'tradingsignals', type: 'channel', members: 89000, online: 678, activity: 'high', language: 'en', verified: true, features: ['stories', 'discussions'], description: 'Professional trading signals', postsPerWeek: 35, engagement: 4.8 },
    ]
    
    setResults(mockResults)
    setIsSearching(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {project && <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />}
          <div>
            <h1 className="text-2xl font-bold">Парсинг групп</h1>
            <p className="text-muted-foreground text-sm">Поиск и фильтрация Telegram сообществ</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Database className="h-4 w-4 mr-2" />
            Сохранённые ({results.length})
          </Button>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {filterPresets.map((preset) => (
          <Button
            key={preset.id}
            variant={selectedPreset === preset.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => applyPreset(preset.id)}
            className={cn(selectedPreset === preset.id && 'bg-gradient-to-r from-blue-500 to-purple-600 text-white')}
          >
            {preset.name}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Filters Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Фильтры поиска</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Keywords */}
              <div className="space-y-2">
                <Label>Ключевые слова</Label>
                <Input 
                  value={filters.keywords}
                  onChange={(e) => updateFilter('keywords', e.target.value)}
                  placeholder="crypto, bitcoin, trading..."
                />
              </div>

              {/* Exclude Keywords */}
              <div className="space-y-2">
                <Label>Исключить слова</Label>
                <Input 
                  value={filters.excludeKeywords}
                  onChange={(e) => updateFilter('excludeKeywords', e.target.value)}
                  placeholder="scam, spam..."
                />
              </div>

              {/* Members Range */}
              <div className="space-y-2">
                <Label>Кол-во участников</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={filters.minMembers || ''}
                    onChange={(e) => updateFilter('minMembers', parseInt(e.target.value) || 0)}
                    placeholder="От"
                    className="w-full"
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input 
                    type="number"
                    value={filters.maxMembers || ''}
                    onChange={(e) => updateFilter('maxMembers', parseInt(e.target.value) || 0)}
                    placeholder="До"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Group Type */}
              <div className="space-y-2">
                <Label>Тип сообщества</Label>
                <div className="flex flex-wrap gap-2">
                  {groupTypeOptions.map((type) => (
                    <Button
                      key={type.id}
                      variant={filters.types.includes(type.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleArrayFilter('types', type.id)}
                      className={cn(filters.types.includes(type.id) && 'bg-primary')}
                    >
                      {type.icon} {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label>Язык</Label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((lang) => (
                    <Button
                      key={lang.id}
                      variant={filters.languages.includes(lang.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleArrayFilter('languages', lang.id)}
                      className={cn(filters.languages.includes(lang.id) && 'bg-primary')}
                    >
                      {lang.flag} {lang.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Activity Level */}
              <div className="space-y-2">
                <Label>Активность</Label>
                <div className="grid grid-cols-2 gap-2">
                  {activityLevels.map((level) => (
                    <div
                      key={level.id}
                      onClick={() => toggleArrayFilter('activity', level.id)}
                      className={cn(
                        'p-2 rounded-lg border cursor-pointer transition-colors',
                        filters.activity.includes(level.id) ? 'bg-primary/20 border-primary' : 'hover:bg-muted/50'
                      )}
                    >
                      <div className={cn('text-sm font-medium', level.color)}>{level.label}</div>
                      <div className="text-xs text-muted-foreground">{level.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              {showAdvancedFilters && (
                <>
                  <Separator />
                  
                  {/* Features */}
                  <div className="space-y-2">
                    <Label>Функции</Label>
                    <div className="flex flex-wrap gap-2">
                      {featureOptions.map((feature) => (
                        <Button
                          key={feature.id}
                          variant={filters.features.includes(feature.id) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleArrayFilter('features', feature.id)}
                          className={cn(filters.features.includes(feature.id) && 'bg-primary')}
                        >
                          {feature.icon} {feature.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Filters */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Кастомные фильтры</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowCustomFilterDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Добавить
                      </Button>
                    </div>
                    
                    {filters.customFilters.length > 0 ? (
                      <div className="space-y-2">
                        {filters.customFilters.map((cf) => (
                          <div key={cf.id} className="flex items-center justify-between p-2 rounded-lg border text-sm">
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={cf.enabled}
                                onCheckedChange={(v) => updateFilter('customFilters', filters.customFilters.map(f => f.id === cf.id ? { ...f, enabled: v } : f))}
                                className="scale-75"
                              />
                              <span className="font-medium">{customFilterFields.find(f => f.id === cf.field)?.label}</span>
                              <span className="text-muted-foreground">{customFilterOperators.find(o => o.id === cf.operator)?.label}</span>
                              <span className="text-primary">"{cf.value}"</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeCustomFilter(cf.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-sm text-muted-foreground border rounded-lg">
                        Нет кастомных фильтров
                      </div>
                    )}
                  </div>

                  {/* Logic Operator */}
                  <div className="space-y-2">
                    <Label>Логика объединения</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={filters.logicOperator === 'AND' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateFilter('logicOperator', 'AND')}
                        className={cn(filters.logicOperator === 'AND' && 'bg-primary')}
                      >
                        И (AND)
                      </Button>
                      <Button
                        variant={filters.logicOperator === 'OR' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateFilter('logicOperator', 'OR')}
                        className={cn(filters.logicOperator === 'OR' && 'bg-primary')}
                      >
                        Или (OR)
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Search Button */}
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                onClick={handleSearch}
                disabled={isSearching || !filters.keywords.trim()}
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Поиск...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Найти группы
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Результаты поиска</CardTitle>
                {results.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{results.length} найдено</span>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-1" />
                      Экспорт
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isSearching ? (
                <div className="text-center py-16">
                  <RefreshCw className="h-12 w-12 mx-auto animate-spin text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Поиск сообществ...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {results.map((group) => (
                    <div key={group.id} className="p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            {group.title.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{group.title}</span>
                              {group.verified && <CheckCircle className="h-4 w-4 text-blue-400" />}
                            </div>
                            <div className="text-sm text-muted-foreground">@{group.username}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {group.type === 'channel' ? '📢 Канал' : '👥 Группа'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{group.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {group.members.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="h-4 w-4 text-green-400" />
                          {group.online.toLocaleString()} онлайн
                        </span>
                        <span className={cn(
                          'flex items-center gap-1',
                          activityLevels.find(l => l.id === group.activity)?.color
                        )}>
                          <TrendingUp className="h-4 w-4" />
                          {activityLevels.find(l => l.id === group.activity)?.label}
                        </span>
                        <span className="flex items-center gap-1">
                          📝 {group.postsPerWeek} постов/нед
                        </span>
                        <span className="flex items-center gap-1">
                          👍 {group.engagement}% engagement
                        </span>
                      </div>
                      
                      {group.features.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {group.features.map((f) => (
                            <Badge key={f} variant="secondary" className="text-xs">
                              {featureOptions.find(fo => fo.id === f)?.icon} {featureOptions.find(fo => fo.id === f)?.label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <FolderSearch className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-2">Введите ключевые слова для поиска</p>
                  <p className="text-xs text-muted-foreground">Используйте фильтры для точного поиска</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Custom Filter Dialog */}
      <Dialog open={showCustomFilterDialog} onOpenChange={setShowCustomFilterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить кастомный фильтр</DialogTitle>
            <DialogDescription>
              Создайте своё условие для фильтрации результатов
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Поле</Label>
              <Select value={newCustomFilter.field} onValueChange={(v) => setNewCustomFilter(prev => ({ ...prev, field: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {customFilterFields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Оператор</Label>
              <Select value={newCustomFilter.operator} onValueChange={(v) => setNewCustomFilter(prev => ({ ...prev, operator: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {customFilterOperators.map((op) => (
                    <SelectItem key={op.id} value={op.id}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Значение</Label>
              <Input 
                value={newCustomFilter.value}
                onChange={(e) => setNewCustomFilter(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Введите значение..."
              />
            </div>
            
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <span className="text-muted-foreground">Превью:</span>
              <div className="mt-1">
                <span className="font-medium">{customFilterFields.find(f => f.id === newCustomFilter.field)?.label}</span>
                {' '}
                <span className="text-muted-foreground">{customFilterOperators.find(o => o.id === newCustomFilter.operator)?.label.toLowerCase()}</span>
                {' '}
                <span className="text-primary">"{newCustomFilter.value || '...'}"</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomFilterDialog(false)}>
              Отмена
            </Button>
            <Button onClick={addCustomFilter} disabled={!newCustomFilter.value.trim()}>
              Добавить фильтр
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ParsingMembersPage({ project, databases }: { project?: Project; databases: Database[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {project && <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />}
          <div>
            <h1 className="text-2xl font-bold">Парсинг участников</h1>
            <p className="text-muted-foreground">{databases.length} баз данных</p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <Plus className="h-4 w-4 mr-2" />Новая задача
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Базы данных проекта</CardTitle></CardHeader>
        <CardContent>
          {databases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Нет сохранённых баз</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Источник</TableHead>
                  <TableHead>Записей</TableHead>
                  <TableHead>Дата</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {databases.map(db => (
                  <TableRow key={db.id}>
                    <TableCell className="font-medium">{db.name}</TableCell>
                    <TableCell>{db.source}</TableCell>
                    <TableCell>{db.count.toLocaleString()}</TableCell>
                    <TableCell>{new Date(db.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function InvitingPage({ project, tasks }: { project?: Project; tasks: Task[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {project && <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />}
          <h1 className="text-2xl font-bold">Инвайты</h1>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <Plus className="h-4 w-4 mr-2" />Новая кампания
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Кампании инвайтов</CardTitle></CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Нет активных кампаний</div>
          ) : (
            <div className="space-y-4">
              {tasks.map(task => (
                <div key={task.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{task.name}</span>
                    <Badge>{task.status}</Badge>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Comment styles and emotions
const commentStyles = [
  { id: 'supportive', label: 'Поддерживающий', desc: 'Позитивные, одобряющие комментарии', emoji: '👍' },
  { id: 'questioning', label: 'Вопрос', desc: 'Уточняющие вопросы по теме', emoji: '❓' },
  { id: 'opinion', label: 'Мнение', desc: 'Личное мнение и опыт', emoji: '💡' },
  { id: 'humor', label: 'Юмор', desc: 'Лёгкие шутки и мемы', emoji: '😄' },
  { id: 'provocative', label: 'Провокация', desc: 'Спорные мнения для дискуссии', emoji: '🔥' },
  { id: 'expert', label: 'Экспертный', desc: 'Глубокий анализ и факты', emoji: '🎯' },
]

const commentEmotions = [
  { id: 'neutral', label: 'Нейтральный', color: 'bg-gray-500' },
  { id: 'positive', label: 'Позитивный', color: 'bg-green-500' },
  { id: 'enthusiastic', label: 'Восторженный', color: 'bg-yellow-500' },
  { id: 'curious', label: 'Любопытный', color: 'bg-blue-500' },
  { id: 'skeptical', label: 'Скептический', color: 'bg-orange-500' },
]

const discussionPatterns = [
  { id: 'cascade', label: 'Каскад', desc: 'Комментарии один за другим с задержкой' },
  { id: 'parallel', label: 'Параллельный', desc: 'Все аккаунты комментируют одновременно' },
  { id: 'thread', label: 'Дискуссия', desc: 'Аккаунты отвечают друг другу создавая ветку' },
  { id: 'wave', label: 'Волна', desc: 'Волны активности с нарастающей интенсивностью' },
]

interface CommentCampaign {
  id: string
  name: string
  channels: string[]
  accounts: string[]
  style: string
  emotion: string
  pattern: string
  triggerKeywords: string[]
  avoidKeywords: string[]
  commentsPerPost: number
  delayMin: number
  delayMax: number
  useAI: boolean
  customTemplates: string[]
  status: string
}

interface GeneratedComment {
  accountId: string
  accountName: string
  comment: string
  emotion: string
  isReply: boolean
  replyTo?: string
}

function CommentingPage({ project, accounts: projectAccounts }: { project?: Project; accounts?: Account[] }) {
  const [campaigns, setCampaigns] = React.useState<CommentCampaign[]>([])
  const [showCampaignDialog, setShowCampaignDialog] = React.useState(false)
  const [editingCampaign, setEditingCampaign] = React.useState<CommentCampaign | null>(null)
  const [showPreview, setShowPreview] = React.useState(false)
  const [previewComments, setPreviewComments] = React.useState<GeneratedComment[]>([])
  const [previewLoading, setPreviewLoading] = React.useState(false)
  
  // Form state
  const [name, setName] = React.useState('')
  const [channels, setChannels] = React.useState('')
  const [selectedAccounts, setSelectedAccounts] = React.useState<string[]>([])
  const [style, setStyle] = React.useState('supportive')
  const [emotion, setEmotion] = React.useState('positive')
  const [pattern, setPattern] = React.useState('cascade')
  const [triggerKeywords, setTriggerKeywords] = React.useState('')
  const [avoidKeywords, setAvoidKeywords] = React.useState('')
  const [commentsPerPost, setCommentsPerPost] = React.useState(3)
  const [delayMin, setDelayMin] = React.useState(30)
  const [delayMax, setDelayMax] = React.useState(120)
  const [useAI, setUseAI] = React.useState(true)
  const [customTemplates, setCustomTemplates] = React.useState('')

  const accounts = projectAccounts || []

  const resetForm = () => {
    setName('')
    setChannels('')
    setSelectedAccounts([])
    setStyle('supportive')
    setEmotion('positive')
    setPattern('cascade')
    setTriggerKeywords('')
    setAvoidKeywords('')
    setCommentsPerPost(3)
    setDelayMin(30)
    setDelayMax(120)
    setUseAI(true)
    setCustomTemplates('')
  }

  const handleGeneratePreview = async () => {
    setPreviewLoading(true)
    setShowPreview(true)
    
    // Simulate AI generation
    await new Promise(r => setTimeout(r, 1500))
    
    const selectedAccountData = accounts.filter(a => selectedAccounts.includes(a.id)).slice(0, 5)
    const styleData = commentStyles.find(s => s.id === style)
    
    const mockComments: GeneratedComment[] = selectedAccountData.map((acc, idx) => ({
      accountId: acc.id,
      accountName: acc.name,
      comment: generateMockComment(style, emotion, idx, pattern === 'thread' && idx > 0 ? selectedAccountData[idx - 1]?.name : undefined),
      emotion,
      isReply: pattern === 'thread' && idx > 0,
      replyTo: pattern === 'thread' && idx > 0 ? selectedAccountData[idx - 1]?.name : undefined
    }))
    
    setPreviewComments(mockComments)
    setPreviewLoading(false)
  }

  const handleSaveCampaign = () => {
    const campaign: CommentCampaign = {
      id: editingCampaign?.id || `camp_${Date.now()}`,
      name: name || `Кампания ${campaigns.length + 1}`,
      channels: channels.split('\n').filter(c => c.trim()),
      accounts: selectedAccounts,
      style,
      emotion,
      pattern,
      triggerKeywords: triggerKeywords.split(',').map(k => k.trim()).filter(k => k),
      avoidKeywords: avoidKeywords.split(',').map(k => k.trim()).filter(k => k),
      commentsPerPost,
      delayMin,
      delayMax,
      useAI,
      customTemplates: customTemplates.split('\n').filter(t => t.trim()),
      status: 'PAUSED'
    }
    
    if (editingCampaign) {
      setCampaigns(prev => prev.map(c => c.id === editingCampaign.id ? campaign : c))
    } else {
      setCampaigns(prev => [...prev, campaign])
    }
    
    setShowCampaignDialog(false)
    setEditingCampaign(null)
    resetForm()
  }

  const handleEditCampaign = (campaign: CommentCampaign) => {
    setEditingCampaign(campaign)
    setName(campaign.name)
    setChannels(campaign.channels.join('\n'))
    setSelectedAccounts(campaign.accounts)
    setStyle(campaign.style)
    setEmotion(campaign.emotion)
    setPattern(campaign.pattern)
    setTriggerKeywords(campaign.triggerKeywords.join(', '))
    setAvoidKeywords(campaign.avoidKeywords.join(', '))
    setCommentsPerPost(campaign.commentsPerPost)
    setDelayMin(campaign.delayMin)
    setDelayMax(campaign.delayMax)
    setUseAI(campaign.useAI)
    setCustomTemplates(campaign.customTemplates.join('\n'))
    setShowCampaignDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {project && <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />}
          <div>
            <h1 className="text-2xl font-bold">AI Комментинг</h1>
            <p className="text-muted-foreground text-sm">Мульти-аккаунт дискуссии с AI генерацией</p>
          </div>
        </div>
        <Button 
          onClick={() => { resetForm(); setEditingCampaign(null); setShowCampaignDialog(true) }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Новая кампания
        </Button>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-400" />
              AI Генерация
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Уникальные контекстные комментарии для каждого поста
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Дискуссии
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Несколько аккаунтов создают живые обсуждения
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-green-400" />
              Триггеры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Комментарии только на релевантные посты
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Кампании комментирования</CardTitle>
          <CardDescription>Настройте AI-комментинг для нескольких аккаунтов</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">Нет созданных кампаний</p>
              <Button 
                variant="outline" 
                onClick={() => { resetForm(); setShowCampaignDialog(true) }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Создать первую кампанию
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="rounded-lg border p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {campaign.channels.length} каналов • {campaign.accounts.length} аккаунтов
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={campaign.status === 'RUNNING' ? 'default' : 'secondary'}>
                        {campaign.status === 'RUNNING' ? 'Активна' : 'Остановлена'}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleEditCampaign(campaign)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {commentStyles.find(s => s.id === campaign.style)?.emoji} {commentStyles.find(s => s.id === campaign.style)?.label}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className={cn('h-2 w-2 rounded-full', commentEmotions.find(e => e.id === campaign.emotion)?.color)} />
                      {commentEmotions.find(e => e.id === campaign.emotion)?.label}
                    </span>
                    <span>{discussionPatterns.find(p => p.id === campaign.pattern)?.label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Dialog */}
      <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? 'Редактировать кампанию' : 'Новая кампания комментинга'}</DialogTitle>
            <DialogDescription>
              Настройте AI-генерацию комментариев и мульти-аккаунт дискуссии
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Basic Settings */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Название кампании</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Crypto Comments Campaign" />
              </div>
              
              <div className="grid gap-2">
                <Label>Целевые каналы/чаты</Label>
                <Textarea
                  value={channels}
                  onChange={(e) => setChannels(e.target.value)}
                  placeholder="@channel1&#10;@channel2&#10;https://t.me/group1"
                  className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">Каждый канал с новой строки</p>
              </div>
            </div>

            <Separator />

            {/* Account Selection */}
            <div className="grid gap-4">
              <Label className="text-base font-semibold">Аккаунты для комментирования</Label>
              {accounts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm border rounded-lg">
                  Нет аккаунтов в проекте. Добавьте аккаунты сначала.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {accounts.map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => setSelectedAccounts(prev => 
                        prev.includes(acc.id) ? prev.filter(id => id !== acc.id) : [...prev, acc.id]
                      )}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors',
                        selectedAccounts.includes(acc.id) ? 'bg-primary/20 border-primary' : 'hover:bg-muted/50'
                      )}
                    >
                      <div className={cn(
                        'h-4 w-4 rounded border flex items-center justify-center',
                        selectedAccounts.includes(acc.id) && 'bg-primary border-primary'
                      )}>
                        {selectedAccounts.includes(acc.id) && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span className="text-sm truncate">{acc.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Выбрано: {selectedAccounts.length} аккаунтов</p>
            </div>

            <Separator />

            {/* AI Settings */}
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">AI Генерация</Label>
                <Switch checked={useAI} onCheckedChange={setUseAI} />
              </div>
              
              {useAI ? (
                <>
                  {/* Comment Style */}
                  <div className="grid gap-2">
                    <Label>Стиль комментариев</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {commentStyles.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => setStyle(s.id)}
                          className={cn(
                            'p-3 rounded-lg border cursor-pointer transition-colors',
                            style === s.id ? 'bg-primary/20 border-primary' : 'hover:bg-muted/50'
                          )}
                        >
                          <div className="text-lg mb-1">{s.emoji}</div>
                          <div className="text-sm font-medium">{s.label}</div>
                          <div className="text-xs text-muted-foreground">{s.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Emotion */}
                  <div className="grid gap-2">
                    <Label>Тональность</Label>
                    <div className="flex flex-wrap gap-2">
                      {commentEmotions.map((e) => (
                        <Button
                          key={e.id}
                          variant={emotion === e.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setEmotion(e.id)}
                          className="gap-2"
                        >
                          <div className={cn('h-2 w-2 rounded-full', e.color)} />
                          {e.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid gap-2">
                  <Label>Шаблоны комментариев</Label>
                  <Textarea
                    value={customTemplates}
                    onChange={(e) => setCustomTemplates(e.target.value)}
                    placeholder="Отличный пост! Согласен на 100%&#10;Интересная точка зрения&#10;Спасибо за информацию!"
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">Каждый шаблон с новой строки. Будут выбираться случайно.</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Discussion Pattern */}
            <div className="grid gap-4">
              <Label className="text-base font-semibold">Паттерн дискуссии</Label>
              <div className="grid grid-cols-2 gap-2">
                {discussionPatterns.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setPattern(p.id)}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-colors',
                      pattern === p.id ? 'bg-primary/20 border-primary' : 'hover:bg-muted/50'
                    )}
                  >
                    <div className="text-sm font-medium">{p.label}</div>
                    <div className="text-xs text-muted-foreground">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Trigger Keywords */}
            <div className="grid gap-4">
              <Label className="text-base font-semibold">Триггеры и фильтры</Label>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-sm">Ключевые слова (триггеры)</Label>
                  <Input
                    value={triggerKeywords}
                    onChange={(e) => setTriggerKeywords(e.target.value)}
                    placeholder="crypto, bitcoin, trading"
                  />
                  <p className="text-xs text-muted-foreground">Комментарии только на посты с этими словами</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm">Исключить слова</Label>
                  <Input
                    value={avoidKeywords}
                    onChange={(e) => setAvoidKeywords(e.target.value)}
                    placeholder="scam, spam, giveaway"
                  />
                  <p className="text-xs text-muted-foreground">Пропускать посты с этими словами</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Timing Settings */}
            <div className="grid gap-4">
              <Label className="text-base font-semibold">Настройки времени</Label>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Комментариев на пост</Label>
                  <Input
                    type="number"
                    value={commentsPerPost}
                    onChange={(e) => setCommentsPerPost(parseInt(e.target.value) || 1)}
                    min={1}
                    max={10}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Мин. задержка (сек)</Label>
                  <Input
                    type="number"
                    value={delayMin}
                    onChange={(e) => setDelayMin(parseInt(e.target.value) || 10)}
                    min={5}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Макс. задержка (сек)</Label>
                  <Input
                    type="number"
                    value={delayMax}
                    onChange={(e) => setDelayMax(parseInt(e.target.value) || 300)}
                    min={delayMin}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => { resetForm(); setShowCampaignDialog(false) }}>
              Отмена
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleGeneratePreview}
                disabled={selectedAccounts.length === 0}
              >
                <Bot className="h-4 w-4 mr-2" />
                Превью
              </Button>
              <Button 
                onClick={handleSaveCampaign}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              >
                {editingCampaign ? 'Сохранить' : 'Создать кампанию'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-400" />
              AI Превью комментариев
            </DialogTitle>
            <DialogDescription>
              Пример сгенерированных комментариев для выбранного стиля
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {previewLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">AI генерирует комментарии...</p>
              </div>
            ) : (
              previewComments.map((c, idx) => (
                <div key={idx} className={cn(
                  'p-3 rounded-lg border',
                  c.isReply ? 'ml-6 bg-muted/30' : 'bg-muted/10'
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{c.accountName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{c.accountName}</span>
                    {c.isReply && (
                      <span className="text-xs text-muted-foreground">
                        ↩ ответ {c.replyTo}
                      </span>
                    )}
                    <Badge variant="outline" className="ml-auto text-xs">
                      {commentEmotions.find(e => e.id === c.emotion)?.label}
                    </Badge>
                  </div>
                  <p className="text-sm">{c.comment}</p>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper function to generate mock comments
function generateMockComment(style: string, emotion: string, index: number, replyTo?: string): string {
  const comments: Record<string, string[]> = {
    supportive: [
      'Отличный пост! Полностью согласен с автором 👍',
      'Очень полезная информация, спасибо за пост!',
      'Действительно качественный контент, редко такое встретишь',
      'Поддерживаю! Тоже так думаю по этому вопросу',
    ],
    questioning: [
      'Интересная точка зрения. А что думаете насчёт долгосрочной перспективы?',
      'Спасибо за информацию! Можете подробнее рассказать о первом пункте?',
      'Хороший пост, но есть вопрос - как это работает на практике?',
      'Любопытная идея. А есть ли реальные примеры использования?',
    ],
    opinion: [
      'По моему опыту, всё немного иначе работает, но идея интересная',
      'Я в этом уже 3 года, могу сказать - автор прав на 100%',
      'Сложный вопрос. С одной стороны согласен, но с другой есть нюансы',
      'Моё мнение - это будущее индустрии. Уже вижу тренды',
    ],
    humor: [
      'После этого поста моя жизнь уже не будет прежней 😄',
      'Автор пишет так, будто я книгу читаю, а не пост в телеге',
      'Кто тоже перечитывал 3 раза? 🙋‍♂️',
      'Короче, автор крч, ну это самое, того, ну вы поняли 😂',
    ],
    provocative: [
      'Не согласен с ключевыми моментами. Кто-то может аргументированно возразить?',
      'Интересная теория, но на практике я видел совершенно другие результаты',
      'Много красивых слов, а где реальные цифры и доказательства?',
      'Автор явно упускает важный аспект проблемы. Кто ещё заметил?',
    ],
    expert: [
      'С технической точки зрения всё верно. Добавлю, что производительность можно увеличить на 40% при правильной настройке',
      'Анализ корректный. В своей практике применял похожий подход - результаты превзошли ожидания',
      'Автор затронул важную тему. Согласно последним исследованиям, тренд подтверждается',
      'Глубокий анализ. Рекомендую также рассмотреть альтернативные методологии',
    ],
  }

  const styleComments = comments[style] || comments.supportive
  const baseComment = styleComments[index % styleComments.length]
  
  if (replyTo) {
    return `${replyTo}, согласен с твоим комментом! ${baseComment.toLowerCase()}`
  }
  
  return baseComment
}

function MessagingPage({ project, tasks }: { project?: Project; tasks: Task[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {project && <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />}
          <h1 className="text-2xl font-bold">Рассылки</h1>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <Plus className="h-4 w-4 mr-2" />Новая рассылка
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Кампании рассылок</CardTitle></CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Нет активных рассылок</div>
          ) : (
            <div className="space-y-4">
              {tasks.map(task => (
                <div key={task.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{task.name}</span>
                    <Badge>{task.status}</Badge>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AnalyticsPage({ project }: { project?: Project }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {project && <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />}
        <h1 className="text-2xl font-bold">Аналитика</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Сообщений', value: '128.5K', icon: MessageSquare, color: 'text-blue-400' },
          { label: 'Инвайтов', value: '4,523', icon: UserPlus, color: 'text-purple-400' },
          { label: 'Комментариев', value: '8,234', icon: MessageCircle, color: 'text-cyan-400' },
          { label: 'Конверсия', value: '34.2%', icon: TrendingUp, color: 'text-green-400' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={cn('h-5 w-5', stat.color)} />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Настройки</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Telegram API</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2"><Label>API ID</Label><Input placeholder="12345678" /></div>
            <div className="grid gap-2"><Label>API Hash</Label><Input type="password" placeholder="••••••••" /></div>
            <Button variant="outline" className="w-full">Проверить подключение</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Лимиты</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2"><Label>Макс. сообщений в день</Label><Input type="number" defaultValue="500" /></div>
            <div className="grid gap-2"><Label>Макс. инвайтов в день</Label><Input type="number" defaultValue="50" /></div>
            <div className="grid gap-2"><Label>Задержка (сек)</Label><Input type="number" defaultValue="30" /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
