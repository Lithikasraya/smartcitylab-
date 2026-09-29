export interface Submission {
  id: string;
  studentId: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
}