import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PiSmileySad } from "react-icons/pi";

const Error500 = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        backgroundColor: "#f9f9f9",
        padding: "20px",
      }}
    >
      <Typography variant="h3" sx={{ mb: 2, fontWeight: "bold" }}>
        <PiSmileySad size={100} />
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Oops! Something went wrong. Please try again later.
      </Typography>
      <Button
        variant="contained"
        sx={{ backgroundColor: "#007bff", color: "#fff" }}
        onClick={() => navigate("/")}
      >
        Go Back to Home
      </Button>
    </Box>
  );
};

export default Error500;
