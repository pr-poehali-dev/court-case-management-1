import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

interface NewCaseDialogProps {
  clients: Array<{ id: string; name: string; type: string }>;
}

const NewCaseDialog = ({ clients }: NewCaseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    category: '',
    priority: 'medium',
    status: 'pending',
    budget: '',
    nextHearing: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.client || !formData.category) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Дело создано',
      description: `Дело "${formData.title}" успешно добавлено в систему`,
    });
    
    setOpen(false);
    setFormData({
      title: '',
      client: '',
      category: '',
      priority: 'medium',
      status: 'pending',
      budget: '',
      nextHearing: '',
      description: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
          <Icon name="Plus" size={18} />
          Новое дело
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Icon name="FileText" size={24} />
            Создание нового дела
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title" className="flex items-center gap-1">
                Название дела <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Например: Иск о взыскании задолженности"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client" className="flex items-center gap-1">
                Клиент <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.client} onValueChange={(value) => setFormData({ ...formData, client: value })}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <Icon name={client.type === 'corporate' ? 'Building2' : 'User'} size={14} />
                        {client.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-1">
                Категория <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arbitrage">Арбитраж</SelectItem>
                  <SelectItem value="civil">Гражданские дела</SelectItem>
                  <SelectItem value="labor">Трудовые споры</SelectItem>
                  <SelectItem value="corporate">Корпоративное право</SelectItem>
                  <SelectItem value="administrative">Административные дела</SelectItem>
                  <SelectItem value="criminal">Уголовные дела</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Приоритет</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Высокий
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      Средний
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Низкий
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Ожидание</SelectItem>
                  <SelectItem value="active">В работе</SelectItem>
                  <SelectItem value="completed">Завершено</SelectItem>
                  <SelectItem value="archived">Архив</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Бюджет (₽)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="500000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextHearing">Ближайшее заседание</Label>
              <Input
                id="nextHearing"
                type="date"
                value={formData.nextHearing}
                onChange={(e) => setFormData({ ...formData, nextHearing: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                placeholder="Краткое описание дела, ключевые детали..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" className="gap-2">
              <Icon name="Save" size={18} />
              Создать дело
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewCaseDialog;
