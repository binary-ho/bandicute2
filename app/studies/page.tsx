import { StudyList } from '@/components/studies/study-list';
import { CreateStudyButton } from '@/components/studies/create-study-button';

export default function StudiesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            스터디
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            블로그 요약을 공유할 스터디 목록입니다.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <CreateStudyButton />
        </div>
      </div>
      <StudyList />
    </div>
  );
}
