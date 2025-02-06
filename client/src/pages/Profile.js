import React, { useState, useEffect } from "react";
import "./Profile.css";

function Profile({ userInfo, allBookings }) {
  const [bookings, setBookings] = useState(allBookings);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [updatedBooking, setUpdatedBooking] = useState({ bookingDate: "", bookingTime: "" });

  useEffect(() => {
    if (!userInfo) return;

    setLoading(true);
    fetch(`http://127.0.0.1:5555/bookings/${userInfo.email}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch bookings");
        return response.json();
      })
      .then((data) => setBookings(data))
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setLoading(false));
  }, [userInfo]);

  const handleEdit = (booking) => {
    if (editingBooking?.id !== booking.id) {  // Only update state if the booking is different
      setEditingBooking(booking);
      setUpdatedBooking({
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedBooking((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSaveEdit = (id) => {
    fetch(`http://127.0.0.1:5555/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedBooking),
    })
      .then(() => {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.id === id ? { ...booking, ...updatedBooking } : booking
          )
        );
        setEditingBooking(null);
      })
      .catch((error) => setErrorMessage("An error occurred while saving the booking."));
  };

  const handleDelete = (id) => {
    fetch(`http://127.0.0.1:5555/bookings/${id}`, { method: "DELETE" })
      .then(() => {
        setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== id));
      })
      .catch((error) => setErrorMessage(error.message));
  };

  if (loading) return <p>Loading...</p>;
  if (errorMessage) return <p className="error-message">{errorMessage}</p>;
  if (!bookings.length) return <p>No bookings found for {userInfo.email}.</p>;

  return (
    <div className="profile-container">
      <h1 className="profile-title">Welcome, {userInfo.name || userInfo.username || userInfo.email}!</h1>
      <h2>Your Bookings</h2>
      <ul className="bookings-list">
        {bookings.map((booking) => (
          <li key={booking.id} className="booking-item">
            {editingBooking && editingBooking.id === booking.id ? (
              <div className="edit-form">
                <h3>Edit Booking</h3>
                <label>
                  Date:
                  <input
                    type="date"
                    name="bookingDate"
                    value={updatedBooking.bookingDate}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Time:
                  <input
                    type="time"
                    name="bookingTime"
                    value={updatedBooking.bookingTime}
                    onChange={handleInputChange}
                  />
                </label>
                <div className="button-container">
                  <button className="save-btn" onClick={() => handleSaveEdit(booking.id)}>Save</button>
                  <button className="cancel-btn" onClick={() => setEditingBooking(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="booking-info">
                <h3>{booking.room || booking.amenity || "Unknown"}</h3>
                <p>{booking.description}</p>
                <p>Cost: {booking.cost}</p>
                <p>Date: {booking.bookingDate}</p>
                <p>Time: {booking.bookingTime}</p>
                <div className="button-container">
                  <button className="edit-btn" onClick={() => handleEdit(booking)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(booking.id)}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Profile;
