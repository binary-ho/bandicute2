import { StudyForm } from '@/components/study/study-form';

export default function CreateStudyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-10">
        <header>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            새 스터디 만들기
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            함께 공부할 스터디를 만들어보세요.
          </p>
        </header>
        <main>
          <div className="mt-10">
            <StudyForm />
          </div>
        </main>
      </div>
    </div>
  );
}
