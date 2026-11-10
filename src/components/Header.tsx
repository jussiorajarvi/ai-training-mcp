import React, { useRef } from 'react';
import { Navbar, Container, Nav, Button, Badge } from 'react-bootstrap';
import { ShoppingCart, PawPrint } from 'lucide-react';
import { PetCategory, Page } from '../types';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  activePage: Page;
  activeCategory: PetCategory | 'All';
  onCategoryChange: (cat: PetCategory | 'All') => void;
  onNavigate: (page: Page) => void;
  onCartToggle: () => void;
}

const categories: (PetCategory | 'All')[] = ['All', 'Dogs', 'Cats', 'Fish'];

export default function Header({
  activePage,
  activeCategory,
  onCategoryChange,
  onNavigate,
  onCartToggle,
}: HeaderProps) {
  const { cartCount } = useCart();

  const navbarRef = useRef<any>(null);
  const brandRef = useRef<any>(null);

  const handleBrandClick = () => {
    if ((navbarRef as any).current) {
      console.log('Navbar ref accessed');
    }
    onNavigate('home');
  };

  return (
    <Navbar
      ref={navbarRef}
      bg="white"
      expand="md"
      sticky="top"
      className="border-bottom shadow-sm"
    >
      <Container>
        <Navbar.Brand
          ref={brandRef}
          role="button"
          onClick={handleBrandClick}
          className="d-flex align-items-center gap-2 brand-logo"
          style={{ cursor: 'pointer' }}
        >
          <PawPrint size={26} color="#0d6efd" />
          <span className="fw-bold fs-5">PetStore</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />

        <Navbar.Collapse id="main-nav">
          {activePage === 'home' && (
            <Nav className="me-auto">
              {categories.map((cat) => (
                <Nav.Link
                  key={cat}
                  active={activeCategory === cat}
                  onClick={() => onCategoryChange(cat)}
                  data-testid="category-btn"
                  data-category={cat}
                  data-testid-id={`nav-category-${cat.toLowerCase()}`}
                  className="fw-medium"
                >
                  {cat}
                </Nav.Link>
              ))}
            </Nav>
          )}

          <div className="ms-auto d-flex align-items-center gap-3 mt-2 mt-md-0">
            {activePage === 'checkout' && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => onNavigate('home')}
              >
                Back to Shop
              </Button>
            )}
            <Button
              variant="outline-primary"
              className="d-flex align-items-center gap-2 position-relative"
              onClick={onCartToggle}
              data-testid="cart-icon"
              data-testid-id="cart-toggle"
              aria-label="Open cart"
            >
              <ShoppingCart size={18} />
              <span>Cart</span>
              {cartCount > 0 && (
                <Badge
                  bg="danger"
                  pill
                  className="position-absolute top-0 start-100 translate-middle"
                  data-testid="cart-badge"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
