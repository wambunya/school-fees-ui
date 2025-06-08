import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Update if different
});

export const initiateSTKPush = async (invoiceId: number, phoneNumber: string) => {
  const res = await API.post("/payments/stkpush", { invoiceId, phoneNumber });
  return res.data;
};
