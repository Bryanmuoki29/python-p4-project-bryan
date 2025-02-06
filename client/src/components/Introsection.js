import React, { useState, useEffect } from 'react';
import ExecutiveSuiteImage from '../assets/images/room1.jpeg';
import FamilySuiteImage from '../assets/images/room2.jpeg';
import OceanBreezeSuite from '../assets/images/room3.jpeg';
import TropicalOasis from '../assets/images/room4.jpeg';
import SeasideEscape from '../assets/images/room5.jpeg';
import GardenStudioImage from '../assets/images/room6.jpeg';
import BeachFront from '../assets/images/room7.jpeg';
import './IntroSection.css';

function IntroSection({ userInfo, existingBooking }) {
  // Room data
  const rooms = [
    {
      id: 1,
      name: 'Executive Suite',
      image: ExecutiveSuiteImage,
      cost: '$200/night',
      description: 'Spacious suite with king-sized bed and private balcony.',
    },
    {
      id: 2,
      name: 'Family Suite',
      image: FamilySuiteImage,
      cost: '$250/night',
      description: 'Perfect for families with multiple beds and a living area.',
    },
    {
      id: 3,
      name: 'Garden Studio',
      image: GardenStudioImage,
      cost: '$180/night',
      description: 'Beautiful garden views and modern amenities.',
    },
    {
      id: 4,
      name: 'Deluxe Room',
      image: OceanBreezeSuite,
      cost: '$150/night',
      description: 'Luxurious room with premium facilities.',
    },
    {
      id: 5,
      name: 'Tropical Oasis',
      image: TropicalOasis,
      cost: '$500/night',
      description: 'Top-notch suite with exceptional amenities.',
    },
    {
      id: 6,
      name: 'Single Room',
      image: SeasideEscape,
      cost: '$100/night',
      description: 'Ideal for solo travelers with comfortable facilities.',
    },
    {
      id: 7,
      name: 'Beachfront Double Room',
      image: BeachFront,
      cost: '$120/night',
      description: 'Cozy room with a beachfront view and two beds.',
    },
  ];

  // State for selected booking details
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState(''); // New state for time
  const [clientName, setClientName] = useState(userInfo?.name || '');  // Prefill with logged-in user's name
  const [clientEmail, setClientEmail] = useState(userInfo?.email || ''); // Prefill with logged-in user's email

  // Handle booking click to set room
  const handleBookNow = (room) => {
    if (existingBooking) {
      alert("You've already made a booking.");
      return;
    }
    setSelectedRoom(room);
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
      roomId: selectedRoom.id,  // Include room ID for reference
    };

    try {
      // Send room and booking details to the server (replace with your endpoint)
      const response = await fetch('http://127.0.0.1:5555/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        alert(`Booking confirmed for "${selectedRoom.name}" on ${bookingDate} at ${bookingTime}`);
        setSelectedRoom(null); 
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
    <section className="intro-section">
      <h1 className="home-title">Luxury Rooms & Suites</h1>
      <p className="home-description">
        Guestrooms at our hotel offer luxury accommodation and relaxation...
      </p>

      <div className="card-container">
        {rooms.map((room) => (
          <div key={room.id} className="card">
            <img src={room.image} alt={room.name} className="card-image" />
            <h3 className="card-title">{room.name}</h3>
            <p className="card-description">{room.description}</p>
            <p className="card-cost">{room.cost}</p>
            <button
              className="book-now-button"
              onClick={() => handleBookNow(room)}
              disabled={existingBooking} // Disable button if booking exists
            >
              {existingBooking ? "You've already booked" : "Book Now"}
            </button>
          </div>
        ))}
      </div>

      {selectedRoom && !existingBooking && (
        <div className="booking-form">
          <h3>Book Your {selectedRoom.name}</h3>
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

export default IntroSection;
