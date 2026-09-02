import React from "react";
import { Container, Navbar, Nav, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavbarComp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Navbar className="top-nav" expand="sm">
      <Container className="page-container py-0" style={{ maxWidth: 560 }}>
        <Navbar.Brand as={Link} to="/">
          Our Circle
        </Navbar.Brand>
        <Nav className="ms-auto d-flex flex-row align-items-center gap-2">
          {user ? (
            <>
              <Nav.Link as={Link} to="/create">
                New Post
              </Nav.Link>
              <div className="avatar-circle sm" title={user.username}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <Button variant="link" className="nav-link" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Nav.Link as={Link} to="/login">
                Log in
              </Nav.Link>
              <Link to="/signup">
                <Button className="btn-brand btn-sm">Sign up</Button>
              </Link>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}
