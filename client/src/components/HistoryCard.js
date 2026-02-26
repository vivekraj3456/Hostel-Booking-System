// New File: src/components/HistoryCard.js
import React from 'react';
import { MdHotel, MdAttachMoney, MdCalendarToday, MdAccessTime, MdPerson } from 'react-icons/md';

function HistoryCard({ booking, formatDate }) {
  const { roomNumber, price, userName, bookedAt, duration = 1 } = booking;
  const totalAmount = price * duration;

  return (
    <div className="history-card">
      <div className="card-header">
        <div className="room-info">
          <h3><MdHotel /> Room {roomNumber}</h3>
          <p className="guest"><MdPerson /> {userName}</p>
        </div>
        <div className="status-badge completed">Completed</div>
      </div>

      <div className="card-body">
        <div className="detail">
          <MdAttachMoney className="icon" />
          <div>
            <span className="label">Monthly Rent</span>
            <span className="value price">₹{price.toLocaleString()}</span>
          </div>
        </div>
        <div className="detail">
          <MdCalendarToday className="icon" />
          <div>
            <span className="label">Booked On</span>
            <span className="value">{formatDate(bookedAt)}</span>
          </div>
        </div>
        <div className="detail">
          <MdAccessTime className="icon" />
          <div>
            <span className="label">Duration</span>
            <span className="value">{duration} Month(s)</span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <div className="total">
          <span>Total Paid</span>
          <span className="amount">₹{totalAmount.toLocaleString()}</span>
        </div>
        <button className="btn btn-outline">View Invoice</button>
      </div>
    </div>
  );
}

export default HistoryCard;
