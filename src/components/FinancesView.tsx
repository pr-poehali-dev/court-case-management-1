import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Expense {
  id: string;
  caseTitle: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  status: 'paid' | 'pending' | 'approved';
}

interface CaseFinance {
  caseId: string;
  caseTitle: string;
  budget: number;
  spent: number;
  pending: number;
  category: string;
}

const FinancesView = () => {
  const mockExpenses: Expense[] = [
    {
      id: '1',
      caseTitle: 'Иск о взыскании задолженности',
      category: 'Госпошлина',
      amount: 30000,
      date: '2025-11-15',
      description: 'Оплата госпошлины за подачу иска',
      status: 'paid'
    },
    {
      id: '2',
      caseTitle: 'Иск о взыскании задолженности',
      category: 'Экспертиза',
      amount: 120000,
      date: '2025-11-20',
      description: 'Финансовая экспертиза',
      status: 'paid'
    },
    {
      id: '3',
      caseTitle: 'Защита деловой репутации',
      category: 'Консультации',
      amount: 50000,
      date: '2025-11-25',
      description: 'Юридические консультации',
      status: 'paid'
    },
    {
      id: '4',
      caseTitle: 'Трудовой спор о восстановлении',
      category: 'Документы',
      amount: 15000,
      date: '2025-11-28',
      description: 'Подготовка документов',
      status: 'pending'
    },
    {
      id: '5',
      caseTitle: 'Защита деловой репутации',
      category: 'Представительство',
      amount: 80000,
      date: '2025-12-01',
      description: 'Представительство в суде',
      status: 'approved'
    }
  ];

  const mockCaseFinances: CaseFinance[] = [
    {
      caseId: '1',
      caseTitle: 'Иск о взыскании задолженности',
      budget: 500000,
      spent: 350000,
      pending: 50000,
      category: 'Арбитраж'
    },
    {
      caseId: '2',
      caseTitle: 'Защита деловой репутации',
      budget: 300000,
      spent: 180000,
      pending: 80000,
      category: 'Гражданские дела'
    },
    {
      caseId: '3',
      caseTitle: 'Трудовой спор о восстановлении',
      budget: 150000,
      spent: 45000,
      pending: 15000,
      category: 'Трудовые споры'
    },
    {
      caseId: '4',
      caseTitle: 'Оспаривание договора поставки',
      budget: 400000,
      spent: 400000,
      pending: 0,
      category: 'Арбитраж'
    }
  ];

  const totalBudget = mockCaseFinances.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = mockCaseFinances.reduce((sum, c) => sum + c.spent, 0);
  const totalPending = mockCaseFinances.reduce((sum, c) => sum + c.pending, 0);
  const totalAvailable = totalBudget - totalSpent - totalPending;

  const expensesByCategory = mockExpenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const statusConfig = {
    paid: { label: 'Оплачено', color: 'bg-green-500' },
    pending: { label: 'Ожидает', color: 'bg-yellow-500' },
    approved: { label: 'Согласовано', color: 'bg-blue-500' }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Icon name="Wallet" size={18} />
              Общий бюджет
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(totalBudget / 1000000).toFixed(1)}М ₽
            </div>
            <p className="text-xs text-purple-100 mt-1">Все активные дела</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
              <Icon name="TrendingDown" size={18} />
              Израсходовано
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {(totalSpent / 1000000).toFixed(1)}М ₽
            </div>
            <Progress value={(totalSpent / totalBudget) * 100} className="mt-2 h-2" />
            <p className="text-xs text-slate-500 mt-1">
              {Math.round((totalSpent / totalBudget) * 100)}% от бюджета
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
              <Icon name="Clock" size={18} />
              Ожидает оплаты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {(totalPending / 1000).toFixed(0)}К ₽
            </div>
            <p className="text-xs text-slate-500 mt-1">В процессе согласования</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
              <Icon name="DollarSign" size={18} />
              Остаток
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {(totalAvailable / 1000).toFixed(0)}К ₽
            </div>
            <p className="text-xs text-slate-500 mt-1">Доступно для использования</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cases" className="space-y-6">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="cases" className="gap-2">
            <Icon name="Briefcase" size={16} />
            По делам
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2">
            <Icon name="Receipt" size={16} />
            Расходы
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Icon name="PieChart" size={16} />
            По категориям
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cases" className="space-y-4">
          {mockCaseFinances.map((caseFinance, idx) => {
            const percentSpent = (caseFinance.spent / caseFinance.budget) * 100;
            const percentPending = (caseFinance.pending / caseFinance.budget) * 100;
            const available = caseFinance.budget - caseFinance.spent - caseFinance.pending;

            return (
              <Card key={caseFinance.caseId} className="border-none shadow-lg hover-scale animate-fade-in" style={{animationDelay: `${idx * 0.05}s`}}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 mb-1">
                        {caseFinance.caseTitle}
                      </h3>
                      <Badge variant="secondary">{caseFinance.category}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">
                        {caseFinance.budget.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-xs text-slate-500">Бюджет</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-xs text-red-600 font-medium mb-1">Израсходовано</div>
                      <div className="text-lg font-bold text-red-900">
                        {caseFinance.spent.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-xs text-red-600">{Math.round(percentSpent)}%</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="text-xs text-orange-600 font-medium mb-1">Ожидает</div>
                      <div className="text-lg font-bold text-orange-900">
                        {caseFinance.pending.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-xs text-orange-600">{Math.round(percentPending)}%</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-xs text-green-600 font-medium mb-1">Остаток</div>
                      <div className="text-lg font-bold text-green-900">
                        {available.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-xs text-green-600">
                        {Math.round((available / caseFinance.budget) * 100)}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-red-500 h-full transition-all duration-500"
                        style={{width: `${percentSpent}%`}}
                      />
                      <div 
                        className="bg-orange-500 h-full transition-all duration-500"
                        style={{width: `${percentPending}%`}}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="expenses">
          <Card className="border-none shadow-lg">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дело</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockExpenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{expense.caseTitle}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{expense.description}</TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(expense.date).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {expense.amount.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig[expense.status].color} text-white border-none`}>
                          {statusConfig[expense.status].label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(expensesByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount], idx) => {
                const percentage = (amount / totalSpent) * 100;
                
                return (
                  <Card 
                    key={category} 
                    className="border-none shadow-lg hover-scale animate-fade-in"
                    style={{animationDelay: `${idx * 0.1}s`}}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                          <Icon name="Tag" size={24} className="text-purple-600" />
                        </div>
                        <Badge variant="secondary" className="text-lg">
                          {Math.round(percentage)}%
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2">{category}</h3>
                      <div className="text-2xl font-bold text-slate-900 mb-2">
                        {amount.toLocaleString('ru-RU')} ₽
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-slate-500 mt-2">
                        {Math.round(percentage)}% от общих расходов
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancesView;
