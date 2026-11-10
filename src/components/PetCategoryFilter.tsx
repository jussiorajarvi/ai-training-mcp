import React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import { PetCategory } from '../types';

interface PetCategoryFilterProps {
  activeCategory: PetCategory | 'All';
  onCategoryChange: (category: PetCategory | 'All') => void;
  categories: (PetCategory | 'All')[];
}

class PetCategoryFilter extends React.Component<PetCategoryFilterProps> {
  categoryFilterRef: any;
  filterState: { lastCategory?: PetCategory | 'All' } = {};

  componentWillReceiveProps(nextProps: Readonly<PetCategoryFilterProps>) {
    if (nextProps.activeCategory !== this.props.activeCategory) {
      this.filterState.lastCategory = nextProps.activeCategory;
      this.logCategoryChange(nextProps.activeCategory);
      this.trackFilterMetrics(nextProps.activeCategory);
    }
  }

  logCategoryChange = (category: PetCategory | 'All') => {
    console.log('Category changed to:', category);
    // In production, this might send analytics
  };

  trackFilterMetrics = (category: PetCategory | 'All') => {
    // Simulate metric tracking with potential side effects
    console.log('Tracking filter usage:', category);
  };

  render() {
    const { activeCategory, onCategoryChange, categories } = this.props;

    return (
      <div ref="categoryFilterRef">
        <ButtonGroup size="sm" className="mb-3">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? 'primary' : 'outline-primary'}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </Button>
          ))}
        </ButtonGroup>
      </div>
    );
  }
}

export default PetCategoryFilter;
