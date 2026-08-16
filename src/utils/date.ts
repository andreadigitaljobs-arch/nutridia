import { format, parseISO, startOfDay, endOfDay, isToday, isYesterday, addDays, subDays, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr: string = 'dd/MM/yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: es });
};

export const formatTime = (time: string): string => {
  return time.substring(0, 5);
};

export const getToday = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getStartOfDay = (date: string | Date): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return startOfDay(dateObj);
};

export const getEndOfDay = (date: string | Date): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return endOfDay(dateObj);
};

export const isDateToday = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isToday(dateObj);
};

export const isDateYesterday = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isYesterday(dateObj);
};

export const addDaysToDate = (date: string | Date, days: number): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(addDays(dateObj, days), 'yyyy-MM-dd');
};

export const subtractDaysFromDate = (date: string | Date, days: number): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(subDays(dateObj, days), 'yyyy-MM-dd');
};

export const daysBetween = (date1: string | Date, date2: string | Date): number => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInDays(d1, d2);
};

export const getWeekRange = (date: string | Date): { start: Date; end: Date } => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return {
    start: startOfWeek(dateObj, { weekStartsOn: 1 }),
    end: endOfWeek(dateObj, { weekStartsOn: 1 }),
  };
};

export const getDaysInRange = (start: string | Date, end: string | Date): Date[] => {
  const startObj = typeof start === 'string' ? parseISO(start) : start;
  const endObj = typeof end === 'string' ? parseISO(end) : end;
  return eachDayOfInterval({ start: startObj, end: endObj });
};

export const formatRelativeDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return 'Hoy';
  }
  
  if (isYesterday(dateObj)) {
    return 'Ayer';
  }
  
  return formatDate(dateObj, 'dd MMM');
};

export const formatDateTime = (date: string | Date, time: string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return `${format(dateObj, 'dd MMM')} ${formatTime(time)}`;
};
