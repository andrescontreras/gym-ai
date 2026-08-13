# Domain Rules — Training Science & AI Logic

> The product's core IP. These rules are **safety-critical**: they govern injury avoidance,
> overtraining prevention, and load prescription. Treat them as hard constraints, not defaults.
>
> **Companion docs:** [`../AGENTS.md`](../AGENTS.md) (engineering rules) ·
> [`WIREFRAME-BRIEF.md`](WIREFRAME-BRIEF.md) (design decisions & screens)

---

## 1. Movement Patterns (Biomechanical Taxonomy)

```typescript
'push_horizontal'  // Bench press, push-ups, chest press machine
                   // Pectoralis major, anterior deltoid, triceps
'push_vertical'    // Overhead press, pike push-ups, shoulder press machine
                   // Anterior/medial deltoid, triceps, upper chest
'pull_horizontal'  // Barbell/dumbbell/cable row, inverted row
                   // Latissimus dorsi, rhomboids, rear deltoid, biceps
'pull_vertical'    // Pull-ups, chin-ups, lat pulldown
                   // Latissimus dorsi, teres major, biceps
'squat'            // Back/front/goblet squat, leg press
                   // Quadriceps, glutes, adductors
'hinge'            // Deadlift, RDL, good morning, hip thrust
                   // Hamstrings, glutes, erector spinae
'lunge'            // Walking/reverse lunge, Bulgarian split squat
                   // Quadriceps, glutes (unilateral emphasis)
'carry'            // Farmer's walk, suitcase carry, overhead carry
                   // Core stabilizers, traps, grip strength
```

### Pattern substitution rules

- **NEVER cross patterns.** Do not replace `squat` with `hinge`
- Within-pattern swaps are preferred: barbell row → dumbbell row
- Cross-pattern **only** when the original pattern is injured or restricted
  (e.g. `squat` → `lunge` when knee pain prevents bilateral squatting)

---

## 2. Routine Builder Logic

### 2.1 Injury-aware programming — Priority #1

- **Veto restricted patterns entirely.** Knee pain with `restrictedPatterns: ['squat']`
  means deep squats are excluded, not reduced
- **Replace with safe alternatives:** deep squat → hip thrust, leg press, or split squat,
  depending on available equipment
- **Always document in `aiRationale`:** *"Avoided deep squats due to knee pain; replaced
  with hip thrusts for glute development"*

### 2.2 Anti-overtraining volume — HARD CAPS

Weekly sets per muscle group:

| Experience | Sets / muscle / week |
|---|---|
| Beginner | 10–12 |
| Intermediate | 12–18 |
| Advanced | 16–22 |

Exceeding these increases injury risk **without additional benefit**. Never treat the upper
bound as a target to push past.

### 2.3 Intelligent split design

- **Recovery rule:** 48–72 h between training the same muscle group
- 3 days/week → Full Body (Mon/Wed/Fri)
- 4 days/week → Upper/Lower (Mon/Tue/Thu/Fri)
- 5–6 days/week → Push/Pull/Legs (rotating)
- **Session duration caps exercise count:** 60 minutes → 8–10 exercises max

⚠️ A user's *preferred* split can violate the recovery rule (PPL at 3 days/week trains each
muscle 1×/week instead of 3×). Preferred split is a **soft input** — the AI may override it,
but must justify the override and the UI must surface the conflict. See
`WIREFRAME-BRIEF.md` §"Split conflict card".

### 2.4 Periodization

Microcycles (weekly blocks):

| Block | Prescription |
|---|---|
| **Accumulation** | Higher volume, moderate intensity (e.g. 4 × 10) |
| **Intensification** | Lower volume, higher intensity (e.g. 3 × 6) |
| **Deload** | 40–50% volume reduction, every 4–6 weeks |

Default mesocycle length: **8–12 weeks** for hypertrophy goals. Programs have a defined
end date — this is what the Progress chart measures against.

### 2.5 Exercise selection hierarchy

1. Match the user's available equipment
2. Avoid injury-restricted patterns
3. Prioritize compounds (squat, deadlift, bench, row, overhead press)
4. Add isolation work for lagging muscle groups
5. Include 1–2 core/stabilization exercises per session

---

## 3. Exercise Substitution Logic

### 3.1 Biomechanical equivalence — Priority #1

1. **Match movement pattern first** — mandatory
2. **Match muscle group second** — primary + synergist overlap **≥ 80%**
3. **Equipment is negotiable:** barbell → dumbbell → machine → bodyweight (preference order)

### 3.2 Load translation

Never swap an exercise without recalculating load — the goal is preserving *stimulus*, not
the number on the bar.

| Factor | Adjustment |
|---|---|
| **ROM differences** | Dumbbell bench ≈ 20% more ROM → reduce load 10–15% |
| **Stability demands** | Free weight → machine → increase load 10–20% |
| **Unilateral vs bilateral** | Barbell bench 80 kg → DB bench 32.5 kg **per hand**, not 40 kg |
| **Resistance profile** | Cables hold tension at peak contraction → may feel harder at equal load |

Worked examples:

```
Barbell Bench Press 80 kg → Dumbbell Bench Press
  80 / 2 = 40 kg per hand
  ROM adjustment: 40 × 0.85 = 34 kg per hand

Barbell Back Squat 100 kg → Leg Press
  Leg press ≈ 1.5–1.8 × squat load (machine advantage)
  100 × 1.7 = 170 kg

Pull-ups (bodyweight 80 kg) → Lat Pulldown
  Lat pulldown ≈ 70–75% of bodyweight for equivalent difficulty
  80 × 0.7 = 56 kg
```

**Bodyweight is required in the user profile** because these conversions depend on it.

### 3.3 Context awareness

- **Experience level:** beginners get simpler alternatives (machine over free weight)
- **Known injuries:** never suggest exercises loading an injured area
- **Equipment availability:** only suggest what the user has access to
- **Space constraints:** "home workout" → prioritize dumbbell/bodyweight options

### 3.4 Confidence scoring

| Score | Meaning | Example |
|---|---|---|
| 0.9–1.0 | Near-perfect — same pattern, same muscles, minimal load adjustment | Barbell bench → dumbbell bench |
| 0.7–0.8 | Good — same pattern, similar muscles, moderate load adjustment | Barbell row → cable row |
| 0.5–0.6 | Acceptable — related pattern, muscle overlap ≥ 60% | Pull-ups → lat pulldown |
| < 0.5 | Questionable — warn the user or reject the suggestion | — |

---

## 4. Volume Tracking & Progressive Overload

| RIR | Meaning |
|---|---|
| 0 | Absolute failure — couldn't do one more rep |
| 1 | Could've done 1 more (very hard) |
| 2 | Could've done 2 more — **optimal training zone** |
| 3–4 | Could've done 3–4 more — too easy, insufficient stimulus |

### 4.2 Progressive overload rules

| Condition | Action |
|---|---|
| Last session **RIR ≤ 2** | Increase load: **upper body +2.5 kg**, **lower body +5 kg** — or add +1 rep at the same load |
| Last session **RIR ≥ 4** | Maintain or reduce load (user went too easy, or was fatigued) |
| **RIR 0–1 for 2+ weeks** | Possible overreaching → **suggest a deload** |

Every load change must be explained to the user, e.g.
*"↑ +2.5 kg — you left 2 RIR last time."* Silent adjustments erode trust.

### 4.3 Volume calculation

- **Tonnage** = weight × reps × sets
  → `80 kg × 10 reps × 3 sets = 2,400 kg`
- **Weekly volume per muscle group** = sum of all sets targeting that muscle
  → chest: 3 bench + 3 incline + 3 fly = **9 sets/week**

Weekly per-muscle counts are checked against the §2.2 hard caps and surfaced in the UI.

### 4.4 Estimated 1RM — the shared formula

```
e1RM = weight × (1 + reps / 30)        // Epley
```

Used in **two** places, deliberately:

1. **Onboarding** — converts an optional "best set" (e.g. 100 kg × 5) into a starting 1RM,
   because almost no recreational lifter has tested a true single
2. **Progress chart** — the y-axis metric, because it absorbs *both* dimensions of progress

Why this matters: more reps at the same load and more load at the same reps are **both**
progress, and a raw weight or raw rep axis captures only one.

| Log | e1RM | vs. baseline |
|---|---|---|
| Week 1 · 3×6 @ 75 kg | 90.0 kg | baseline |
| Week 8 · 3×9 @ 75 kg | 97.5 kg | **+8.3%** |
| Week 8 · 3×6 @ 80 kg | 96.0 kg | **+6.7%** |

**Always display the raw set notation alongside it.** Users trust `3×9 @ 75 kg`, not `97.5`.
e1RM is the axis; the logged sets are the truth.

### 4.5 Voice input parsing

Extract: `reps`, `weight`, `weightUnit`, `rir`, `rpe`

```
"Hice 12 repeticiones con 40 kilos"   → { reps: 12, weight: 40, weightUnit: 'kg' }
"Did 10 reps at 80 pounds, RIR 2"     → { reps: 10, weight: 80, weightUnit: 'lb', rir: 2 }
"8 reps, could've done 2 more"        → { reps: 8, rir: 2 }
```

- Must handle **English and Spanish** natural language
- **Confidence < 0.7** → prompt the user to confirm the parsed data before saving
- MVP scope: **one utterance = one set.** Multi-set parsing ("3 sets of 10 at 40") is Phase 2

---

## 5. Session State

- `WorkoutSession.status`: `'planned' | 'active' | 'completed'`
- **Only ONE `'active'` session per user at a time** — enforce this
- When substituting an exercise:
  1. Store the original exercise ID in `substitutedFrom`
  2. Update the session with the new exercise
  3. Preserve the sets/reps structure, adjusting weight per §3.2

---

## 6. Invariants Checklist

Before merging any change to training logic, verify:

- [ ] No substitution crosses movement patterns (unless the original is injury-restricted)
- [ ] No weekly per-muscle set count exceeds the §2.2 cap for the user's experience level
- [ ] No exercise targets a user-flagged injured area
- [ ] No exercise requires unavailable equipment
- [ ] 48–72 h recovery respected between sessions hitting the same muscle group
- [ ] Every substitution recalculates load rather than copying the previous number
- [ ] Every AI decision carries a user-visible rationale
- [ ] `substitutedFrom` is preserved on every swap
- [ ] Voice parses below 0.7 confidence require explicit user confirmation
- [ ] A deload is suggested after 2+ weeks at RIR 0–1

---

## 7. Not Confirmed

- [ ] Whether `strength` is a supported goal alongside hypertrophy / fat loss / endurance
      (the journey board lists only *hipertrofia, grasa, resistencia*)
- [ ] Volume caps for the `fat_loss` and `endurance` goals — the §2.2 table is
      hypertrophy-oriented
- [ ] Whether Epley or a formula better suited to higher rep ranges (Brzycki, Lombardi)
      should be used above ~10 reps, where Epley loses accuracy
- [ ] Exact injury-zone taxonomy and its mapping to `restrictedPatterns[]`
- [ ] Whether deload weeks are pre-scheduled at generation time or triggered reactively
      from RIR data (or both)