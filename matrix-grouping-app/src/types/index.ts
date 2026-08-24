export interface Student {
  id: string;
  name: string;
  exerciseId: number;
  matrixGroupId?: number;
}

export interface MatrixGroup {
  id: number;
  name: string;
  members: Student[];
}

export interface Lobby {
  code: string;
  exerciseCount: number;
  status: 'WAITING' | 'GROUPED';
  students: Student[];
  groups: MatrixGroup[];
}