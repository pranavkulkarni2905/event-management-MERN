const Event = require('../models/Event');
const io = require("../server").io; // Import socket.io instance


exports.createEvent = async (req, res) => {
    try {
        const { name, description, date } = req.body;
        const event = await Event.create({ name, description, date, createdBy: req.user.id });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error creating event' });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('createdBy', 'name').populate('attendees', 'name');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events' });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event || event.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        Object.assign(event, req.body);
        await event.save();
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error updating event' });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event || event.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await event.deleteOne();
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event' });
    }
};

exports.attendEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        if (!event.attendees.includes(req.user.id)) {
            event.attendees.push(req.user.id);
            await event.save();

            // Emit real-time attendee update
            io.emit("eventUpdated", event);
        }

        res.json(event);
    } catch (error) {
        res.status(500).json({ message: "Error attending event" });
    }
};