// src/pages/Bookings.js - Updated with all improvements
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi, Spinner } from '../App';
import BookingCard from '../components/BookingCard';
import Modal from '../components/Modal';
import SkeletonCard from '../components/SkeletonCard'; // Reuse for loading
import { MdSearch, MdClose, MdFilterList, MdSort, MdRefresh } from 'react-icons/md';
import { toast } from 'react-toastify';
import { debounce } from 'lodash'; // Install lodash: npm i lodash

function Bookings() {
  const { apiRequest } = useApi();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [modal, setModal] = useState({ open: false, bookingId: null });
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // New: filter
  const [sortBy, setSortBy] = useState('date-desc'); // New: sort

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/bookings');
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const confirmCancel = (bookingId) => {
    setModal({ open: true, bookingId });
  };

  const handleCancel = useCallback(
    async () => {
      const { bookingId } = modal;
      setModal({ open: false, bookingId: null });
      setCancellingId(bookingId);
      try {
        await apiRequest(`/cancel/${bookingId}`, { method: 'DELETE' });
        toast.success('Booking cancelled successfully!');
        fetchBookings();
      } catch (err) {
        toast.error('Cancel failed');
      } finally {
        setCancellingId(null);
      }
    },
    [apiRequest, fetchBookings, modal]
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return 'Invalid Date';
    }
  };

  // Debounced search update
  const debouncedSetSearch = useMemo(() => debounce((value) => setSearch(value), 300), []);

  const handleSearchChange = (e) => {
    debouncedSetSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearch('');
  };

  // Filtered and sorted bookings
  const filteredSortedBookings = useMemo(() => {
    let result = bookings.filter(
      (b) =>
        (b.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
          b.userName.toLowerCase().includes(search.toLowerCase())) &&
        (filterStatus === 'all' || b.status === filterStatus) // Assume backend adds 'status' or add logic
    );

    if (sortBy === 'date-desc') {
      result.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
    } else if (sortBy === 'date-asc') {
      result.sort((a, b) => new Date(a.bookedAt) - new Date(b.bookedAt));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [bookings, search, filterStatus, sortBy]);

  // Pagination (simple: show 10 per page)
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const paginatedBookings = filteredSortedBookings.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredSortedBookings.length / itemsPerPage);

  // Booking Summary
  const summary = useMemo(() => ({
    total: bookings.length,
    active: bookings.filter(b => b.status === 'active').length,
    totalCost: bookings.reduce((sum, b) => sum + b.price, 0),
  }), [bookings]);

  return (
    <div className="bookings-page">
      <h1 className="page-title">My Bookings</h1>
      <p className="page-subtitle">View and manage your active bookings.</p>

      {/* Summary */}
      <div className="booking-summary">
        <div className="summary-item">
          <h3>Total Bookings</h3>
          <p>{summary.total}</p>
        </div>
        <div className="summary-item">
          <h3>Active</h3>
          <p>{summary.active}</p>
        </div>
        <div className="summary-item">
          <h3>Total Cost</h3>
          <p>₹{summary.totalCost.toLocaleString()}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="search-filters">
        <div className="search-wrapper">
          <MdSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by room or user..."
            onChange={handleSearchChange}
            value={search}
          />
          {search && <MdClose className="clear-icon" onClick={clearSearch} />}
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="price-asc">Price Low to High</option>
          <option value="price-desc">Price High to Low</option>
        </select>
        <button onClick={fetchBookings} className="btn btn-outline refresh-btn">
          <MdRefresh /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="bookings-grid">
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : paginatedBookings.length === 0 ? (
        <div className="empty-state">
          <h3>No bookings found</h3>
          <p>Start booking rooms from the Rooms page.</p>
        </div>
      ) : (
        <div className="bookings-grid">
          {paginatedBookings.map((b) => (
            <BookingCard
              key={b.bookingId}
              booking={b}
              onCancel={confirmCancel}
              loading={cancellingId === b.bookingId}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn btn-outline">
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="btn btn-outline">
            Next
          </button>
        </div>
      )}

      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, bookingId: null })}
        title="Confirm Cancellation"
        actions={
          <>
            <button className="btn btn-danger" onClick={handleCancel}>
              Confirm Cancel
            </button>
            <button className="btn btn-outline" onClick={() => setModal({ open: false, bookingId: null })}>
              Close
            </button>
          </>
        }
      >
        <p>Are you sure you want to cancel this booking? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}

export default Bookings;