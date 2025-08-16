import { useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await api.post("/auth/login", { email, password });
    login(res.data.token);
    navigate("/");
  }

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2"/>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2"/>
        <button className="bg-blue-600 text-white p-2 rounded">Login</button>
      </form>
    </div>
  );
}
