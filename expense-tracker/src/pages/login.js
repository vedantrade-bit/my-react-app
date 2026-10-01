import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const [serverMsg, setServerMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setServerMsg({ text: "", type: "" });

    try {
      // Connect to MongoDB backend via Express (Exp 4 & 5)
      const apiBase = process.env.REACT_APP_API_URL || "";
      const response = await axios.post(`${apiBase}/api/users/login`, {
        email: data.email,
        password: data.password
      });

      if (response.data.success) {
        localStorage.setItem("currentUser", JSON.stringify(response.data.user));
        setServerMsg({ text: "Login successful! Redirecting...", type: "success" });
        setTimeout(() => {
          navigate("/expenses");
        }, 1200);
      }
    } catch (error) {
      // Fallback check in localStorage as demonstrated in manual Exp 4
      const localData = JSON.parse(localStorage.getItem(data.email));
      if (localData && localData.password === data.password) {
        localStorage.setItem("currentUser", JSON.stringify({ name: localData.name, email: data.email }));
        setServerMsg({ text: "Login successful (Local session)! Redirecting...", type: "success" });
        setTimeout(() => {
          navigate("/expenses");
        }, 1200);
      } else {
        const errorMsg = error.response?.data?.message || "Invalid email or password";
        setServerMsg({ text: errorMsg, type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to your Expense Tracker account</p>
        </div>

        {serverMsg.text && (
          <div className={`alert-box ${serverMsg.type}`}>
            {serverMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup">Sign Up here</Link></p>
          <p><Link to="/">← Back to Home</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;