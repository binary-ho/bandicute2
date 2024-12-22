import Image from "next/image";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">
          블로그 요약 협업 도구
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          팀원들의 블로그 포스팅을 자동으로 요약하고 GitHub를 통해 공유하세요.
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">주요 기능</h2>
            <ul className="text-left list-disc list-inside space-y-2">
              <li>Tistory 블로그 RSS 자동 파싱</li>
              <li>GPT를 활용한 포스트 요약</li>
              <li>GitHub PR 자동 생성</li>
              <li>스터디 그룹 관리</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
