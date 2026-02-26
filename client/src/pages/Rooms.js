// src/pages/Rooms.js - Updated with all improvements
import React, { useState, useEffect, useCallback } from 'react';
import { useApi, Spinner } from '../App';
import RoomCard from '../components/RoomCard';
import SkeletonCard from '../components/SkeletonCard';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import { MdHotel, MdLocationCity, MdPeople, MdSort, MdRefresh } from 'react-icons/md';

const HOSTEL_CONFIG = {
  Boys: [1, 2, 3, 4, 5, 6],
  Girls: [1, 2, 3, 4, 5],
};

const SEATER_OPTIONS = [2, 3, 4];

function Rooms() {
  const { apiRequest } = useApi();
  const [selection, setSelection] = useState({
    hostelType: null,
    hostelNumber: null,
    seater: null,
  });
  const [rooms, setRooms] = useState([]);
  const [status, setStatus] = useState({
    loading: false,
    bookingLoading: null,
  });
  const [modal, setModal] = useState({ open: false, roomId: null });
  const [sortBy, setSortBy] = useState('price-asc'); // New: sorting

  const { hostelType, hostelNumber, seater } = selection;
  const hostelNumbers = hostelType ? HOSTEL_CONFIG[hostelType] : [];

  const fetchRooms = useCallback(async () => {
    if (!hostelType || hostelNumber == null || seater == null) return;

    setStatus((prev) => ({ ...prev, loading: true }));

    try {
      const params = new URLSearchParams({
        hostelType,
        hostelNumber: String(hostelNumber),
        seater: String(seater),
      });
      let data = await apiRequest(`/rooms/filter?${params.toString()}`);
      data = Array.isArray(data) ? data : [];

      // Sort rooms
      if (sortBy === 'price-asc') {
        data.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-desc') {
        data.sort((a, b) => b.price - a.price);
      }

      setRooms(data);
    } catch (err) {
      setRooms([]);
      toast.error('Failed to load rooms');
    } finally {
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  }, [hostelType, hostelNumber, seater, sortBy, apiRequest]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const confirmBook = (roomId) => {
    setModal({ open: true, roomId });
  };

  const handleBook = useCallback(async () => {
    const { roomId } = modal;
    setModal({ open: false, roomId: null });
    setStatus((prev) => ({ ...prev, bookingLoading: roomId }));

    try {
      const data = await apiRequest(`/book/${roomId}`, {
        method: 'POST',
        body: JSON.stringify({ userName: 'Guest' }), // Replace with real user
      });
      toast.success('Room booked successfully!');
      fetchRooms();
    } catch (err) {
      toast.error('Booking failed');
    } finally {
      setStatus((prev) => ({ ...prev, bookingLoading: null }));
    }
  }, [apiRequest, fetchRooms, modal]);

  const updateSelection = useCallback((field, value) => {
    setSelection((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'hostelType' && { hostelNumber: null, seater: null }),
      ...(field === 'hostelNumber' && { seater: null }),
    }));
  }, []);

  const resetSelection = useCallback(() => {
    setSelection({ hostelType: null, hostelNumber: null, seater: null });
    setRooms([]);
    setStatus({ loading: false, bookingLoading: null });
  }, []);

  const steps = [
    { label: 'Hostel Type', completed: !!hostelType },
    { label: 'Hostel Number', completed: hostelNumber != null },
    { label: 'Seater', completed: seater != null },
    { label: 'Rooms', completed: rooms.length > 0 },
  ];

  return (
    <div className="rooms-page">
      <h1 className="page-title">Book a Room</h1>
      <p className="page-subtitle">
        Select hostel type, building, and seater to view available rooms.
      </p>

      {/* Progress Indicator */}
      <div className="step-progress">
        {steps.map((step, index) => (
          <div key={index} className={`step-item ${step.completed ? 'completed' : ''}`}>
            <div className="step-number">{index + 1}</div>
            <span className="step-label">{step.label}</span>
          </div>
        ))}
      </div>

      {/* Step 1 */}
      <section className="step-section">
        <div className="step-header">
          <span className="step-label">
            <MdHotel /> Step 1: Hostel Type
          </span>
        </div>
        <div className="step-buttons">
          {Object.keys(HOSTEL_CONFIG).map((type) => (
            <button
              key={type}
              type="button"
              className={`btn step-btn ${hostelType === type ? 'step-btn-selected' : ''}`}
              onClick={() => updateSelection('hostelType', type)}
            >
              {type} Hostel
            </button>
          ))}
        </div>
      </section>

      {/* Step 2 - Disabled if no type */}
      {hostelType && (
        <section className="step-section">
          <div className="step-header">
            <span className="step-label">
              <MdLocationCity /> Step 2: Hostel Number
            </span>
          </div>
          <div className="step-buttons">
            {hostelNumbers.map((num) => (
              <button
                key={num}
                type="button"
                className={`btn step-btn step-btn-small ${hostelNumber === num ? 'step-btn-selected' : ''}`}
                onClick={() => updateSelection('hostelNumber', num)}
              >
                {num}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Step 3 - Disabled if no number */}
      {hostelNumber != null && (
        <section className="step-section">
          <div className="step-header">
            <span className="step-label">
              <MdPeople /> Step 3: Seater
            </span>
          </div>
          <div className="step-buttons">
            {SEATER_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className={`btn step-btn ${seater === s ? 'step-btn-selected' : ''}`}
                onClick={() => updateSelection('seater', s)}
              >
                {s} Seater
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Step 4 */}
      {hostelType && hostelNumber != null && seater != null && (
        <section className="step-section step-section-rooms">
          <div className="step-header-with-reset">
            <span className="step-label">
              Step 4: Rooms — {hostelType} Hostel #{hostelNumber}, {seater} Seater
            </span>
            <div className="step-controls">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="price-asc">Price Low to High</option>
                <option value="price-desc">Price High to Low</option>
              </select>
              <button type="button" className="btn btn-outline reset-btn" onClick={resetSelection}>
                <MdRefresh /> Start Over
              </button>
            </div>
          </div>

          {status.loading ? (
            <div className="rooms-grid">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="empty-state">
              <h3>No rooms available</h3>
              <p>Try different filters or check back later.</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onBook={confirmBook}
                  loading={status.bookingLoading === room.id}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, roomId: null })}
        title="Confirm Booking"
        actions={
          <>
            <button className="btn btn-primary" onClick={handleBook}>
              Confirm Booking
            </button>
            <button className="btn btn-outline" onClick={() => setModal({ open: false, roomId: null })}>
              Cancel
            </button>
          </>
        }
      >
        <p>Are you sure you want to book this room? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}

export default Rooms;