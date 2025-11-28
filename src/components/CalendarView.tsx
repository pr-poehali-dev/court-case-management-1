import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Hearing {
  id: string;
  caseTitle: string;
  date: string;
  time: string;
  court: string;
  priority: 'high' | 'medium' | 'low';
}

const CalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const mockHearings: Hearing[] = [
    {
      id: '1',
      caseTitle: 'Иск о взыскании задолженности',
      date: '2025-12-05',
      time: '10:00',
      court: 'Арбитражный суд г. Москвы',
      priority: 'high'
    },
    {
      id: '2',
      caseTitle: 'Защита деловой репутации',
      date: '2025-12-08',
      time: '14:30',
      court: 'Тверской районный суд',
      priority: 'high'
    },
    {
      id: '3',
      caseTitle: 'Трудовой спор о восстановлении',
      date: '2025-12-12',
      time: '11:00',
      court: 'Пресненский районный суд',
      priority: 'medium'
    },
    {
      id: '4',
      caseTitle: 'Оспаривание договора',
      date: '2025-12-15',
      time: '15:00',
      court: 'Арбитражный суд г. Москвы',
      priority: 'low'
    }
  ];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getHearingsForDate = (date: Date) => {
    return mockHearings.filter(h => isSameDay(new Date(h.date), date));
  };

  const selectedHearings = selectedDate ? getHearingsForDate(selectedDate) : [];

  const priorityConfig = {
    high: { color: 'bg-red-500', label: 'Высокий' },
    medium: { color: 'bg-orange-500', label: 'Средний' },
    low: { color: 'bg-blue-500', label: 'Низкий' }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-none shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Calendar" size={24} />
              {format(currentMonth, 'LLLL yyyy', { locale: ru })}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <Icon name="ChevronLeft" size={20} />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <Icon name="ChevronRight" size={20} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-slate-600 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1 }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            
            {daysInMonth.map((day) => {
              const hearings = getHearingsForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative p-2 rounded-lg aspect-square flex flex-col items-center justify-center
                    transition-all hover:bg-slate-100 hover-scale
                    ${isSelected ? 'bg-purple-100 border-2 border-purple-500' : ''}
                    ${isToday ? 'font-bold text-purple-600' : 'text-slate-700'}
                  `}
                >
                  <span className="text-sm">{format(day, 'd')}</span>
                  {hearings.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {hearings.slice(0, 3).map((h, idx) => (
                        <div
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${priorityConfig[h.priority].color}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Clock" size={20} />
            {selectedDate ? format(selectedDate, 'd MMMM', { locale: ru }) : 'Выберите дату'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedHearings.length > 0 ? (
            <div className="space-y-4">
              {selectedHearings.map((hearing) => (
                <div
                  key={hearing.id}
                  className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg space-y-3 hover-scale"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-slate-900 text-sm leading-tight">
                      {hearing.caseTitle}
                    </h4>
                    <Badge className={`${priorityConfig[hearing.priority].color} text-white border-none text-xs`}>
                      {priorityConfig[hearing.priority].label}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Icon name="Clock" size={14} />
                      <span>{hearing.time}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-600">
                      <Icon name="MapPin" size={14} className="mt-0.5 flex-shrink-0" />
                      <span className="leading-tight">{hearing.court}</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
                    <Icon name="ExternalLink" size={14} />
                    Открыть дело
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Icon name="Calendar" size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm">
                {selectedDate 
                  ? 'Нет заседаний на эту дату' 
                  : 'Выберите дату в календаре'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-3 border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Bell" size={20} />
            Ближайшие заседания
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockHearings.slice(0, 4).map((hearing, idx) => (
              <div
                key={hearing.id}
                className="p-4 border-l-4 bg-slate-50 rounded-lg hover-scale animate-fade-in"
                style={{ 
                  borderLeftColor: priorityConfig[hearing.priority].color.replace('bg-', '#'),
                  animationDelay: `${idx * 0.1}s`
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-xs font-semibold text-slate-500">
                    {format(new Date(hearing.date), 'd MMM', { locale: ru })}
                  </div>
                  <Badge variant="secondary" className="text-xs">{hearing.time}</Badge>
                </div>
                <h4 className="font-semibold text-sm text-slate-900 mb-2 leading-tight">
                  {hearing.caseTitle}
                </h4>
                <p className="text-xs text-slate-600 leading-tight">{hearing.court}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
