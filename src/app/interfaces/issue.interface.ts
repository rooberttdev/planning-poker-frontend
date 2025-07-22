export interface Issue {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'voting' | 'completed';
  votes?: { [participant: string]: number };
  result?: number;
  createdAt: Date;
}

export interface IssueVoteResult {
  issueId: string;
  votes: { participant: string; value: number }[];
  average: number;
  result: number;
  agreement: 'perfect' | 'good' | 'fair' | 'poor';
}
