const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    name: String,
    description: String,
    date: Date,
    category: { type: String, enum: ["Conference", "Workshop", "Meetup", "Webinar"], default: "Meetup" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

module.exports = mongoose.model('Event', EventSchema);
