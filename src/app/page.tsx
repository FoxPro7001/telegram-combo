'use client'

import * as React from 'react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
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
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bell,
  Bot,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Clock,
  Crown,
  Download,
  Eye,
  FileText,
  Flame,
  FolderOpen,
  Globe,
  HeadphonesIcon,
  HelpCircle,
  History,
  Home,
  Key,
  MessageSquare,
  Moon,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Server,
  Settings,
  Share2,
  Shield,
  Square,
  Star,
  Sun,
  Target,
  TrendingUp,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  Zap,
  FolderSearch,
  UserSearch,
  MessageCircle,
  Folder,
  FolderCog,
  Briefcase,
  User,
  Layers,
  Trash2,
  Edit,
  Database,
  UsersRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

// Types
type Page = 'dashboard' | 'accounts' | 'warmup' | 'parsing-groups' | 'parsing-members' | 'inviting' | 'commenting' | 'messaging' | 'analytics' | 'settings'

type AccountFolder = 'work' | 'admins' | 'personal'

interface Project {
  id: string
  name: string
  color: string
  description?: string
  createdAt: string
}

interface Account {
  id: string
  phone: string
  name: string
  status: 'online' | 'offline' | 'limited' | 'warming'
  folder: AccountFolder
  projectId: string
  avatar?: string
  lastActive: string
  messages: number
  invites: number
  warmupProgress?: number
  warmupDays?: number
  proxy?: string
  tdataPath?: string
}

interface ParsedDatabase {
  id: string
  name: string
  projectId: string
  source: string
  count: number
  createdAt: string
}

interface Task {
  id: string
  name: string
  type: 'parsing' | 'inviting' | 'messaging' | 'warmup' | 'commenting'
  status: 'running' | 'paused' | 'completed' | 'error'
  progress: number
  target: number
  completed: number
  speed?: string
  eta?: string
  projectId: string
}

// ==================== MOCK DATA ====================

const mockProjects: Project[] = [
  { id: 'proj_1', name: 'Crypto Project', color: '#8B5CF6', description: 'Криптовалютный проект', createdAt: '2024-01-15' },
  { id: 'proj_2', name: 'Marketing Agency', color: '#10B981', description: 'Маркетинговое агентство', createdAt: '2024-02-01' },
  { id: 'proj_3', name: 'Personal', color: '#F59E0B', description: 'Личные нужды', createdAt: '2024-02-10' },
]

const mockAccounts: Account[] = [
  // Crypto Project accounts
  { id: '1', phone: '+7 999 123 4567', name: 'Crypto Bot #1', status: 'online', folder: 'work', projectId: 'proj_1', lastActive: 'Сейчас', messages: 15420, invites: 342, proxy: 'socks5://proxy1.com:1080' },
  { id: '2', phone: '+7 999 234 5678', name: 'Crypto Bot #2', status: 'online', folder: 'work', projectId: 'proj_1', lastActive: '5 мин назад', messages: 8934, invites: 156 },
  { id: '3', phone: '+7 999 345 6789', name: 'Admin Crypto', status: 'online', folder: 'admins', projectId: 'proj_1', lastActive: '1 час назад', messages: 4521, invites: 89 },
  
  // Marketing Agency accounts
  { id: '4', phone: '+7 999 456 7890', name: 'Marketing Bot #1', status: 'online', folder: 'work', projectId: 'proj_2', lastActive: 'Сейчас', messages: 22000, invites: 450 },
  { id: '5', phone: '+7 999 567 8901', name: 'Support Bot', status: 'warming', folder: 'work', projectId: 'proj_2', lastActive: 'Сейчас', messages: 12890, invites: 278, warmupProgress: 65, warmupDays: 7 },
  { id: '6', phone: '+7 999 678 9012', name: 'Admin Marketing', status: 'online', folder: 'admins', projectId: 'proj_2', lastActive: 'Сейчас', messages: 5200, invites: 120 },
  
  // Personal accounts
  { id: '7', phone: '+7 999 789 0123', name: 'Personal Main', status: 'offline', folder: 'personal', projectId: 'proj_3', lastActive: '2 дня назад', messages: 0, invites: 0 },
  { id: '8', phone: '+7 999 890 1234', name: 'Personal Backup', status: 'limited', folder: 'personal', projectId: 'proj_3', lastActive: '3 часа назад', messages: 340, invites: 12 },
]

const mockDatabases: ParsedDatabase[] = [
  { id: 'db_1', name: 'Crypto база', projectId: 'proj_1', source: '@crypto_traders', count: 50000, createdAt: '2024-02-20' },
  { id: 'db_2', name: 'Bitcoin holdlers', projectId: 'proj_1', source: '@bitcoin_channel', count: 25000, createdAt: '2024-02-18' },
  { id: 'db_3', name: 'Marketing целевая', projectId: 'proj_2', source: '@marketing_hub', count: 35000, createdAt: '2024-02-19' },
  { id: 'db_4', name: 'SMM база', projectId: 'proj_2', source: '@smm_tips', count: 15000, createdAt: '2024-02-17' },
]

const mockTasks: Task[] = [
  { id: '1', name: 'Парсинг участников @crypto_traders', type: 'parsing', status: 'running', progress: 67, target: 50000, completed: 33500, speed: '~150/мин', eta: '~2ч 15мин', projectId: 'proj_1' },
  { id: '2', name: 'Инвайт в VIP канал', type: 'inviting', status: 'running', progress: 23, target: 500, completed: 115, speed: '~5/мин', eta: '~1ч 17мин', projectId: 'proj_1' },
  { id: '3', name: 'Рассылка промо', type: 'messaging', status: 'paused', progress: 45, target: 10000, completed: 4500, speed: '~30/мин', eta: '~3ч 50мин', projectId: 'proj_2' },
  { id: '4', name: 'Прогрев аккаунта', type: 'warmup', status: 'running', progress: 65, target: 100, completed: 65, speed: '~14 д/день', eta: '~3 дня', projectId: 'proj_2' },
]

const chartData = [
  { month: 'Янв', messages: 45000, invites: 1200, parsing: 85000 },
  { month: 'Фев', messages: 52000, invites: 1800, parsing: 92000 },
  { month: 'Мар', messages: 48000, invites: 1500, parsing: 78000 },
  { month: 'Апр', messages: 61000, invites: 2200, parsing: 105000 },
  { month: 'Май', messages: 55000, invites: 1900, parsing: 98000 },
  { month: 'Июн', messages: 67000, invites: 2800, parsing: 120000 },
]

const hourlyData = [
  { hour: '00:00', value: 120 },
  { hour: '04:00', value: 85 },
  { hour: '08:00', value: 240 },
  { hour: '12:00', value: 380 },
  { hour: '16:00', value: 420 },
  { hour: '20:00', value: 350 },
]

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  limited: 'bg-yellow-500',
  warming: 'bg-orange-500',
}

const folderConfig = {
  work: { label: 'В работе', icon: Briefcase, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  admins: { label: 'Админы', icon: Shield, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  personal: { label: 'Личные нужды', icon: User, color: 'text-green-400', bgColor: 'bg-green-500/20' },
}

const taskStatusColors = {
  running: 'bg-blue-500',
  paused: 'bg-yellow-500',
  completed: 'bg-green-500',
  error: 'bg-red-500',
}

const chartConfig = {
  messages: { label: 'Сообщения', color: 'oklch(0.65 0.2 260)' },
  invites: { label: 'Инвайты', color: 'oklch(0.7 0.15 180)' },
  parsing: { label: 'Парсинг', color: 'oklch(0.75 0.15 80)' },
} satisfies ChartConfig

// Navigation Items
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

// ==================== MAIN APP ====================

export default function TelegramComboApp() {
  const [currentPage, setCurrentPage] = React.useState<Page>('dashboard')
  const [projects, setProjects] = React.useState<Project[]>(mockProjects)
  const [currentProject, setCurrentProject] = React.useState<Project>(mockProjects[0])
  const [notifications, setNotifications] = React.useState(3)
  const [showAddAccountDialog, setShowAddAccountDialog] = React.useState(false)
  const [showEditAccountDialog, setShowEditAccountDialog] = React.useState(false)
  const [editingAccount, setEditingAccount] = React.useState<Account | null>(null)
  const [showProjectDialog, setShowProjectDialog] = React.useState(false)
  const [editingProject, setEditingProject] = React.useState<Project | null>(null)
  const [showNewTaskDialog, setShowNewTaskDialog] = React.useState(false)
  const [darkMode, setDarkMode] = React.useState(true)

  // Filter data by current project
  const projectAccounts = mockAccounts.filter(a => a.projectId === currentProject.id)
  const projectDatabases = mockDatabases.filter(d => d.projectId === currentProject.id)
  const projectTasks = mockTasks.filter(t => t.projectId === currentProject.id)

  return (
    <div className="dark">
      <SidebarProvider defaultOpen={true}>
        <Sidebar variant="sidebar" collapsible="icon" className="border-r border-sidebar-border">
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl telegram-gradient">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-lg font-bold text-sidebar-foreground">Telegram Комбайн</span>
                <span className="text-xs text-muted-foreground">v2.4.0 Pro</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {/* Current Project Badge */}
            <div className="p-3 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: currentProject.color }} />
                <span className="text-sm font-medium truncate flex-1">{currentProject.name}</span>
              </div>
            </div>

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

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Активные задачи ({projectTasks.filter(t => t.status === 'running').length})
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {projectTasks.filter(t => t.status === 'running').slice(0, 3).map((task) => (
                    <SidebarMenuItem key={task.id}>
                      <SidebarMenuButton tooltip={task.name} className="group-data-[collapsible=icon]:p-2">
                        <div className="relative">
                          <Activity className="h-5 w-5 text-blue-400" />
                          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        </div>
                        <div className="flex flex-col items-start gap-0.5 overflow-hidden">
                          <span className="text-sm truncate w-full">{task.name.slice(0, 20)}...</span>
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
            <div className="flex items-center gap-3 mt-4 group-data-[collapsible=icon]:hidden">
              <Avatar className="h-9 w-9 border-2 border-primary">
                <AvatarImage src="/logo.svg" />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">AD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">Admin User</span>
                <span className="text-xs text-muted-foreground">Pro Plan</span>
              </div>
              <Crown className="h-4 w-4 text-yellow-500 ml-auto" />
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          {/* Header */}
          <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-6" />

            {/* Project Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-[200px]">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: currentProject.color }} />
                  <span className="truncate flex-1 text-left">{currentProject.name}</span>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[280px]">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Проекты
                  <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => { setEditingProject(null); setShowProjectDialog(true) }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {projects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => setCurrentProject(project)}
                    className={cn('gap-2', currentProject.id === project.id && 'bg-accent')}
                  >
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                    <div className="flex-1">
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {mockAccounts.filter(a => a.projectId === project.id).length} аккаунтов • {mockDatabases.filter(d => d.projectId === project.id).length} баз
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
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setEditingProject(null); setShowProjectDialog(true) }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Новый проект
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={`Поиск в "${currentProject.name}"...`}
                  className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {notifications}
                  </span>
                )}
              </Button>

              <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <Separator orientation="vertical" className="h-6 mx-2" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/logo.svg" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">AD</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium">Admin</span>
                      <span className="text-xs text-muted-foreground">Pro Plan</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem><UserCheck className="mr-2 h-4 w-4" /><span>Профиль</span></DropdownMenuItem>
                  <DropdownMenuItem><Shield className="mr-2 h-4 w-4" /><span>Безопасность</span></DropdownMenuItem>
                  <DropdownMenuItem><Crown className="mr-2 h-4 w-4" /><span>Тарифный план</span></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem><HelpCircle className="mr-2 h-4 w-4" /><span>Помощь</span></DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive"><Square className="mr-2 h-4 w-4" /><span>Выйти</span></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {currentPage === 'dashboard' && <DashboardPage project={currentProject} accounts={projectAccounts} tasks={projectTasks} databases={projectDatabases} />}
            {currentPage === 'accounts' && <AccountsPage 
              project={currentProject}
              accounts={projectAccounts} 
              onAddAccount={() => setShowAddAccountDialog(true)}
              onEditAccount={(account) => { setEditingAccount(account); setShowEditAccountDialog(true) }}
            />}
            {currentPage === 'warmup' && <WarmupPage project={currentProject} />}
            {currentPage === 'parsing-groups' && <ParsingGroupsPage project={currentProject} />}
            {currentPage === 'parsing-members' && <ParsingMembersPage project={currentProject} databases={projectDatabases} />}
            {currentPage === 'inviting' && <InvitingPage project={currentProject} tasks={projectTasks.filter(t => t.type === 'inviting')} />}
            {currentPage === 'commenting' && <CommentingPage project={currentProject} />}
            {currentPage === 'messaging' && <MessagingPage project={currentProject} tasks={projectTasks.filter(t => t.type === 'messaging')} />}
            {currentPage === 'analytics' && <AnalyticsPage project={currentProject} />}
            {currentPage === 'settings' && <SettingsPage project={currentProject} />}
          </main>

          {/* Footer */}
          <footer className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 px-4 lg:px-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Telegram Комбайн v2.4.0</span>
                <Separator orientation="vertical" className="h-4" />
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Система активна
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: currentProject.color }} />
                  {currentProject.name}
                </div>
                <Separator orientation="vertical" className="h-4" />
                <span>© 2024</span>
              </div>
            </div>
          </footer>
        </SidebarInset>
      </SidebarProvider>

      {/* Add Account Dialog */}
      <Dialog open={showAddAccountDialog} onOpenChange={setShowAddAccountDialog}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Добавить аккаунт
            </DialogTitle>
            <DialogDescription>
              Проект: <span className="font-medium" style={{ color: currentProject.color }}>{currentProject.name}</span>
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="tdata" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tdata">TData папка</TabsTrigger>
              <TabsTrigger value="manual">Вручную</TabsTrigger>
            </TabsList>
            <TabsContent value="tdata" className="space-y-4 mt-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">Перетащите tdata папку сюда</p>
                <p className="text-xs text-muted-foreground">или нажмите для выбора</p>
                <Input type="file" className="hidden" webkitdirectory="" directory="" />
              </div>
              <div className="grid gap-2">
                <Label>Название аккаунта</Label>
                <Input placeholder="Marketing Bot #1" />
              </div>
              <div className="grid gap-2">
                <Label>Папка</Label>
                <Select defaultValue="work">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">В работе</SelectItem>
                    <SelectItem value="admins">Админы</SelectItem>
                    <SelectItem value="personal">Личные нужды</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label>Номер телефона</Label>
                <Input placeholder="+7 999 123 4567" />
              </div>
              <div className="grid gap-2">
                <Label>Название аккаунта</Label>
                <Input placeholder="Marketing Bot #1" />
              </div>
              <div className="grid gap-2">
                <Label>Папка</Label>
                <Select defaultValue="work">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">В работе</SelectItem>
                    <SelectItem value="admins">Админы</SelectItem>
                    <SelectItem value="personal">Личные нужды</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
          <Separator className="my-4" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Прокси</Label>
              <Switch id="use-proxy" />
            </div>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Тип</Label>
                  <Select defaultValue="socks5">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="socks5">SOCKS5</SelectItem>
                      <SelectItem value="socks4">SOCKS4</SelectItem>
                      <SelectItem value="http">HTTP</SelectItem>
                      <SelectItem value="https">HTTPS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2"><Label>Адрес</Label><Input placeholder="proxy.example.com" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2"><Label>Порт</Label><Input placeholder="1080" /></div>
                <div className="grid gap-2"><Label>Логин</Label><Input placeholder="username" /></div>
                <div className="grid gap-2"><Label>Пароль</Label><Input type="password" placeholder="••••••••" /></div>
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <div><Label>Автопрогрев</Label><p className="text-xs text-muted-foreground">Запустить после добавления</p></div>
            <Switch id="auto-warmup" />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowAddAccountDialog(false)}>Отмена</Button>
            <Button type="submit" className="telegram-gradient text-white">Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={showEditAccountDialog} onOpenChange={setShowEditAccountDialog}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Редактировать аккаунт
            </DialogTitle>
            <DialogDescription>
              {editingAccount?.name} • {editingAccount?.phone}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2"><Label>Название</Label><Input defaultValue={editingAccount?.name} /></div>
            <div className="grid gap-2">
              <Label>Папка</Label>
              <Select defaultValue={editingAccount?.folder}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">В работе</SelectItem>
                  <SelectItem value="admins">Админы</SelectItem>
                  <SelectItem value="personal">Личные нужды</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Перенести в проект</Label>
              <Select defaultValue={editingAccount?.projectId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Прокси</Label>
              <Switch defaultChecked={!!editingAccount?.proxy} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Тип</Label>
                <Select defaultValue="socks5">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="socks5">SOCKS5</SelectItem>
                    <SelectItem value="http">HTTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Адрес</Label><Input placeholder="proxy.example.com" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2"><Label>Порт</Label><Input defaultValue="1080" /></div>
              <div className="grid gap-2"><Label>Логин</Label><Input /></div>
              <div className="grid gap-2"><Label>Пароль</Label><Input type="password" /></div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowEditAccountDialog(false)}>Отмена</Button>
            <Button type="submit" className="telegram-gradient text-white">Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Dialog (Create/Edit) */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingProject ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingProject ? 'Редактировать проект' : 'Новый проект'}
            </DialogTitle>
            <DialogDescription>
              {editingProject ? 'Измените настройки проекта' : 'Создайте новый проект для организации работы'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название проекта</Label>
              <Input placeholder="My Project" defaultValue={editingProject?.name} />
            </div>
            <div className="grid gap-2">
              <Label>Описание</Label>
              <Textarea placeholder="Описание проекта..." defaultValue={editingProject?.description} className="min-h-[80px]" />
            </div>
            <div className="grid gap-2">
              <Label>Цвет</Label>
              <div className="flex gap-2">
                {['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#06B6D4', '#84CC16'].map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                      editingProject?.color === color ? 'border-white scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            {editingProject && (
              <Button variant="destructive" onClick={() => setShowProjectDialog(false)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setShowProjectDialog(false)}>Отмена</Button>
              <Button type="submit" className="telegram-gradient text-white">
                {editingProject ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==================== PAGE COMPONENTS ====================

// Dashboard Page
function DashboardPage({ project, accounts, tasks, databases }: { project: Project, accounts: Account[], tasks: Task[], databases: ParsedDatabase[] }) {
  const stats = [
    { label: 'Аккаунтов', value: accounts.length, icon: Users, color: 'text-blue-400' },
    { label: 'Онлайн', value: accounts.filter(a => a.status === 'online').length, icon: Activity, color: 'text-green-400' },
    { label: 'Задач', value: tasks.filter(t => t.status === 'running').length, icon: Target, color: 'text-purple-400' },
    { label: 'Баз данных', value: databases.length, icon: Database, color: 'text-cyan-400' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>
        <p className="text-muted-foreground">{project.description || 'Обзор проекта'}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={cn('h-5 w-5', stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Активные задачи</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {tasks.filter(t => t.status === 'running').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Нет активных задач</div>
            ) : (
              tasks.filter(t => t.status === 'running').map(task => (
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
          <CardHeader><CardTitle>Быстрые действия</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2 h-11">
              <UserSearch className="h-4 w-4 text-blue-400" />Парсинг участников
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-11">
              <UserPlus className="h-4 w-4 text-purple-400" />Массовый инвайт
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-11">
              <Send className="h-4 w-4 text-green-400" />Запустить рассылку
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Базы данных проекта</CardTitle></CardHeader>
          <CardContent>
            {databases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Нет сохранённых баз</div>
            ) : (
              <div className="space-y-2">
                {databases.map(db => (
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

        <Card>
          <CardHeader><CardTitle>Активность за месяц</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="messages" stroke="var(--color-messages)" fill="var(--color-messages)" fillOpacity={0.3} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Accounts Page with Folders
function AccountsPage({ project, accounts, onAddAccount, onEditAccount }: { project: Project, accounts: Account[], onAddAccount: () => void, onEditAccount: (account: Account) => void }) {
  const [openFolders, setOpenFolders] = React.useState<AccountFolder[]>(['work', 'admins', 'personal'])

  const toggleFolder = (folder: AccountFolder) => {
    setOpenFolders(prev => prev.includes(folder) ? prev.filter(f => f !== folder) : [...prev, folder])
  }

  const getAccountsByFolder = (folder: AccountFolder) => accounts.filter(a => a.folder === folder)

  const FolderSection = ({ folder }: { folder: AccountFolder }) => {
    const config = folderConfig[folder]
    const folderAccounts = getAccountsByFolder(folder)
    const isOpen = openFolders.includes(folder)
    const onlineCount = folderAccounts.filter(a => a.status === 'online').length

    return (
      <Collapsible open={isOpen} onOpenChange={() => toggleFolder(folder)}>
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
                    <CardDescription>{folderAccounts.length} аккаунтов • {onlineCount} онлайн</CardDescription>
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
              {folderAccounts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Нет аккаунтов в этой папке</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {folderAccounts.map((account) => (
                    <div key={account.id} className="rounded-lg border bg-muted/20 p-3 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => onEditAccount(account)}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="text-xs">{account.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className={cn('absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background', statusColors[account.status])} />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{account.name}</div>
                            <div className="text-xs text-muted-foreground">{account.phone}</div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditAccount(account) }}>
                              <Settings className="mr-2 h-4 w-4" />Настройки
                            </DropdownMenuItem>
                            <DropdownMenuItem><RefreshCw className="mr-2 h-4 w-4" />Переподключить</DropdownMenuItem>
                            <DropdownMenuItem><Flame className="mr-2 h-4 w-4" />На прогрев</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Удалить</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="outline" className={cn(
                          account.status === 'online' && 'border-green-500 text-green-400',
                          account.status === 'limited' && 'border-yellow-500 text-yellow-400',
                          account.status === 'warming' && 'border-orange-500 text-orange-400',
                          account.status === 'offline' && 'border-gray-500 text-gray-400',
                        )}>
                          {account.status === 'online' ? 'Онлайн' : account.status === 'limited' ? 'Ограничен' : account.status === 'warming' ? 'Прогрев' : 'Офлайн'}
                        </Badge>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          {account.proxy && <Globe className="h-3 w-3" />}
                          {account.lastActive}
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />
          <div>
            <h1 className="text-2xl font-bold">Аккаунты</h1>
            <p className="text-muted-foreground">{project.name} • {accounts.length} аккаунтов</p>
          </div>
        </div>
        <Button onClick={onAddAccount} className="telegram-gradient text-white">
          <Plus className="h-4 w-4 mr-2" />Добавить аккаунт
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{accounts.length}</div><div className="text-xs text-muted-foreground">Всего</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{accounts.filter(a => a.status === 'online').length}</div><div className="text-xs text-muted-foreground">Онлайн</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{accounts.filter(a => a.folder === 'admins').length}</div><div className="text-xs text-muted-foreground">Админов</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{accounts.filter(a => a.status === 'warming').length}</div><div className="text-xs text-muted-foreground">На прогреве</div></CardContent></Card>
      </div>

      <div className="space-y-4">
        <FolderSection folder="work" />
        <FolderSection folder="admins" />
        <FolderSection folder="personal" />
      </div>
    </div>
  )
}

// Warmup Page
function WarmupPage({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />
        <h1 className="text-2xl font-bold">Прогрев</h1>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Flame className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Прогрев аккаунтов</h3>
          <p className="text-muted-foreground text-center max-w-md">Раздел в разработке</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Parsing Groups Page
function ParsingGroupsPage({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />
          <div>
            <h1 className="text-2xl font-bold">Парсинг групп</h1>
            <p className="text-muted-foreground">{project.name}</p>
          </div>
        </div>
        <Button className="telegram-gradient text-white"><Plus className="h-4 w-4 mr-2" />Новый поиск</Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Новый поиск</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2"><Label>Ключевые слова</Label><Input placeholder="crypto, bitcoin..." /></div>
            <div className="grid gap-2"><Label>Язык</Label><Select defaultValue="ru"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Все</SelectItem><SelectItem value="ru">Русский</SelectItem><SelectItem value="en">English</SelectItem></SelectContent></Select></div>
            <Button className="w-full telegram-gradient text-white"><Search className="h-4 w-4 mr-2" />Найти</Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Результаты поиска</CardTitle></CardHeader>
          <CardContent><div className="text-center py-8 text-muted-foreground">Введите ключевые слова для поиска</div></CardContent>
        </Card>
      </div>
    </div>
  )
}

// Parsing Members Page
function ParsingMembersPage({ project, databases }: { project: Project, databases: ParsedDatabase[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />
          <div>
            <h1 className="text-2xl font-bold">Парсинг участников</h1>
            <p className="text-muted-foreground">{project.name} • {databases.length} баз данных</p>
          </div>
        </div>
        <Button className="telegram-gradient text-white"><Plus className="h-4 w-4 mr-2" />Новая задача</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Новый парсинг</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2"><Label>Источник</Label><Input placeholder="@channel_name" /></div>
            <div className="grid gap-2"><Label>Название базы</Label><Input placeholder="Моя база" /></div>
            <Button className="w-full telegram-gradient text-white"><Target className="h-4 w-4 mr-2" />Начать</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Базы данных проекта
            </CardTitle>
          </CardHeader>
          <CardContent>
            {databases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Нет сохранённых баз данных</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Источник</TableHead>
                    <TableHead>Записей</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {databases.map(db => (
                    <TableRow key={db.id}>
                      <TableCell className="font-medium">{db.name}</TableCell>
                      <TableCell>{db.source}</TableCell>
                      <TableCell>{db.count.toLocaleString()}</TableCell>
                      <TableCell>{db.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Inviting Page
function InvitingPage({ project, tasks }: { project: Project, tasks: Task[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />
          <div>
            <h1 className="text-2xl font-bold">Инвайты</h1>
            <p className="text-muted-foreground">{project.name}</p>
          </div>
        </div>
        <Button className="telegram-gradient text-white"><Plus className="h-4 w-4 mr-2" />Новая кампания</Button>
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
                    <Badge variant={task.status === 'running' ? 'default' : 'secondary'}>
                      {task.status === 'running' ? 'Выполняется' : 'Пауза'}
                    </Badge>
                  </div>
                  <Progress value={task.progress} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{task.completed} / {task.target}</span>
                    <span>{task.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Commenting Page
function CommentingPage({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />
        <h1 className="text-2xl font-bold">Комментинг</h1>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <MessageCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Автоматические комментарии</h3>
          <p className="text-muted-foreground text-center">Будет проработан позже</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Messaging Page
function MessagingPage({ project, tasks }: { project: Project, tasks: Task[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />
          <div>
            <h1 className="text-2xl font-bold">Рассылки</h1>
            <p className="text-muted-foreground">{project.name}</p>
          </div>
        </div>
        <Button className="telegram-gradient text-white"><Plus className="h-4 w-4 mr-2" />Новая рассылка</Button>
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
                    <Badge variant="secondary">Пауза</Badge>
                  </div>
                  <Progress value={task.progress} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{task.completed.toLocaleString()} / {task.target.toLocaleString()}</span>
                    <span>{task.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Analytics Page
function AnalyticsPage({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Активность за месяц</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="messages" stroke="var(--color-messages)" fill="var(--color-messages)" fillOpacity={0.3} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Почасовая активность</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-messages)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Settings Page
function SettingsPage({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />
        <h1 className="text-2xl font-bold">Настройки</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Общие настройки</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><Label>Автозапуск задач</Label><p className="text-xs text-muted-foreground">Автоматически запускать при старте</p></div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div><Label>Уведомления</Label><p className="text-xs text-muted-foreground">Получать уведомления</p></div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Лимиты</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Макс. сообщений в день</Label><Input type="number" defaultValue="500" /></div>
            <div className="space-y-2"><Label>Макс. инвайтов в день</Label><Input type="number" defaultValue="50" /></div>
            <div className="space-y-2"><Label>Задержка (сек)</Label><Input type="number" defaultValue="30" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Telegram API</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>API ID</Label><Input placeholder="12345678" /></div>
            <div className="space-y-2"><Label>API Hash</Label><Input type="password" placeholder="••••••••" /></div>
            <Button variant="outline" className="w-full">Проверить подключение</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
