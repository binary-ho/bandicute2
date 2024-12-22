'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroButton() {
  const { member } = useAuth();

  return (
    <Button asChild size="lg">
      {member ? (
        <Link href="/studies">
          스터디 만들기
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      ) : (
        <Link href="/auth/signin">
          시작하기
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      )}
    </Button>
  );
}
