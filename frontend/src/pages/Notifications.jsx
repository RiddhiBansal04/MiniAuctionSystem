import { useEffect, useState } from "react";
import api from "../api";

export default function Notifications() {
  const [notes, setNotes] = useState([]);

  async function load() {
    const res = await api.get("/notifications");
    setNotes(res.data || []);
  }

  async function markRead(id) {
    await api.post(`/notifications/${id}/read`);
    await load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      <div className="bg-white rounded shadow divide-y">
        {notes.length === 0 ? (
          <div className="p-4 text-gray-600">No notifications.</div>
        ) : notes.map(n => (
          <div key={n.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{n.message}</div>
              <div className="text-xs text-gray-500">
                {new Date(n.created_at || Date.now()).toLocaleString()}
                {!n.read && <span className="ml-2 inline-block text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">new</span>}
              </div>
            </div>
            {!n.read && (
              <button onClick={() => markRead(n.id)} className="text-sm bg-green-600 text-white px-3 py-1 rounded">
                Mark read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
