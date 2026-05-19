export type CalendarEvent = {
  id: number;
  title: string;
  type: 'lost' | 'found' | 'campaign';
  date: string;
  description?: string;
};