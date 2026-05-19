import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { CalendarEvent } from '../model/CalendarEvent';

export const useCalendarViewModel = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = async () => {
    try {
      setLoading(true);

      const response = await api.get('/calendar/events');

      setEvents(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return {
    events,
    loading,
    loadEvents,
  };
};