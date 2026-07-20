import { prisma } from "@/lib/db/prisma";

async function analyzeAtoms() {
  const atoms = await prisma.task.findMany({
    where: {
      resistance: { not: null },
    },
    select: {
      id: true,
      title: true,
      resistance: true,
      parentId: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  console.log(`Total atoms: ${atoms.length}\n`);

  const actionVerbs = [
    "створити", "додати", "зробити", "написати", "перевірити", "підібрати",
    "скласти", "порахувати", "визначити", "описати", "провести", "впровадити",
    "дослідити", "розібрати", "вивчити", "прочитати", "купити", "змінити",
    "налаштувати", "підключити", "встановити", "запустити", "протестувати",
    "оптимізувати", "покращити", "організувати", "планувати", "відстежувати",
    "аналізувати", "порівняти", "оновити", "видалити", "перенести",
    "зберегти", "надіслати", "отримати", "знайти", "підготувати",
    "розробити", "реалізувати", "інтегрувати", "деплоїти", "задокументувати",
    "виправити", "усунути", "вирішити", "завершити", "закрити",
    "відкрити", "підключити", "зареєструвати", "авторизувати",
    "create", "add", "make", "write", "check", "build", "set up",
    "fix", "update", "delete", "remove", "test", "deploy", "review",
    "implement", "design", "develop", "integrate", "optimize",
    "improve", "analyze", "compare", "install", "configure",
  ];

  const problematicAtoms: { id: string; title: string; reason: string }[] = [];

  for (const atom of atoms) {
    const title = atom.title.toLowerCase().trim();
    const titleLower = title;

    // Перевіряємо чи починається з дієслова
    const startsWithVerb = actionVerbs.some((verb) =>
      titleLower.startsWith(verb) || titleLower.includes(verb)
    );

    // Перевіряємо проблемні патерни
    const isQuestion = title.includes("?") || titleLower.startsWith("як ") || titleLower.startsWith("що ") || titleLower.startsWith("чому ") || titleLower.startsWith("коли ") || titleLower.startsWith("де ");
    const isNoun = !startsWithVerb && !isQuestion;
    const isTopic = titleLower.startsWith("що таке ") || titleLower.startsWith("як ") || titleLower.startsWith("види ") || titleLower.startsWith("основи ") || titleLower.startsWith("правила ") || titleLower.startsWith("методи ");
    const isAbstract = titleLower.includes(" vs ") || titleLower.includes("і ") && !startsWithVerb;

    if (isQuestion || isTopic || isAbstract || (isNoun && !titleLower.includes("як ") && !titleLower.startsWith("дослідити") && !titleLower.startsWith("вивчити") && !titleLower.startsWith("розібрати"))) {
      problematicAtoms.push({
        id: atom.id,
        title: atom.title,
        reason: isQuestion ? "question" : isTopic ? "topic/noun" : isAbstract ? "comparison" : "noun phrase",
      });
    }
  }

  console.log(`Problematic atoms (not action-oriented): ${problematicAtoms.length}\n`);

  for (const atom of problematicAtoms.slice(0, 100)) {
    console.log(`  [${atom.reason}] ${atom.title}`);
  }

  if (problematicAtoms.length > 100) {
    console.log(`\n  ... and ${problematicAtoms.length - 100} more`);
  }

  await prisma.$disconnect();
}

analyzeAtoms().catch(console.error);
