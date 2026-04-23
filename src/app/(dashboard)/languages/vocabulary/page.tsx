import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function VocabularyRedirect() {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) redirect("/login");
  
  const userLang = await prisma.userLanguage.findFirst({
    where: { userId }
  });
  
  if (!userLang) redirect("/languages");
  
  redirect(`/languages/${userLang.id}/vocabulary`);
}
