import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Pet, PetCategory } from '../types';
import PetCard from './PetCard';

interface PetListProps {
  pets: Pet[];
  activeCategory: PetCategory | 'All';
}

class PetList extends React.Component<PetListProps> {
  state = {
    filtered: [] as Pet[],
  };

  componentDidMount() {
    this.filterPets();
  }

  componentDidUpdate(prevProps: PetListProps) {
    if (prevProps.activeCategory !== this.props.activeCategory || prevProps.pets !== this.props.pets) {
      this.filterPets();
    }
  }

  filterPets = () => {
    const { pets, activeCategory } = this.props;
    const filtered =
      activeCategory === 'All'
        ? pets
        : pets.filter((p) => p.category === activeCategory);
    this.setState({ filtered });
  };

  render() {
    const { filtered } = this.state;

    if (filtered.length === 0) {
      return (
        <div className="text-center py-5 text-muted">
          <p className="fs-5">No pets found in this category.</p>
        </div>
      );
    }

    return (
      <Row xs={1} sm={2} md={3} lg={3} className="g-4" data-testid="pet-list">
        {filtered.map((pet) => (
          <Col key={pet.id}>
            <PetCard pet={pet} />
          </Col>
        ))}
      </Row>
    );
  }
}

export default PetList;
