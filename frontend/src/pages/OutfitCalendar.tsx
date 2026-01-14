import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Layout from '../components/Layout';
import { calendarService, OutfitEvent } from '../services/calendarService';
import { getWeatherForecast, ForecastDay } from '../services/weatherService';
import toast from 'react-hot-toast';
import {
  XMarkIcon,
  CheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

interface CalendarEvent extends Event {
  resource: OutfitEvent;
}

const OutfitCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<OutfitEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadEvents();
    // Add custom styles for calendar
    const style = document.createElement('style');
    style.innerHTML = `
      /* Calendar text colors - all white */
      .rbc-calendar {
        color: white !important;
      }
      
      .rbc-header {
        color: white !important;
        font-weight: 600;
        padding: 12px 8px;
        background: rgba(255, 255, 255, 0.05);
        border-bottom: 2px solid rgba(255, 255, 255, 0.1) !important;
      }
      
      .rbc-month-view {
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        background: rgba(0, 0, 0, 0.3);
      }
      
      .rbc-day-bg {
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
      }
      
      .rbc-date-cell {
        color: white !important;
        padding: 8px;
      }
      
      .rbc-off-range {
        color: rgba(255, 255, 255, 0.3) !important;
      }
      
      .rbc-off-range-bg {
        background: rgba(0, 0, 0, 0.2) !important;
      }
      
      /* Today's date - bright blue/purple gradient */
      .rbc-today {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3)) !important;
        border: 2px solid #3b82f6 !important;
      }
      
      .rbc-now .rbc-button-link {
        color: #60a5fa !important;
        font-weight: bold;
      }
      
      /* Event styling */
      .rbc-event {
        background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
        border: none !important;
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 12px;
        color: white !important;
      }
      
      .rbc-event:hover {
        background: linear-gradient(135deg, #2563eb, #7c3aed) !important;
      }
      
      .rbc-event-label {
        color: white !important;
      }
      
      .rbc-event-content {
        color: white !important;
      }
      
      /* Toolbar styling */
      .rbc-toolbar {
        color: white !important;
        padding: 16px;
        margin-bottom: 16px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
      }
      
      .rbc-toolbar button {
        color: white !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        background: rgba(255, 255, 255, 0.1) !important;
        padding: 8px 16px;
        border-radius: 6px;
        transition: all 0.2s;
      }
      
      .rbc-toolbar button:hover {
        background: rgba(255, 255, 255, 0.2) !important;
        border-color: rgba(255, 255, 255, 0.4) !important;
      }
      
      .rbc-toolbar button.rbc-active {
        background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
        border-color: #3b82f6 !important;
      }
      
      .rbc-toolbar-label {
        color: white !important;
        font-weight: 600;
        font-size: 18px;
      }
      
      /* Selected date styling */
      .rbc-selected {
        background: rgba(139, 92, 246, 0.3) !important;
      }
      
      /* Month row */
      .rbc-month-row {
        border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
      }
      
      /* Show more link */
      .rbc-show-more {
        color: #60a5fa !important;
        font-weight: 500;
      }
      
      .rbc-show-more:hover {
        color: #3b82f6 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const loadEvents = () => {
    const outfits = calendarService.getScheduledOutfits();
    const calendarEvents: CalendarEvent[] = outfits.map((outfit) => ({
      title: outfit.title,
      start: new Date(outfit.date),
      end: new Date(outfit.date),
      resource: outfit
    }));
    setEvents(calendarEvents);
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    const existing = calendarService.getOutfitForDate(start);
    setSelectedEvent(existing);
    setShowModal(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event.resource);
    setSelectedDate(new Date(event.resource.date));
    setShowModal(true);
  };

  const handleSaveOutfit = () => {
    if (!selectedDate) return;

    const outfit: OutfitEvent = {
      id: selectedEvent?.id || `outfit-${Date.now()}`,
      date: selectedDate,
      title: selectedEvent?.title || 'Planned Outfit',
      occasion: selectedEvent?.occasion || '',
      notes: selectedEvent?.notes || '',
      worn: selectedEvent?.worn || false,
      tags: selectedEvent?.tags || []
    };

    if (selectedEvent?.id) {
      calendarService.updateOutfit(selectedEvent.id, outfit);
      toast.success('Outfit updated!');
    } else {
      calendarService.scheduleOutfit(outfit);
      toast.success('Outfit scheduled!');
    }

    loadEvents();
    setShowModal(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  const handleDeleteOutfit = () => {
    if (selectedEvent?.id) {
      calendarService.deleteOutfit(selectedEvent.id);
      toast.success('Outfit deleted!');
      loadEvents();
      setShowModal(false);
      setSelectedEvent(null);
    }
  };

  const handleAutoSchedule = async () => {
    setIsLoading(true);
    try {
      const forecastData = await getWeatherForecast(7);
      let scheduled = 0;

      forecastData.forEach((day) => {
        const existing = calendarService.getOutfitForDate(new Date(day.date));
        if (!existing) {
          const outfit: OutfitEvent = {
            id: `auto-${Date.now()}-${scheduled}`,
            date: new Date(day.date),
            title: `${day.condition} Day Outfit`,
            occasion: 'Daily wear',
            weather: {
              temp: day.temp,
              condition: day.condition
            },
            notes: day.suggestions.tips.join(' '),
            worn: false,
            tags: day.suggestions.clothing.slice(0, 3)
          };
          calendarService.scheduleOutfit(outfit);
          scheduled++;
        }
      });

      if (scheduled > 0) {
        toast.success(`Auto-scheduled ${scheduled} outfits based on weather!`);
        loadEvents();
      } else {
        toast('All days already have outfits planned!', { icon: '📅' });
      }
    } catch (error) {
      toast.error('Failed to auto-schedule outfits');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = calendarService.getStatistics();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Outfit Calendar
            </h1>
            <p className="text-gray-300 mt-2">Plan your outfits and never repeat too soon</p>
          </div>
          <button
            onClick={handleAutoSchedule}
            disabled={isLoading}
            className="btn-primary flex items-center space-x-2"
          >
            <SparklesIcon className="h-5 w-5" />
            <span>{isLoading ? 'Scheduling...' : 'Auto-Schedule Week'}</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
            <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
            <div className="text-sm text-gray-300">Total Planned</div>
          </div>
          <div className="card text-center bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <div className="text-2xl font-bold text-green-400">{stats.worn}</div>
            <div className="text-sm text-gray-300">Worn</div>
          </div>
          <div className="card text-center bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700">
            <div className="text-2xl font-bold text-purple-400">{stats.upcoming}</div>
            <div className="text-sm text-gray-300">Upcoming</div>
          </div>
          <div className="card text-center bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700">
            <div className="text-2xl font-bold text-gray-400">{stats.past}</div>
            <div className="text-sm text-gray-300">Past</div>
          </div>
        </div>

        {/* Calendar */}
        <div className="card bg-black/40 border-gray-700">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            views={['month', 'week', 'day']}
            defaultView="month"
          />
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedEvent ? 'Edit Outfit' : 'Plan Outfit'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="text"
                      value={selectedDate?.toLocaleDateString() || ''}
                      disabled
                      className="input-field bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Outfit Title
                    </label>
                    <input
                      type="text"
                      value={selectedEvent?.title || ''}
                      onChange={(e) =>
                        setSelectedEvent((prev) => ({
                          ...prev!,
                          title: e.target.value
                        }))
                      }
                      className="input-field"
                      placeholder="e.g., Casual Friday, Date Night"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occasion
                    </label>
                    <input
                      type="text"
                      value={selectedEvent?.occasion || ''}
                      onChange={(e) =>
                        setSelectedEvent((prev) => ({
                          ...prev!,
                          occasion: e.target.value
                        }))
                      }
                      className="input-field"
                      placeholder="e.g., Work, Party, Casual"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={selectedEvent?.notes || ''}
                      onChange={(e) =>
                        setSelectedEvent((prev) => ({
                          ...prev!,
                          notes: e.target.value
                        }))
                      }
                      className="input-field"
                      rows={3}
                      placeholder="Add any notes about this outfit..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedEvent?.worn || false}
                      onChange={(e) =>
                        setSelectedEvent((prev) => ({
                          ...prev!,
                          worn: e.target.checked
                        }))
                      }
                      className="h-4 w-4 text-primary-600 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Mark as worn
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button onClick={handleSaveOutfit} className="btn-primary flex-1">
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Save
                  </button>
                  {selectedEvent?.id && (
                    <button
                      onClick={handleDeleteOutfit}
                      className="btn-outline text-red-600 border-red-600 hover:bg-purple-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OutfitCalendar;
