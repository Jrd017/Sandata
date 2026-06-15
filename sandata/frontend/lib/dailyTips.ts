import { supabase } from '@/lib/supabase';

export type DailyTip = {
  id: string;
  text: string;
};

export const scamTips: DailyTip[] = [
  {
    id: 'false-prophets',
    text: 'Beware the whispers of false prophets who promise riches; they often lead to empty coffers.',
  },
  {
    id: 'inspect-armor',
    text: 'Just as a warrior inspects their armor, always check the sender before trusting a message.',
  },
  {
    id: 'sacred-tokens',
    text: 'Do not share your sacred tokens, passwords, or OTPs with strangers, even if they sound urgent.',
  },
  {
    id: 'separate-path',
    text: 'When a request feels urgent, step onto a separate path and verify through the official app or hotline.',
  },
  {
    id: 'too-much-gold',
    text: 'Offers of effortless treasure are often bait; verify prizes, investments, and discounts before acting.',
  },
  {
    id: 'sealed-scroll',
    text: 'A strange link is like a sealed scroll from an unknown court; inspect it before opening.',
  },
  {
    id: 'trusted-gates',
    text: 'Enter accounts through trusted gates you type yourself, not through buttons in surprise messages.',
  },
];

function dayKey(date = new Date()) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

function pickTip(tips: DailyTip[], date = new Date()) {
  const index = dayKey(date) % tips.length;
  return tips[index] || scamTips[0];
}

export async function getDailyTip(date = new Date()) {
  if (supabase) {
    const { data, error } = await supabase
      .from('scam_tips')
      .select('id, tip_text')
      .order('created_at', { ascending: true });

    if (!error && data?.length) {
      return pickTip(data.map((row) => ({ id: String(row.id), text: String(row.tip_text) })), date);
    }
  }

  return pickTip(scamTips, date);
}
