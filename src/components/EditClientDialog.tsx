import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

interface Client {
  id: number;
  type: 'физическое' | 'юридическое';
  full_name?: string;
  company_name?: string;
  contact_info: {
    phones?: string[];
    emails?: string[];
  };
  address?: string;
  passport_series_number?: string;
  date_of_birth?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  legal_address?: string;
}

interface EditClientDialogProps {
  client: Client;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const EditClientDialog = ({ client, onSuccess, trigger }: EditClientDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    phones: '',
    emails: '',
    address: '',
    passport_series_number: '',
    date_of_birth: '',
    inn: '',
    kpp: '',
    ogrn: '',
    legal_address: ''
  });

  useEffect(() => {
    if (open) {
      setFormData({
        full_name: client.full_name || '',
        company_name: client.company_name || '',
        phones: client.contact_info?.phones?.join(', ') || '',
        emails: client.contact_info?.emails?.join(', ') || '',
        address: client.address || '',
        passport_series_number: client.passport_series_number || '',
        date_of_birth: client.date_of_birth || '',
        inn: client.inn || '',
        kpp: client.kpp || '',
        ogrn: client.ogrn || '',
        legal_address: client.legal_address || ''
      });
    }
  }, [open, client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (client.type === 'физическое' && !formData.full_name) {
      toast({
        title: 'Ошибка',
        description: 'Укажите ФИО клиента',
        variant: 'destructive'
      });
      return;
    }

    if (client.type === 'юридическое' && !formData.company_name) {
      toast({
        title: 'Ошибка',
        description: 'Укажите название компании',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const phones = formData.phones.split(',').map(p => p.trim()).filter(p => p);
      const emails = formData.emails.split(',').map(e => e.trim()).filter(e => e);

      const requestBody = {
        id: client.id,
        type: client.type,
        contact_info: {
          phones,
          emails
        },
        address: formData.address || null,
        ...(client.type === 'физическое' ? {
          full_name: formData.full_name,
          passport_series_number: formData.passport_series_number || null,
          date_of_birth: formData.date_of_birth || null
        } : {
          company_name: formData.company_name,
          inn: formData.inn || null,
          kpp: formData.kpp || null,
          ogrn: formData.ogrn || null,
          legal_address: formData.legal_address || null
        })
      };

      const response = await fetch('https://functions.poehali.dev/e47a5187-bd9e-4e30-9749-5aaf274af1f5', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const clientName = client.type === 'физическое' ? formData.full_name : formData.company_name;
        toast({
          title: 'Клиент обновлен',
          description: `Данные клиента "${clientName}" успешно обновлены`,
        });
        
        setOpen(false);
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Ошибка обновления клиента');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить данные клиента',
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
            Редактирование клиента
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {client.type === 'физическое' ? (
              <>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="full_name" className="flex items-center gap-1">
                    ФИО <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    placeholder="Иванов Иван Иванович"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passport_series_number">Серия и номер паспорта</Label>
                  <Input
                    id="passport_series_number"
                    placeholder="1234 567890"
                    value={formData.passport_series_number}
                    onChange={(e) => setFormData({ ...formData, passport_series_number: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Дата рождения</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="company_name" className="flex items-center gap-1">
                    Название компании <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="company_name"
                    placeholder='ООО "Прогресс"'
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inn">ИНН</Label>
                  <Input
                    id="inn"
                    placeholder="1234567890"
                    value={formData.inn}
                    onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kpp">КПП</Label>
                  <Input
                    id="kpp"
                    placeholder="123456789"
                    value={formData.kpp}
                    onChange={(e) => setFormData({ ...formData, kpp: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="ogrn">ОГРН</Label>
                  <Input
                    id="ogrn"
                    placeholder="1234567890123"
                    value={formData.ogrn}
                    onChange={(e) => setFormData({ ...formData, ogrn: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="legal_address">Юридический адрес</Label>
                  <Input
                    id="legal_address"
                    placeholder="г. Москва, ул. Ленина, д. 1"
                    value={formData.legal_address}
                    onChange={(e) => setFormData({ ...formData, legal_address: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="phones">Телефоны</Label>
              <Input
                id="phones"
                placeholder="+7 (999) 123-45-67, +7 (999) 765-43-21"
                value={formData.phones}
                onChange={(e) => setFormData({ ...formData, phones: e.target.value })}
              />
              <p className="text-xs text-slate-500">Через запятую, если несколько</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emails">Email</Label>
              <Input
                id="emails"
                placeholder="example@mail.ru"
                value={formData.emails}
                onChange={(e) => setFormData({ ...formData, emails: e.target.value })}
              />
              <p className="text-xs text-slate-500">Через запятую, если несколько</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">
                {client.type === 'физическое' ? 'Адрес проживания' : 'Фактический адрес'}
              </Label>
              <Textarea
                id="address"
                placeholder="г. Москва, ул. Ленина, д. 1, кв. 1"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
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

export default EditClientDialog;
