import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Amenities from "./pages/Amenities";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const [userInfo, setUserInfo] = useState(null); // Store logged-in user's info
  const [allBookings, setAllBookings] = useState([]); // Store all booking details
  const [messages, setMessages] = useState([]); // Store messages from the server
  const [users, setUsers] = useState([]); // Store users
  const [rooms, setRooms] = useState([]); // Store rooms
  const [amenities, setAmenities] = useState([]); // Store amenities

  // Handle user login
  const handleLogin = (user) => {
    setUserInfo(user); // Set user info after login
    localStorage.setItem("userInfo", JSON.stringify(user)); // Persist user info to localStorage
  };

  // Handle user logout
  const handleLogout = () => {
    setUserInfo(null); // Clear user info from state
    localStorage.removeItem("userInfo"); // Remove user info from localStorage
  };

  // Add new booking to the allBookings state
  const handleNewBooking = (bookingData) => {
    setAllBookings((prevBookings) => [...prevBookings, bookingData]);
  };

  

  // Fetch users
  useEffect(() => {
    fetch("http://127.0.0.1:5555/users")
      .then((r) => r.json())
      .then((users) => setUsers(users))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  // Fetch rooms
  useEffect(() => {
    fetch("http://127.0.0.1:5555/rooms")
      .then((r) => r.json())
      .then((rooms) => setRooms(rooms))
      .catch((error) => console.error("Error fetching rooms:", error));
  }, []);

  // Fetch amenities
  useEffect(() => {
    fetch("http://127.0.0.1:5555/amenities")
      .then((r) => r.json())
      .then((amenities) => setAmenities(amenities))
      .catch((error) => console.error("Error fetching amenities:", error));
  }, []);

  

  // Handle creating a new room booking
  const createRoomBooking = (bookingData) => {
    if (!userInfo) return;

    fetch("http://127.0.0.1:5555/user_room_bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userInfo.id,
        room_id: bookingData.room_id,
        check_in_date: bookingData.check_in_date,
        check_out_date: bookingData.check_out_date,
      }),
    })
      .then((r) => r.json())
      .then((newBooking) => {
        setAllBookings((prevBookings) => [...prevBookings, newBooking]);
      })
      .catch((error) => console.error("Error creating room booking:", error));
  };

  // Handle creating a new amenity booking
  const createAmenityBooking = (bookingData) => {
    if (!userInfo) return;

    fetch("http://127.0.0.1:5555/user_amenity_bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userInfo.id,
        amenity_id: bookingData.amenity_id,
        booking_time: bookingData.booking_time,
      }),
    })
      .then((r) => r.json())
      .then((newBooking) => {
        setAllBookings((prevBookings) => [...prevBookings, newBooking]);
      })
      .catch((error) => console.error("Error creating amenity booking:", error));
  };

  return (
    <div className="App">
      <Header onLogout={handleLogout} />
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/amenities"
          element={<Amenities amenities={amenities} onCreateBooking={createAmenityBooking} />}
        />
        <Route
          path="/profile"
          element={
            userInfo ? (
              <Profile userInfo={userInfo} allBookings={allBookings} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
