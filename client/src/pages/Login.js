import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faFacebook, faApple } from "@fortawesome/free-brands-svg-icons";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import slide1 from "../assets/images/slide1.jpeg";
import slide2 from "../assets/images/slide2.jpeg";
import slide3 from "../assets/images/slide3.jpeg";

function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [slide1, slide2, slide3];
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Check if all required fields are filled
    if (!username || !email || !password) {
      setError("Please fill out all fields (Username, Email, and Password are required).");
      return;
    }

    const loginData = {
      name,
      username,
      email,
      password,
      user_type: null,
      user_type_id: null,
      id: Math.floor(Math.random() * 1000), // Generate a random id or retrieve it from your database
    };

    try {
      // Check if the username or email already exists
      const responseCheck = await fetch("http://127.0.0.1:5555/users");
      const users = await responseCheck.json();

      const existingUser = users.find((user) => user.username === username || user.email === email);

      if (existingUser) {
        // If the user exists, log them in
        localStorage.setItem("clientName", existingUser.name);
        localStorage.setItem("clientUsername", existingUser.username);
        onLogin(existingUser);
        navigate("/profile");
      } else {
        // If the user doesn't exist, post their details to the API
        const responsePost = await fetch("http://127.0.0.1:5555/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
        });

        if (responsePost.ok) {
          const newUser = await responsePost.json();
          localStorage.setItem("clientName", newUser.name);
          localStorage.setItem("clientUsername", newUser.username);
          onLogin(newUser);
          navigate("/profile");
        } else {
          setError("There was an error while creating your account.");
        }
      }

      // Reset the form fields after successful login or registration
      setName("");
      setEmail("");
      setUsername("");
      setPassword("");
    } catch (error) {
      console.error("Error during login:", error);
      setError("There was an error during login.");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="login-container">
      <div className="slideshow-container">
        <img src={slides[currentSlide]} alt="Hotel Slideshow" className="slideshow-image" />
        <div className="caption">We hope you enjoy your vacation</div>
      </div>

      <div className="login-form-container">
        <h2>Welcome to the Luxury Hotel login page</h2>
        <p>Keep up with all your activities. Are you new here? <a href="/register">Create an Account</a></p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="login-input"
            aria-label="Name"
          />
          <input
            type="text"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            aria-label="Email Address"
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
            aria-label="Username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            aria-label="Password"
          />
          <a href="#" className="forgot-password">Forgot password?</a>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button">Login</button>
        </form>

        <div className="social-login">
          <p>Or sign in with</p>
          <div className="social-icons">
            <button className="social-button google">
              <FontAwesomeIcon icon={faGoogle} /> Google
            </button>
            <button className="social-button facebook">
              <FontAwesomeIcon icon={faFacebook} /> Facebook
            </button>
            <button className="social-button apple">
              <FontAwesomeIcon icon={faApple} /> Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
