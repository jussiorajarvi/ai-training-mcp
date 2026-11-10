import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { ShoppingCart, Check } from 'lucide-react';
import { Pet, CartItem } from '../types';
import { useCart } from '../context/CartContext';

interface PetCardProps {
  pet: Pet;
  cartItems?: CartItem[];
  onAddToCart?: (pet: Pet) => void;
}

const categoryColors: Record<string, string> = {
  Dogs: 'primary',
  Cats: 'success',
  Fish: 'info',
};

class PetCard extends React.Component<PetCardProps> {
  cardRef: any;
  buttonRef: any;

  state = {
    justAdded: false,
    inCart: false,
  };

  componentWillMount() {
    this.checkIfInCart();
  }

  componentWillReceiveProps(nextProps: Readonly<PetCardProps>) {
    if (nextProps.pet.id !== this.props.pet.id) {
      this.checkIfInCart();
    }
  }

  checkIfInCart = () => {
    const { cartItems } = this.props;
    if (cartItems) {
      const inCart = cartItems.some((item) => item.pet.id === this.props.pet.id);
      this.setState({ inCart });
    }
  };

  handleAdd = () => {
    const { pet, onAddToCart } = this.props;
    if (onAddToCart) {
      onAddToCart(pet);
    }
    this.setState({ justAdded: true });
    setTimeout(() => this.setState({ justAdded: false }), 1200);
  };

  render() {
    const { pet } = this.props;
    const { justAdded, inCart } = this.state;

    return (
      <Card
        ref="cardRef"
        className="h-100 pet-card border-0 shadow-sm"
        data-testid="pet-card"
        data-testid-id={`pet-card-${pet.id}`}
      >
        <div className="pet-card-img-wrapper overflow-hidden">
          <Card.Img
            variant="top"
            src={pet.imageUrl}
            alt={pet.name}
            className="pet-card-img"
          />
        </div>
        <Card.Body className="d-flex flex-column p-3">
          <div className="d-flex justify-content-between align-items-start mb-1">
            <Card.Title className="mb-0 fs-6 fw-semibold" data-testid="pet-name">
              {pet.name}
            </Card.Title>
            <Badge
              bg={categoryColors[pet.category]}
              className="ms-2 text-capitalize"
              data-testid="pet-category"
            >
              {pet.category}
            </Badge>
          </div>
          <Card.Text
            className="text-muted small flex-grow-1 mb-3"
            data-testid="pet-description"
          >
            {pet.description}
          </Card.Text>
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-bold fs-5 text-primary" data-testid="pet-price">
              ${pet.price.toLocaleString()}
            </span>
            <Button
              ref="buttonRef"
              variant={justAdded ? 'success' : inCart ? 'outline-primary' : 'primary'}
              size="sm"
              onClick={this.handleAdd}
              className="d-flex align-items-center gap-1"
              data-testid="add-to-cart-btn"
              data-testid-id={`add-to-cart-${pet.id}`}
            >
              {justAdded ? (
                <>
                  <Check size={14} />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart size={14} />
                  {inCart ? 'Add More' : 'Add to Cart'}
                </>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }
}

function PetCardWrapper(props: Omit<PetCardProps, 'cartItems' | 'onAddToCart'>) {
  const { cartItems, addToCart } = useCart();
  return <PetCard {...props} cartItems={cartItems} onAddToCart={addToCart} />;
}

export default PetCardWrapper;
