import React from 'react';
import { Container, Row, Col, Card, ListGroup, Button, Alert } from 'react-bootstrap';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { CartItem, Page } from '../types';

interface CheckoutPageProps {
  onNavigate: (page: Page) => void;
  cartItems: CartItem[];
  cartTotal: number;
  onClearCart: () => void;
}

class CheckoutPage extends React.Component<CheckoutPageProps> {
  formRef: any;
  confirmButtonRef: any;

  state = {
    confirmed: false,
    validating: false,
  };

  validateCheckout = () => {
    if (this.formRef) {
      console.log('Validating form...');
    }
  };

  handleConfirm = () => {
    this.setState({ validating: true });
    setTimeout(() => {
      this.setState({ confirmed: true, validating: false });
      this.props.onClearCart();
    }, 500);
  };

  render() {
    const { confirmed, validating } = this.state;
    const { cartItems, cartTotal, onNavigate } = this.props;

    if (cartItems.length === 0 && !confirmed) {
      return (
        <Container className="py-5 text-center">
          <ShoppingBag size={64} strokeWidth={1} className="text-muted mb-3" />
          <h2 className="fw-bold mb-2">Your cart is empty</h2>
          <p className="text-muted mb-4">Add some pets before checking out.</p>
          <Button variant="primary" onClick={() => onNavigate('home')}>
            Browse Pets
          </Button>
        </Container>
      );
    }

    if (confirmed) {
      return (
        <Container className="py-5 text-center">
          <CheckCircle size={72} className="text-success mb-3" strokeWidth={1.5} />
          <h2 className="fw-bold mb-2">Order Confirmed!</h2>
          <p className="text-muted mb-4">
            Thank you for your purchase. Your new pets are on their way!
          </p>
          <Button variant="primary" onClick={() => onNavigate('home')}>
            Continue Shopping
          </Button>
        </Container>
      );
    }

    return (
      <Container className="py-5" ref={(el) => { this.formRef = el; }}>
        <h1 className="fw-bold mb-4" data-testid="checkout-heading">Checkout</h1>
        <Row className="g-4">
          <Col lg={8}>
            <Card className="border-0 shadow-sm" data-testid="order-summary">
            <Card.Header className="bg-white border-bottom fw-semibold py-3">
              Order Summary
            </Card.Header>
            <ListGroup variant="flush">
              {cartItems.map((item) => (
                <ListGroup.Item
                  key={item.pet.id}
                  className="px-4 py-3"
                  data-testid="checkout-item"
                  data-testid-id={`checkout-item-${item.pet.id}`}
                >
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={item.pet.imageUrl}
                      alt={item.pet.name}
                      width={60}
                      height={60}
                      className="rounded-2 flex-shrink-0"
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-medium">{item.pet.name}</div>
                      <div className="text-muted small">
                        {item.pet.category} &middot; Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="fw-semibold text-primary">
                      ${(item.pet.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">Price Details</h5>

              {cartItems.map((item) => (
                <div
                  key={item.pet.id}
                  className="d-flex justify-content-between mb-2 small"
                >
                  <span className="text-muted">
                    {item.pet.name} &times; {item.quantity}
                  </span>
                  <span>${(item.pet.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}

              <hr />

              <Alert variant="success" className="py-2 px-3 mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Total</span>
                  <span
                    className="fw-bold fs-5"
                    data-testid="checkout-total"
                  >
                    ${cartTotal.toLocaleString()}
                  </span>
                </div>
              </Alert>

              <Button
                ref={(el) => { this.confirmButtonRef = el; }}
                variant="primary"
                className="w-100"
                size="lg"
                onClick={this.handleConfirm}
                disabled={validating}
                data-testid="confirm-order"
                data-testid-id="confirm-order"
              >
                {validating ? 'Processing...' : 'Confirm Order'}
              </Button>

              <Button
                variant="link"
                className="w-100 mt-2 text-muted"
                onClick={() => onNavigate('home')}
                data-testid="back-to-shopping-btn"
              >
                Back to Shop
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    );
  }
}

export default CheckoutPage;
