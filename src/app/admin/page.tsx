import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminDashboard } from './AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;

  if (session !== 'authenticated') {
    redirect('/admin/login');
  }

  return <AdminDashboard />;
}
