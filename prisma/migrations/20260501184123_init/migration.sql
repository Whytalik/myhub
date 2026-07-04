CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

CREATE TYPE "SystemStatus" AS ENUM ('STABLE', 'CRISIS_SURVIVAL', 'CRISIS_STABILIZATION', 'CRISIS_RE_ENTRY');

CREATE TYPE "Goal" AS ENUM ('GAIN', 'MAINTAIN', 'LOSE');

CREATE TYPE "PriceSource" AS ENUM ('MANUAL', 'FETCHED');

CREATE TYPE "NutritionSource" AS ENUM ('MANUAL', 'OPENFOODFACTS', 'USDA');

CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'FAVORITE');

CREATE TYPE "ProductSource" AS ENUM ('MANUAL', 'IMPORTED', 'OPENFOODFACTS');

CREATE TYPE "ProductState" AS ENUM ('RAW', 'COOKED', 'PROCESSED');

CREATE TYPE "MealSlot" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

CREATE TYPE "PlanAdherence" AS ENUM ('PLANNED', 'FOLLOWED', 'DEVIATED');

CREATE TYPE "Priority" AS ENUM ('FIXED', 'FLEXIBLE', 'AUTO');

CREATE TYPE "TaskStatus" AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED');

CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

CREATE TYPE "LibraryItemType" AS ENUM ('BOOK', 'ARTICLE', 'VIDEO', 'COURSE', 'OTHER');

CREATE TYPE "LibraryItemStatus" AS ENUM ('WANT_TO_READ', 'READING', 'COMPLETED', 'DROPPED');

CREATE TYPE "WishlistStatus" AS ENUM ('IDEA', 'RESEARCHING', 'WISH', 'PLANNED', 'ORDERED', 'BOUGHT', 'GIFTED', 'ABANDONED', 'REPLACED', 'CANCELLED');

CREATE TYPE "LanguageSphere" AS ENUM ('VOCABULARY', 'LISTENING', 'READING', 'SPEAKING', 'WRITING');

CREATE TYPE "CefrLevel" AS ENUM ('A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2');

CREATE TYPE "SprintStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

CREATE TYPE "ObjectiveStatus" AS ENUM ('IN_PROGRESS', 'ACHIEVED', 'PARTIAL', 'FAILED', 'CANCELLED');

CREATE TYPE "TacticFrequency" AS ENUM ('DAILY', 'WEEKLY');

CREATE TYPE "Unit" AS ENUM ('GRAM', 'ML', 'PIECE', 'TBSP', 'TSP');

CREATE TYPE "PreparationMethod" AS ENUM ('RAW', 'BOILED', 'FRIED', 'BAKED', 'STEAMED', 'OTHER');

CREATE TYPE "IngredientInputState" AS ENUM ('RAW', 'COOKED');

CREATE TYPE "CartItemStatus" AS ENUM ('TO_BUY', 'IN_CART', 'BOUGHT', 'HAVE', 'SKIPPED');

CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

CREATE TYPE "AIDomain" AS ENUM ('OPERATIONS', 'HEALTH');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "privateTaskPasswordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "systemStatus" "SystemStatus" NOT NULL DEFAULT 'STABLE',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "NutritionPerson" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT,
    "goal" "Goal" NOT NULL DEFAULT 'MAINTAIN',
    "targetKcal" DOUBLE PRECISION DEFAULT 2000,
    "proteinPct" DOUBLE PRECISION DEFAULT 30,
    "fatPct" DOUBLE PRECISION DEFAULT 25,
    "carbsPct" DOUBLE PRECISION DEFAULT 45,
    "fiberGrams" DOUBLE PRECISION DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionPerson_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FoodProduct" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "caloriesPer100" DOUBLE PRECISION NOT NULL,
    "proteinPer100" DOUBLE PRECISION NOT NULL,
    "fatPer100" DOUBLE PRECISION NOT NULL,
    "carbsPer100" DOUBLE PRECISION NOT NULL,
    "fiberPer100" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "standardPackageAmount" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION DEFAULT 0,
    "priceSource" "PriceSource" NOT NULL DEFAULT 'MANUAL',
    "priceUpdatedAt" TIMESTAMP(3),
    "nutritionSource" "NutritionSource" NOT NULL DEFAULT 'MANUAL',
    "category" TEXT NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodProduct_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CookingMethod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coefficient" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CookingMethod_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Dish" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "servings" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dish_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DishIngredient" (
    "id" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "cookingMethodId" TEXT,
    "rawWeight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DishIngredient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DayTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DayTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DayTemplateEntry" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "mealSlot" "MealSlot" NOT NULL,
    "servings" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "priority" "Priority" NOT NULL DEFAULT 'FLEXIBLE',

    CONSTRAINT "DayTemplateEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WeekPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeekPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DayPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekPlanId" TEXT,
    "templateId" TEXT,
    "date" DATE NOT NULL,
    "adherence" "PlanAdherence" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DayPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DayPlanEntry" (
    "id" TEXT NOT NULL,
    "dayPlanId" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "mealSlot" "MealSlot" NOT NULL,
    "servings" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "priority" "Priority" NOT NULL DEFAULT 'FLEXIBLE',

    CONSTRAINT "DayPlanEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShoppingList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekPlanId" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShoppingListItem" (
    "id" TEXT NOT NULL,
    "shoppingListId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "unit" "Unit" NOT NULL DEFAULT 'GRAM',
    "checked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ShoppingListItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MealTemplateSlot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "goal" "Goal" NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL,
    "minProteinGrams" DOUBLE PRECISION,
    "maxPctOfDaily" DOUBLE PRECISION,
    "fiberPct" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MealTemplateSlot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MealSlotInstance" (
    "id" TEXT NOT NULL,
    "dayPlanId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "templateSlotId" UUID NOT NULL,
    "targetKcal" DOUBLE PRECISION NOT NULL,
    "targetFiberGrams" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealSlotInstance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DishEntry" (
    "id" TEXT NOT NULL,
    "mealSlotId" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "portionWeight" DOUBLE PRECISION NOT NULL,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "manualWeight" BOOLEAN NOT NULL DEFAULT false,
    "fitScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DishEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShoppingCart" (
    "id" TEXT NOT NULL,
    "weekPlanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingCart_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "requiredRawGrams" DOUBLE PRECISION NOT NULL,
    "availableGrams" DOUBLE PRECISION,
    "packagesCount" INTEGER,
    "totalCost" DOUBLE PRECISION,
    "status" "CartItemStatus" NOT NULL DEFAULT 'TO_BUY',
    "manualOverride" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LifeSphere" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LifeSphere_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "plannedDate" TIMESTAMP(3),
    "hasPlannedTime" BOOLEAN NOT NULL DEFAULT false,
    "plannedEndDate" TIMESTAMP(3),
    "hasPlannedEndTime" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TIMESTAMP(3),
    "hasDueTime" BOOLEAN NOT NULL DEFAULT false,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,
    "sphereId" TEXT,
    "projectId" TEXT,
    "completedAt" TIMESTAMP(3),
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DailyEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "sleepBedtime" TIMESTAMP(3),
    "sleepWakeup" TIMESTAMP(3),
    "sleepHours" DOUBLE PRECISION,
    "sleepQuality" INTEGER,
    "sleepNote" TEXT,
    "energy" INTEGER,
    "mood" INTEGER,
    "emotions" JSONB,
    "weight" DOUBLE PRECISION,
    "energyNote" TEXT,
    "eveningEnergy" INTEGER,
    "nutrition" INTEGER,
    "nutritionNote" TEXT,
    "morningRoutine" JSONB,
    "eveningRoutine" JSONB,
    "routineNote" TEXT,
    "winToday" TEXT,
    "improveTomorrow" TEXT,
    "gratitude" TEXT,
    "brainDump" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "standupBlockers" TEXT,
    "standupDone" TEXT,
    "standupPlan" TEXT,
    "recoveryRoutine" JSONB,
    "recoveryScore" DOUBLE PRECISION,

    CONSTRAINT "DailyEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Habit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "anchor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "celebration" TEXT,
    "reminderTime" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sphereId" TEXT,

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HabitCompletion" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HabitCompletion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LibraryItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "url" TEXT,
    "type" "LibraryItemType" NOT NULL DEFAULT 'BOOK',
    "status" "LibraryItemStatus" NOT NULL DEFAULT 'WANT_TO_READ',
    "rating" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "imageUrl" TEXT,
    "price" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'UAH',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "WishlistStatus" NOT NULL DEFAULT 'WISH',
    "category" TEXT,
    "tags" TEXT[],
    "necessity" INTEGER,
    "store" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserLanguage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "level" "CefrLevel" NOT NULL DEFAULT 'A0',
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLanguage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LanguageSphereProgress" (
    "id" TEXT NOT NULL,
    "userLanguageId" TEXT NOT NULL,
    "sphere" "LanguageSphere" NOT NULL,
    "mastery" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LanguageSphereProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VocabularyItem" (
    "id" TEXT NOT NULL,
    "userLanguageId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "context" TEXT,
    "notes" TEXT,
    "nextReview" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "repetition" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabularyItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ImmersionLog" (
    "id" TEXT NOT NULL,
    "userLanguageId" TEXT NOT NULL,
    "sphere" "LanguageSphere" NOT NULL,
    "duration" INTEGER NOT NULL,
    "note" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImmersionLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LanguageResource" (
    "id" TEXT NOT NULL,
    "userLanguageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "sphere" "LanguageSphere",
    "level" "CefrLevel",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LanguageResource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Vision" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnnualCompass" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "theme" TEXT,
    "wigs" TEXT,
    "focusAreas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnualCompass_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sphereId" TEXT,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Sprint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SprintStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sprint_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Objective" (
    "id" TEXT NOT NULL,
    "sprintId" TEXT NOT NULL,
    "sphereId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ObjectiveStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Objective_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KeyResult" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeyResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tactic" (
    "id" TEXT NOT NULL,
    "keyResultId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frequency" "TacticFrequency" NOT NULL DEFAULT 'WEEKLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tactic_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TacticCompletion" (
    "id" TEXT NOT NULL,
    "tacticId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TacticCompletion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SprintReview" (
    "id" TEXT NOT NULL,
    "sprintId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "score" DOUBLE PRECISION,
    "wins" TEXT,
    "challenges" TEXT,
    "adjustments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SprintReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AIChat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIChat_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AISuggestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" "AIDomain" NOT NULL DEFAULT 'HEALTH',
    "action" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AISuggestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AIUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

CREATE UNIQUE INDEX "NutritionPerson_userId_key" ON "NutritionPerson"("userId");

CREATE INDEX "FoodProduct_userId_idx" ON "FoodProduct"("userId");

CREATE UNIQUE INDEX "CookingMethod_name_key" ON "CookingMethod"("name");

CREATE UNIQUE INDEX "DishIngredient_dishId_productId_cookingMethodId_key" ON "DishIngredient"("dishId", "productId", "cookingMethodId");

CREATE UNIQUE INDEX "MealTemplateSlot_name_goal_key" ON "MealTemplateSlot"("name", "goal");

CREATE UNIQUE INDEX "MealSlotInstance_dayPlanId_personId_templateSlotId_key" ON "MealSlotInstance"("dayPlanId", "personId", "templateSlotId");

CREATE UNIQUE INDEX "ShoppingCart_weekPlanId_key" ON "ShoppingCart"("weekPlanId");

CREATE UNIQUE INDEX "CartItem_cartId_productId_key" ON "CartItem"("cartId", "productId");

CREATE UNIQUE INDEX "DailyEntry_userId_date_key" ON "DailyEntry"("userId", "date");

CREATE UNIQUE INDEX "HabitCompletion_habitId_date_key" ON "HabitCompletion"("habitId", "date");

CREATE UNIQUE INDEX "Language_name_key" ON "Language"("name");

CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

CREATE UNIQUE INDEX "UserLanguage_userId_languageId_key" ON "UserLanguage"("userId", "languageId");

CREATE UNIQUE INDEX "LanguageSphereProgress_userLanguageId_sphere_key" ON "LanguageSphereProgress"("userLanguageId", "sphere");

CREATE INDEX "VocabularyItem_nextReview_idx" ON "VocabularyItem"("nextReview");

CREATE UNIQUE INDEX "AnnualCompass_userId_year_key" ON "AnnualCompass"("userId", "year");

CREATE UNIQUE INDEX "TacticCompletion_tacticId_weekNumber_key" ON "TacticCompletion"("tacticId", "weekNumber");

CREATE INDEX "AIChat_userId_idx" ON "AIChat"("userId");

CREATE INDEX "AISuggestion_userId_idx" ON "AISuggestion"("userId");

CREATE INDEX "AISuggestion_userId_status_idx" ON "AISuggestion"("userId", "status");

CREATE INDEX "AIUsage_userId_idx" ON "AIUsage"("userId");

CREATE UNIQUE INDEX "AIUsage_userId_date_key" ON "AIUsage"("userId", "date");

ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NutritionPerson" ADD CONSTRAINT "NutritionPerson_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FoodProduct" ADD CONSTRAINT "FoodProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Dish" ADD CONSTRAINT "Dish_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DishIngredient" ADD CONSTRAINT "DishIngredient_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DishIngredient" ADD CONSTRAINT "DishIngredient_productId_fkey" FOREIGN KEY ("productId") REFERENCES "FoodProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DishIngredient" ADD CONSTRAINT "DishIngredient_cookingMethodId_fkey" FOREIGN KEY ("cookingMethodId") REFERENCES "CookingMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DayTemplate" ADD CONSTRAINT "DayTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DayTemplateEntry" ADD CONSTRAINT "DayTemplateEntry_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DayTemplateEntry" ADD CONSTRAINT "DayTemplateEntry_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DayTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WeekPlan" ADD CONSTRAINT "WeekPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DayPlan" ADD CONSTRAINT "DayPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DayPlan" ADD CONSTRAINT "DayPlan_weekPlanId_fkey" FOREIGN KEY ("weekPlanId") REFERENCES "WeekPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DayPlan" ADD CONSTRAINT "DayPlan_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DayTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DayPlanEntry" ADD CONSTRAINT "DayPlanEntry_dayPlanId_fkey" FOREIGN KEY ("dayPlanId") REFERENCES "DayPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DayPlanEntry" ADD CONSTRAINT "DayPlanEntry_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_weekPlanId_fkey" FOREIGN KEY ("weekPlanId") REFERENCES "WeekPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "FoodProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_shoppingListId_fkey" FOREIGN KEY ("shoppingListId") REFERENCES "ShoppingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MealSlotInstance" ADD CONSTRAINT "MealSlotInstance_dayPlanId_fkey" FOREIGN KEY ("dayPlanId") REFERENCES "DayPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MealSlotInstance" ADD CONSTRAINT "MealSlotInstance_personId_fkey" FOREIGN KEY ("personId") REFERENCES "NutritionPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MealSlotInstance" ADD CONSTRAINT "MealSlotInstance_templateSlotId_fkey" FOREIGN KEY ("templateSlotId") REFERENCES "MealTemplateSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DishEntry" ADD CONSTRAINT "DishEntry_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DishEntry" ADD CONSTRAINT "DishEntry_mealSlotId_fkey" FOREIGN KEY ("mealSlotId") REFERENCES "MealSlotInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShoppingCart" ADD CONSTRAINT "ShoppingCart_weekPlanId_fkey" FOREIGN KEY ("weekPlanId") REFERENCES "WeekPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "ShoppingCart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "FoodProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LifeSphere" ADD CONSTRAINT "LifeSphere_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Task" ADD CONSTRAINT "Task_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Task" ADD CONSTRAINT "Task_sphereId_fkey" FOREIGN KEY ("sphereId") REFERENCES "LifeSphere"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DailyEntry" ADD CONSTRAINT "DailyEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Habit" ADD CONSTRAINT "Habit_sphereId_fkey" FOREIGN KEY ("sphereId") REFERENCES "LifeSphere"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HabitCompletion" ADD CONSTRAINT "HabitCompletion_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LibraryItem" ADD CONSTRAINT "LibraryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserLanguage" ADD CONSTRAINT "UserLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "UserLanguage" ADD CONSTRAINT "UserLanguage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LanguageSphereProgress" ADD CONSTRAINT "LanguageSphereProgress_userLanguageId_fkey" FOREIGN KEY ("userLanguageId") REFERENCES "UserLanguage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VocabularyItem" ADD CONSTRAINT "VocabularyItem_userLanguageId_fkey" FOREIGN KEY ("userLanguageId") REFERENCES "UserLanguage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ImmersionLog" ADD CONSTRAINT "ImmersionLog_userLanguageId_fkey" FOREIGN KEY ("userLanguageId") REFERENCES "UserLanguage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LanguageResource" ADD CONSTRAINT "LanguageResource_userLanguageId_fkey" FOREIGN KEY ("userLanguageId") REFERENCES "UserLanguage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Vision" ADD CONSTRAINT "Vision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AnnualCompass" ADD CONSTRAINT "AnnualCompass_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_sphereId_fkey" FOREIGN KEY ("sphereId") REFERENCES "LifeSphere"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Objective" ADD CONSTRAINT "Objective_sphereId_fkey" FOREIGN KEY ("sphereId") REFERENCES "LifeSphere"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Objective" ADD CONSTRAINT "Objective_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "KeyResult" ADD CONSTRAINT "KeyResult_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Project" ADD CONSTRAINT "Project_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Tactic" ADD CONSTRAINT "Tactic_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "KeyResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TacticCompletion" ADD CONSTRAINT "TacticCompletion_tacticId_fkey" FOREIGN KEY ("tacticId") REFERENCES "Tactic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SprintReview" ADD CONSTRAINT "SprintReview_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AIChat" ADD CONSTRAINT "AIChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AISuggestion" ADD CONSTRAINT "AISuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AIUsage" ADD CONSTRAINT "AIUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
