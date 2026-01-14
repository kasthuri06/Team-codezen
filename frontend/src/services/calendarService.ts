export interface OutfitEvent {
  id: string;
  date: Date;
  title: string;
  outfitId?: string;
  occasion?: string;
  weather?: {
    temp: number;
    condition: string;
  };
  images?: {
    top?: string;
    bottom?: string;
    shoes?: string;
    result?: string;
  };
  notes?: string;
  worn: boolean;
  tags?: string[];
}

const STORAGE_KEY = 'sitfit-outfit-calendar';

export const calendarService = {
  // Get all scheduled outfits
  getScheduledOutfits: (): OutfitEvent[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const events = JSON.parse(data);
      // Convert date strings back to Date objects
      return events.map((event: any) => ({
        ...event,
        date: new Date(event.date)
      }));
    } catch (error) {
      console.error('Error loading scheduled outfits:', error);
      return [];
    }
  },

  // Schedule an outfit for a specific date
  scheduleOutfit: (outfit: OutfitEvent): void => {
    try {
      const events = calendarService.getScheduledOutfits();
      events.push(outfit);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Error scheduling outfit:', error);
    }
  },

  // Update scheduled outfit
  updateOutfit: (id: string, updates: Partial<OutfitEvent>): void => {
    try {
      const events = calendarService.getScheduledOutfits();
      const index = events.findIndex((e) => e.id === id);
      if (index !== -1) {
        events[index] = { ...events[index], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      }
    } catch (error) {
      console.error('Error updating outfit:', error);
    }
  },

  // Delete scheduled outfit
  deleteOutfit: (id: string): void => {
    try {
      const events = calendarService.getScheduledOutfits().filter((e) => e.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Error deleting outfit:', error);
    }
  },

  // Get outfit for specific date
  getOutfitForDate: (date: Date): OutfitEvent | null => {
    try {
      const events = calendarService.getScheduledOutfits();
      return (
        events.find(
          (e) => new Date(e.date).toDateString() === date.toDateString()
        ) || null
      );
    } catch (error) {
      console.error('Error getting outfit for date:', error);
      return null;
    }
  },

  // Check if outfit was worn recently (within X days)
  wasWornRecently: (outfitId: string, days: number = 14): boolean => {
    try {
      const events = calendarService.getScheduledOutfits();
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - days);

      return events.some(
        (e) =>
          e.outfitId === outfitId &&
          e.worn &&
          new Date(e.date) > recentDate
      );
    } catch (error) {
      console.error('Error checking recent wear:', error);
      return false;
    }
  },

  // Get upcoming outfits (next N days)
  getUpcomingOutfits: (days: number = 7): OutfitEvent[] => {
    try {
      const events = calendarService.getScheduledOutfits();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + days);

      return events
        .filter((e) => {
          const eventDate = new Date(e.date);
          return eventDate >= today && eventDate <= futureDate;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error('Error getting upcoming outfits:', error);
      return [];
    }
  },

  // Get outfit statistics
  getStatistics: () => {
    try {
      const events = calendarService.getScheduledOutfits();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return {
        total: events.length,
        worn: events.filter((e) => e.worn).length,
        upcoming: events.filter((e) => new Date(e.date) >= today).length,
        past: events.filter((e) => new Date(e.date) < today).length
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { total: 0, worn: 0, upcoming: 0, past: 0 };
    }
  }
};
