const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// ============================================
// REQUEST LOGGER MIDDLEWARE
// ============================================
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ============================================
// INITIALIZE DATA FILE IF MISSING
// ============================================
function initDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = { rooms: [], bookings: [], waitingQueue: [], bookingHistory: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
    console.log('Created empty data.json');
  }
}
initDataFile();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Read data from JSON file
 * Time Complexity: O(1) - single file read
 */
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
    // Ensure all expected keys exist
    parsed.rooms = parsed.rooms || [];
    parsed.bookings = parsed.bookings || [];
    parsed.waitingQueue = parsed.waitingQueue || [];
    parsed.bookingHistory = parsed.bookingHistory || [];
    return parsed;
  } catch (err) {
    console.error('Error reading data:', err.message);
    return { rooms: [], bookings: [], waitingQueue: [], bookingHistory: [] };
  }
}

/**
 * Write data to JSON file
 * Time Complexity: O(1) - single file write
 */
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing data:', err.message);
    return false;
  }
}

/**
 * Linear Search - Find room by id using manual loop (no .find())
 * Time Complexity: O(n) - scans array from start to end
 */
function searchRoomById(id) {
  const data = readData();
  const rooms = data.rooms;
  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].id === id) {
      return { room: rooms[i], index: i, data };
    }
  }
  return { room: null, index: -1, data };
}

/**
 * Bubble Sort - Sort rooms by price ascending (no built-in .sort())
 * Time Complexity: O(n^2) - nested loops compare adjacent elements
 */
function bubbleSortRooms(roomsArray) {
  const arr = [...roomsArray]; // copy to avoid mutating original
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j].price > arr[j + 1].price) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}

/**
 * Linear Search / Filter - Get rooms matching hostelType, hostelNumber, seater (manual loop, no .filter())
 * Time Complexity: O(n) - single pass over rooms array
 */
function filterRoomsByCriteria(roomsArray, hostelType, hostelNumber, seater) {
  const result = [];
  const typeStr = String(hostelType || '').trim();
  const num = hostelNumber != null ? Number(hostelNumber) : NaN;
  const seat = seater != null ? Number(seater) : NaN;
  for (let i = 0; i < roomsArray.length; i++) {
    const r = roomsArray[i];
    if (r.hostelType !== typeStr) continue;
    if (Number(r.hostelNumber) !== num) continue;
    if (Number(r.seater) !== seat) continue;
    result.push(r);
  }
  return result;
}

/**
 * Generate a unique booking ID using timestamp + random suffix
 * Avoids collisions from rapid successive calls to Date.now()
 * Stays within Number.MAX_SAFE_INTEGER
 */
let bookingCounter = 0;
function generateBookingId() {
  bookingCounter = (bookingCounter + 1) % 1000;
  return Date.now() + bookingCounter;
}

/**
 * Check if a room with same hostelType, hostelNumber, and roomNumber already exists
 * Time Complexity: O(n)
 */
function isDuplicateRoom(rooms, hostelType, hostelNumber, roomNumber) {
  for (let i = 0; i < rooms.length; i++) {
    if (
      rooms[i].hostelType === String(hostelType) &&
      Number(rooms[i].hostelNumber) === Number(hostelNumber) &&
      rooms[i].roomNumber === String(roomNumber)
    ) {
      return true;
    }
  }
  return false;
}

// ============================================
// API ROUTES
// ============================================

// GET / - Welcome
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hostel Booking API',
    endpoints: [
      'GET  /rooms',
      'GET  /rooms/sorted',
      'GET  /rooms/filter?hostelType=&hostelNumber=&seater=',
      'GET  /bookings',
      'GET  /history',
      'GET  /waiting-queue',
      'POST /add-room',
      'POST /book/:id',
      'DELETE /cancel/:bookingId',
      'DELETE /rooms/:id'
    ]
  });
});

// GET /rooms - All rooms
app.get('/rooms', (req, res) => {
  const data = readData();
  res.status(200).json(data.rooms);
});

// GET /rooms/sorted - Rooms sorted by price (Bubble Sort)
app.get('/rooms/sorted', (req, res) => {
  const data = readData();
  const sorted = bubbleSortRooms(data.rooms);
  res.status(200).json(sorted);
});

// GET /rooms/filter - Filter by hostelType, hostelNumber, seater (Linear Search, no .filter())
app.get('/rooms/filter', (req, res) => {
  const { hostelType, hostelNumber, seater } = req.query;
  if (!hostelType || hostelNumber === undefined || hostelNumber === '' || seater === undefined || seater === '') {
    return res.status(400).json({ error: 'Query params required: hostelType, hostelNumber, seater' });
  }
  const data = readData();
  const filtered = filterRoomsByCriteria(data.rooms, hostelType, Number(hostelNumber), Number(seater));
  res.status(200).json(filtered);
});

// GET /bookings - Current bookings
app.get('/bookings', (req, res) => {
  const data = readData();
  res.status(200).json(data.bookings);
});

// GET /history - Booking history (Stack - LIFO, returned newest-first)
app.get('/history', (req, res) => {
  const data = readData();
  // Return in LIFO order (most recent first) without mutating original
  const reversed = [];
  for (let i = data.bookingHistory.length - 1; i >= 0; i--) {
    reversed.push(data.bookingHistory[i]);
  }
  res.status(200).json(reversed);
});

// GET /waiting-queue - View current waiting queue (FIFO order)
app.get('/waiting-queue', (req, res) => {
  const data = readData();
  res.status(200).json(data.waitingQueue);
});

// POST /add-room - Add new room (with duplicate check)
app.post('/add-room', (req, res) => {
  const { hostelType, hostelNumber, seater, roomNumber, price } = req.body;
  if (!hostelType || hostelNumber === undefined || hostelNumber === null || seater === undefined || seater === null || !roomNumber || price === undefined || price === null) {
    return res.status(400).json({ error: 'hostelType, hostelNumber, seater, roomNumber and price are required' });
  }
  if (Number(price) < 0) {
    return res.status(400).json({ error: 'Price must be a non-negative number' });
  }
  if (Number(seater) < 1) {
    return res.status(400).json({ error: 'Seater must be at least 1' });
  }
  const data = readData();
  if (isDuplicateRoom(data.rooms, hostelType, hostelNumber, roomNumber)) {
    return res.status(409).json({ error: 'A room with the same hostelType, hostelNumber, and roomNumber already exists' });
  }
  let maxId = 0;
  for (let i = 0; i < data.rooms.length; i++) {
    if (data.rooms[i].id > maxId) maxId = data.rooms[i].id;
  }
  const newRoom = {
    id: maxId + 1,
    hostelType: String(hostelType).trim(),
    hostelNumber: Number(hostelNumber),
    seater: Number(seater),
    roomNumber: String(roomNumber).trim(),
    price: Number(price),
    isAvailable: true
  };
  data.rooms.push(newRoom);
  if (!writeData(data)) {
    return res.status(500).json({ error: 'Failed to save room' });
  }
  res.status(201).json(newRoom);
});

// POST /book/:id - Book a room (Queue for waiting, Stack for history)
app.post('/book/:id', (req, res) => {
  const roomId = parseInt(req.params.id, 10);
  if (isNaN(roomId)) {
    return res.status(400).json({ error: 'Invalid room ID' });
  }
  const { userName } = req.body || {};
  const name = (userName || 'Guest').trim();

  const { room, data } = searchRoomById(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (room.isAvailable) {
    room.isAvailable = false;
    const booking = {
      bookingId: generateBookingId(),
      roomId: room.id,
      roomNumber: room.roomNumber,
      hostelType: room.hostelType,
      hostelNumber: room.hostelNumber,
      price: room.price,
      userName: name,
      bookedAt: new Date().toISOString()
    };
    data.bookings.push(booking);
    // Stack: push to history (LIFO)
    data.bookingHistory.push(booking);
    if (!writeData(data)) {
      return res.status(500).json({ error: 'Failed to save booking' });
    }
    return res.status(201).json({ message: 'Room booked successfully', booking });
  }

  // Room not available - add to Queue (FIFO)
  data.waitingQueue.push({
    roomId: room.id,
    userName: name,
    requestedAt: new Date().toISOString()
  });
  writeData(data);

  // Calculate queue position for this specific room
  let position = 0;
  for (let i = 0; i < data.waitingQueue.length; i++) {
    if (data.waitingQueue[i].roomId === room.id) position++;
  }
  res.status(200).json({
    message: 'Room is not available. You have been added to the waiting queue.',
    queuePosition: position
  });
});

// DELETE /cancel/:bookingId - Cancel booking, assign to first in queue if any
app.delete('/cancel/:bookingId', (req, res) => {
  const bookingId = Number(req.params.bookingId);
  if (!bookingId || isNaN(bookingId)) {
    return res.status(400).json({ error: 'Invalid booking ID' });
  }
  const data = readData();
  let bookingIndex = -1;
  for (let i = 0; i < data.bookings.length; i++) {
    if (Number(data.bookings[i].bookingId) === bookingId) {
      bookingIndex = i;
      break;
    }
  }
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const cancelled = data.bookings.splice(bookingIndex, 1)[0];
  let room = null;
  for (let i = 0; i < data.rooms.length; i++) {
    if (data.rooms[i].id === cancelled.roomId) {
      room = data.rooms[i];
      break;
    }
  }
  if (room) room.isAvailable = true;

  // Queue (FIFO): assign room to first person in waiting queue for this room
  let assigned = null;
  if (room) {
    for (let i = 0; i < data.waitingQueue.length; i++) {
      if (data.waitingQueue[i].roomId === cancelled.roomId) {
        const next = data.waitingQueue.splice(i, 1)[0];
        room.isAvailable = false;
        const newBooking = {
          bookingId: generateBookingId(),
          roomId: room.id,
          roomNumber: room.roomNumber,
          hostelType: room.hostelType,
          hostelNumber: room.hostelNumber,
          price: room.price,
          userName: next.userName,
          bookedAt: new Date().toISOString()
        };
        data.bookings.push(newBooking);
        data.bookingHistory.push(newBooking);
        assigned = newBooking;
        break;
      }
    }
  }

  if (!writeData(data)) {
    return res.status(500).json({ error: 'Failed to update data' });
  }
  res.status(200).json({
    message: 'Booking cancelled',
    cancelled,
    assignedFromQueue: assigned || null
  });
});

// DELETE /rooms/:id - Remove a room (only if not currently booked)
app.delete('/rooms/:id', (req, res) => {
  const roomId = parseInt(req.params.id, 10);
  if (isNaN(roomId)) {
    return res.status(400).json({ error: 'Invalid room ID' });
  }
  const data = readData();

  let roomIndex = -1;
  for (let i = 0; i < data.rooms.length; i++) {
    if (data.rooms[i].id === roomId) {
      roomIndex = i;
      break;
    }
  }
  if (roomIndex === -1) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const room = data.rooms[roomIndex];
  if (!room.isAvailable) {
    return res.status(409).json({ error: 'Cannot delete a room that is currently booked. Cancel the booking first.' });
  }

  // Remove any waiting queue entries for this room
  for (let i = data.waitingQueue.length - 1; i >= 0; i--) {
    if (data.waitingQueue[i].roomId === roomId) {
      data.waitingQueue.splice(i, 1);
    }
  }

  const removed = data.rooms.splice(roomIndex, 1)[0];
  if (!writeData(data)) {
    return res.status(500).json({ error: 'Failed to update data' });
  }
  res.status(200).json({ message: 'Room removed', room: removed });
});

// JSON 404 handler (prevents frontend JSON parse errors)
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// JSON error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
