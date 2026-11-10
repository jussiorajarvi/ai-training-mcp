import { Container, Row, Col, Badge } from 'react-bootstrap';
import { pets } from '../data/pets';
import PetList from '../components/PetList';
import { PetCategory } from '../types';

interface HomePageProps {
  activeCategory: PetCategory | 'All';
}

const categoryDescriptions: Record<string, string> = {
  All: 'Browse our complete selection of lovable pets',
  Dogs: 'Find your perfect canine companion',
  Cats: 'Discover graceful and affectionate feline friends',
  Fish: 'Explore vibrant aquatic life for your home',
};

const categoryCounts = (category: PetCategory | 'All') =>
  category === 'All'
    ? pets.length
    : pets.filter((p) => p.category === category).length;

export default function HomePage({ activeCategory }: HomePageProps) {
  return (
    <main>
      <div className="hero-section py-5 mb-4">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h1 className="display-5 fw-bold mb-2">
                {activeCategory === 'All' ? 'Our Pets' : activeCategory}
              </h1>
              <p className="lead text-muted mb-0">
                {categoryDescriptions[activeCategory]}
              </p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <Badge bg="secondary" className="fs-6 px-3 py-2">
                {categoryCounts(activeCategory)}{' '}
                {categoryCounts(activeCategory) === 1 ? 'pet' : 'pets'} available
              </Badge>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="pb-5">
        <PetList pets={pets} activeCategory={activeCategory} />
      </Container>
    </main>
  );
}
