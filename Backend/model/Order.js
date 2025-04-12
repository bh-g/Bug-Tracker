import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  item: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema); 
export default Order;

