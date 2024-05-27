import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import { config } from "../App";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",

  })

  const[isSubmit, setIsSubmit] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  }

  const history = useHistory();
  // eslint-disable-next-line
  const { enqueueSnackbar } = useSnackbar();
  
  

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement the register function
  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   * 
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true,
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   */
  // eslint-disable-next-line
  const register = async (formData) => {
    const request = {
      password: formData.password,
      username: formData.username,
    };
    if (validateInput(formData)) {
      setIsSubmit(true);
      axios
        .post(`${config.endpoint}/auth/register`, request)
        .then((response) => {
          // console.log(response);
          enqueueSnackbar("Registered Successfully", { variant: `success` });
          setIsSubmit(false);
          history.push("/login", { from: "Register" });
        })
        .catch((error) => {
          if (error.response) {
            
            enqueueSnackbar(error.response.data.message, { variant: `error` });
            setIsSubmit(false);
          } else if (error.request) {
            
            enqueueSnackbar(
              "Something went wrong. Check that the backend is running, reachable and return valid JSON  ",
              { variant: `error` }
            );
            setIsSubmit(false);
          } else {
            
            console.log("Error", error.message);
            setIsSubmit(false);
          }
          
        });
    }
  };

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement user input validation logic
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */
  // eslint-disable-next-line
  const validateInput = (data) => {
    if (data.username.length === 0) {
      enqueueSnackbar("Username is a required field", {
        variant: `warning`,
      });
    } else if (data.username.length < 6) {
      enqueueSnackbar("Username must be at least 6 characters", {
        variant: `warning`,
      });
    } else if (data.password.length === 0) {
      enqueueSnackbar("Password is a required field", {
        variant: `warning`,
      });
    } else if (data.password.length < 6) {
      enqueueSnackbar("Paasword must be at least 6 characters", {
        variant: `warning`,
      });
    } else if (data.password !== data.confirmPassword) {
      enqueueSnackbar("Passwords do not match", {
        variant: `warning`,
      });
    } else {
      return true;
    }
    return false;
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      
      
      <Header hasHiddenAuthButtons = {true} />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            type= "text"
            variant="outlined"
            title="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter Username"
            fullWidth
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            helperText="Password must be atleast 6 characters length"
            fullWidth
            
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            fullWidth
          />
           {isSubmit ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress disableShrink />
            </Box>
          ) : (
            <Button
              type="button"
              variant="contained"
              onClick={() => register(formData)}
            >
              REGISTER NOW
            </Button>
          )}
          <p className="secondary-action">
            Already have an account?{" "}
             <Link className="link" to="/login">
              Login here
             </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
