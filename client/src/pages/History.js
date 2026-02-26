// src/pages/History.js - FULLY IMPROVED
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi, Spinner } from '../App';
import HistoryCard from '../components/HistoryCard';
import SkeletonCard from '../components/SkeletonCard';
import { MdSearch, MdClose, MdRefresh, MdSort } from 'react-icons/md';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

function History() {
  const { apiRequest } = useApi();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/history');
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const debouncedSearch = useMemo(() => debounce((val) => setSearch(val), 300), []);

  const handleSearch = (e) => debouncedSearch(e.target.value);
  const clearSearch = () => setSearch('');

  const filteredAndSorted = useMemo(() => {
    let filtered = history.filter(b =>
      b.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.userName.toLowerCase().includes(search.toLowerCase())
    );

    if (sortBy === 'date-desc') filtered.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
    if (sortBy === 'date-asc') filtered.sort((a, b) => new Date(a.bookedAt) - new Date(b.bookedAt));
    if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);

    return filtered;
  }, [history, search, sortBy]);

  const paginated = filteredAndSorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);

  // Summary Stats
  const summary = useMemo(() => ({
    totalBookings: history.length,
    totalSpent: history.reduce((sum, b) => sum + (b.price * (b.duration || 1)), 0),
    mostBookedRoom: history.length ? [...history].sort((a, b) => b.price - a.price)[0]?.roomNumber : '-',
  }), [history]);

  return (
    <div className="history-page">
      <h1 className="page-title">Booking History</h1>
      <p className="page-subtitle">View past bookings (most recent first).</p>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <h3>Total Bookings</h3>
          <p className="big-number">{summary.totalBookings}</p>
        </div>
        <div className="summary-card">
          <h3>Total Spent</h3>
          <p className="big-number">₹{summary.totalSpent.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Most Booked Room</h3>
          <p className="big-number">Room {summary.mostBookedRoom}</p>
        </div>
      </div>

      {/* Search & Controls */}
      <div className="controls-row">
        <div className="search-wrapper">
          <MdSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by room or user..."
            onChange={handleSearch}
            value={search}
          />
          {search && <MdClose className="clear-icon" onClick={clearSearch} />}
        </div>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="price-desc">Highest Price</option>
          <option value="price-asc">Lowest Price</option>
        </select>

        <button onClick={fetchHistory} className="btn btn-outline">
          <MdRefresh /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="history-grid">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : paginated.length === 0 ? (
        <div className="empty-state">
          <h3>No booking history yet</h3>
          <p>Your past bookings will appear here.</p>
        </div>
      ) : (
        <div className="history-grid">
          {paginated.map((booking) => (
            <HistoryCard
              key={booking.bookingId}
              booking={booking}
              formatDate={(date) => new Date(date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn btn-outline">Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn btn-outline">Next</button>
        </div>
      )}
    </div>
  );
}

export default History;