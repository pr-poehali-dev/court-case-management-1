import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

interface Client {
  id: number;
  type: 'физическое' | 'юридическое';
  full_name?: string;
  company_name?: string;
}

interface NewCaseDialogProps {
  clients: Client[];
  onSuccess?: () => void;
}

const NewCaseDialog = ({ clients, onSuccess }: NewCaseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    type: '',
    status: 'открыто',
    internal_number: '',
    external_number: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.type || !formData.internal_number) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/196ef5ca-dd1d-4d1f-ae2e-e95a90b5b8e1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          client_id: formData.client_id ? parseInt(formData.client_id) : null
        }),
      });

      if (response.ok) {
        toast({
          title: 'Дело создано',
          description: `Дело "${formData.title}" успешно добавлено в систему`,
        });
        
        setOpen(false);
        setFormData({
          title: '',
          client_id: '',
          type: '',
          status: 'открыто',
          internal_number: '',
          external_number: '',
          description: ''
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Ошибка создания дела');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать дело',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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
              <Label htmlFor="internal_number" className="flex items-center gap-1">
                Внутренний номер <span className="text-red-500">*</span>
              </Label>
              <Input
                id="internal_number"
                placeholder="Например: ДЛ-2024-001"
                value={formData.internal_number}
                onChange={(e) => setFormData({ ...formData, internal_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="external_number">Номер дела в суде</Label>
              <Input
                id="external_number"
                placeholder="Например: А40-12345/24"
                value={formData.external_number}
                onChange={(e) => setFormData({ ...formData, external_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Клиент</Label>
              <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
                <SelectTrigger id="client_id">
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Icon name={client.type === 'юридическое' ? 'Building2' : 'User'} size={14} />
                        {client.type === 'юридическое' ? client.company_name : client.full_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="flex items-center gap-1">
                Тип дела <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Гражданское">Гражданское</SelectItem>
                  <SelectItem value="Арбитраж">Арбитраж</SelectItem>
                  <SelectItem value="Уголовное">Уголовное</SelectItem>
                  <SelectItem value="Претензионная работа">Претензионная работа</SelectItem>
                  <SelectItem value="Медиация">Медиация</SelectItem>
                  <SelectItem value="Консультация">Консультация</SelectItem>
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
                  <SelectItem value="открыто">Открыто</SelectItem>
                  <SelectItem value="в работе">В работе</SelectItem>
                  <SelectItem value="на паузе">На паузе</SelectItem>
                  <SelectItem value="завершено">Завершено</SelectItem>
                  <SelectItem value="архив">Архив</SelectItem>
                </SelectContent>
              </Select>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Отмена
            </Button>
            <Button type="submit" className="gap-2" disabled={loading}>
              {loading ? (
                <>
                  <Icon name="Loader2" size={18} className="animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <Icon name="Save" size={18} />
                  Создать дело
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewCaseDialog;
