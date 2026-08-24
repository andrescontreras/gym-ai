'use client';

import { useState } from 'react';
import { Check, ChevronRight, Info, Sparkles, X } from 'lucide-react';
import type { Exercise, SessionExercise, SubstitutionSuggestion } from '@/types';

interface ExerciseSubstitutionProps {
  exercise: SessionExercise;
  onClose: () => void;
  onConfirm: (suggestion: SubstitutionSuggestion) => void;
}

const reasons = [
  { label: 'Equipo ocupado', value: 'equipment_occupied' },
  { label: 'Molestia / dolor', value: 'pain_discomfort' },
  { label: 'Poco espacio', value: 'lack_space' },
  { label: 'Entreno en casa', value: 'home_workout' },
] as const;

function buildLocalSuggestions(exercise: Exercise): SubstitutionSuggestion[] {
  return [
    {
      exercise: {
        ...exercise,
        id: 'local-dumbbell-press',
        name: 'Press de banca con mancuernas',
        equipment: ['dumbbells', 'bench'],
      },
      justification: 'Mantiene el empuje horizontal y el trabajo principal de pecho, con menos dependencia del rack.',
      adjustedWeight: Math.round((exercise.name.includes('barra') ? 80 / 2 * 0.85 : 30) * 2) / 2,
      adjustedReps: 8,
      confidenceScore: 0.94,
      biomechanicalEquivalence: 'Mismo patrón: empuje horizontal. La carga se divide por lado y baja por el mayor recorrido de las mancuernas.',
    },
    {
      exercise: {
        ...exercise,
        id: 'local-push-up',
        name: 'Flexiones con manos elevadas',
        equipment: ['bodyweight', 'bench'],
      },
      justification: 'Una opción estable si las mancuernas también dejan de estar disponibles; conserva el patrón sin cargar la barra.',
      adjustedWeight: 0,
      adjustedReps: 10,
      confidenceScore: 0.72,
      biomechanicalEquivalence: 'Mismo patrón: empuje horizontal. Ajusta la altura para terminar cada serie con RIR 2.',
    },
  ];
}

export function ExerciseSubstitution({ exercise, onClose, onConfirm }: ExerciseSubstitutionProps) {
  const [category, setCategory] = useState<(typeof reasons)[number]['value']>('equipment_occupied');
  const [reason, setReason] = useState('El rack está ocupado, solo tengo mancuernas libres');
  const [suggestions, setSuggestions] = useState<SubstitutionSuggestion[]>([]);
  const [selected, setSelected] = useState<SubstitutionSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFallback, setIsFallback] = useState(false);

  async function findSubstitutions() {
    setLoading(true);
    setError('');
    setSuggestions([]);
    setSelected(null);

    try {
      const response = await fetch('/api/ai/substitute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalExercise: exercise.exercise,
          exerciseId: exercise.exerciseId,
          reason,
          reasonCategory: category,
          currentWeight: exercise.weight,
          currentReps: exercise.reps,
          currentRir: exercise.rir,
        }),
      });

      if (!response.ok) throw new Error('substitution request failed');
      const payload: { data: { suggestions: SubstitutionSuggestion[] } } = await response.json();
      setSuggestions(payload.data.suggestions);
      setIsFallback(false);
    } catch {
      setSuggestions(buildLocalSuggestions(exercise.exercise));
      setIsFallback(true);
      setError('La IA no está disponible ahora. Te mostramos opciones seguras del catálogo para que puedas continuar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6">
      <section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-[#374334] bg-[#171a17] p-5 text-[#e8eee5] shadow-2xl sm:rounded-2xl sm:p-8" aria-labelledby="substitution-title">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#8dff70]">Micro-ajuste en sesión</p>
            <h2 id="substitution-title" className="text-2xl font-bold tracking-tight">Cambia {exercise.exercise.name}</h2>
            <p className="mt-2 text-sm text-[#aab8a7]">Conservaremos {exercise.sets} series, {exercise.rir} RIR y el estímulo de {exercise.exercise.muscleGroup.toLowerCase()}.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar sustitución" className="rounded-full p-2 text-[#aab8a7] hover:bg-[#273126] hover:text-white"><X size={20} /></button>
        </div>

        {!suggestions.length && !loading && (
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-semibold">¿Qué cambió?</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {reasons.map((item) => (
                  <button key={item.value} type="button" onClick={() => setCategory(item.value)} className={`min-h-12 rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${category === item.value ? 'border-[#8dff70] bg-[#283b27] text-[#dfffd6]' : 'border-[#374334] bg-[#20251f] text-[#aab8a7] hover:border-[#6e886b]'}`}>{item.label}</button>
                ))}
              </div>
            </div>
            <label className="block text-sm font-semibold" htmlFor="substitution-reason">Cuéntame un poco más
              <textarea id="substitution-reason" value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="mt-2 w-full resize-none rounded-lg border border-[#374334] bg-[#20251f] p-3 font-normal text-[#e8eee5] outline-none placeholder:text-[#758174] focus:border-[#8dff70] focus:ring-1 focus:ring-[#8dff70]" placeholder="Ej. siento un pinchazo al bajar..." />
            </label>
            <button type="button" onClick={findSubstitutions} disabled={reason.trim().length < 3} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#8dff70] px-5 font-bold text-[#10200d] transition-transform hover:bg-[#b3ff9f] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"><Sparkles size={18} /> Encontrar alternativas</button>
          </div>
        )}

        {loading && <div className="flex min-h-48 flex-col items-center justify-center gap-4 text-center"><Sparkles className="animate-pulse text-[#8dff70]" size={30} /><p className="font-semibold">Buscando el reemplazo más preciso...</p><p className="text-sm text-[#aab8a7]">Revisando patrón, músculos, restricciones y carga.</p></div>}
        {error && <div className="mb-5 flex gap-3 rounded-lg border border-[#72514d] bg-[#3a2422] p-4 text-sm text-[#ffd9d4]"><Info size={18} className="mt-0.5 shrink-0" />{error}</div>}
        {suggestions.length > 0 && !loading && (
          <div>
            <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-sm text-[#aab8a7]">Alternativas para {exercise.exercise.muscleGroup.toLowerCase()}</p><h3 className="text-xl font-bold">Elige cómo continuar</h3></div>{isFallback && <span className="rounded-full bg-[#273126] px-3 py-1 text-xs text-[#b9d7ae]">Catálogo local</span>}</div>
            <div className="space-y-3">
              {suggestions.map((suggestion) => <button key={suggestion.exercise.id} type="button" onClick={() => setSelected(suggestion)} className={`w-full rounded-xl border p-4 text-left transition-colors ${selected?.exercise.id === suggestion.exercise.id ? 'border-[#8dff70] bg-[#283b27]' : 'border-[#374334] bg-[#20251f] hover:border-[#6e886b]'}`}><div className="flex items-start justify-between gap-4"><div><h4 className="font-bold">{suggestion.exercise.name}</h4><p className="mt-1 text-sm text-[#aab8a7]">{suggestion.justification}</p></div><ChevronRight className="mt-1 shrink-0 text-[#8dff70]" size={18} /></div><div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#374334] pt-3 text-xs"><span><strong className="block text-base text-white">{suggestion.adjustedWeight ? `${suggestion.adjustedWeight} kg` : 'Peso corporal'}</strong>carga sugerida</span><span><strong className="block text-base text-white">{suggestion.adjustedReps} reps</strong>objetivo</span><span><strong className="block text-base text-[#8dff70]">{Math.round(suggestion.confidenceScore * 100)}%</strong>confianza</span></div></button>)}
            </div>
            {selected && <div className="mt-5 rounded-lg border border-[#40543d] bg-[#1d2b1c] p-4 text-sm"><p className="flex items-center gap-2 font-semibold text-[#baffac]"><Check size={16} /> {selected.biomechanicalEquivalence}</p><p className="mt-2 text-[#c4d4bf]">Se mantiene el objetivo de RIR {exercise.rir} y las {exercise.sets} series de tu sesión.</p><button type="button" onClick={() => onConfirm(selected)} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#8dff70] font-bold text-[#10200d] hover:bg-[#b3ff9f]"><Check size={18} /> Usar esta alternativa</button></div>}
            <button type="button" onClick={() => { setSuggestions([]); setError(''); }} className="mt-5 w-full text-center text-sm font-semibold text-[#aab8a7] hover:text-white">Volver a ajustar el motivo</button>
          </div>
        )}
      </section>
    </div>
  );
}