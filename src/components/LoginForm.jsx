import { useState } from "react";
import axios from "axios";

function LoginForm({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const { token, role } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      setUser({ token, role });
    } catch (err) {
      setError("Login failed. Check credentials.");
    }
  };

  return (
    <form onSubmit={login} className="max-w-sm mx-auto p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-2 p-2 border" required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-2 p-2 border" required />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 mt-2">Login</button>
    </form>
  );
}

export default LoginForm;
