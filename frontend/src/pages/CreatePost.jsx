import React, { useRef, useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ImagePlus, X } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const MAX_IMAGE_MB = 5;

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return setError("Please choose an image file.");
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      return setError(`Image must be smaller than ${MAX_IMAGE_MB}MB.`);
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!text.trim() && !imageFile) {
      return setError("Add some text, an image, or both.");
    }

    const formData = new FormData();
    if (text.trim()) formData.append("text", text.trim());
    if (imageFile) formData.append("image", imageFile);

    setSubmitting(true);
    try {
      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create the post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="surface-card">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="avatar-circle">{user.username.charAt(0).toUpperCase()}</div>
          <div className="post-username">{user.username}</div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="What's on your mind?"
              value={text}
              maxLength={2000}
              onChange={(e) => setText(e.target.value)}
              style={{ resize: "none" }}
            />
          </Form.Group>

          {imagePreview && (
            <div className="image-preview-wrap">
              <img src={imagePreview} alt="Selected preview" />
              <button type="button" className="image-preview-remove" onClick={removeImage} aria-label="Remove image">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mt-3">
            <Button
              type="button"
              variant="link"
              className="d-flex align-items-center gap-2 text-decoration-none"
              style={{ color: "var(--brand-dark)" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus size={20} />
              {imageFile ? "Change image" : "Add image"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              hidden
            />

            <Button type="submit" className="btn-brand" disabled={submitting}>
              {submitting ? <Spinner size="sm" animation="border" /> : "Post"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
