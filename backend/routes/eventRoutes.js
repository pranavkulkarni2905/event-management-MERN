const express = require('express');
const { createEvent, getEvents, updateEvent, deleteEvent, attendEvent } = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createEvent);
router.get('/', getEvents);
router.put('/:id', authMiddleware, updateEvent);
router.delete('/:id', authMiddleware, deleteEvent);
router.post('/:id/attend', authMiddleware, attendEvent);

module.exports = router;
