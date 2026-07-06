import { PROFILES } from "../data";
import { BODY_STATS, ACTIVITY_LABELS } from "../body-stats";
import { calculateScienceProfile } from "../profile-science";
import type { Profile } from "../types";

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-2.5 rounded-xl bg-white/[0.02]">
      <span className="text-label">{label}</span>
      <span className="font-mono text-sm text-zinc-100">{value}</span>
      {hint && <span className="text-caption">{hint}</span>}
    </div>
  );
}

function ProfileScienceCard({ profile }: { profile: Profile }) {
  const stats = BODY_STATS[profile.id];
  if (!stats) return null;

  const science = calculateScienceProfile(stats);
  const activityLabel = ACTIVITY_LABELS[stats.activityLevel];
  const goalLabel = stats.goal === "cut" ? "Дефіцит (жироспалення)" : "Профіцит (набір маси)";
  const adjustmentLabel =
    science.adjustmentPercent < 0
      ? `${science.adjustmentPercent}% від TDEE`
      : `+${science.adjustmentPercent}% від TDEE`;
  const bodyFatValue = `${stats.bodyFatPercent}%${stats.bodyFatEstimated ? " (оцінка)" : ""}`;

  const kcalDelta = profile.kcal - science.targetKcal;
  const kcalDeltaLabel =
    kcalDelta === 0
      ? "співпадає з науковим орієнтиром"
      : kcalDelta > 0
        ? `план на ${kcalDelta} ккал більший за науковий орієнтир`
        : `план на ${Math.abs(kcalDelta)} ккал менший за науковий орієнтир`;

  return (
    <div className="glass-card p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-panel-title">{profile.name}</span>
        <span className="text-caption">
          {goalLabel} · {activityLabel}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <StatTile label="Вага" value={`${stats.weightKg} кг`} />
        <StatTile label="Зріст" value={`${stats.heightCm} см`} />
        <StatTile label="Вік" value={`${stats.age}`} />
        <StatTile label="% жиру" value={bodyFatValue} />
        <StatTile label="Обезжирена маса" value={`${science.leanBodyMassKg} кг`} />
        <StatTile label="Жирова маса" value={`${science.fatMassKg} кг`} />
      </div>

      <div className="h-px bg-white/[0.06]" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <StatTile label="BMR (Katch-McArdle)" value={`${science.bmr} ккал`} />
        <StatTile label="TDEE" value={`${science.tdee} ккал`} />
        <StatTile
          label="Науковий орієнтир"
          value={`${science.targetKcal} ккал`}
          hint={adjustmentLabel}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-label">Макроси — науково vs у плані</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/[0.02]">
            <span className="text-caption">Науковий орієнтир ({science.targetKcal} ккал)</span>
            <span className="font-mono text-sm text-zinc-200">
              Б {science.proteinG} г · Ж {science.fatG} г · В {science.carbsG} г
            </span>
            <span className="text-caption">
              {science.proteinGramsPerKgLbm} г білка / кг обезжиреної маси
            </span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/[0.02]">
            <span className="text-caption">У поточному плані ({profile.kcal} ккал)</span>
            <span className="font-mono text-sm text-zinc-200">
              Б {profile.macros.protein} г · Ж {profile.macros.fat} г · В {profile.macros.carbs} г
            </span>
            <span className="text-caption">{kcalDeltaLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Profiles() {
  return (
    <div className="flex flex-col gap-4">
      {PROFILES.map((profile) => (
        <ProfileScienceCard key={profile.id} profile={profile} />
      ))}

      <div className="glass-card p-4 flex flex-col gap-2">
        <span className="text-label">Методологія</span>
        <p className="text-caption">
          BMR розраховано за формулою Katch-McArdle (370 + 21.6 × обезжирена маса) — точніша за
          Mifflin-St Jeor при відомому/оціненому % жиру. TDEE = BMR × коефіцієнт активності.
        </p>
        <p className="text-caption">
          Дефіцит/профіцит — за Helms, Aragon &amp; Fitschen (2013/2014, PubMed 24092765 /
          24864135): ~20–25% дефіцит на сушці, ~10–15% профіцит на наборі. Білок на сушці — 2.3 г/кг
          обезжиреної маси (нижня межа діапазону 2.3–3.1; верхня межа призначена для вже сухих
          атлетів перед змаганнями на агресивному дефіциті — не наш випадок). Білок на наборі — 2.0
          г/кг обезжиреної маси.
        </p>
        <p className="text-caption">
          Це узгоджується з відомим порогом Morton et al. (2018, метааналіз 49 досліджень) — 1.6
          г/кг <em>загальної</em> ваги тіла. Різні бази вимірювання (обезжирена маса проти загальної
          ваги) дають майже однакову кількість грамів для конкретної людини — це не два конфліктні
          числа, а той самий орієнтир, виражений по-різному.
        </p>
        <p className="text-caption">
          Жир — мінімум 25% від калорій для гормонального здоров&apos;я, вуглеводи — залишок.
        </p>
      </div>
    </div>
  );
}
