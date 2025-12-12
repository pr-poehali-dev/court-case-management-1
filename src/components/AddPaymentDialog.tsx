import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from '@/components/ui/use-toast';

interface AddPaymentDialogProps {
  caseId: number;
  clientId?: number;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const AddPaymentDialog = ({ caseId, clientId, onSuccess, trigger }: AddPaymentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    purpose: '',
    document_number: '',
    status: 'ожидается' as 'ожидается' | 'получено' | 'возврат'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.date) {
      toast({
        title: 'Ошибка',
        description: 'Заполните сумму и дату оплаты',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/6e812ba0-fe2d-47bb-9441-603d0b7b3f55', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          client_id: clientId,
          amount: parseFloat(formData.amount),
          date: formData.date,
          purpose: formData.purpose,
          document_number: formData.document_number,
          status: formData.status
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      toast({
        title: 'Оплата добавлена',
        description: `Оплата на сумму ${formData.amount} ₽ успешно добавлена`,
      });
      
      setOpen(false);
      setFormData({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        purpose: '',
        document_number: '',
        status: 'ожидается'
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить оплату',
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
          <Button className="gap-2" size="sm">
            <Icon name="Plus" size={16} />
            Добавить оплату
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Icon name="DollarSign" size={24} />
            Добавление оплаты
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-1">
                Сумма <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="50000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-1">
                Дата <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Статус оплаты</Label>
            <Select value={formData.status} onValueChange={(value: 'ожидается' | 'получено' | 'возврат') => setFormData({ ...formData, status: value })}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ожидается">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    Ожидается
                  </div>
                </SelectItem>
                <SelectItem value="получено">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Получено
                  </div>
                </SelectItem>
                <SelectItem value="возврат">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Возврат
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_number">Номер документа</Label>
            <Input
              id="document_number"
              placeholder="Например: ПП-2024-001"
              value={formData.document_number}
              onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Назначение платежа</Label>
            <Textarea
              id="purpose"
              placeholder="Например: Оплата за представительство в суде"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Отмена
            </Button>
            <Button type="submit" className="gap-2" disabled={loading}>
              {loading ? (
                <>
                  <Icon name="Loader2" size={18} className="animate-spin" />
                  Добавление...
                </>
              ) : (
                <>
                  <Icon name="Save" size={18} />
                  Добавить оплату
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPaymentDialog;