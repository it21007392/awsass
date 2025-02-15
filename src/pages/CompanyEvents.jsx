import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Import Firestore instance
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore"; // Firestore functions

// EventService - Interacts with Firebase Firestore
const EventService = {
    getEvents: async () => {
        try {
            const eventsRef = collection(db, "events");
            const snapshot = await getDocs(eventsRef);
            const eventList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return eventList;
        } catch (error) {
            console.error("Error fetching events:", error);
            throw error;
        }
    },
    addEvent: async (event) => {
        try {
            const eventsRef = collection(db, "events");
            await addDoc(eventsRef, event);
        } catch (error) {
            console.error("Error adding event:", error);
            throw error;
        }
    },
    deleteEvent: async (id) => {
        try {
            const eventDoc = doc(db, "events", id);
            await deleteDoc(eventDoc);
        } catch (error) {
            console.error("Error deleting event:", error);
            throw error;
        }
    },
    updateEvent: async (id, updatedEvent) => {
        try {
            const eventDoc = doc(db, "events", id);
            await updateDoc(eventDoc, updatedEvent);
        } catch (error) {
            console.error("Error updating event:", error);
            throw error;
        }
    },
};

// EventForm Component
const EventForm = ({ onEventAdded }) => {
    const [form, setForm] = useState({
        eventName: "",
        eventDate: "",
        description: "",
        isHoliday: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await EventService.addEvent(form);
        setForm({ eventName: "", eventDate: "", description: "", isHoliday: false });
        onEventAdded(); // Trigger a refresh of the event list
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow-lg mb-6 max-w-4xl mx-auto"
        >
            <h3 className="text-xl font-bold text-gray-700 mb-4">Add Event</h3>
            <input
                name="eventName"
                placeholder="Event Name"
                value={form.eventName}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
           <div className="relative mb-6">
    <input
        id="eventDate"
        type="date"
        name="eventDate"
        value={form.eventDate}
        onChange={handleChange}
        required
        className="w-full p-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-transparent"
        placeholder=" "
    />
    <label
        htmlFor="eventDate"
        className={`absolute left-3 top-3 text-gray-400 text-sm transition-all ${
            form.eventDate ? "-translate-y-3 scale-75" : ""
        }`}
    >
        Event Date
    </label>
</div>

            <textarea
                name="description"
                placeholder="Event Description"
                value={form.description}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="block mb-2 font-semibold">Is it a Holiday?</label>
            <input
                type="checkbox"
                name="isHoliday"
                checked={form.isHoliday}
                onChange={handleChange}
                className="mb-4"
            />
            <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700"
            >
                Add Event
            </button>
        </form>
    );
};

// EventList Component
const EventList = ({ events, onDeleteEvent, onToggleHoliday }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
        <h3 className="text-xl font-bold text-gray-700 mb-4">Event Records</h3>
        <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow-md">
                <thead>
                    <tr className="bg-blue-600 text-white">
                        <th className="p-3 text-left font-semibold">Event Name</th>
                        <th className="p-3 text-left font-semibold">Event Date</th>
                        <th className="p-3 text-left font-semibold">Description</th>
                        <th className="p-3 text-left font-semibold">Holiday</th>
                        <th className="p-3 text-center font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((event) => (
                        <tr
                            key={event.id}
                            className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200"
                        >
                            <td className="p-3 border-b border-gray-200">{event.eventName}</td>
                            <td className="p-3 border-b border-gray-200">
                                {new Date(event.eventDate).toLocaleDateString()}
                            </td>
                            <td className="p-3 border-b border-gray-200">{event.description}</td>
                            <td className="p-3 border-b border-gray-200">{event.isHoliday ? "Yes" : "No"}</td>
                            <td className="p-3 border-b border-gray-200 text-center">
                                <button
                                    onClick={() => onToggleHoliday(event.id, event)}
                                    className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 mr-2"
                                >
                                    Toggle Holiday
                                </button>
                                <button
                                    onClick={() => onDeleteEvent(event.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// Main CompanyEventsPage Component
const CompanyEventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await EventService.getEvents();
            setEvents(data);
        } catch (err) {
            console.error("Error fetching events:", err);
            setError("Failed to fetch events. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleEventAdded = () => {
        fetchEvents(); // Refresh events after adding a new one
    };

    const handleDeleteEvent = async (id) => {
        await EventService.deleteEvent(id);
        fetchEvents(); // Refresh events after deleting
    };

    const handleToggleHoliday = async (id, event) => {
        await EventService.updateEvent(id, { ...event, isHoliday: !event.isHoliday });
        fetchEvents(); // Refresh events after updating the holiday status
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <div className="w-full p-6 space-y-6 bg-gradient-to-r from-blue-900 to-blue-700 min-h-screen">
            <h1 className="text-4xl font-bold text-white mb-6 text-center">Company Events and Holidays</h1>
            <EventForm onEventAdded={handleEventAdded} />
            {loading ? (
                <div className="text-center text-lg text-white">Loading...</div>
            ) : error ? (
                <div className="text-red-600 text-lg mb-5">{error}</div>
            ) : (
                <EventList
                    events={events}
                    onDeleteEvent={handleDeleteEvent}
                    onToggleHoliday={handleToggleHoliday}
                />
            )}
        </div>
    );
};

export default CompanyEventsPage;
