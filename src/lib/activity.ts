import { loadJSON, saveJSON } from './storage';

const KEY = 'activity';
type Activity = Record<string, number>; // { "2026-11-09": 5, ... }

// ကိုယ့်ဒေသစံတော်ချိန်အတိုင်း YYYY-MM-DD ထုတ်ပေးတယ်
const dayKey = (d: Date) => d.toLocaleDateString('sv-SE');

export function logActivity() {
  const data = loadJSON<Activity>(KEY, {});
  const k = dayKey(new Date());
  data[k] = (data[k] ?? 0) + 1;
  saveJSON(KEY, data);
}

export function getTodayCount(): number {
  return loadJSON<Activity>(KEY, {})[dayKey(new Date())] ?? 0;
}

export function getStreak(): number {
  const data = loadJSON<Activity>(KEY, {});
  const d = new Date();
  // ဒီနေ့ မလုပ်ရသေးရင် streak မပြတ်သေးဘူး၊ မနေ့ကစပြီးရေတွက်တယ်
  if (!data[dayKey(d)]) d.setDate(d.getDate() - 1);

  let streak = 0;
  while (data[dayKey(d)]) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
