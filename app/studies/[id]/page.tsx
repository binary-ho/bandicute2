import { StudyDetails } from '@/components/studies/study-details';
import { StudyMembers } from '@/components/studies/study-members';
import { AddMemberButton } from '@/components/studies/add-member-button';

interface StudyPageProps {
  params: {
    id: string;
  };
}

export default function StudyPage({ params }: StudyPageProps) {
  return (
    <div className="py-10">
      <StudyDetails studyId={params.id} />
      <div className="mt-10">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-xl font-semibold text-gray-900">스터디 멤버</h2>
            <p className="mt-2 text-sm text-gray-700">
              스터디에 참여하는 멤버 목록입니다.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <AddMemberButton studyId={params.id} />
          </div>
        </div>
        <StudyMembers studyId={params.id} />
      </div>
    </div>
  );
}
