import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import NewCaseDialog from '@/components/NewCaseDialog';
import NewClientDialog from '@/components/NewClientDialog';
import EditCaseDialog from '@/components/EditCaseDialog';
import EditClientDialog from '@/components/EditClientDialog';
import CalendarView from '@/components/CalendarView';
import FinancesView from '@/components/FinancesView';

type CaseStatus = 'открыто' | 'в работе' | 'на паузе' | 'завершено' | 'архив';
type ClientType = 'физическое' | 'юридическое';

interface Client {
  id: number;
  type: ClientType;
  full_name?: string;
  company_name?: string;
  contact_info: {
    phones?: string[];
    emails?: string[];
  };
  address?: string;
  cases_count: number;
}

interface Case {
  id: number;
  internal_number: string;
  external_number?: string;
  title: string;
  description?: string;
  status: CaseStatus;
  type: string;
  client_id?: number;
  client_name?: string;
  client_company?: string;
  responsible_user_id?: number;
  responsible_name?: string;
  tasks_count: number;
  completed_tasks: number;
  created_at: string;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [casesRes, clientsRes] = await Promise.all([
        fetch('https://functions.poehali.dev/196ef5ca-dd1d-4d1f-ae2e-e95a90b5b8e1'),
        fetch('https://functions.poehali.dev/e47a5187-bd9e-4e30-9749-5aaf274af1f5')
      ]);

      const casesData = await casesRes.json();
      const clientsData = await clientsRes.json();

      setCases(casesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: Record<CaseStatus, { label: string; color: string }> = {
    'открыто': { label: 'Открыто', color: 'bg-blue-500' },
    'в работе': { label: 'В работе', color: 'bg-purple-500' },
    'на паузе': { label: 'На паузе', color: 'bg-yellow-500' },
    'завершено': { label: 'Завершено', color: 'bg-green-500' },
    'архив': { label: 'Архив', color: 'bg-gray-500' }
  };

  const stats = {
    totalCases: cases.length,
    activeCases: cases.filter(c => c.status === 'в работе').length,
    totalClients: clients.length,
    completionRate: cases.length > 0
      ? Math.round((cases.reduce((sum, c) => sum + c.completed_tasks, 0) / cases.reduce((sum, c) => sum + c.tasks_count, 0)) * 100)
      : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-slate-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-slate-900">Суть Дела</h1>
                <p className="text-sm text-slate-500">Управление судебными делами</p>
              </div>
            </div>
            <NewCaseDialog clients={clients} onSuccess={fetchData} />
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
                {clients.filter(c => c.type === 'юридическое').length} юр. / {clients.filter(c => c.type === 'физическое').length} физ.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-scale animate-fade-in border-none shadow-lg" style={{animationDelay: '0.2s'}}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Icon name="CheckCircle" size={18} />
                Выполнено задач
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {cases.reduce((sum, c) => sum + c.completed_tasks, 0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">из {cases.reduce((sum, c) => sum + c.tasks_count, 0)} задач</p>
            </CardContent>
          </Card>

          <Card className="hover-scale animate-fade-in border-none shadow-lg" style={{animationDelay: '0.3s'}}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Icon name="TrendingUp" size={18} />
                Прогресс
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {stats.completionRate}%
              </div>
              <Progress value={stats.completionRate} className="mt-2 h-2" />
              <p className="text-xs text-slate-500 mt-1">Общая эффективность</p>
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
              <Icon name="DollarSign" size={16} />
              Финансы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Activity" size={20} />
                  Активные дела
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cases.filter(c => c.status === 'в работе').slice(0, 5).map(caseItem => (
                    <div key={caseItem.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{caseItem.title}</h4>
                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Icon name="User" size={14} />
                            {caseItem.client_name || caseItem.client_company || 'Не указан'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="FileText" size={14} />
                            {caseItem.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Hash" size={14} />
                            {caseItem.internal_number}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-700">
                            {caseItem.completed_tasks}/{caseItem.tasks_count} задач
                          </div>
                          <Progress 
                            value={caseItem.tasks_count > 0 ? (caseItem.completed_tasks / caseItem.tasks_count) * 100 : 0} 
                            className="w-24 h-2 mt-1" 
                          />
                        </div>
                        <Badge className={statusConfig[caseItem.status]?.color || 'bg-gray-500'}>
                          {statusConfig[caseItem.status]?.label || caseItem.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {cases.filter(c => c.status === 'в работе').length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Icon name="Inbox" size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Нет активных дел</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cases" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Briefcase" size={20} />
                  Все дела
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cases.map(caseItem => (
                    <div key={caseItem.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{caseItem.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{caseItem.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Icon name="User" size={14} />
                            {caseItem.client_name || caseItem.client_company || 'Не указан'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="FileText" size={14} />
                            {caseItem.type}
                          </span>
                          {caseItem.external_number && (
                            <span className="flex items-center gap-1">
                              <Icon name="Scale" size={14} />
                              {caseItem.external_number}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-700">
                            {caseItem.completed_tasks}/{caseItem.tasks_count} задач
                          </div>
                          <Progress 
                            value={caseItem.tasks_count > 0 ? (caseItem.completed_tasks / caseItem.tasks_count) * 100 : 0} 
                            className="w-24 h-2 mt-1" 
                          />
                        </div>
                        <Badge className={statusConfig[caseItem.status]?.color || 'bg-gray-500'}>
                          {statusConfig[caseItem.status]?.label || caseItem.status}
                        </Badge>
                        <EditCaseDialog
                          caseData={caseItem}
                          clients={clients}
                          onSuccess={fetchData}
                          trigger={
                            <Button variant="ghost" size="icon">
                              <Icon name="Edit" size={16} />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  ))}
                  {cases.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Icon name="Inbox" size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Нет дел в системе</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Users" size={20} />
                  База клиентов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clients.map(client => (
                    <div key={client.id} className="p-4 rounded-lg border hover:border-purple-300 transition-all hover:shadow-md">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className={client.type === 'юридическое' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                              {client.type === 'юридическое' 
                                ? client.company_name?.substring(0, 2).toUpperCase() 
                                : client.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              {client.type === 'юридическое' ? client.company_name : client.full_name}
                            </h4>
                            <Badge variant="outline" className="mt-1">
                              {client.type === 'юридическое' ? 'Юр. лицо' : 'Физ. лицо'}
                            </Badge>
                          </div>
                        </div>
                        <EditClientDialog
                          client={client}
                          onSuccess={fetchData}
                          trigger={
                            <Button variant="ghost" size="icon">
                              <Icon name="Edit" size={16} />
                            </Button>
                          }
                        />
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        {client.contact_info?.phones?.[0] && (
                          <div className="flex items-center gap-2">
                            <Icon name="Phone" size={14} />
                            {client.contact_info.phones[0]}
                          </div>
                        )}
                        {client.contact_info?.emails?.[0] && (
                          <div className="flex items-center gap-2">
                            <Icon name="Mail" size={14} />
                            {client.contact_info.emails[0]}
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Icon name="Briefcase" size={14} />
                          <span className="font-medium">{client.cases_count} дел</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {clients.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-slate-500">
                      <Icon name="UserPlus" size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Нет клиентов в базе</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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