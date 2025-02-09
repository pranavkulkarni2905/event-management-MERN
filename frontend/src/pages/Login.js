import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("https://event-management-mern.onrender.com/api/auth/login", { email, password });
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userId", response.data.user.id); // <-- Store userId properly

            toast.success("Login successful!");
            navigate("/");
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed!");
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, textAlign: "center" }}>
                <Typography variant="h4">Login</Typography>
                <form onSubmit={handleLogin}>
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
                        Login
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default Login;
