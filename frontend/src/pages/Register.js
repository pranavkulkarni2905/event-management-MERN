import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post("https://event-management-mern.onrender.com/api/auth/register", { name, email, password });
            toast.success("Registration successful! Please login.");
            navigate("/login");
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed!");
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, textAlign: "center" }}>
                <Typography variant="h4">Register</Typography>
                <form onSubmit={handleRegister}>
                    <TextField
                        label="Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Register
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default Register;
