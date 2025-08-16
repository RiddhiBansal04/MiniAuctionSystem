import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

export default function Auctions() {
  const { user } = useContext(AuthContext);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  // seller form state
  const [form, setForm] = useState({
    item_name: "",
    description: "",
    starting_price: 100,
    bid_increment: 10,
    start_time: new Date(Date.now() + 60 * 1000).toISOString().slice(0,16), // next minute
    duration_minutes: 10,
  });

  async function load() {
    setLoading(true);
    const res = await api.get("/auctions");
    setAuctions(res.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const isSeller = useMemo(() => user?.role === "seller" || user?.role === "admin", [user]);

  async function createAuction(e) {
    e.preventDefault();
    await api.post("/auctions", {
      ...form,
      starting_price: Number(form.starting_price),
      bid_increment: Number(form.bid_increment),
      duration_minutes: Number(form.duration_minutes),
      start_time: new Date(form.start_time).toISOString(),
    });
    setForm({ ...form, item_name: "", description: "" });
    await load();
    alert("Auction created!");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Auctions</h1>

      {isSeller && (
        <div className="bg-white shadow p-4 rounded">
          <h2 className="font-medium mb-3">Create Auction (Seller)</h2>
          <form onSubmit={createAuction} className="grid gap-3 md:grid-cols-2">
            <input className="border p-2 rounded" placeholder="Item name"
              value={form.item_name} onChange={e=>setForm(f=>({...f, item_name:e.target.value}))}/>
            <input className="border p-2 rounded" placeholder="Description"
              value={form.description} onChange={e=>setForm(f=>({...f, description:e.target.value}))}/>
            <input className="border p-2 rounded" type="number" placeholder="Starting price"
              value={form.starting_price} onChange={e=>setForm(f=>({...f, starting_price:e.target.value}))}/>
            <input className="border p-2 rounded" type="number" placeholder="Bid increment"
              value={form.bid_increment} onChange={e=>setForm(f=>({...f, bid_increment:e.target.value}))}/>
            <label className="text-sm text-gray-700">Start time (local):
              <input className="border p-2 rounded w-full" type="datetime-local"
                value={form.start_time} onChange={e=>setForm(f=>({...f, start_time:e.target.value}))}/>
            </label>
            <input className="border p-2 rounded" type="number" placeholder="Duration (minutes)"
              value={form.duration_minutes} onChange={e=>setForm(f=>({...f, duration_minutes:e.target.value}))}/>
            <div className="md:col-span-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {loading ? (
          <div>Loading…</div>
        ) : auctions.length === 0 ? (
          <div>No auctions yet.</div>
        ) : (
          auctions.map(a => (
            <Link key={a.id} to={`/auction/${a.id}`} className="bg-white rounded shadow p-4 hover:shadow-md transition">
              <div className="text-lg font-medium">{a.item_name}</div>
              <div className="text-sm text-gray-600 line-clamp-2">{a.description}</div>
              <div className="mt-2 text-sm">
                Status: <span className="font-medium">{a.status}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Starts: {new Date(a.start_time).toLocaleString()} • Ends: {new Date(a.end_time).toLocaleString()}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
