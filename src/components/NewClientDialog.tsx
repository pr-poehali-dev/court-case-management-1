import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

interface NewClientDialogProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const NewClientDialog = ({ onSuccess, trigger }: NewClientDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientType, setClientType] = useState<'физическое' | 'юридическое'>('физическое');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (clientType === 'физическое' && !formData.full_name) {
      toast({
        title: 'Ошибка',
        description: 'Укажите ФИО клиента',
        variant: 'destructive'
      });
      return;
    }

    if (clientType === 'юридическое' && !formData.company_name) {
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
        type: clientType,
        contact_info: {
          phones,
          emails
        },
        address: formData.address || null,
        ...(clientType === 'физическое' ? {
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const clientName = clientType === 'физическое' ? formData.full_name : formData.company_name;
        toast({
          title: 'Клиент создан',
          description: `Клиент "${clientName}" успешно добавлен в базу`,
        });
        
        setOpen(false);
        setFormData({
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
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Ошибка создания клиента');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать клиента',
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
          <Button className="gap-2">
            <Icon name="UserPlus" size={18} />
            Новый клиент
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Icon name="UserPlus" size={24} />
            Добавление нового клиента
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              Тип клиента <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={clientType === 'физическое' ? 'default' : 'outline'}
                className="gap-2"
                onClick={() => setClientType('физическое')}
              >
                <Icon name="User" size={18} />
                Физическое лицо
              </Button>
              <Button
                type="button"
                variant={clientType === 'юридическое' ? 'default' : 'outline'}
                className="gap-2"
                onClick={() => setClientType('юридическое')}
              >
                <Icon name="Building2" size={18} />
                Юридическое лицо
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientType === 'физическое' ? (
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
                {clientType === 'физическое' ? 'Адрес проживания' : 'Фактический адрес'}
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
                  Создание...
                </>
              ) : (
                <>
                  <Icon name="Save" size={18} />
                  Создать клиента
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewClientDialog;
