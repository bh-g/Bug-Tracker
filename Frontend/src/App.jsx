import React from "react";
import Home from "./home/Home";
import { Navigate, Route, Routes } from "react-router-dom";
import Courses from "./courses/Courses";
import Signup from "./components/Signup";
import OrderPage from "./components/OrderPage";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";

function App() {
  const [authUser, setAuthUser] = useAuth();
  console.log(authUser);

  return (
    <>
      <div className="dark:bg-slate-900 dark:text-white">
        <Routes>
          {/* Existing Routes */}
          <Route path="/" element={<Home />} />
          <Route
            path="/course"
            element={authUser ? <Courses /> : <Navigate to="/signup" />}
          />
          <Route path="/signup" element={<Signup />} />

          {/* New Route for Order Page */}
          <Route path="/order" element={<OrderPage />} />
        </Routes>
        <Toaster />
      </div>
    </>
  );
}

export default App;

