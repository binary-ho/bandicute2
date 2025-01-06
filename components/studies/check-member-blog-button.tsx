import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CheckMemberBlogButtonProps {
  memberId: string
}

export function CheckMemberBlogButton({ memberId }: CheckMemberBlogButtonProps) {
  const { toast } = useToast()

  const handleClick = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/members/${memberId}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("블로그 확인에 실패했습니다.")
      }

      toast({
        title: "블로그 확인 완료",
        description: "블로그 포스트를 확인했습니다.",
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
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
    >
      <RefreshCw className="h-4 w-4" />
    </Button>
  )
}
