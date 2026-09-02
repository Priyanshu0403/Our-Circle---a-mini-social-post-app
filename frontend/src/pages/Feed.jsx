import React, { useCallback, useEffect, useRef, useState } from "react";
import { Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";

const PAGE_SIZE = 8;

export default function Feed() {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const sentinelRef = useRef(null);
  const loadingMoreRef = useRef(false); 

  const loadPage = useCallback(async (nextPage) => {
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    nextPage === 1 ? setLoading(true) : setLoadingMore(true);
    setError("");

    try {
      const res = await api.get("/posts", { params: { page: nextPage, limit: PAGE_SIZE } });
      setPosts((prev) => (nextPage === 1 ? res.data.posts : [...prev, ...res.data.posts]));
      setHasMore(res.data.hasMore);
      setPage(nextPage);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load the feed. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, []);

  // initial load
  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  // infinite scroll: observe a sentinel div and fetch the next page when it comes into view
  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMoreRef.current) {
          loadPage(page + 1);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, page, loadPage]);

  return (
    <div className="page-container">
      {user && (
        <Link
          to="/create"
          className="surface-card d-flex align-items-center gap-2 mb-3 text-decoration-none"
          style={{ padding: "12px 16px" }}
        >
          <div className="avatar-circle sm">{user.username.charAt(0).toUpperCase()}</div>
          <span className="text-muted flex-grow-1">What's on your mind?</span>
          <ImagePlus size={18} style={{ color: "var(--brand)" }} />
        </Link>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" style={{ color: "var(--brand)" }} />
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <h4>No posts yet</h4>
          <p>Be the first to share something with everyone.</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}

          <div ref={sentinelRef} />

          {loadingMore && (
            <div className="d-flex justify-content-center py-3">
              <Spinner size="sm" animation="border" style={{ color: "var(--brand)" }} />
            </div>
          )}
          {!hasMore && (
            <p className="text-center text-muted small py-3">You're all caught up.</p>
          )}
        </>
      )}
    </div>
  );
}
