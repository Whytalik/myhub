import { TrendingDown, TrendingUp, FlaskConical } from "lucide-react";
import { PROFILES } from "../data";
import { BODY_STATS, ACTIVITY_LABELS } from "../body-stats";
import { calculateScienceProfile } from "../profile-science";
import type { Profile } from "../types";

type Tone = "rose" | "emerald" | "amber";

const TONE_CLASSES: Record<Tone, string> = {
  rose: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-mono font-semibold uppercase tracking-wide ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}

function StatTile({
  label,
  value,
  hint,
  accented,
}: {
  label: string;
  value: string;
  hint?: string;
  accented?: boolean;
}) {
  const tileClass = accented
    ? "flex flex-col gap-0.5 p-2.5 rounded-xl bg-accent-nutrition/5 border border-accent-nutrition/10"
    : "flex flex-col gap-0.5 p-2.5 rounded-xl bg-white/[0.02]";
  const valueClass = `font-mono text-sm ${accented ? "text-accent-nutrition" : "text-zinc-100"}`;

  return (
    <div className={tileClass}>
      <span className="text-label">{label}</span>
      <span className={valueClass}>{value}</span>
      {hint && <span className="text-caption">{hint}</span>}
    </div>
  );
}

function ProfileScienceCard({ profile }: { profile: Profile }) {
  const stats = BODY_STATS[profile.id];
  if (!stats) return null;

  const science = calculateScienceProfile(stats);
  const activityLabel = ACTIVITY_LABELS[stats.activityLevel];
  const isCut = stats.goal === "cut";
  const goalTone: Tone = isCut ? "rose" : "emerald";
  const GoalIcon = isCut ? TrendingDown : TrendingUp;
  const goalLabel = isCut ? "Дефіцит" : "Профіцит";
  const adjustmentLabel =
    science.adjustmentPercent < 0
      ? `${science.adjustmentPercent}% від TDEE`
      : `+${science.adjustmentPercent}% від TDEE`;
  const bodyFatValue = `${stats.bodyFatPercent}%${stats.bodyFatEstimated ? " (оцінка)" : ""}`;

  const kcalDelta = profile.kcal - science.targetKcal;
  const kcalDeltaAbs = Math.abs(kcalDelta);
  const deltaTone: Tone = kcalDeltaAbs <= 50 ? "emerald" : kcalDeltaAbs <= 150 ? "amber" : "rose";
  const kcalDeltaLabel =
    kcalDelta === 0
      ? "співпадає з науковим орієнтиром"
      : kcalDelta > 0
        ? `план на ${kcalDelta} ккал більший за науковий орієнтир`
        : `план на ${kcalDeltaAbs} ккал менший за науковий орієнтир`;

  return (
    <div className="glass-card p-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-nutrition/10 text-accent-nutrition shrink-0">
            <GoalIcon size={18} />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-panel-title">{profile.name}</span>
              <Pill tone={goalTone}>{goalLabel}</Pill>
            </div>
            <span className="text-caption">{activityLabel}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <span className="font-mono text-2xl leading-none text-accent-nutrition">
            {science.targetKcal}
          </span>
          <span className="text-caption">ккал · {adjustmentLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatTile label="BMR (Katch-McArdle)" value={`${science.bmr} ккал`} accented />
        <StatTile label="TDEE" value={`${science.tdee} ккал`} accented />
      </div>

      <div className="h-px bg-white/[0.06]" />

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <StatTile label="Вага" value={`${stats.weightKg} кг`} />
        <StatTile label="Зріст" value={`${stats.heightCm} см`} />
        <StatTile label="Вік" value={`${stats.age}`} />
        <StatTile label="% жиру" value={bodyFatValue} />
        <StatTile label="Обезжирена маса" value={`${science.leanBodyMassKg} кг`} />
        <StatTile label="Жирова маса" value={`${science.fatMassKg} кг`} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-label">Макроси — науково vs у плані</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 p-3 rounded-xl bg-accent-nutrition/5 border border-accent-nutrition/20">
            <span className="text-caption">Науковий орієнтир ({science.targetKcal} ккал)</span>
            <span className="font-mono text-sm text-zinc-100">
              Б {science.proteinG} г · Ж {science.fatG} г · В {science.carbsG} г
            </span>
            <span className="text-caption">
              {science.proteinGramsPerKgLbm} г білка / кг обезжиреної маси
            </span>
          </div>
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/[0.02]">
            <span className="text-caption">У поточному плані ({profile.kcal} ккал)</span>
            <span className="font-mono text-sm text-zinc-200">
              Б {profile.macros.protein} г · Ж {profile.macros.fat} г · В {profile.macros.carbs} г
            </span>
            <Pill tone={deltaTone}>{kcalDeltaLabel}</Pill>
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

      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-nutrition/10 text-accent-nutrition shrink-0">
            <FlaskConical size={16} />
          </div>
          <span className="text-panel-title">Методологія</span>
        </div>
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
