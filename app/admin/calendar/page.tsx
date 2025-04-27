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
import toast from "react-hot-toast";

interface Event {
  id: number;
  eventName: string;
  eventDate: Date | null;
  isRecurring: boolean;
  eventType: EventType;
  description: string | null;
}

const AdminCalendarPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showEventForm, setShowEventForm] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      const fetchedEvents = await fetchEvents();
      console.log("EVENTS: ",fetchedEvents)
      if (fetchedEvents?.errorMsg){
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
    console.log("EVENT DATA: ",eventData)
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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Calendar</h1>
      <button
        onClick={handleAddEvent}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Add Event
      </button>
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        className="mt-4"
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
                event.eventDate &&
                event.eventDate.toDateString() === selectedDate.toDateString()
            )
            .map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between p-3 border rounded-md shadow-sm"
              >
                <div>
                  <span className="font-medium">{event.eventName}</span> -{" "}
                  {event.eventDate?.toLocaleTimeString()}
                </div>
                <div className="space-x-2">
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: initialEvent?.id || 0,
      eventName,
      eventDate,
      isRecurring,
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
            <option value={EventType.WEEKEND}>Weekend</option>
            <option value={EventType.WORKDAY_ADJUSTMENT}>
              Workday Adjustment
            </option>
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
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
