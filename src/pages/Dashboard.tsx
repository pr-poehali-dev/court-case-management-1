import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import NewCaseDialog from '@/components/NewCaseDialog';
import CalendarView from '@/components/CalendarView';
import FinancesView from '@/components/FinancesView';

type CaseStatus = 'active' | 'pending' | 'completed' | 'archived';
type CasePriority = 'high' | 'medium' | 'low';
type ClientType = 'individual' | 'corporate';

interface Client {
  id: string;
  name: string;
  type: ClientType;
  phone: string;
  email: string;
  casesCount: number;
}

interface Case {
  id: string;
  title: string;
  client: string;
  status: CaseStatus;
  priority: CasePriority;
  category: string;
  nextHearing: string;
  budget: number;
  spent: number;
  progress: number;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const mockCases: Case[] = [
    {
      id: '1',
      title: 'Иск о взыскании задолженности',
      client: 'ООО "Прогресс"',
      status: 'active',
      priority: 'high',
      category: 'Арбитраж',
      nextHearing: '2025-12-05',
      budget: 500000,
      spent: 350000,
      progress: 65
    },
    {
      id: '2',
      title: 'Трудовой спор о восстановлении',
      client: 'Иванов П.С.',
      status: 'pending',
      priority: 'medium',
      category: 'Трудовые споры',
      nextHearing: '2025-12-12',
      budget: 150000,
      spent: 45000,
      progress: 30
    },
    {
      id: '3',
      title: 'Защита деловой репутации',
      client: 'ИП Петрова А.М.',
      status: 'active',
      priority: 'high',
      category: 'Гражданские дела',
      nextHearing: '2025-12-08',
      budget: 300000,
      spent: 180000,
      progress: 55
    },
    {
      id: '4',
      title: 'Оспаривание договора поставки',
      client: 'ООО "Континент"',
      status: 'completed',
      priority: 'low',
      category: 'Арбитраж',
      nextHearing: '-',
      budget: 400000,
      spent: 400000,
      progress: 100
    }
  ];

  const mockClients: Client[] = [
    { id: '1', name: 'ООО "Прогресс"', type: 'corporate', phone: '+7 (495) 123-45-67', email: 'info@progress.ru', casesCount: 3 },
    { id: '2', name: 'Иванов Петр Сергеевич', type: 'individual', phone: '+7 (926) 234-56-78', email: 'ivanov@mail.ru', casesCount: 1 },
    { id: '3', name: 'ИП Петрова Анна Михайловна', type: 'individual', phone: '+7 (916) 345-67-89', email: 'petrova@gmail.com', casesCount: 2 },
    { id: '4', name: 'ООО "Континент"', type: 'corporate', phone: '+7 (495) 987-65-43', email: 'legal@kontinent.ru', casesCount: 5 }
  ];

  const statusConfig = {
    active: { label: 'В работе', color: 'bg-blue-500' },
    pending: { label: 'Ожидание', color: 'bg-yellow-500' },
    completed: { label: 'Завершено', color: 'bg-green-500' },
    archived: { label: 'Архив', color: 'bg-gray-500' }
  };

  const priorityConfig = {
    high: { label: 'Высокий', color: 'bg-red-500' },
    medium: { label: 'Средний', color: 'bg-orange-500' },
    low: { label: 'Низкий', color: 'bg-blue-500' }
  };

  const stats = {
    totalCases: mockCases.length,
    activeCases: mockCases.filter(c => c.status === 'active').length,
    totalClients: mockClients.length,
    totalBudget: mockCases.reduce((sum, c) => sum + c.budget, 0),
    totalSpent: mockCases.reduce((sum, c) => sum + c.spent, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50">
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Icon name="Scale" className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">LegalCRM</h1>
                <p className="text-sm text-slate-500">Управление судебными делами</p>
              </div>
            </div>
            <NewCaseDialog clients={mockClients} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover-scale animate-fade-in border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon name="Briefcase" size={18} />
                Всего дел
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCases}</div>
              <p className="text-xs text-blue-100 mt-1">В том числе {stats.activeCases} активных</p>
            </CardContent>
          </Card>

          <Card className="hover-scale animate-fade-in border-none shadow-lg" style={{animationDelay: '0.1s'}}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Icon name="Users" size={18} />
                Клиенты
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.totalClients}</div>
              <p className="text-xs text-slate-500 mt-1">
                {mockClients.filter(c => c.type === 'corporate').length} юр. / {mockClients.filter(c => c.type === 'individual').length} физ.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-scale animate-fade-in border-none shadow-lg" style={{animationDelay: '0.2s'}}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Icon name="Wallet" size={18} />
                Бюджет дел
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {(stats.totalBudget / 1000000).toFixed(1)}М
              </div>
              <p className="text-xs text-slate-500 mt-1">₽ российских рублей</p>
            </CardContent>
          </Card>

          <Card className="hover-scale animate-fade-in border-none shadow-lg" style={{animationDelay: '0.3s'}}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Icon name="TrendingUp" size={18} />
                Расходы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {(stats.totalSpent / 1000000).toFixed(1)}М
              </div>
              <Progress value={(stats.totalSpent / stats.totalBudget) * 100} className="mt-2 h-2" />
              <p className="text-xs text-slate-500 mt-1">
                {Math.round((stats.totalSpent / stats.totalBudget) * 100)}% от бюджета
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="overview" className="gap-2">
              <Icon name="LayoutDashboard" size={16} />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="cases" className="gap-2">
              <Icon name="FileText" size={16} />
              Дела
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2">
              <Icon name="Users" size={16} />
              Клиенты
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Icon name="Calendar" size={16} />
              Календарь
            </TabsTrigger>
            <TabsTrigger value="finances" className="gap-2">
              <Icon name="Wallet" size={16} />
              Финансы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="PieChart" size={20} />
                    Статистика по статусам
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(statusConfig).map(([key, config]) => {
                      const count = mockCases.filter(c => c.status === key).length;
                      const percentage = (count / mockCases.length) * 100;
                      return (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-700">{config.label}</span>
                            <span className="text-slate-500">{count} дел</span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${config.color} transition-all duration-500`}
                              style={{width: `${percentage}%`}}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="BarChart3" size={20} />
                    Категории дел
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from(new Set(mockCases.map(c => c.category))).map((category, idx) => {
                      const count = mockCases.filter(c => c.category === category).length;
                      return (
                        <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover-scale">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${idx % 3 === 0 ? 'bg-purple-100' : idx % 3 === 1 ? 'bg-blue-100' : 'bg-green-100'} flex items-center justify-center`}>
                              <Icon name="Folder" size={20} className={idx % 3 === 0 ? 'text-purple-600' : idx % 3 === 1 ? 'text-blue-600' : 'text-green-600'} />
                            </div>
                            <span className="font-medium text-slate-700">{category}</span>
                          </div>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cases" className="space-y-4">
            {mockCases.map((caseItem, idx) => (
              <Card key={caseItem.id} className="hover-scale border-none shadow-lg animate-fade-in" style={{animationDelay: `${idx * 0.05}s`}}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{caseItem.title}</h3>
                        <Badge className={`${priorityConfig[caseItem.priority].color} text-white border-none`}>
                          {priorityConfig[caseItem.priority].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Icon name="User" size={14} />
                          {caseItem.client}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Folder" size={14} />
                          {caseItem.category}
                        </span>
                      </div>
                    </div>
                    <Badge className={`${statusConfig[caseItem.status].color} text-white border-none`}>
                      {statusConfig[caseItem.status].label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs text-blue-600 font-medium mb-1">Следующее заседание</div>
                      <div className="text-sm font-semibold text-blue-900">
                        {caseItem.nextHearing !== '-' ? new Date(caseItem.nextHearing).toLocaleDateString('ru-RU') : 'Не назначено'}
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-xs text-green-600 font-medium mb-1">Бюджет</div>
                      <div className="text-sm font-semibold text-green-900">
                        {caseItem.budget.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="text-xs text-orange-600 font-medium mb-1">Расходы</div>
                      <div className="text-sm font-semibold text-orange-900">
                        {caseItem.spent.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Прогресс дела</span>
                      <span className="font-medium">{caseItem.progress}%</span>
                    </div>
                    <Progress value={caseItem.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockClients.map((client, idx) => (
                <Card key={client.id} className="hover-scale border-none shadow-lg animate-fade-in" style={{animationDelay: `${idx * 0.05}s`}}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-14 h-14 bg-gradient-to-br from-purple-400 to-blue-400">
                        <AvatarFallback className="bg-transparent text-white text-lg font-semibold">
                          {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">{client.name}</h3>
                          <Badge variant={client.type === 'corporate' ? 'default' : 'secondary'} className="text-xs">
                            {client.type === 'corporate' ? 'Юр. лицо' : 'Физ. лицо'}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-slate-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Icon name="Phone" size={14} />
                            {client.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="Mail" size={14} />
                            {client.email}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="Briefcase" size={14} className="text-purple-600" />
                          <span className="text-slate-700">
                            <span className="font-semibold text-purple-600">{client.casesCount}</span> {client.casesCount === 1 ? 'дело' : 'дел'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>

          <TabsContent value="finances">
            <FinancesView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;