import { Fighter } from '../core/models/fighter.model';

export const FIGHTERS: Fighter[] = [
  {
    id: 'f1',
    name: 'Dani',
    nickname: 'Filete',
    age: 20,
    height: 1,
    weight: 1,
    image: '/assets/fighters/dani.png'
  },
  {
    id: 'f2',
    name: 'Arnau',
    nickname: 'Pocoyó',
    age: 19,
    height: 1.67,
    weight: 62,
    image: '/assets/fighters/arnau.png'
  },
  {
    id: 'f3',
    name: 'Diego',
    nickname: 'El Mismísimo Diablo',
    age: 17,
    height: 1.80,
    weight: 70,
    image: '/assets/fighters/diego.png',
    champion: true
  },
  {
    id: 'f4',
    name: 'Aitor',
    nickname: null,
    age: 15,
    height: 1.89,
    weight: 79,
    image: '/assets/fighters/aitor.png'
  },
  {
    id: 'f5',
    name: 'Jose',
    nickname: null,
    age: 18,
    height: 1.82,
    weight: 77,
    image: '/assets/fighters/jose.png'
  }
];
