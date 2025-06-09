import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/admin/payments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPayments(res.data);
      } catch (err) {
        console.error("Failed to fetch payments", err);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">🛠 Admin Dashboard</h1>
      <table className="mt-4 border w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2">Invoice ID</th>
            <th className="border px-2">Phone</th>
            <th className="border px-2">Amount</th>
            <th className="border px-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p._id}>
              <td className="border px-2">{p.invoiceId}</td>
              <td className="border px-2">{p.phoneNumber}</td>
              <td className="border px-2">{p.amount}</td>
              <td className="border px-2">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
