import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Auctions from "./pages/Auctions";
import AuctionDetail from "./pages/AuctionDetail";
import Notifications from "./pages/Notifications";
import ProtectedRoute from "./components/ProtectedRoute";
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import { socket } from "./socket";

export default function App() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit("joinUser", user.id);
      return () => socket.disconnect();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Auctions />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/auction/:id" element={<AuctionDetail />} />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}
