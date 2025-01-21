import React, { useState } from "react";
import axios from "axios";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:8080/auth/login", {
        username,
        password,
      });
      const { token, userId } = response.data;
      localStorage.setItem("token", token); // Desa el token al navegador
      localStorage.setItem("userId", userId.toString());
      alert("Login successful!");
      window.location.href = "/dashboard"; // Redirigeix a la pàgina del dashboard
    } catch (err) {
        console.error(err);
      setError("Invalid username or password");
    }
  };

return (
    <div className="login-page">
      <div className="login-container">
        <h2>Welcome to StarRings</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
