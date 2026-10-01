import { redirect } from 'next/navigation';

export default function StudentFeedRedirect() {
  redirect('/student/quests');
}
