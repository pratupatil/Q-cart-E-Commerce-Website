import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";
import AddNewAddress from "./AddNewAddress";

const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => {
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        onChange={(e) =>
          handleNewAddress({ ...newAddress, value: e.target.value })
        }
      />
      <Stack direction="row" my="1rem">
        <Button
          variant="contained"
          onClick={async () => await addAddress(token, newAddress)}
        >
          Add
        </Button>
        <Button
          variant="text"
          onClick={() =>
            handleNewAddress({ ...newAddress, isAddingNewAddress: false })
          }
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });
  const [isPaymentDone, setIsPaymentDone] = useState(false);

  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);
      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const fetchCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  const getAddresses = async (token) => {
    if (!token) {
      history.push("/login");
      enqueueSnackbar("You must be logged in to access checkout page", {
        variant: "error",
      });
      return;
    }

    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses({ ...addresses, all: response.data });
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  const addAddress = async (token, newAddress) => {
    try {
      const url = `${config.endpoint}/user/addresses`;
      const address = { address: newAddress.value };
      const response = await axios.post(url, address, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewAddress({ isAddingNewAddress: false, value: "" });
      setAddresses({ ...addresses, all: response.data });
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const deleteAddress = async (token, addressId) => {
    try {
      const url = `${config.endpoint}/user/addresses/${addressId}`;
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAddresses({ ...addresses, all: response.data });
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const validateRequest = (items, addresses) => {
    const totalCartValue = getTotalCartValue(items);
    const currentBalance = localStorage.getItem("balance");
    if (totalCartValue > currentBalance) {
      enqueueSnackbar(
        "You do not have enough balance in your wallet for this purchase.",
        { variant: "error" }
      );
      return false;
    }
    if (addresses.all.length === 0) {
      enqueueSnackbar("Please add a new address before proceeding.", {
        variant: "error",
      });
      return false;
    }
    if (addresses.selected.length === 0) {
      enqueueSnackbar("Please select one shipping address to proceed.", {
        variant: "error",
      });
      return false;
    }
    return true;
  };

  const handleRazorpayPayment = async () => {
    const amount = getTotalCartValue(items) * 100; // Convert to paisa
    const options = {
      key: "rzp_test_Nll7srSfEOdRtz",
      amount: amount,
      currency: "INR",
      name: "Qcart",
      description: "transaction",
      handler: function (response) {
        setIsPaymentDone(true);
        enqueueSnackbar("Payment successful", { variant: "success" });
      },
      prefill: {
        name: "Your Name",
        email: "your.email@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const performCheckout = async (token, items, addresses) => {
    try {
      if (validateRequest(items, addresses)) {
        const url = `${config.endpoint}/cart/checkout`;
        const response = await axios.post(
          url,
          { addressId: addresses.selected },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const totalCartValue = getTotalCartValue(items);
        const currentBalance = localStorage.getItem("balance");
        localStorage.setItem("balance", currentBalance - totalCartValue);
        history.push("/thanks");
        enqueueSnackbar("Order placed successfully", { variant: "success" });
      }
    } catch (err) {
      if (err.response) {
        enqueueSnackbar(err.response.data.message, { variant: "error" });
      }
    }
  };

  useEffect(() => {
    const onLoadHandler = async () => {
      const productsData = await getProducts();
      const cartData = await fetchCart(token);

      if (productsData && cartData) {
        const cartDetails = await generateCartItemsFrom(cartData, productsData);
        setItems(cartDetails);
      }
      await getAddresses(token);
    };
    onLoadHandler();
  }, []);

  return (
    <>
      <Header hasHiddenAuthButtons />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="checkout-container" padding="1rem">
            <Typography variant="h4" sx={{ fontWeight: "bold" }} my="1rem">
              Checkout
            </Typography>
            <Typography my="1rem" color="#3C3C3C" sx={{ fontWeight: "bold" }}>
              Shipping
            </Typography>
            <Typography my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>

            <Divider />
            <Box>
              {addresses.all.length > 0 ? (
                addresses.all.map((address) => (
                  <Box
                    className={`address-item  ${
                      address._id === addresses.selected
                        ? "selected"
                        : "not-selected"
                    }`}
                    key={address._id}
                    onClick={() =>
                      setAddresses({ ...addresses, selected: address._id })
                    }
                  >
                    <Typography>{address.address}</Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Delete />}
                      onClick={() => deleteAddress(token, address._id)}
                    >
                      Delete
                    </Button>
                  </Box>
                ))
              ) : (
                <Typography my="1rem">
                  No addresses found for this account. Please add one to
                  proceed.
                </Typography>
              )}
            </Box>

            {newAddress.isAddingNewAddress ? (
              <AddNewAddressView
                token={token}
                newAddress={newAddress}
                handleNewAddress={setNewAddress}
                addAddress={addAddress}
              />
            ) : (
              <Button
                color="primary"
                variant="contained"
                id="add-new-btn"
                size="large"
                onClick={() => {
                  setNewAddress((currNewAddress) => ({
                    ...currNewAddress,
                    isAddingNewAddress: true,
                  }));
                }}
              >
                Add new address
              </Button>
            )}

            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={handleRazorpayPayment}
            >
              Pay with Razorpay
            </Button>
            <Button
              variant="contained"
              onClick={() => setIsPaymentDone(true)}
            >
              Cash on Delivery
            </Button>

            <Button
              startIcon={<CreditCard />}
              variant="contained"
              onClick={async () =>
                await performCheckout(token, items, addresses)
              }
              disabled={!isPaymentDone}
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly products={products} items={items} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;
