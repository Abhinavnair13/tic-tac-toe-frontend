export interface GameState {
  board: number[];
  current_turn: number;
  turn_start_time: number;
  winner_id: string;
}
