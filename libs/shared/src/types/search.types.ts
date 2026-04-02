export interface SearchResultProduct {
  id: string;
  name: string;
  category: string;
  tags: string[];
  price: number;
  stock: number;
  rating: number;
  score: number;
  highlight: string;
}

export interface SearchCategory {
  name: string;
  count: number;
  products: SearchResultProduct[];
}

export interface SearchResponse {
  query: string;
  total: number;
  categories: SearchCategory[];
}
