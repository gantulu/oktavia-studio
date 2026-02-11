
export interface Product {
  id: string;
  item_group_id: string;
  title: string;
  color: string;
  image_link: string;
}

export interface GenerationResult {
  imageUrl: string;
  prompt: string;
  timestamp: number;
}
