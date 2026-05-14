import { SpaceSkeleton } from "@/components/space-landing/space-skeleton";

export default function Loading() {
  return <SpaceSkeleton tileCount={0} hasDescription={false} hasIntelligence />;
}
