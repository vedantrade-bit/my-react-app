import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

function Signup() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const [serverMsg, setServerMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passwordValue = watch("password", "");

  // Password Strength Indicator (Exp 2)
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 25, label: "Weak", color: "#ef4444" };
    if (score === 2 || score === 3) return { score: 65, label: "Medium", color: "#f59e0b" };
    return { score: 100, label: "Strong", color: "#10b981" };
  };

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data) => {
    setLoading(true);
    setServerMsg({ text: "", type: "" });

    try {
      const response = await axios.post("http://localhost:5000/api/users/register", {
        name: data.name,
        email: data.email,
        password: data.password
      });

      setServerMsg({
        text: response.data.message || "Registration successful! Redirecting to login...",
        type: "success"
      });

      // Also store in localStorage as reference in manual
      localStorage.setItem("user_" + data.email, JSON.stringify({ name: data.name, email: data.email }));

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      const errorMsg = error.response?.data?.message || "Registration failed. Server may be offline.";
      setServerMsg({ text: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Register for Expense Tracker</p>
        </div>

        {serverMsg.text && (
          <div className={`alert-box ${serverMsg.type}`}>
            {serverMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="e.g. john@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Please enter a valid email"
                }
              })}
            />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
            />
            {errors.password && <span className="field-error">{errors.password.message}</span>}

            {/* Password Strength Indicator (Exp 2) */}
            {passwordValue && (
              <div className="password-meter-wrap">
                <div className="meter-bar-track">
                  <div
                    className="meter-bar-fill"
                    style={{ width: `${strength.score}%`, backgroundColor: strength.color }}
                  ></div>
                </div>
                <span className="strength-label" style={{ color: strength.color }}>
                  Strength: {strength.label}
                </span>
              </div>
            )}
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
          <p><Link to="/">← Back to Home</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;