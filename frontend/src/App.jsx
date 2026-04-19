import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login.jsx";
import HomeGuest from "./Pages/HomeGuest.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<Navigate to="/home-guest" />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/home-guest" element={<HomeGuest />} />
      </Routes>
    </BrowserRouter>
  );
}