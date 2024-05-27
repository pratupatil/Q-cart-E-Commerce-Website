import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import ProductCard from "./ProductCard";
import Footer from "./Footer";
import Header from "./Header";
import Cart from "./Cart";
import { generateCartItemsFrom } from "./Cart";
import "./Products.css";

const Products = () => {
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);

 
  const [debounce, setDebounce] = useState(0);
  const [productsData, setProductsData] = useState([]);
 
  const [cartData, setCartData] = useState([]);
  const [items, setItems] = useState([]);
 
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  
  const performAPICall = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);
      setProductsData(response.data);
      setIsLoading(false);
      
      return response.data;
    } catch (err) {
      setIsLoading(false);
      enqueueSnackbar(err.response.data.message, { variant: "error" });
      console.log(err.response);
    }
  };

  useEffect(() => {
    (async function () {
      const dataFromProductAPI = await performAPICall();
      const dataFromCartAPI = await fetchCart(token);
      const cartDetails = await generateCartItemsFrom(
        dataFromCartAPI,
        dataFromProductAPI
      );
      setItems(cartDetails);
    })();
  }, []);

 

  const performSearch = async (e) => {
    try {
      const url = `${config.endpoint}/products/search?value=${e.target.value}`;
      const response = await axios.get(url);
      console.log(response.data);
      setProductsData(response.data);
    } catch (err) {
      if (err.response.status === 404) {
        setProductsData(err.response.data);
        console.log(err.response);
      }
    }
  };

  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */

  const debounceSearch = (event, debounceTimeout) => {
    let timeout;

    if (debounce) {
      clearTimeout(debounce);
    }

    timeout = setTimeout(() => performSearch(event), debounceTimeout);
    setDebounce(timeout);
  };

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */

  const fetchCart = async (token) => {
    if (!token) return;
    const url = `${config.endpoint}/cart`;
    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCartData(response.data);
     
      return response.data;
      
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    return items.find((item) => {
      return item.productId === productId;
    });
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    try {
      if (!token) {
        enqueueSnackbar("Login to add an item to the Cart", {
          variant: "error",
        });
        return;
      }
      if (options.preventDuplicate) {
        if (isItemInCart(items, productId)) {
          enqueueSnackbar(
            "Item already in cart. Use the cart sidebar to update quantity or remove item.",
            { variant: "warning" }
          );
          return;
        }
      }
      const url = `${config.endpoint}/cart`;
      const itemToBeAdded = {
        productId,
        qty,
      };
      const response = await axios.post(url, itemToBeAdded, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setCartData(response.data);
      const cartDetails = await generateCartItemsFrom(
        response.data,
        productsData
      );
      setItems(cartDetails);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        enqueueSnackbar("Session has expired please login again!", {
          variant: "error",
        });
      }
    }

    
  };

  return (
    <div>
      <Header>
        <Box className="search search-desktop">
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            // value={value}
            placeholder="Search for items/categories"
            InputProps={{
              endAdornment: <SearchIcon color="primary" />,
            }}
            onChange={(e) => debounceSearch(e, 500)}
          />
        </Box>
      </Header>
      <Box className="search-mobile">
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search for items/categories"
          InputProps={{
            endAdornment: <SearchIcon color="primary" />,
          }}
          onChange={(e) => debounceSearch(e, 500)}
        />
      </Box>
      <Grid container>
        <Grid item md={username ? 8 : 12} lg={username ? 9 : 12}>
          <Grid item className="product-grid">
            <Box className="hero">
              <p className="hero-heading">
                India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                to your door step
              </p>
            </Box>
          </Grid>
          {isLoading ? (
            <Box className="loading">
              <CircularProgress />
              <Typography variant="body2">Loading Products...</Typography>
            </Box>
          ) : productsData.length !== 0 ? (
            <Grid container rowSpacing={2.5} columnSpacing={2} my={2} px={2}>
              {productsData.map((product) => (
                <Grid item xs={6} md={3} key={product._id}>
                  <ProductCard
                    product={product}
                    handleAddToCart={(id, qty) =>
                      addToCart(token, cartData, productsData, id, qty, {
                        preventDuplicate: true,
                      })
                    }
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box className="loading">
              <SentimentNeutralIcon color="primary" />
              <Typography variant="body2" color="textSecondary" mt={1}>
                No Products found
              </Typography>
            </Box>
          )}
        </Grid>

        {username ? (
          <Grid item xs={12} md={4} lg={3} className="cart-background">
            {/* {items && <Cart products={productsData} items={items} />} */}
            <Cart
              products={productsData}
              items={items}
              handleQuantity={(id, qty) =>
                addToCart(token, cartData, productsData, id, qty)
              }
              // handleQuantity={addToCart}
            />
          </Grid>
        ) : null}
      </Grid>

      <Footer />
    </div>
  );
};

export default Products;
