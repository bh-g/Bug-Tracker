import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import Footer from "../components/Footer";

function OrderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { item } = location.state || {};

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    const orderData = {
      fullName: e.target[0].value,
      address: e.target[1].value,
      contactNumber: e.target[2].value,
      item,
    };

    try {
      const response = await axios.post("http://localhost:4001/api/orders", orderData);

      if (response.status === 201) {
        alert("Order placed successfully!");
        navigate("/");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  if (!item) return <div className="text-center mt-10 text-xl">No item selected!</div>;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-10 dark:bg-slate-900 dark:text-white">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg w-full dark:bg-slate-800">
        <h1 className="text-2xl font-bold text-center mb-4">Place Your Order</h1>

        <div className="flex items-center mb-6">
          <img
            src={item.image}
            alt={item.name}
            className="w-32 h-32 rounded-lg border"
          />
          <div className="ml-4">
            <h2 className="text-lg font-semibold">{item.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{item.title}</p>
            <p className="text-lg font-bold mt-2">${item.price}</p>
          </div>
        </div>

        <form onSubmit={handleOrderSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="text"
            placeholder="Address"
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="tel"
            placeholder="Contact Number"
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            type="submit"
            className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition duration-200"
          >
            Place Order
          </button>
        </form>
      </div>
      <div className="my-4">
        <hr className="border-t border-gray-300 dark:border-gray-600" />
      </div>
      <Footer />
    </div>
  );
}

export default OrderPage;
