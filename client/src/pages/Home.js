import React from 'react';
import IntroSection from '../components/IntroSection';
import AmenitiesSection from '../components/AmenitiesSection';
import TestimonialsSection from '../components/TestimonialsSection';
import './Home.css'; 

function Home() {
  return (
    <div className="home-container">
      <IntroSection />
      <AmenitiesSection />
      <TestimonialsSection />
    </div>
  );
}

export default Home;
