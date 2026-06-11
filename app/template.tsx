import { PageTransitionWrapper } from "@/components/animations/PageTransitionWrapper";

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransitionWrapper>{children}</PageTransitionWrapper>;
}
