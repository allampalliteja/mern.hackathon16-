import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

function MyDealsPage() {
  const [deals, setDeals] = useState([]);
  const { token } = useAuth();
  const [editingDeal, setEditingDeal] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount: "",
    location: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const fetchMyDeals = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const { data } = await axios.get("/api/deals/my-deals", config);
        setDeals(data);
      } catch (error) {
        console.error("Error fetching deals:", error);
      }
    };

    if (token) fetchMyDeals();
  }, [token]);

  // ✅ Handle Edit Button Click
  const handleEdit = (deal) => {
    setEditingDeal(deal._id);
    setFormData({
      title: deal.title,
      description: deal.description,
      discount: deal.discount,
      location: deal.location,
      startDate: deal.startDate.split("T")[0], // Format date
      endDate: deal.endDate.split("T")[0],
    });
  };

  // ✅ Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle Update
  const handleUpdate = async (id) => {
    try {
      const config = {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      };

      const { data } = await axios.put(`/api/deals/${id}`, formData, config);
      setDeals(deals.map((deal) => (deal._id === id ? data : deal))); // Update state
      setEditingDeal(null); // Exit edit mode
    } catch (error) {
      console.error("Error updating deal:", error);
    }
  };

  // ✅ Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.delete(`/api/deals/${id}`, config);
      setDeals(deals.filter((deal) => deal._id !== id)); // Remove from state
    } catch (error) {
      console.error("Error deleting deal:", error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Deals</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.length > 0 ? (
          deals.map((deal) => (
            <div key={deal._id} className="border p-4 rounded-lg shadow-md bg-white">
              {editingDeal === deal._id ? (
                <div>
                  {/* Edit Form */}
                  <input type="text" name="title" value={formData.title} onChange={handleChange} className="border p-2 w-full mb-2" />
                  <textarea name="description" value={formData.description} onChange={handleChange} className="border p-2 w-full mb-2" />
                  <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="border p-2 w-full mb-2" />
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="border p-2 w-full mb-2" />
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="border p-2 w-full mb-2" />
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="border p-2 w-full mb-2" />

                  <button onClick={() => handleUpdate(deal._id)} className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2">Save</button>
                  <button onClick={() => setEditingDeal(null)} className="bg-gray-500 text-white px-4 py-2 rounded-md">Cancel</button>
                </div>
              ) : (
                <div>
                  {/* Deal Details */}
                  <h2 className="text-xl font-bold">{deal.title}</h2>
                  <p className="text-gray-700">{deal.description}</p>
                  <p className="text-green-500 font-bold">{deal.discount}% Off</p>
                  <p className="text-gray-500">📍 {deal.location}</p>
                  <p className="text-gray-500">📅 {new Date(deal.startDate).toLocaleDateString()} - {new Date(deal.endDate).toLocaleDateString()}</p>

                  {/* Action Buttons */}
                  <button onClick={() => handleEdit(deal)} className="bg-yellow-500 text-white px-4 py-2 rounded-md mr-2 mt-4">Edit</button>
                  <button onClick={() => handleDelete(deal._id)} className="bg-red-500 text-white px-4 py-2 rounded-md mt-4">Delete</button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No deals found.</p>
        )}
      </div>
    </div>
  );
}

export default MyDealsPage;
