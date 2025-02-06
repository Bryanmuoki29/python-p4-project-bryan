import React, { useState, useEffect } from 'react';
import pool from '../assets/images/outdoorpool.jpeg';  // Example image
import spa from '../assets/images/spaservice.jpeg';   // Example image
import gym from '../assets/images/fitness.jpeg';     // Example image
import canoeing from '../assets/images/canoeing.jpeg'; // Example image
import finedining from '../assets/images/finedining.jpeg'; // Example image
import './Amenities.css';

function Amenities({ userInfo, existingBooking }) {
  // Amenity data
  const amenities = [
    {
      id: 1,
      name: 'Outdoor Pool',
      image: pool,
      description: 'Relax by our outdoor pool, offering a perfect spot for a refreshing swim and sunbathing.',
    },
    {
      id: 2,
      name: 'Fine Dining Restaurant',
      image: finedining,
      description: 'Indulge in gourmet dishes prepared by world-class chefs in a luxurious dining setting.',
    },
    {
      id: 3,
      name: 'Spa Services',
      image: spa,
      description: 'Relax and rejuvenate with our variety of spa treatments designed to provide ultimate relaxation.',
    },
    {
      id: 4,
      name: 'Fitness Center',
      image: gym,
      description: 'Stay fit and healthy in our fully equipped fitness center, featuring the latest workout equipment.',
    },
    {
      id: 5,
      name: 'Canoeing',
      image: canoeing,
      description: 'Explore the waters with our exciting canoeing experience.',
    },
  ];

  // State for selected amenity and booking details
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [clientName, setClientName] = useState(userInfo?.name || '');  // Prefill with logged-in user's name
  const [clientEmail, setClientEmail] = useState(userInfo?.email || ''); // Prefill with logged-in user's email

  // Handle booking click to set selected amenity
  const handleBookNow = (amenity) => {
    if (existingBooking) {
      alert("You've already made a booking.");
      return;
    }
    setSelectedAmenity(amenity);
  };

  // Handle booking form submit
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!bookingDate || !bookingTime || !clientName || !clientEmail) {
      alert('Please fill out all fields!');
      return;
    }

    const bookingData = {
      username: clientName,  // Assuming username is the client's name
      email: clientEmail,
      bookingDate: bookingDate,
      bookingTime: bookingTime,  // Include time in booking data
      amenityId: selectedAmenity.id,  // Include amenity ID for reference
    };

    try {
      // Send amenity and booking details to the server (replace with your endpoint)
      const response = await fetch('http://127.0.0.1:5555/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        alert(`Booking confirmed for "${selectedAmenity.name}" on ${bookingDate} at ${bookingTime}`);
        setSelectedAmenity(null); 
        setBookingDate(''); 
        setBookingTime(''); 
        setClientName(''); 
        setClientEmail(''); 
      } else {
        alert('Booking failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during booking:', error);
      alert('There was an error during booking.');
    }
  };

  // Update clientName and clientEmail if userInfo changes (for example, after login)
  useEffect(() => {
    if (userInfo) {
      setClientName(userInfo.name);
      setClientEmail(userInfo.email);
    }
  }, [userInfo]);

  return (
    <section className="amenities-section">
      <h1 className="home-title">Our Amenities</h1>
      <p className="home-description">
        Enjoy a variety of top-notch amenities during your stay with us.
      </p>

      <div className="card-container">
        {amenities.map((amenity) => (
          <div key={amenity.id} className="card">
            <img src={amenity.image} alt={amenity.name} className="card-image" />
            <h3 className="card-title">{amenity.name}</h3>
            <p className="card-description">{amenity.description}</p>
            <button
              className="book-now-button"
              onClick={() => handleBookNow(amenity)}
              disabled={existingBooking} // Disable button if booking exists
            >
              {existingBooking ? "You've already booked" : "Book Now"}
            </button>
          </div>
        ))}
      </div>

      {selectedAmenity && !existingBooking && (
        <div className="booking-form">
          <h3>Book Your {selectedAmenity.name}</h3>
          <form onSubmit={handleBookingSubmit}>
            <label>
              Client Name:
              <input
                type="text"
                value={clientName}  // Controlled input
                onChange={(e) => setClientName(e.target.value)}  // Update state on change
                required
                disabled={existingBooking}  // Disable if already booked
              />
            </label>
            <label>
              Client Email:
              <input
                type="email"
                value={clientEmail}  // Controlled input
                onChange={(e) => setClientEmail(e.target.value)}  // Update state on change
                required
                disabled={existingBooking}  // Disable if already booked
              />
            </label>
            <label>
              Booking Date:
              <input
                type="date"
                value={bookingDate}  // Controlled input
                onChange={(e) => setBookingDate(e.target.value)}  // Update state on change
                required
                disabled={existingBooking}  // Disable if already booked
              />
            </label>
            <label>
              Booking Time:
              <input
                type="time"
                value={bookingTime}  // Controlled input for time
                onChange={(e) => setBookingTime(e.target.value)}  // Update state on change
                required
                disabled={existingBooking}  // Disable if already booked
              />
            </label>
            <button
              type="submit"
              className="confirm-booking-btn"
              disabled={existingBooking}  // Disable button if already booked
            >
              Confirm Booking
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

export default Amenities;
