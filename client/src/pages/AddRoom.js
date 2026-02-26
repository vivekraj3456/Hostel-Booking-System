// src/pages/AddRoom.js - FULLY IMPROVED (Premium Card Layout)
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useApi } from '../App';
import { toast } from 'react-toastify';
import { MdMale, MdFemale, MdHotel, MdPeople } from 'react-icons/md';

const HOSTEL_CONFIG = {
  Boys: [1, 2, 3, 4, 5, 6],
  Girls: [1, 2, 3, 4, 5],
};

const SEATER_OPTIONS = [2, 3, 4];

const schema = yup.object({
  roomNumber: yup.string().trim().required('Room number is required').min(3, 'Minimum 3 characters'),
  price: yup.number().typeError('Price must be a number').min(500, 'Minimum ₹500').required('Price is required'),
});

function AddRoom() {
  const { apiRequest } = useApi();
  const [hostelType, setHostelType] = useState('Boys');
  const [hostelNumber, setHostelNumber] = useState(1);
  const [seater, setSeater] = useState(2);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const hostelNumbers = HOSTEL_CONFIG[hostelType];

  useEffect(() => {
    if (hostelType === 'Girls' && hostelNumber > 5) {
      setHostelNumber(1);
    }
  }, [hostelType]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        hostelType,
        hostelNumber: Number(hostelNumber),
        seater: Number(seater),
        roomNumber: data.roomNumber.trim(),
        price: Number(data.price),
      };

      const response = await apiRequest('/add-room', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast.success(`✅ Room ${response.roomNumber || data.roomNumber} added successfully!`);
      reset();
      setHostelNumber(1);
      setSeater(2);
    } catch (err) {
      toast.error(err.message || 'Failed to add room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-room-page">
      <div className="form-card">
        <h1 className="page-title">Add Room</h1>
        <p className="page-subtitle">Register a new room in the hostel system.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="add-form">
          {/* Hostel Type */}
          <div className="form-group">
            <label>Hostel Type</label>
            <div className="toggle-group">
              {Object.keys(HOSTEL_CONFIG).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`toggle-btn ${hostelType === type ? 'active' : ''}`}
                  onClick={() => setHostelType(type)}
                >
                  {type === 'Boys' ? <MdMale /> : <MdFemale />} {type}
                </button>
              ))}
            </div>
          </div>

          {/* Hostel Number */}
          <div className="form-group">
            <label>Hostel Number</label>
            <div className="toggle-group small">
              {hostelNumbers.map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`toggle-btn small ${hostelNumber === num ? 'active' : ''}`}
                  onClick={() => setHostelNumber(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Seater */}
          <div className="form-group">
            <label>Seater</label>
            <div className="toggle-group">
              {SEATER_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`toggle-btn ${seater === s ? 'active' : ''}`}
                  onClick={() => setSeater(s)}
                >
                  <MdPeople /> {s} Seater
                </button>
              ))}
            </div>
          </div>

          {/* Room Number */}
          <div className="form-group">
            <label>Room Number</label>
            <input
              type="text"
              placeholder="e.g. 104"
              {...register('roomNumber')}
              className={errors.roomNumber ? 'error-input' : ''}
            />
            {errors.roomNumber && <p className="error-text">{errors.roomNumber.message}</p>}
          </div>

          {/* Price */}
          <div className="form-group">
            <label>Price (₹/month)</label>
            <input
              type="number"
              placeholder="e.g. 2000"
              min="500"
              {...register('price')}
              className={errors.price ? 'error-input' : ''}
            />
            {errors.price && <p className="error-text">{errors.price.message}</p>}
          </div>

          <button type="submit" className="btn btn-primary add-btn" disabled={loading}>
            {loading ? 'Adding Room...' : 'Add Room'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddRoom;