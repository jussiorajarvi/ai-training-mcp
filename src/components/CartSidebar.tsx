import React, { useRef } from 'react';
import { Modal, Button, ListGroup, Badge } from 'react-bootstrap';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Page } from '../types';

interface CartSidebarProps {
  show: boolean;
  onHide: () => void;
  onNavigate: (page: Page) => void;
}

export default function CartSidebar({
  show,
  onHide,
  onNavigate,
}: CartSidebarProps) {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } =
    useCart();

  const sidebarRef = useRef<any>(null);
  const quantityRefs: { [key: string]: any } = {};

  const trackQuantity = (petId: string) => {
    if (quantityRefs[petId]) {
      console.log('Quantity for', petId, ':', quantityRefs[petId]);
    }
  };

  const handleCheckout = () => {
    onHide();
    onNavigate('checkout');
  };

  return (
    <Modal
      ref={sidebarRef}
      show={show}
      onHide={onHide}
      dialogClassName="modal-fullscreen-sm-down"
      data-testid="cart-sidebar"
    >
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title className="d-flex align-items-center gap-2">
          <ShoppingBag size={20} />
          Cart
          {cartCount > 0 && (
            <Badge bg="primary" pill>
              {cartCount}
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="d-flex flex-column p-0">
        {cartItems.length === 0 ? (
          <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted p-4">
            <ShoppingBag size={48} strokeWidth={1} className="mb-3 opacity-50" />
            <p className="mb-0">Your cart is empty</p>
            <p className="small">Add some pets to get started!</p>
          </div>
        ) : (
          <>
            <ListGroup variant="flush" className="flex-grow-1 overflow-auto">
              {cartItems.map((item) => (
                <ListGroup.Item
                  key={item.pet.id}
                  className="px-3 py-3"
                  data-testid="cart-item"
                  data-testid-id={`cart-item-${item.pet.id}`}
                >
                  <div className="d-flex gap-3 align-items-center">
                    <img
                      src={item.pet.imageUrl}
                      alt={item.pet.name}
                      width={56}
                      height={56}
                      className="rounded-2 object-fit-cover flex-shrink-0"
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1 min-w-0">
                      <div className="fw-medium text-truncate">{item.pet.name}</div>
                      <div className="text-muted small">${item.pet.price.toLocaleString()} each</div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="p-0 d-flex align-items-center justify-content-center"
                          style={{ width: 26, height: 26 }}
                          onClick={() =>
                            updateQuantity(item.pet.id, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </Button>
                        <span
                          ref={(el) => {
                            quantityRefs[item.pet.id] = el;
                            trackQuantity(item.pet.id);
                          }}
                          className="fw-medium"
                          style={{ minWidth: 20, textAlign: 'center' }}
                          data-testid={`qty-${item.pet.id}`}
                        >
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="p-0 d-flex align-items-center justify-content-center"
                          style={{ width: 26, height: 26 }}
                          onClick={() =>
                            updateQuantity(item.pet.id, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </Button>
                      </div>
                    </div>
                    <div className="d-flex flex-column align-items-end gap-2">
                      <span className="fw-semibold text-primary">
                        ${(item.pet.price * item.quantity).toLocaleString()}
                      </span>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-danger"
                        onClick={() => removeFromCart(item.pet.id)}
                        aria-label={`Remove ${item.pet.name}`}
                        data-testid="remove-from-cart-btn"
                        data-testid-id={`remove-${item.pet.id}`}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <div className="border-top p-3">
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-semibold fs-6">Total</span>
                <span
                  className="fw-bold fs-5 text-primary"
                  data-testid="cart-total"
                >
                  ${cartTotal.toLocaleString()}
                </span>
              </div>
              <Button
                variant="primary"
                className="w-100"
                onClick={handleCheckout}
                data-testid="checkout-btn"
                data-testid-id="checkout-button"
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
