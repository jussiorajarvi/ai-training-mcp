export type PetCategory = 'Dogs' | 'Cats' | 'Fish';

export interface Pet {
  id: string;
  name: string;
  category: PetCategory;
  price: number;
  imageUrl: string;
  description: string;
}

export interface CartItem {
  pet: Pet;
  quantity: number;
}

export type Page = 'home' | 'checkout';
