import React, { useEffect, useState } from "react";
import { fetchInvoices } from "../api/payments";
import PaymentModal from "./PaymentModal";

interface Invoice {
  id: number;
  total_amount: number;
  status: string;
  due_date: string;
}

const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selected, setSelected] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchInvoices().then(setInvoices);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Your Invoices</h2>
      <ul className="space-y-2">
        {invoices.map((inv) => (
          <li key={inv.id} className="flex justify-between p-2 border rounded">
            <div>
              <p>Invoice #{inv.id}</p>
              <p>Amount: KES {inv.total_amount}</p>
              <p>Status: {inv.status}</p>
            </div>
            <button
              onClick={() => setSelected(inv)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Pay
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <PaymentModal invoice={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default InvoiceList;
