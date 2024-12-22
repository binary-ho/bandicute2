import { ProfileForm } from '@/components/profile/profile-form';

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-10">
        <header>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            프로필 설정
          </h1>
        </header>
        <main>
          <div className="mt-10">
            <ProfileForm />
          </div>
        </main>
      </div>
    </div>
  );
}
