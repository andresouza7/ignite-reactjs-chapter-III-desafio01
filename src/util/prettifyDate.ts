import { format } from 'date-fns';
import enUS from 'date-fns/locale/pt-BR';

export const prettifyDate = (date: string): string =>
  format(new Date(date), 'MMM dd yyyy', {
    locale: enUS,
  });
