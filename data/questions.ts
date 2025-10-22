export type QType = 'likert' | 'yesno' | 'text';
export type Category = 'morale' | 'direct_supervisor' | 'other_supervisors' | 'hr' | 'training' | 'senior_leadership';

export interface Question {
  id: string; text: string; type: QType; cat: Category;
}

export const QUESTION_BANK: Question[] = [
  // Morale / culture
  { id: 'm1', cat: 'morale', type: 'likert', text: 'I felt respected at work today.' },
  { id: 'm2', cat: 'morale', type: 'likert', text: 'Team morale on my shift feels positive.' },
  { id: 'm3', cat: 'morale', type: 'yesno',   text: 'I received recognition for good work this week.' },
  { id: 'm4', cat: 'morale', type: 'text',    text: 'One thing that went well this shift:' },

  // Direct supervisor
  { id: 'ds1', cat: 'direct_supervisor', type: 'likert', text: 'My direct supervisor was available and supportive.' },
  { id: 'ds2', cat: 'direct_supervisor', type: 'likert', text: 'Feedback from my direct supervisor was clear and fair.' },

  // Other supervisors (same shift)
  { id: 'os1', cat: 'other_supervisors', type: 'likert', text: 'Other supervisors on this shift communicated effectively.' },
  { id: 'os2', cat: 'other_supervisors', type: 'yesno',   text: 'I saw coordination across departments (e.g., Wave Desk ↔ Loading).' },

  // HR
  { id: 'hr1', cat: 'hr', type: 'likert', text: 'HR treats employees consistently and with respect.' },
  { id: 'hr2', cat: 'hr', type: 'yesno',   text: 'I know how to report a concern to HR if needed.' },

  // Training
  { id: 'tr1', cat: 'training', type: 'likert', text: 'I had the tools and training needed for my tasks today.' },
  { id: 'tr2', cat: 'training', type: 'yesno',   text: 'I learned or practiced a new skill this week.' },

  // Senior leadership (Production Planners, Ops Managers, AGM, GM)
  { id: 'sl1', cat: 'senior_leadership', type: 'likert', text: 'Production Planners set priorities that made sense on the floor.' },
  { id: 'sl2', cat: 'senior_leadership', type: 'likert', text: 'Ops Managers communicated goals and addressed issues promptly.' },
  { id: 'sl3', cat: 'senior_leadership', type: 'likert', text: 'AGM/GM visibility and communication met expectations.' },
  { id: 'sl4', cat: 'senior_leadership', type: 'text',    text: 'If I could tell senior leadership one thing, it would be:' },
];

export const LIKERT = [1,2,3,4,5] as const;

export function pickQuestions(seed: number, n = 6): Question[] {
  const rnd = mulberry32(seed);
  const shuffled = [...QUESTION_BANK].sort(() => rnd() - 0.5);

  // Ensure at least one from each core area
  const coreCats: Category[] = ['morale','direct_supervisor','other_supervisors','training','senior_leadership'];
  const chosen: Question[] = [];
  for (const cat of coreCats) {
    const cand = shuffled.find(q => q.cat === cat && !chosen.find(c => c.id === q.id));
    if (cand) chosen.push(cand);
  }
  for (const q of shuffled) {
    if (chosen.length >= n) break;
    if (!chosen.find(c => c.id === q.id)) chosen.push(q);
  }
  return chosen.slice(0, n);
}

function mulberry32(a: number) {
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
