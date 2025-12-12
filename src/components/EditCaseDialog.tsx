import { useState, useEffect } from 'react';
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

interface Case {
  id: number;
  internal_number: string;
  external_number?: string;
  title: string;
  description?: string;
  status: string;
  type: string;
  client_id?: number;
}

interface EditCaseDialogProps {
  caseData: Case;
  clients: Client[];
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const EditCaseDialog = ({ caseData, clients, onSuccess, trigger }: EditCaseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    type: '',
    status: '',
    external_number: '',
    description: ''
  });

  useEffect(() => {
    if (open) {
      setFormData({
        title: caseData.title || '',
        client_id: caseData.client_id?.toString() || '',
        type: caseData.type || '',
        status: caseData.status || 'открыто',
        external_number: caseData.external_number || '',
        description: caseData.description || ''
      });
    }
  }, [open, caseData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.type) {
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: caseData.id,
          title: formData.title,
          description: formData.description,
          status: formData.status,
          type: formData.type,
          client_id: formData.client_id ? parseInt(formData.client_id) : null,
          external_number: formData.external_number
        }),
      });

      if (response.ok) {
        toast({
          title: 'Дело обновлено',
          description: `Дело "${formData.title}" успешно обновлено`,
        });
        
        setOpen(false);
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Ошибка обновления дела');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить дело',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Icon name="Edit" size={16} />
            Редактировать
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Icon name="Edit" size={24} />
            Редактирование дела
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
              <Label htmlFor="internal_number">Внутренний номер</Label>
              <Input
                id="internal_number"
                value={caseData.internal_number}
                disabled
                className="bg-slate-100"
              />
              <p className="text-xs text-slate-500">Номер нельзя изменить</p>
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="status">Статус</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="открыто">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Открыто
                    </div>
                  </SelectItem>
                  <SelectItem value="в работе">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      В работе
                    </div>
                  </SelectItem>
                  <SelectItem value="на паузе">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      На паузе
                    </div>
                  </SelectItem>
                  <SelectItem value="завершено">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Завершено
                    </div>
                  </SelectItem>
                  <SelectItem value="архив">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                      Архив
                    </div>
                  </SelectItem>
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
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" size={18} />
                  Сохранить изменения
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCaseDialog;
