import { useEffect, useState, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { socket } from "../socket";
import { AuthContext } from "../context/AuthContext";

export default function AuctionDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null); // { auction, highestBid, nextMinimum }
  const [amount, setAmount] = useState("");

  const isActive = useMemo(() => data?.auction?.status === "active", [data]);

  async function load() {
    const res = await api.get(`/auctions/${id}`);
    setData(res.data);
    setAmount(res.data?.nextMinimum || "");
  }

  useEffect(() => {
    load();
    // join auction room for live updates
    socket.emit("joinAuction", id);

    const onNewBid = (payload) => {
      if (payload.auctionId === id) {
        setData(d => d ? ({
          ...d,
          highestBid: payload.highestBid,
          nextMinimum: payload.nextMinimum
        }) : d);
      }
    };
    const onStatus = (payload) => {
      if (payload.auctionId === id) {
        setData(d => d ? ({ ...d, auction: { ...d.auction, status: payload.status } }) : d);
      }
    };

    socket.on("bid:new", onNewBid);
    socket.on("auction:status", onStatus);

    return () => {
      socket.emit("leaveAuction", id);
      socket.off("bid:new", onNewBid);
      socket.off("auction:status", onStatus);
    };
  }, [id]);

  async function placeBid(e) {
    e.preventDefault();
    if (!user) return alert("Please login to bid.");
    const val = Number(amount);
    if (!val || val < (data?.nextMinimum || 0)) {
      return alert(`Bid must be >= ${data?.nextMinimum}`);
    }
    try {
      await api.post(`/bids/${id}`, { bid_amount: val });
      // the socket event will update UI; still prefill next step:
      setAmount(val + data.auction.bid_increment);
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to bid");
    }
  }

  if (!data) return <div>Loading…</div>;

  const { auction, highestBid, nextMinimum } = data;

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <h1 className="text-2xl font-semibold">{auction.item_name}</h1>
        <p className="text-gray-700 mt-2">{auction.description}</p>
        <div className="mt-3 text-sm">
          Seller: <span className="font-medium">{auction.seller?.name || "—"}</span>
        </div>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>Starting: ₹{auction.starting_price}</div>
          <div>Increment: ₹{auction.bid_increment}</div>
          <div>Status: <span className="font-medium">{auction.status}</span></div>
          <div>Highest bid: <span className="font-semibold">₹{highestBid || 0}</span></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Starts: {new Date(auction.start_time).toLocaleString()} • Ends: {new Date(auction.end_time).toLocaleString()}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-medium">Place a bid</h2>
        {!isActive && <div className="text-sm text-red-600 mt-1">Auction is not active.</div>}
        <form onSubmit={placeBid} className="flex items-center gap-3 mt-3">
          <input
            type="number"
            className="border p-2 rounded w-40"
            value={amount}
            onChange={e=>setAmount(e.target.value)}
            min={nextMinimum || 0}
            step="1"
            disabled={!isActive}
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={!isActive}>
            Bid ≥ ₹{nextMinimum || 0}
          </button>
        </form>
      </div>
    </div>
  );
}
