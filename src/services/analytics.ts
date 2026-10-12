export interface AnalyticsEvent {
  eventName: string;
  timestamp: string;
  properties?: Record<string, string | number | boolean | undefined>;
}

class BalootAnalytics {
  private events: AnalyticsEvent[] = [];

  public track(eventName: string, properties?: Record<string, string | number | boolean | undefined>) {
    const event: AnalyticsEvent = {
      eventName,
      timestamp: new Date().toISOString(),
      properties,
    };
    this.events.push(event);

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('baloot_analytics_events');
        const list: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];
        list.push(event);
        localStorage.setItem('baloot_analytics_events', JSON.stringify(list.slice(-100)));
      } catch {
        // Safe failover
      }
    }
  }

  public getEvents(): AnalyticsEvent[] {
    return this.events;
  }
}

export const analytics = new BalootAnalytics();
