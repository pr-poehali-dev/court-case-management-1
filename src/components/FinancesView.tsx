import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Payment {
  id: number;
  case_id: number;
  case_title?: string;
  client_id?: number;
  amount: number;
  date: string;
  purpose?: string;
  document_number?: string;
  status: 'ожидается' | 'получено' | 'возврат';
  created_at: string;
}

interface Expense {
  id: number;
  case_id: number;
  case_title?: string;
  type: string;
  amount: number;
  date: string;
  description?: string;
  status: 'планируемые' | 'фактические' | 'возмещенные';
  created_at: string;
}

const FinancesView = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinances();
  }, []);

  const fetchFinances = async () => {
    try {
      const [paymentsRes, expensesRes] = await Promise.all([
        fetch('https://functions.poehali.dev/6e812ba0-fe2d-47bb-9441-603d0b7b3f55'),
        fetch('https://functions.poehali.dev/a3588aea-53fd-4dbf-9ad0-66202b1c5385')
      ]);

      const paymentsData = await paymentsRes.json();
      const expensesData = await expensesRes.json();

      setPayments(paymentsData);
      setExpenses(expensesData);
    } catch (error) {
      console.error('Ошибка загрузки финансов:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPayments = payments
    .filter(p => p.status === 'получено')
    .reduce((sum, p) => sum + Number(p.amount), 0);
  
  const totalExpenses = expenses
    .filter(e => e.status === 'фактические')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const pendingPayments = payments
    .filter(p => p.status === 'ожидается')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const balance = totalPayments - totalExpenses;

  const statusConfig = {
    'получено': { label: 'Получено', color: 'bg-green-500' },
    'ожидается': { label: 'Ожидается', color: 'bg-yellow-500' },
    'возврат': { label: 'Возврат', color: 'bg-red-500' }
  };

  const expenseStatusConfig = {
    'планируемые': { label: 'Планируемые', color: 'bg-blue-500' },
    'фактические': { label: 'Фактические', color: 'bg-purple-500' },
    'возмещенные': { label: 'Возмещенные', color: 'bg-green-500' }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={32} className="animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Icon name="TrendingUp" size={18} />
              Поступления
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalPayments.toLocaleString('ru-RU')} ₽
            </div>
            <p className="text-xs text-green-100 mt-1">Получено от клиентов</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Icon name="TrendingDown" size={18} />
              Расходы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalExpenses.toLocaleString('ru-RU')} ₽
            </div>
            <p className="text-xs text-red-100 mt-1">Фактические издержки</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
              <Icon name="Clock" size={18} />
              Ожидается
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {pendingPayments.toLocaleString('ru-RU')} ₽
            </div>
            <p className="text-xs text-slate-500 mt-1">Ожидается оплата</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
              <Icon name="Wallet" size={18} />
              Баланс
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balance.toLocaleString('ru-RU')} ₽
            </div>
            <p className="text-xs text-slate-500 mt-1">Доход минус расходы</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="payments" className="gap-2">
            <Icon name="DollarSign" size={16} />
            Оплаты
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2">
            <Icon name="Receipt" size={16} />
            Издержки
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="DollarSign" size={20} />
                История оплат от клиентов
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Дело</TableHead>
                      <TableHead>Назначение</TableHead>
                      <TableHead>Документ</TableHead>
                      <TableHead className="text-right">Сумма</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(payment.date).toLocaleDateString('ru-RU')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {payment.case_title || `Дело #${payment.case_id}`}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {payment.purpose || '-'}
                        </TableCell>
                        <TableCell>
                          {payment.document_number || '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {Number(payment.amount).toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig[payment.status]?.color || 'bg-gray-500'}>
                            {statusConfig[payment.status]?.label || payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Icon name="Inbox" size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Нет записей об оплатах</p>
                  <p className="text-sm mt-1">Добавьте оплату в карточке дела</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Receipt" size={20} />
                Издержки по делам
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Дело</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Описание</TableHead>
                      <TableHead className="text-right">Сумма</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(expense.date).toLocaleDateString('ru-RU')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {expense.case_title || `Дело #${expense.case_id}`}
                        </TableCell>
                        <TableCell>{expense.type}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {expense.description || '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {Number(expense.amount).toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell>
                          <Badge className={expenseStatusConfig[expense.status]?.color || 'bg-gray-500'}>
                            {expenseStatusConfig[expense.status]?.label || expense.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Icon name="Inbox" size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Нет записей об издержках</p>
                  <p className="text-sm mt-1">Издержки появятся при работе с делами</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancesView;