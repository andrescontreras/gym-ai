'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { WEEKLY_VOLUME_CAPS } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import type { OnboardingPreviewAnswers } from '@/types';

const goals = ['hypertrophy', 'fat_loss', 'endurance'] as const;
const levels = ['beginner', 'intermediate', 'advanced'] as const;
const days = [2, 3, 4, 5, 6] as const;
const durations = [30, 45, 60, 75, 90] as const;
const splits = ['full_body', 'upper_lower', 'ppl', 'no_preference'] as const;

const optionClass =
  'flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-600 px-4 py-3 text-left has-checked:border-lime-400 has-checked:bg-lime-400/10 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-lime-400';

export function OnboardingPreview() {
  const t = useTranslations('onboarding');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingPreviewAnswers>({
    goal: null,
    experience: null,
    daysPerWeek: null,
    sessionDuration: null,
    preferredSplit: null,
  });

  const canContinue = [
    answers.goal !== null,
    answers.experience !== null,
    answers.daysPerWeek !== null && answers.sessionDuration !== null,
    answers.preferredSplit !== null,
  ][step];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col">
        <header className="mb-8">
          <h1 className="text-sm font-semibold uppercase tracking-wide text-lime-400">{t('eyebrow')}</h1>
          <p className="mt-4 rounded-xl border border-amber-700 bg-amber-950/40 p-4 text-sm text-amber-100">
            {t('previewNotice')}
          </p>
          {step < 4 && (
            <p className="mt-6 text-sm text-slate-400">{t('progress', { current: step + 1, total: 4 })}</p>
          )}
        </header>

        <div className="flex-1">
          {step === 0 && (
            <fieldset>
              <legend className="text-2xl font-semibold">{t('goal.title')}</legend>
              <p className="mb-6 mt-2 text-slate-300">{t('goal.description')}</p>
              <div className="grid gap-3">
                {goals.map((goal) => (
                  <label key={goal} className={optionClass}>
                    <input type="radio" name="goal" value={goal} checked={answers.goal === goal}
                      onChange={() => setAnswers({ ...answers, goal })} className="accent-lime-400" />
                    {t(`goal.${goal}`)}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <fieldset>
              <legend className="text-2xl font-semibold">{t('experience.title')}</legend>
              <p className="mb-6 mt-2 text-slate-300">{t('experience.description')}</p>
              <div className="grid gap-3">
                {levels.map((experience) => (
                  <label key={experience} className={optionClass}>
                    <input type="radio" name="experience" value={experience} checked={answers.experience === experience}
                      onChange={() => setAnswers({ ...answers, experience })} className="accent-lime-400" />
                    <span>
                      <span className="block font-medium">{t(`experience.${experience}`)}</span>
                      <span className="text-sm text-slate-300">{t('experience.cap', { sets: WEEKLY_VOLUME_CAPS[experience].max })}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold">{t('availability.title')}</h2>
              <p className="mb-6 mt-2 text-slate-300">{t('availability.description')}</p>
              <fieldset>
                <legend className="mb-3 font-medium">{t('availability.days')}</legend>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {days.map((day) => (
                    <label key={day} className={optionClass}>
                      <input type="radio" name="days" value={day} checked={answers.daysPerWeek === day}
                        onChange={() => setAnswers({ ...answers, daysPerWeek: day })} className="accent-lime-400" />
                      {t('availability.dayCount', { count: day })}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="mt-6">
                <legend className="mb-3 font-medium">{t('availability.duration')}</legend>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {durations.map((duration) => (
                    <label key={duration} className={optionClass}>
                      <input type="radio" name="duration" value={duration} checked={answers.sessionDuration === duration}
                        onChange={() => setAnswers({ ...answers, sessionDuration: duration })} className="accent-lime-400" />
                      {t('availability.minutes', { count: duration })}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {step === 3 && (
            <fieldset>
              <legend className="text-2xl font-semibold">{t('split.title')}</legend>
              <p className="mb-6 mt-2 text-slate-300">{t('split.description')}</p>
              <div className="grid gap-3">
                {splits.map((preferredSplit) => (
                  <label key={preferredSplit} className={optionClass}>
                    <input type="radio" name="split" value={preferredSplit} checked={answers.preferredSplit === preferredSplit}
                      onChange={() => setAnswers({ ...answers, preferredSplit })} className="accent-lime-400" />
                    {t(`split.${preferredSplit}`)}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-semibold">{t('remaining.title')}</h2>
              <p className="mt-2 text-slate-300">{t('remaining.description')}</p>
            </div>
          )}
        </div>

        <nav className="mt-8 flex gap-3" aria-label={t('eyebrow')}>
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)}
              className="min-h-12 rounded-lg border border-slate-500 px-5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400">
              {t('back')}
            </button>
          )}
          {step < 4 ? (
            <button type="button" disabled={!canContinue} onClick={() => setStep(step + 1)}
              className={cn('min-h-12 flex-1 rounded-lg bg-lime-400 px-5 font-semibold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400', 'disabled:cursor-not-allowed disabled:opacity-40')}>
              {t('next')}
            </button>
          ) : (
            <button type="button" onClick={() => setStep(0)}
              className="min-h-12 flex-1 rounded-lg bg-lime-400 px-5 font-semibold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400">
              {t('remaining.restart')}
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}
