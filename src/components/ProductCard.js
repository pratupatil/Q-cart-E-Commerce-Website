import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  const { image, name, cost, rating, _id } = product;
  return (
    <Card className="card">
      <CardMedia component="img" image={image} alt={name} />
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {name}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
          ${cost}
        </Typography>
        <Rating readOnly name="read-only" value={rating} />
      </CardContent>
      <CardActions>
        <Button
          className="card-actions card-button"
          variant="contained"
          fullWidth
          onClick={ () =>handleAddToCart(_id, 1)}
          // onClick={handleAddToCart}
        >
          <AddShoppingCartOutlined />
          ADD TO CART
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
