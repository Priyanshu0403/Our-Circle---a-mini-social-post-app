import React, { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import CommentSection from "./CommentSection";
import formatTimeAgo from "../utils/formatTimeAgo";

export default function PostCard({ post }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [likesCount, setLikesCount] = useState(post.likesCount ?? post.likes?.length ?? 0);
  const [liked, setLiked] = useState(
    !!user && (post.likes || []).some((l) => String(l.user) === String(user.id))
  );
  const [likeBusy, setLikeBusy] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount ?? post.comments?.length ?? 0);

  const handleLike = async () => {
    if (!user) return navigate("/login");
    if (likeBusy) return;
    setLikeBusy(true);

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((c) => c + (nextLiked ? 1 : -1));

    try {
      const res = await api.post(`/posts/${post._id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      setLiked(!nextLiked);
      setLikesCount((c) => c + (nextLiked ? -1 : 1));
    } finally {
      setLikeBusy(false);
    }
  };

  const handleToggleComments = async () => {
    const next = !showComments;
    setShowComments(next);

    if (next && !commentsLoaded) {
      setCommentsLoading(true);
      try {
        const res = await api.get(`/posts/${post._id}`);
        setComments(res.data.post.comments || []);
        setCommentsLoaded(true);
      } catch (err) {
      } finally {
        setCommentsLoading(false);
      }
    }
  };

  const handleAddComment = async (text) => {
    const res = await api.post(`/posts/${post._id}/comment`, { text });
    setComments(res.data.comments || []);
    setCommentsCount(res.data.commentsCount);
    setCommentsLoaded(true);
  };

  return (
    <article className="post-card">
      <div className="post-header">
        <div className="avatar-circle">{post.username.charAt(0).toUpperCase()}</div>
        <div>
          <div className="post-username">{post.username}</div>
          <div className="post-timestamp">{formatTimeAgo(post.createdAt)}</div>
        </div>
      </div>

      {post.text && <p className="post-text">{post.text}</p>}
      {post.image && <img className="post-image" src={post.image} alt="" loading="lazy" />}

      <div className="post-actions">
        <button
          className={`action-btn ${liked ? "liked" : ""}`}
          onClick={handleLike}
          aria-label={liked ? "Unlike post" : "Like post"}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
          {likesCount}
        </button>
        <button className="action-btn" onClick={handleToggleComments} aria-label="Toggle comments">
          <MessageCircle size={18} />
          {commentsCount}
        </button>
      </div>

      {showComments && (
        <CommentSection loading={commentsLoading} comments={comments} onAddComment={handleAddComment} />
      )}
    </article>
  );
}
