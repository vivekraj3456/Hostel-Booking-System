// New: src/components/BookingCard.js
import React from 'react';
import { MdCancel, MdCalendarToday, MdAttachMoney, MdPerson, MdAccessTime, MdInfo } from 'react-icons/md';

function BookingCard({ booking, onCancel, loading, formatDate }) {
  const { roomNumber, price, userName, bookedAt, status = 'active', duration = 1 } = booking; // Assume backend provides status/duration
  const totalCost = price * duration;

  return (
    <div className={`booking-card ${status}`}>
      <div className="card-header">
        <h3 className="room-number">Room {roomNumber}</h3>
        <span className={`status-badge ${status}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      <div className="card-info">
        <p><MdAttachMoney /> ₹{price.toLocaleString()}/month</p>
        <p><MdPerson /> {userName}</p>
        <p><MdCalendarToday /> Booked: {formatDate(bookedAt)}</p>
        <p><MdAccessTime /> Duration: {duration} month(s)</p>
        <p><MdAttachMoney /> Total: ₹{totalCost.toLocaleString()}</p>
      </div>
      <div className="card-actions">
        <button className="btn btn-outline view-btn">
          <MdInfo /> View Details
        </button>
        <button
          className="btn btn-danger cancel-btn"
          onClick={() => onCancel(booking.bookingId)}
          disabled={loading || status === 'cancelled'}
        >
          <MdCancel /> {loading ? 'Cancelling...' : 'Cancel Booking'}
        </button>
      </div>
    </div>
  );
}

export default BookingCard;