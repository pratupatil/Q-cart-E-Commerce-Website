import React, { useState } from "react";
import { Button, TextField, Typography, Box } from "@mui/material";
import { useSnackbar } from "notistack";
import axios from "axios";
import { config } from "../App";

const AddNewAddress = ({ token, addAddress }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [newAddress, setNewAddress] = useState({
    value: "",
    suggestions: [],
  });

  const handleInputChange = async (event) => {
    const addressInput = event.target.value;
  
    try {
      // Fetch address suggestions from Bing Maps API
      const response = await axios.get(
        `https://dev.virtualearth.net/REST/v1/Locations?query=${addressInput}&key=${"AkCB7LU7IDWnxG6cMzetXbulcO8-MrGC8vvY4Fe9jj-0z0ExIQIHlmwbZ6OYKyBD"}`
      );
      const suggestions = response.data.resourceSets[0].resources;
      setNewAddress({ ...newAddress, value: addressInput, suggestions });
    } catch (error) {
      enqueueSnackbar("Error fetching address suggestions", { variant: "error" });
      console.error("Error fetching address suggestions:", error);
    }
  };
  

  const handleAddressSelect = (selectedAddress) => {
    setNewAddress({ ...newAddress, value: selectedAddress });
  };

  const handleAddAddress = async () => {
    try {
      // Handle adding the address
      await addAddress(token, newAddress.value);
      // Clear only the address input value, keep suggestions intact
      setNewAddress({ ...newAddress, value: "" });
      enqueueSnackbar("Address added successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Error adding address", { variant: "error" });
      console.error("Error adding address:", error);
    }
  };
  
  

  return (
    <Box display="flex" flexDirection="column">
      <TextField
        label="Enter your complete address"
        value={newAddress.value}
        onChange={handleInputChange}
      />
      <ul>
        {newAddress.suggestions.map((suggestion) => (
          <li key={suggestion.id} onClick={() => handleAddressSelect(suggestion.name)}>
            {suggestion.name}
          </li>
        ))}
      </ul>
      <Button variant="contained" onClick={handleAddAddress}>
        Add
      </Button>
    </Box>
  );
};

export default AddNewAddress;
