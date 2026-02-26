// Updated src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Your Campus Stay, <br /> Simplified
          </h1>
          <p className="hero-description">
            Find and reserve the perfect room in just a few clicks. <br />
            Choose hostel type, building, and seater — fast, simple, and secure
          </p>
          <form className="search-form">
            <div className="form-field">
              <label>Check-in</label>
              <input type="date" placeholder="dd-mm-yyyy" />
            </div>
            <div className="form-field">
              <label>Check-out</label>
              <input type="date" placeholder="dd-mm-yyyy" />
            </div>
            <div className="form-field">
              <label>Guests</label>
              <select>
                <option>1 adult</option>
                <option>2 adults</option>
                {/* Add more options as needed */}
              </select>
            </div>
            <button type="submit" className="btn btn-primary search-btn">
              Search
            </button>
          </form>
        </div>
        <div className="hero-image">
          {/* Updated placeholder for the new image; replace with actual src if available */}
          <img 
            src="https://t4.ftcdn.net/jpg/06/39/01/79/240_F_639017918_GeDNwoDRFcDTpY2WtJGCa4E38JRlcCYi.jpg" 
            alt="Modern campus hostel room with two beds, desk, and plants" 
            loading="lazy"
          />
        </div>
      </div>
      {/* Featured Rooms section */}
      <section className="featured-section">
        <h2>Featured Rooms</h2>
        {/* You can add a grid of RoomCards here fetching a few featured rooms */}
        <Link to="/rooms" className="btn btn-outline">
          View All Rooms
        </Link>
      </section>
    </div>
  );
}

export default Home;