import React, { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.username.trim().length < 3) {
      return setError("Username must be at least 3 characters.");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setSubmitting(true);
    try {
      await signup(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="surface-card">
        <h3 className="text-center mb-1">Join Circle</h3>
        <p className="text-muted text-center mb-4">Create an account to start posting.</p>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="jane_doe"
              required
              minLength={3}
              maxLength={30}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="jane@example.com"
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </Form.Group>

          <Button type="submit" className="btn-brand w-100" disabled={submitting}>
            {submitting ? <Spinner size="sm" animation="border" /> : "Create account"}
          </Button>
        </Form>

        <p className="text-center text-muted mt-4 mb-0">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
