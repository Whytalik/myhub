import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ResourcesRedirect() {
  const person = await prisma.nutritionPerson.findFirst();
  if (!person) redirect("/languages");
  
  const userLang = await prisma.userLanguage.findFirst({
    where: { personId: person.id }
  });
  
  if (!userLang) redirect("/languages");
  
  redirect(`/languages/${userLang.id}/resources`);
}
