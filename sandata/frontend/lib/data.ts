import { ui } from '@/lib/assets';
import type { BattleEnemy, CategoryKey, Difficulty, Flashcard, LeaderboardEntry, LearningModule, Mission, QuizQuestion } from '@/lib/types';

export const categoryCatalog: Array<{
  key: CategoryKey;
  title: string;
  subtitle: string;
  icon: string;
  difficulty: Difficulty;
  accentClass: string;
}> = [
  { key: 'phishing', title: 'Phishing Serpent', subtitle: 'Email and login traps', icon: 'phishing', difficulty: 'beginner', accentClass: 'bg-mango' },
  { key: 'fake_shopping', title: 'Merchant Mirage', subtitle: 'Marketplace traps', icon: 'fake_shopping', difficulty: 'beginner', accentClass: 'bg-mint' },
  { key: 'investment_scams', title: 'Golden Hoard Trap', subtitle: 'Fast-profit claims', icon: 'investment_scams', difficulty: 'popular', accentClass: 'bg-gold' },
  { key: 'social_engineering', title: 'Whispering Court', subtitle: 'Pressure and pretexting', icon: 'social_engineering', difficulty: 'popular', accentClass: 'bg-teal' },
  { key: 'otp_scams', title: 'Sacred Token Trial', subtitle: 'Code theft defense', icon: 'otp', difficulty: 'popular', accentClass: 'bg-sky-blue' },
  { key: 'ai_scams', title: 'Mirror Spirit Illusion', subtitle: 'Deepfake requests', icon: 'ai_scams', difficulty: 'advanced', accentClass: 'bg-pink-light' },
  { key: 'romance_scams', title: 'Trust Binding Curse', subtitle: 'Trust manipulation', icon: 'romance_scams', difficulty: 'popular', accentClass: 'bg-lavender' },
  { key: 'data_harvesting', title: 'Harvested Secrets', subtitle: 'Oversharing traps', icon: 'data_harvesting', difficulty: 'beginner', accentClass: 'bg-mint' },
  { key: 'smishing', title: 'False Courier Scrolls', subtitle: 'SMS scam links', icon: 'smishing', difficulty: 'beginner', accentClass: 'bg-sky-blue' },
  { key: 'other', title: 'Unknown Omens', subtitle: 'New scam patterns', icon: 'other', difficulty: 'advanced', accentClass: 'bg-cream' },
];

export const badgeCatalog = [
  {
    key: 'phishing_fighter',
    name: 'Phishing Fighter',
    description: 'Complete five quiz attempts.',
    color: 'from-ube-soft to-ube-deep',
  },
  {
    key: 'quiz_master',
    name: 'Quiz Master',
    description: 'Reach 90 percent overall accuracy.',
    color: 'from-gold to-mango',
  },
  {
    key: 'streak_warrior',
    name: 'Streak Warrior',
    description: 'Log in seven days in a row.',
    color: 'from-pink-light to-gold',
  },
  {
    key: 'sharp_observer',
    name: 'Sharp Observer',
    description: 'Score perfectly on a module.',
    color: 'from-mint to-teal',
  },
  {
    key: 'community_helper',
    name: 'Community Helper',
    description: 'Earn 500 total Spirit Shards.',
    color: 'from-lavender to-ube-soft',
  },
];

export const onboardingScenarios = [
  {
    message: 'Congrats! You won PHP 5,000. Tap this short link to claim before midnight.',
    sender: 'Prize Center PH',
    suspicious: true,
    signal: 'Unexpected prizes and rushed links are classic scam signals.',
  },
  {
    message: 'Your bank will never ask for your OTP. Call the official hotline if you need support.',
    sender: 'Security Reminder',
    suspicious: false,
    signal: 'This is a safe awareness reminder because it points to official verification.',
  },
  {
    message: 'GCash account locked. Send your OTP here to restore access now.',
    sender: 'Support Team',
    suspicious: true,
    signal: 'Nobody should ask for an OTP, even if the message sounds urgent.',
  },
];

export const fallbackMissions: Mission[] = [
  { id: 'identify_phishing', label: 'Identify 3 phishing messages', target: 3, progress: 0, xp: 80 },
  { id: 'complete_module', label: 'Complete 1 lesson in any module', target: 1, progress: 0, xp: 50 },
  { id: 'quiz_streak', label: 'Get 5 correct answers in quizzes', target: 5, progress: 0, xp: 60 },
];

export const fallbackLeaderboard: LeaderboardEntry[] = [
  { id: 'shield-master', rankNumber: 1, username: 'ShieldMaster', avatar: 'character_1', totalXP: 3200, level: 7, rank: 'SanData Guardian' },
  { id: 'cyber-ninja', rankNumber: 2, username: 'CyberNinja', avatar: 'character_2', totalXP: 2410, level: 6, rank: 'Net Guardian' },
  { id: 'phish-buster', rankNumber: 3, username: 'PhishBuster', avatar: 'character_4', totalXP: 2150, level: 5, rank: 'Scam Buster' },
  { id: 'scam-defender', rankNumber: 4, username: 'ScamDefender', avatar: 'character_3', totalXP: 1980, level: 5, rank: 'Scam Defender' },
  { id: 'safe-surfer', rankNumber: 5, username: 'SafeSurfer', avatar: 'character_5', totalXP: 1750, level: 4, rank: 'Safe Surfer' },
  { id: 'shield-agent', rankNumber: 6, username: 'Shield Agent (You)', avatar: 'character_1', totalXP: 1530, level: 7, rank: 'SanData Guardian' },
  { id: 'net-guardian', rankNumber: 7, username: 'NetGuardian', avatar: 'character_2', totalXP: 1250, level: 4, rank: 'Net Guardian' },
  { id: 'alert-hero', rankNumber: 8, username: 'AlertHero', avatar: 'character_4', totalXP: 1120, level: 3, rank: 'Alert Hero' },
];

export const battleEnemies: BattleEnemy[] = [
  {
    id: 'serpent-assassin',
    name: 'Serpent Assassin',
    title: 'Phishing Ambusher',
    image: ui.battlefield.enemies[0],
    weakness: 'Sender checks and link verification',
    maxHP: 100,
  },
  {
    id: 'shadow-rogue',
    name: 'Shadow Rogue',
    title: 'OTP Thief',
    image: ui.battlefield.enemies[1],
    weakness: 'Never sharing one-time codes',
    maxHP: 100,
  },
  {
    id: 'dark-knight',
    name: 'Dark Knight',
    title: 'Authority Impersonator',
    image: ui.battlefield.enemies[3],
    weakness: 'Independent verification',
    maxHP: 100,
  },
  {
    id: 'fire-demon',
    name: 'Fire Demon',
    title: 'Urgency Pusher',
    image: ui.battlefield.enemies[6],
    weakness: 'Pausing before acting',
    maxHP: 100,
  },
];

export const battlefieldQuestions: QuizQuestion[] = [
  {
    id: 'battle-phishing-link',
    scenarioType: 'Battle Scroll',
    scenarioTitle: 'Serpent Strike',
    scenarioSubtitle: 'A suspicious login alert flashes across the field.',
    questionText: 'The message says your wallet will be frozen unless you click a shortened link. What is the strongest counter?',
    options: [
      'Tap the link before the timer ends',
      'Open the official app or website yourself',
      'Forward the alert to friends',
      'Reply with your username only',
    ],
    xpReward: 40,
    correctIndex: 1,
    explanation: 'Strong counter. Opening the official app or website avoids surprise links and lookalike domains.',
  },
  {
    id: 'battle-otp-token',
    scenarioType: 'Token Trial',
    scenarioTitle: 'Shadow Feint',
    scenarioSubtitle: 'An impostor asks for a six-digit code to stop account closure.',
    questionText: 'Which action blocks the attack?',
    options: [
      'Share the OTP because support asked',
      'Send only the last three digits',
      'Refuse and contact the official support channel',
      'Post the code in a group chat for advice',
    ],
    xpReward: 40,
    correctIndex: 2,
    explanation: 'Correct. OTPs are private keys for one moment only. No legitimate support agent needs them.',
  },
  {
    id: 'battle-marketplace',
    scenarioType: 'Merchant Mirage',
    scenarioTitle: 'False Bargain',
    scenarioSubtitle: 'A seller offers a rare item at a huge discount with payment outside the platform.',
    questionText: 'What should you do before sending money?',
    options: [
      'Pay fast to keep the discount',
      'Move to the private payment link',
      'Check seller history and stay inside protected checkout',
      'Send a smaller deposit first',
    ],
    xpReward: 40,
    correctIndex: 2,
    explanation: 'Correct. Platform protections, seller history, and realistic pricing all matter before payment.',
  },
  {
    id: 'battle-ai-voice',
    scenarioType: 'Mirror Spirit',
    scenarioTitle: 'Familiar Voice',
    scenarioSubtitle: 'A voice note sounds like a relative asking for urgent cash.',
    questionText: 'Which response is safest?',
    options: [
      'Send money because the voice matches',
      'Verify through another known number or shared family check',
      'Ask the caller to repeat the request',
      'Send the smallest amount possible',
    ],
    xpReward: 40,
    correctIndex: 1,
    explanation: 'Correct. Deepfake and impersonation scams fail when you verify through a separate trusted path.',
  },
];

export const reviewFlashcards: Flashcard[] = [
  {
    id: 'flashcard-otp',
    category: 'otp_scams',
    front: 'What should you do when someone asks for your OTP?',
    back: 'Refuse, end the conversation, and verify through the official app, website, or hotline. OTPs are never meant to be shared.',
    hint: 'Sacred token rule',
  },
  {
    id: 'flashcard-phishing-sender',
    category: 'phishing',
    front: 'What is one of the first details to inspect in a suspicious email?',
    back: 'Check the sender address and domain carefully. Lookalike domains are common in phishing attacks.',
    hint: 'Inspect the scroll seal',
  },
  {
    id: 'flashcard-marketplace',
    category: 'fake_shopping',
    front: 'Why are off-platform payments risky in online shopping?',
    back: 'They bypass dispute protection and make it easier for fake sellers to disappear after receiving money.',
    hint: 'Stay in protected gates',
  },
  {
    id: 'flashcard-urgency',
    category: 'social_engineering',
    front: 'Why do scams often use urgent deadlines?',
    back: 'Urgency pressures you to act before thinking. Pausing and verifying lowers the chance of falling for the trap.',
    hint: 'Slow beats pressure',
  },
  {
    id: 'flashcard-ai',
    category: 'ai_scams',
    front: 'How can you respond to a suspicious voice or video request from someone you know?',
    back: 'Verify through a separate trusted channel, such as a saved phone number or a shared family confirmation phrase.',
    hint: 'Mirror spirit defense',
  },
];

export const fallbackModules: LearningModule[] = [
  {
    _id: 'phishing-basics',
    title: 'The Prophecy of the Phishing Serpent',
    category: 'phishing',
    difficulty: 'beginner',
    icon: 'phishing',
    description: 'Decipher sender, link, and urgency clues that reveal false scrolls.',
    completionXP: 80,
    percentComplete: 0,
    questions: [
      {
        id: 'phishing-paypal',
        scenarioType: 'Email warning',
        scenarioTitle: "The Serpent's Deception",
        scenarioSubtitle: 'Decipher the ancient message below.',
        questionText: 'What path will you choose?',
        message: {
          from: 'security@paypal.com',
          to: 'you@gmail.com',
          brand: 'PayPal',
          body: 'We noticed unusual activity in your account. Please verify now to avoid suspension.',
          cta: 'Verify Account Now',
        },
        options: [
          'Click the link and verify',
          'Reply to the email',
          'Ignore and delete the email',
          'Forward it to your friends',
        ],
        xpReward: 50,
        correctIndex: 2,
        explanation: 'Correct. Do not use the email button. Open the official app or website directly instead.',
      },
      {
        id: 'phishing-bank-otp',
        scenarioType: 'OTP request',
        questionText: 'A message says your bank needs your OTP to keep your account open. What is safest?',
        options: [
          'Send the OTP quickly',
          'Call the official bank hotline',
          'Post the message online',
          'Try the link in a private browser',
        ],
        xpReward: 50,
        correctIndex: 1,
        explanation: 'Banks never need your OTP. Use an official channel you type or dial yourself.',
      },
      {
        id: 'phishing-short-link',
        scenarioType: 'Prize link',
        questionText: 'You won a prize from a brand you never joined. The claim link is shortened. What should you do?',
        options: [
          'Open it before it expires',
          'Share it with family',
          'Check the official brand page',
          'Enter only your name',
        ],
        xpReward: 50,
        correctIndex: 2,
        explanation: 'Unexpected prizes and shortened links are warning signs. Verify from the official source.',
      },
      {
        id: 'phishing-sender',
        scenarioType: 'Sender check',
        questionText: 'Which detail should you inspect first in a suspicious login alert?',
        options: [
          'The sender address',
          'The font size',
          'The email color',
          'The number of images',
        ],
        xpReward: 50,
        correctIndex: 0,
        explanation: 'The sender address often exposes lookalike domains and spoofed messages.',
      },
      {
        id: 'phishing-report',
        scenarioType: 'Reporting',
        questionText: 'What is the best next step after spotting a phishing email at work?',
        options: [
          'Delete it quietly',
          'Report it using the official channel',
          'Reply asking who sent it',
          'Click unsubscribe',
        ],
        xpReward: 50,
        correctIndex: 1,
        explanation: 'Reporting helps protect other people and lets security teams block similar attempts.',
      },
    ],
  },
  {
    _id: 'fake-shopping',
    title: 'The Merchant Mirage',
    category: 'fake_shopping',
    difficulty: 'beginner',
    icon: 'fake_shopping',
    description: 'Unmask false merchants, impossible discounts, and unsafe payment gates.',
    completionXP: 80,
    percentComplete: 0,
    questions: [],
  },
  {
    _id: 'investment-scams',
    title: 'The Golden Hoard Trap',
    category: 'investment_scams',
    difficulty: 'popular',
    icon: 'investment_scams',
    description: 'Recognize fake treasure promises, celebrity bait, and pressure tactics.',
    completionXP: 100,
    percentComplete: 0,
    questions: [],
  },
  {
    _id: 'social-engineering',
    title: 'The Whispering Court',
    category: 'social_engineering',
    difficulty: 'popular',
    icon: 'social_engineering',
    description: 'Practice resisting urgency, authority tricks, and emotional manipulation.',
    completionXP: 100,
    percentComplete: 0,
    questions: [],
  },
  {
    _id: 'otp-scams',
    title: 'The Sacred Token Trial',
    category: 'otp_scams',
    difficulty: 'beginner',
    icon: 'otp',
    description: 'Protect one-time passwords and account recovery codes.',
    completionXP: 70,
    percentComplete: 0,
    questions: [],
  },
  {
    _id: 'ai-scams',
    title: 'The Mirror Spirit Illusion',
    category: 'ai_scams',
    difficulty: 'advanced',
    icon: 'ai_scams',
    description: 'Identify deepfake calls, synthetic images, and AI-generated bait.',
    completionXP: 120,
    percentComplete: 0,
    questions: [],
  },
];

export const levelThresholds = [0, 500, 1500, 3000, 5000, 8000, 12000, 18000, 25000, 35000];

export function getLevelProgress(totalXP: number, level: number) {
  const current = levelThresholds[Math.max(level - 1, 0)] ?? 0;
  const next = levelThresholds[level] ?? levelThresholds[levelThresholds.length - 1];
  const span = Math.max(next - current, 1);
  const progress = Math.min(100, Math.max(0, Math.round(((totalXP - current) / span) * 100)));
  return { current, next, progress };
}

export function displayAvatar(avatar?: string) {
  const map: Record<string, string> = {
    character_1: 'SA',
    character_2: 'MK',
    character_3: 'BT',
    character_4: 'LM',
    character_5: 'DG',
  };
  return map[avatar || 'character_1'] || 'SA';
}
