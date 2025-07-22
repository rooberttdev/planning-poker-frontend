export interface Participant {
  name: string;
  hasVoted?: boolean;
}

export interface Task {
  title: string;
  description?: string;
  votes: Map<string, number>;
  revealed: boolean;
}

export interface Room {
  id: string;
  moderator: string;
  participants: Set<string>;
  currentTask?: Task;
  name?: string;
}

export interface VoteResult {
  participant: string;
  value: number;
}
