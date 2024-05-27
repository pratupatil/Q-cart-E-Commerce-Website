import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { Array.<{ productId: String, qty: Number }> } cartData
 *    Array of objects with productId and quantity of products in cart
 *
 * @param { Array.<Product> } productsData
 *    Array of objects with complete data on all available products
 *
 * @returns { Array.<CartItem> }
 *    Array of objects with complete data on products in cart
 *
 */
export const generateCartItemsFrom = (cartData, productsData) => {
  if (!cartData) return;

  const completeCartDetail = cartData.map((item) => ({
    ...item,
    ...productsData.find((product) => item.productId === product._id),
  }));

  // console.log(cartData);
  // console.log(productsData);
  // console.log(completeCartDetail);
  return completeCartDetail;
  // const completeProductData = {};

  // productsData.forEach((product) => {
  //   completeProductData[product._id] = product;
  // });

  // const info = cartData.map((cartItem) => {
  //   const obj = completeProductData[cartItem.productId];
  //   obj["qty"] = cartItem.qty;
  //   return obj;
  // });

  // return info;
};

/**
 * Get the total value of all products added to the cart
 *
 * @param { Array.<CartItem> } items
 *    Array of objects with complete data on products added to the cart
 *
 * @returns { Number }
 *    Value of all items in the cart
 *
 */
export const getTotalCartValue = (items = []) => {
  // console.log(items);
  if (!items.length) return 0;
  return items.reduce((acc, curr) => {
    acc = acc + curr.qty * curr.cost;
    return acc;
  }, 0);
};

// TODO: CRIO_TASK_MODULE_CHECKOUT - Implement function to return total cart quantity
/**
 * Return the sum of quantities of all products added to the cart
 *
 * @param { Array.<CartItem> } items
 *    Array of objects with complete data on products in cart
 *
 * @returns { Number }
 *    Total quantity of products added to the cart
 *
 */
export const getTotalItems = (items = []) => {
  if (!items.length) return 0;
  return items.length;
};

// TODO: CRIO_TASK_MODULE_CHECKOUT - Add static quantity view for Checkout page cart
/**
 * Component to display the current quantity for a product and + and - buttons to update product quantity on cart
 *
 * @param {Number} value
 *    Current quantity of product in cart
 *
 * @param {Function} handleAdd
 *    Handler function which adds 1 more of a product to cart
 *
 * @param {Function} handleDelete
 *    Handler function which reduces the quantity of a product in cart by 1
 *
 * @param {Boolean} isReadOnly
 *    If product quantity on cart is to be displayed as read only without the + - options to change quantity
 *
 */

const ItemQuantity = ({ value, handleAdd, handleDelete, isOnCheckoutPage }) => {
  if (isOnCheckoutPage) return <></>;
  return (
    <Stack direction="row" alignItems="center">
      <IconButton
        size="small"
        color="primary"
        onClick={() => handleDelete(value - 1)}
      >
        <RemoveOutlined />
      </IconButton>
      <Box padding="0.5rem" data-testid="item-qty">
        {value}
      </Box>
      <IconButton
        size="small"
        color="primary"
        onClick={() => handleAdd(value + 1)}
        // onClick={handleAdd}
      >
        <AddOutlined />
      </IconButton>
    </Stack>
  );
};

/**
 * Component to display the Cart view
 *
 * @param { Array.<Product> } products
 *    Array of objects with complete data of all available products
 *
 * @param { Array.<Product> } items
 *    Array of objects with complete data on products in cart
 *
 * @param {Function} handleDelete
 *    Current quantity of product in cart
 *
 *
 */
const Cart = ({ products, items = [], handleQuantity, isReadOnly }) => {
  // console.log(products);
  // console.log(items);
  const history = useHistory();
  const totalCartValue = getTotalCartValue(items)
  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }

  const cartCardItem = items.map((item) => (
    <Box
      display="flex"
      alignItems="flex-start"
      padding="1rem"
      key={item._id}
      justifyContent="space-around"
    >
      <Box className="image-container">
        <img
          // Add product image
          src={item.image}
          // Add product name as alt eext
          alt={item.name}
          width="100%"
          height="100%"
        />
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        maxHeight="10rem"
        paddingX="1rem"
      >
        <div>{item.name}</div>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          {isReadOnly?(`Qty: ${item.qty}`):(
            <ItemQuantity
            // Add required props by checking implementation
            value={item.qty}
            handleAdd={(value) => handleQuantity(item.productId, value)}
            handleDelete={(value) => handleQuantity(item.productId, value)}
            
            // handleAdd={() =>
            //   handleQuantity(
            //     localStorage.getItem("token"),
            //     items,
            //     products,
            //     item.productId,
            //     item.qty + 1
            //   )
            // }
          />
          )}
          
          <Box padding="0.5rem" fontWeight="700">
            ${item.cost}
          </Box>
        </Box>
      </Box>
    </Box>
  ));

  return (
    <>
      <Box className="cart">
        {/* TODO: CRIO_TASK_MODULE_CART - Display view for each cart item with non-zero quantity */}
        {cartCardItem}
        <Box
          padding="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box color="#3C3C3C" alignSelf="center">
            Order total
          </Box>
          <Box
            color="#3C3C3C"
            fontWeight="700"
            fontSize="1.5rem"
            alignSelf="center"
            data-testid="cart-total"
          >
            ${totalCartValue}
          </Box>
        </Box>

        <Box display="flex" justifyContent="flex-end" className="cart-footer">
          {!isReadOnly && (
            // <Link to="/checkout" style={{ textDecoration: "none" }}>
              <Button
                color="primary"
                variant="contained"
                startIcon={<ShoppingCart />}
                className="checkout-btn"
                onClick={() => history.push("/checkout")}
              >
                Checkout
              </Button>
            // </Link>
          )}
          
        </Box>
      </Box>
      {isReadOnly && (
        <Box className="cart" paddingTop={3} px={2}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
            Order Details
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            className="order-detail-box"
            justifyContent="center"
          >
            <Box className="order-detail-box-info">
              <div>Products</div>
              <div variant="h6">{getTotalItems(items)}</div>
            </Box>
            <Box className="order-detail-box-info">
              <div variant="h6">Subtotal</div>
              <div variant="h6">${totalCartValue}</div>
            </Box>
            <Box className="order-detail-box-info">
              <div variant="h6">Shipping Charges</div>
              <div variant="h6">$0</div>
            </Box>
            <Box className="order-detail-box-info">
              <Typography variant="h6" fontWeight={600}>
                Total
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                ${totalCartValue}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Cart;
