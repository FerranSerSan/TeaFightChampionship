export interface Fighter {
  id: string;
  name: string;
  nickname: string | null;
  age: number;
  height: number;
  weight: number;
  image: string | null;
  champion?: boolean;
}