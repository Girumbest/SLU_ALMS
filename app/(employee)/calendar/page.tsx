"use client";
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import css for react-calendar
import { EventType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  fetchEvents,
  saveEvent,
  deleteEvent,
} from "@/features/hr-admin/actions";
import "@/features/hr-admin/styles/Calendar.css";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

interface Event {
  id: number;
  eventName: string;
  eventDate: Date | null;
  isRecurring: boolean;
  recurringType?: string;
  eventEnd: Date | null;
  eventType: EventType;
  description: string | null;
}

const AdminCalendarPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showEventForm, setShowEventForm] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const {data: session, status: sessionStatus} = useSession();

  useEffect(() => {
    const loadEvents = async () => {
      const fetchedEvents = await fetchEvents();
      console.log("EVENTS: ", fetchedEvents);
      if (fetchedEvents?.errorMsg) {
        toast.error(fetchedEvents.errorMsg);
        return;
      }
      setEvents(fetchedEvents.events);
    };
    loadEvents();
  }, []);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleCloseForm = () => {
    setShowEventForm(false);
    setSelectedEvent(null);
  };

  const handleEventSubmit = async (eventData: Event) => {
    let response;
    if (selectedEvent?.id) {
      response = await saveEvent(eventData, selectedEvent.id);
    } else {
      response = await saveEvent(eventData);
    }
    if (response?.errorMsg) {
      toast.error(response.errorMsg);
      return;
    }
    toast.success("Event saved successfully");
    const fetchedEvents = await fetchEvents();
    setEvents(fetchedEvents.events);
    handleCloseForm();
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }
    const response = await deleteEvent(eventId);
    if (response?.errorMsg) toast.error(response.errorMsg);
    toast.success("Event deleted successfully");
    const fetchedEvents = await fetchEvents();
    setEvents(fetchedEvents.events);
  };

  // Function to check if a date has an event
  const hasEvent = (date: Date): boolean => {
    return events.some((event) => {
      // alert(event.recurringType)
      if (!event.eventDate) return false;

      // Check for single-day events
      if (!event.isRecurring) {
        return event.eventDate.toDateString() === date.toDateString();
      }

      // Check for recurring events
      if (event.isRecurring && event.eventEnd && event.recurringType) {
        const startDate = new Date(event.eventDate);
        const endDate = new Date(event.eventEnd);

        if (date < startDate || date > endDate) {
          return false; // Date is outside the event range
        }

        switch (event.recurringType) {
          case "daily":
            return true; // Every day within the range
          case "weekly":
            return date.getDay() === startDate.getDay(); // Same day of the week
          case "monthly":
            return date.getDate() === startDate.getDate(); // Same day of the month
          case "yearly":
            return (
              date.getMonth() === startDate.getMonth() &&
              date.getDate() === startDate.getDate()
            ); // Same day and month
          default:
            return false;
        }
      }
      return false;
    });
  };

  // Function to add a CSS class to dates with events
  const tileClassName = ({ date }: { date: Date }) => {
    if (hasEvent(date)) {
      return "has-event";
    }
    return null;
  };

  function isRecurringDate(
    startDate: Date,
    endDate: Date,
    recurrence: 'daily' | 'weekly' | 'monthly' | 'yearly',
    date: Date
  ): boolean {
    // Normalize all dates by removing time components
    const normStart = new Date(startDate);
    normStart.setHours(0, 0, 0, 0);
    
    const normEnd = new Date(endDate);
    normEnd.setHours(0, 0, 0, 0);
    
    const normDate = new Date(date);
    normDate.setHours(0, 0, 0, 0);
  
    // Check if date is within range
    if (normDate < normStart || normDate > normEnd) {
      return false;
    }
  
    // Check recurrence pattern
    switch (recurrence) {
      case 'daily':
        return true;
      case 'weekly':
        return normDate.getDay() === normStart.getDay();
      case 'monthly':
        return normDate.getDate() === normStart.getDate();
      case 'yearly':
        return (
          normDate.getMonth() === normStart.getMonth() &&
          normDate.getDate() === normStart.getDate()
        );
      default:
        throw new Error(`Invalid recurrence pattern: ${recurrence}`);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{session?.user?.role === "HRAdmin" ? "Admin Calendar" : "Calendar"}</h1>
      { session?.user?.role === "HRAdmin" &&
      <button
        onClick={handleAddEvent}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Add Event
      </button>
      }
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        className="mt-4"
        tileClassName={tileClassName} // Add the tileClassName prop here
      />

      {/* Display Events */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-700">
          Events for {selectedDate.toDateString()}
        </h2>
        <ul className="mt-4 space-y-2">
          {events
            .filter(
              (event) =>
                (event.eventDate &&
                  event.eventDate.toDateString() ===
                    selectedDate.toDateString()) ||
                isRecurringDate(
                  new Date(event.eventDate!),
                  new Date(event.eventEnd!),
                  event?.recurringType,
                  selectedDate
                )
            )
            .map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between p-3 border rounded-md shadow-sm"
              >
                <div className="relative flex-1 min-w-0 flex items-center">
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-medium">{event.eventName}</span>
                    <span>-</span>
                    <span>{event.eventDate?.toLocaleTimeString()}</span>
                    <span>-{event?.recurringType}</span>
                  </div>
                  <span className="truncate ml-2">
                    Description: {event.description}
                  </span>
                </div>
                {session?.user?.role === "HRAdmin" &&
                <div className="space-x-2 shrink-0">
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-1 px-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Delete
                  </button>
                </div>
                }
              </li>
            ))}
        </ul>
      </div>

      {/* Event Form */}
      {showEventForm && (
        <div className="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <EventForm
            onClose={handleCloseForm}
            onSubmit={handleEventSubmit}
            initialEvent={selectedEvent}
          />
        </div>
      )}
    </div>
  );
};

// Event Form Component
const EventForm: React.FC<{
  onClose: () => void;
  onSubmit: (eventData: Event) => void;
  initialEvent: Event | null;
}> = ({ onClose, onSubmit, initialEvent }) => {
  const [eventName, setEventName] = useState<string>(
    initialEvent?.eventName || ""
  );
  const [eventDate, setEventDate] = useState<Date | null>(
    initialEvent?.eventDate || new Date()
  );
  const [isRecurring, setIsRecurring] = useState<boolean>(
    initialEvent?.isRecurring || false
  );
  const [eventType, setEventType] = useState<EventType>(
    initialEvent?.eventType || EventType.HOLIDAY
  );
  const [description, setDescription] = useState<string | null>(
    initialEvent?.description || ""
  );
  const [recurringType, setRecurringType] = useState<string | undefined>(
    initialEvent?.recurringType || undefined
  );
  const [eventEnd, setEventEnd] = useState<Date | null>(
    initialEvent?.eventEnd || null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: initialEvent?.id || 0,
      eventName,
      eventDate,
      isRecurring,
      recurringType,
      eventEnd,
      eventType,
      description,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {initialEvent ? "Edit Event" : "Add Event"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="eventName"
            className="block text-sm font-medium text-gray-700"
          >
            Event Name:
          </label>
          <input
            type="text"
            id="eventName"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="eventDate"
            className="block text-sm font-medium text-gray-700"
          >
            Event Date:
          </label>
          <input
            type="datetime-local"
            id="eventDate"
            value={eventDate ? eventDate.toISOString().slice(0, 16) : ""}
            onChange={(e) => setEventDate(new Date(e.target.value))}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="isRecurring" className="flex items-center">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Is Recurring
            </span>
          </label>
          {isRecurring && (
            <div className="flex items-center space-x-2">
              <label
                htmlFor="recurringType"
                className="block text-sm font-medium text-gray-700"
              >
                Recurring Type:
              </label>
             <select
              id="recurringType"
              name="recurringType"
              value={recurringType || ""}
              onChange={(e) => {
                setRecurringType(e.target.value);
              }}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>

              <label
                htmlFor="eventEnd"
                className="block text-sm font-medium text-gray-700"
              >
                End Date:
              </label>
              <input
                value={eventEnd ? eventEnd.toISOString().slice(0, 10) : ""}
                onChange={(e) => setEventEnd(new Date(e.target.value))}
                name="eventEnd"
                type="date"
                id="eventEnd"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
        <div>
          <label
            htmlFor="eventType"
            className="block text-sm font-medium text-gray-700"
          >
            Event Type:
          </label>
          <select
            id="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value={EventType.HOLIDAY}>Holiday</option>
            <option value={EventType.OTHER}>Other</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description:
          </label>
          <textarea
            id="description"
            value={description || ""}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCalendarPage;
