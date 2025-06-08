import React, { useState, useEffect } from "react";
import { initiateSTKPush } from "../api/payments";
import { io, Socket } from "socket.io-client";

interface Props {
  invoice: { id: number; total_amount: number };
  onClose: () => void;
}

const PaymentModal: React.FC<Props> = ({ invoice, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState("IDLE");
  const [socket, setSocket] = useState<Socket | null>(null);

  const handlePay = async () => {
    setStatus("PROCESSING");
    try {
      await initiateSTKPush(invoice.id, phoneNumber);

      const sock = io("http://localhost:5000");
      setSocket(sock);

      sock.emit("joinInvoiceRoom", invoice.id);

      sock.on("paymentUpdate", (data) => {
        if (data.invoiceId === invoice.id) {
          setStatus(data.status);
          sock.disconnect();
        }
      });
    } catch (error) {
      console.error("Payment error:", error);
      setStatus("FAILED");
    }
  };

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white p-6 rounded w-full max-w-md">
        <h2 className="text-xl font-bold">Pay Invoice #{invoice.id}</h2>
        <p>Amount: KES {invoice.total_amount}</p>

        {(status === "IDLE" || status === "FAILED") && (
          <>
            <input
              type="text"
              placeholder="2547XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border p-2 my-4"
            />
            <button
              onClick={handlePay}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Pay Now
            </button>
          </>
        )}

        {status === "PROCESSING" && <p>STK Push sent. Waiting for payment...</p>}
        {status === "PAID" && <p className="text-green-600">✅ Payment successful!</p>}
        {status === "FAILED" && <p className="text-red-600">❌ Payment failed.</p>}

        <button onClick={onClose} className="mt-4 underline text-gray-600 text-sm">
          Close
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
