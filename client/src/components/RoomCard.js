// src/components/RoomCard.js - Enhanced with premium styling, icons, better badge
import React from 'react';
import { MdHotel, MdAttachMoney, MdCheckCircle, MdCancel, MdLocationCity, MdPeople } from 'react-icons/md';

function RoomCard({ room, onBook, loading }) {
  const isAvailable = room.isAvailable;
  const isDisabled = !isAvailable || loading;
  const hostelInfo = room.hostelType
    ? `${room.hostelType} #${room.hostelNumber} · ${room.seater} Seater`
    : null;

  const getButtonText = () => {
    if (loading) return 'Booking...';
    if (!isAvailable) return 'Unavailable';
    return 'Book Now';
  };

  return (
    <article className={`room-card ${isDisabled ? 'room-card-disabled' : ''}`} role="article">
      <div className="room-card-header">
        <span className="room-number">
          <MdHotel /> Room {room.roomNumber}
        </span>
        <span
          className={`badge ${isAvailable ? 'badge-available' : 'badge-booked'}`}
          aria-label={isAvailable ? 'Available' : 'Booked'}
        >
          {isAvailable ? <MdCheckCircle /> : <MdCancel />} {isAvailable ? 'Available' : 'Booked'}
        </span>
      </div>
      {hostelInfo && (
        <div className="room-meta">
          <MdLocationCity /> {hostelInfo} <MdPeople /> {room.seater} Seater
        </div>
      )}
      <div className="room-price">
        <MdAttachMoney /> ₹{room.price.toLocaleString()}/month
      </div>
      <button
        type="button"
        className="btn btn-primary room-book-btn"
        onClick={() => onBook(room.id)}
        disabled={isDisabled}
        aria-disabled={isDisabled}
      >
        {getButtonText()}
      </button>
    </article>
  );
}

export default RoomCard;