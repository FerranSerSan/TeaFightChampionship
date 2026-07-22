export interface Fight {
  id: string;
  fighter1Id: string;
  fighter2Id: string;
  winnerId: string | null;
  method: string | null;
  round: number | null;
  fecha: string;
  lugar: string;
}