import express from "express";
import Order from "../model/Order.js";  

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { fullName, address, contactNumber, item } = req.body;

    if (!fullName || !address || !contactNumber || !item) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const { name, price, image } = item;

    const orderData = {
      fullName,
      address,
      contactNumber,
      item: { name, price, image }, 
    };

    console.log("Order Data to be saved:", orderData);  

    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Order placed successfully!",
      order: savedOrder,
    });

  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ message: "Failed to place order. Please try again." });
  }
});

export default router;
