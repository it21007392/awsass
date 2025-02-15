import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Import Firestore instance
import { collection, getDocs } from "firebase/firestore"; // Firestore functions

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch events from Firestore
  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, "events");
      const snapshot = await getDocs(eventsRef);
      const eventsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsList);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Filter events for the selected month and year
  const getFilteredEvents = () => {
    return events.filter((event) => {
      const eventDate = new Date(event.eventDate);
      return (
        eventDate.getMonth() === selectedMonth &&
        eventDate.getFullYear() === selectedYear
      );
    });
  };

  // Handle month change
  const handleMonthChange = (direction) => {
    const newDate = new Date(selectedYear, selectedMonth + direction, 1);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = getFilteredEvents();

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-blue-900 to-blue-700 min-h-screen"> 
      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 text-center">
        Welcome to HR Management Dashboard
      </div>

      {/* Month Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded shadow-md mb-6">
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-700 mb-4 sm:mb-0"
          onClick={() => handleMonthChange(-1)}
          aria-label="Previous Month"
        >
          Previous
        </button>
        <div className="text-lg font-bold text-center">
          {new Date(selectedYear, selectedMonth).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </div>
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-700 mt-4 sm:mt-0"
          onClick={() => handleMonthChange(1)}
          aria-label="Next Month"
        >
          Next
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded shadow-md ${
                event.isHoliday
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {event.eventName}
              </div>
              <div className="text-sm sm:text-base lg:text-lg">
                {new Date(event.eventDate).toLocaleDateString()}
              </div>
              <div className="mt-2 text-sm lg:text-base">{event.description}</div>
              <div className="mt-2 font-semibold">
                {event.isHoliday ? "Holiday" : "Working Day"}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No events for this month.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
