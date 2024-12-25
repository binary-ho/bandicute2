import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CheckBlogButtonProps {
  studyId: string
}

export function CheckBlogButton({ studyId }: CheckBlogButtonProps) {
  const { toast } = useToast()

  const handleClick = async () => {
    try {
      const response = await fetch(`/api/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studyId,
        }),
      })

      if (!response.ok) {
        throw new Error("블로그 확인에 실패했습니다.")
      }

      toast({
        title: "블로그 확인 완료",
        description: "스터디 멤버들의 블로그를 확인했습니다.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "블로그 확인 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button onClick={handleClick}>
      <RefreshCw className="mr-2 h-4 w-4" />
      블로그 확인
    </Button>
  )
}
