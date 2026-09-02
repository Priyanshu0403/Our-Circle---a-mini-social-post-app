import React, { useState } from "react";
import { Spinner, Form, Button } from "react-bootstrap";
import { Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function CommentSection({ loading, comments, onAddComment }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || posting) return;
    setPosting(true);
    try {
      await onAddComment(text.trim());
      setText("");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mt-3">
      {loading ? (
        <div className="d-flex justify-content-center py-3">
          <Spinner size="sm" animation="border" style={{ color: "var(--brand)" }} />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-muted small mb-3">No comments yet. Be the first to say something.</p>
      ) : (
        comments.map((c) => (
          <div className="comment-row" key={c._id}>
            <div className="avatar-circle sm">{c.username.charAt(0).toUpperCase()}</div>
            <div className="comment-bubble">
              <span className="comment-username">{c.username}</span>
              {c.text}
            </div>
          </div>
        ))
      )}

      {user && (
        <Form onSubmit={handleSubmit} className="d-flex gap-2 align-items-center mt-2">
          <div className="avatar-circle sm">{user.username.charAt(0).toUpperCase()}</div>
          <Form.Control
            size="sm"
            placeholder="Write a comment..."
            value={text}
            maxLength={500}
            onChange={(e) => setText(e.target.value)}
            disabled={posting}
          />
          <Button
            type="submit"
            size="sm"
            className="btn-brand d-flex align-items-center justify-content-center"
            disabled={!text.trim() || posting}
            style={{ width: 36, height: 32, padding: 0 }}
          >
            {posting ? <Spinner size="sm" animation="border" /> : <Send size={15} />}
          </Button>
        </Form>
      )}
    </div>
  );
}
