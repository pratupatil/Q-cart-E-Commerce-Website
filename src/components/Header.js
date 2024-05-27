import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack,Typography } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import { useHistory, Link } from "react-router-dom";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();

  const username = localStorage.getItem("username");

  const handleLogout = () => {
    history.push("/");
    window.location.reload(true);
    localStorage.clear();
  };

  if (hasHiddenAuthButtons) {
    return (
      <Box className="header">
        <Box className="header-title">
          <Link to="/">
            <img src="logo_light.svg" alt="QKart-icon"></img>
          </Link>
        </Box>
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => history.push("/")}
        >
          Back to explore
        </Button>
      </Box>
    );
  } else {
    return (
      <Box className="header">
        <Box className="header-title">
          <Link to="/">
            <img src="logo_light.svg" alt="Qkart-icon" />
          </Link>
        </Box>
        {children}
        {username ? (
          <Stack className="user-info" spacing={1} direction="row">
            <Avatar alt={username} src="/static/images/avatar/avatar.png" />
            <Typography variant="body1">{username}</Typography>
            <Button variant="text" onClick={handleLogout}>
              Logout
            </Button>
          </Stack>
        ) : (
          <Stack spacing={2} direction="row">
            <Button variant="text" onClick={() => history.push("/login")}>
              Login
            </Button>
            <Button
              variant="contained"
              onClick={() => history.push("/register")}
            >
              Register
            </Button>
          </Stack>
        )}
        {/* <Box className="search search-desktop">
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search for items/categories"
            InputProps={{
              endAdornment: <SearchIcon color="primary" />,
            }}
          />
        </Box>

        {children} */}
      </Box>
    );
  }

   /*
    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Back to explore
        </Button>
      </Box>
    );
    */
};

export default Header;
