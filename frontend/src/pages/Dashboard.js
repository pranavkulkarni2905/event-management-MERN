import React, { useEffect, useState } from "react";
import { Container, Typography, IconButton, Link,Select, MenuItem, FormControl, InputLabel, Card, CardContent, CardActions, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import { Edit, Delete, PersonAdd, AddCircle } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import socket from "../utils/socket";

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [category, setCategory] = useState("");
    const [dateFilter, setDateFilter] = useState("upcoming");
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [eventData, setEventData] = useState({ name: "", description: "", date: "", category: "Meetup" });
    const [editEvent, setEditEvent] = useState(null);
    const [openAttendees, setOpenAttendees] = useState(false);

    const [attendeeList, setAttendeeList] = useState([]);

    const userId = localStorage.getItem("userId");

    const fetchEvents = async () => {
        try {
            const response = await axios.get("https://event-management-mern.onrender.com/api/events");
            setEvents(response.data);
        } catch (error) {
            toast.error("Failed to fetch events");
        }
    };

    useEffect(() => {
        fetchEvents();
    
        // Listen for real-time attendee updates
        socket.on("eventUpdated", (updatedEvent) => {
            setEvents((prevEvents) =>
                prevEvents.map(event =>
                    event._id === updatedEvent._id ? updatedEvent : event
                )
            );
        });
    
        return () => {
            socket.off("eventUpdated");
        };
    }, []);
    

    useEffect(() => {
        let filtered = events;

        if (category) {
            filtered = filtered.filter(event => event.category === category);
        }

        const now = new Date();
        if (dateFilter === "upcoming") {
            filtered = filtered.filter(event => new Date(event.date) >= now);
        } else {
            filtered = filtered.filter(event => new Date(event.date) < now);
        }

        setFilteredEvents(filtered);
    }, [events, category, dateFilter]);

    const handleCreateEvent = async () => {
        const token = localStorage.getItem("token");
        try {
            await axios.post("https://event-management-mern.onrender.com/api/events", eventData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Event created!");
            setOpenCreate(false);
            fetchEvents();
        } catch (error) {
            toast.error("Failed to create event");
        }
    };

    const handleUpdateEvent = async () => {
        const token = localStorage.getItem("token");
        try {
            await axios.put(`https://event-management-mern.onrender.com/api/events/${editEvent._id}`, eventData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Event updated!");
            setOpenEdit(false);
            fetchEvents();
        } catch (error) {
            toast.error("Failed to update event");
        }
    };

    const handleDeleteEvent = async (eventId) => {
        const token = localStorage.getItem("token");
        try {
            await axios.delete(`https://event-management-mern.onrender.com/api/events/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Event deleted!");
            fetchEvents();
        } catch (error) {
            toast.error("Failed to delete event");
        }
    };

    const handleAttendEvent = async (eventId) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`https://event-management-mern.onrender.com/api/events/${eventId}/attend`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("you joined Event!");

            setEvents(prevEvents =>
                prevEvents.map(event =>
                    event._id === eventId ? { ...event, attendees: response.data.attendees } : event
                )
            );

            socket.emit("attendEvent", eventId);
        } catch (error) {
            toast.error("Failed to join event");
        }
    };
    const handleOpenAttendees = (attendees) => {
        setAttendeeList(attendees);
        setOpenAttendees(true);
    };

    return (
        <Container>
            <Typography variant="h4" sx={{ mt: 3, mb: 2 }}>Event Dashboard</Typography>

            {/* Filters & Create Button */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Category</InputLabel>
                    <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Conference">Conference</MenuItem>
                        <MenuItem value="Workshop">Workshop</MenuItem>
                        <MenuItem value="Meetup">Meetup</MenuItem>
                        <MenuItem value="Webinar">Webinar</MenuItem>
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel></InputLabel>
                    <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                        <MenuItem value="upcoming">Upcoming</MenuItem>
                        <MenuItem value="past">Past</MenuItem>
                    </Select>
                </FormControl>

                <IconButton color="primary" onClick={() => setOpenCreate(true)}>
                    <AddCircle fontSize="large" />
                </IconButton>
            </Box>

            {/* Events List */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {filteredEvents.map(event => (
                    <Card key={event._id} sx={{ width: "300px" }}>
                        <CardContent>
                            <Typography variant="h6">{event.name}</Typography>
                            <Typography variant="body2">{event.description}</Typography>
                            <Typography variant="caption">Date: {new Date(event.date).toLocaleString()}</Typography>
                            <Typography variant="caption">
                                Attendees: <Link href="#" onClick={() => handleOpenAttendees(event.attendees)}>{event.attendees.length}</Link>
                            </Typography>
                        </CardContent>
                        <CardActions>
                           
                                    <IconButton color="warning" onClick={() => { setEditEvent(event); setOpenEdit(true); }}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDeleteEvent(event._id)}>
                                        <Delete />
                                    </IconButton>
                              
                            {event.attendees.includes(userId) ? (
                                <Typography variant="body2" color="success">✔ You have joined this event</Typography>
                            ) : (
                                <IconButton color="secondary" onClick={() => handleAttendEvent(event._id)}>
                                    <PersonAdd />
                                </IconButton>
                            )}
                        </CardActions>
                    </Card>

                ))}
            </Box>

            {/* Create Event Modal */}
            <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogContent>
                    <TextField label="Event Name" fullWidth margin="normal" onChange={(e) => setEventData({ ...eventData, name: e.target.value })} />
                    <TextField label="Description" fullWidth margin="normal" onChange={(e) => setEventData({ ...eventData, description: e.target.value })} />
                    <TextField label="Date" type="datetime-local" fullWidth margin="normal" onChange={(e) => setEventData({ ...eventData, date: e.target.value })} />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Category</InputLabel>
                        <Select value={eventData.category} onChange={(e) => setEventData({ ...eventData, category: e.target.value })}>
                            <MenuItem value="Conference">Conference</MenuItem>
                            <MenuItem value="Workshop">Workshop</MenuItem>
                            <MenuItem value="Meetup">Meetup</MenuItem>
                            <MenuItem value="Webinar">Webinar</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
                    <Button onClick={handleCreateEvent} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Event Modal */}
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
                <DialogTitle>Edit Event</DialogTitle>
                <DialogContent>
                    <TextField label="Event Name" fullWidth margin="normal" onChange={(e) => setEventData({ ...eventData, name: e.target.value })} />
                    <TextField label="Description" fullWidth margin="normal" onChange={(e) => setEventData({ ...eventData, description: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
                    <Button onClick={handleUpdateEvent} variant="contained">Update</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openAttendees} onClose={() => setOpenAttendees(false)}>
                <DialogTitle>Attendees</DialogTitle>
                <DialogContent>
                    {attendeeList.length > 0 ? attendeeList.map((attendee, index) => (
                        <Typography key={index}>{attendee}</Typography>
                    )) : <Typography>No attendees yet.</Typography>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAttendees(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Dashboard;
