import { SpaceSkeleton } from "@/components/space-landing/space-skeleton";

export default function Loading() {
  return <SpaceSkeleton tileCount={4} variant="domain" hasIntelligence />;
}
