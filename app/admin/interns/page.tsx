import { redirect } from 'next/navigation';

export default function AdminInternsRedirect() {
  redirect('/admin/students');
}
