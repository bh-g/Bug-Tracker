import React from "react";
import Home from "./home/Home";
import { Navigate, Route, Routes } from "react-router-dom";
import Courses from "./courses/Courses";
import Signup from "./components/Signup";
import OrderPage from "./components/OrderPage";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";
import { useEffect } from "react";
import { initBugTracker, startScreenCapture } from "./utils/bugTracker";

function App() {
  const [authUser, setAuthUser] = useAuth();
  console.log(authUser);

  useEffect(() => {
    initBugTracker();
    startScreenCapture(); // Start screen capture on app mount
  }, []);
  console.log("Screenpipe initialized");


  return (
    <div className="dark:bg-slate-900 dark:text-white">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/course"
          element={authUser ? <Courses /> : <Navigate to="/signup" />}
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/order" element={<OrderPage />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
