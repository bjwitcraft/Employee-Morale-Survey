export type Answer = { id: string; type: 'likert'|'yesno'|'text'; value: any };
export type ResponseDoc = { createdAt: string; meta: any; answers: Answer[] };

export function summarize(docs: ResponseDoc[]) {
  const likert: Record<string,{sum:number,count:number}> = {};
  const yesno: Record<string,{yes:number,total:number}> = {};
  const comments: Record<string,string[]> = {};

  for (const r of docs) {
    for (const a of r.answers) {
      if (a.type === 'likert') {
        const x = Number(a.value);
        if (!Number.isFinite(x)) continue;
        likert[a.id] ||= { sum:0, count:0 };
        likert[a.id].sum += x; likert[a.id].count += 1;
      } else if (a.type === 'yesno') {
        yesno[a.id] ||= { yes:0, total:0 };
        yesno[a.id].yes += (a.value === true || a.value === 'yes') ? 1 : 0;
        yesno[a.id].total += 1;
      } else if (a.type === 'text' && a.value) {
        comments[a.id] ||= []; comments[a.id].push(String(a.value));
      }
    }
  }

  const likertAvg = Object.entries(likert).map(([id, v]) => ({ id, avg: v.count ? v.sum / v.count : 0, count: v.count }));
  const yesnoRate = Object.entries(yesno).map(([id, v]) => ({ id, rate: v.total ? v.yes / v.total : 0, total: v.total }));
  return { likertAvg, yesnoRate, comments };
}
