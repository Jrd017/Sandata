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

const serpentQuestions: QuizQuestion[] = [
  {
    id: 'serpent-urgency',
    scenarioType: 'Phishing Strike',
    scenarioTitle: 'False Login Alert',
    scenarioSubtitle: 'The serpent wraps a fake email around a familiar brand.',
    questionText: 'What is a common sign of a phishing email?',
    options: ['Sense of Urgency', 'Secure Link', 'Correct Grammar', 'Known Sender'],
    xpReward: 45,
    correctIndex: 0,
    explanation: 'Correct. Urgency is a classic phishing pressure tactic that tries to make you click before thinking.',
  },
  {
    id: 'serpent-link',
    scenarioType: 'Phishing Strike',
    scenarioTitle: 'Lookalike Gate',
    scenarioSubtitle: 'A button points to a shortened domain instead of the official site.',
    questionText: 'What should you do before opening the link?',
    options: ['Open it quickly', 'Check the sender and domain', 'Reply with your password', 'Forward it to friends'],
    xpReward: 45,
    correctIndex: 1,
    explanation: 'Right. Inspect the sender and domain, then use the official app or typed address instead of a surprise link.',
  },
  {
    id: 'serpent-report',
    scenarioType: 'Phishing Strike',
    scenarioTitle: 'Poisoned Scroll',
    scenarioSubtitle: 'The message asks you to verify your wallet by midnight.',
    questionText: 'What is the safest counter?',
    options: ['Report and delete it', 'Enter only your email', 'Click in private mode', 'Ask the sender for proof'],
    xpReward: 45,
    correctIndex: 0,
    explanation: 'Good defense. Reporting helps block the attack for everyone, and deletion keeps the bait away.',
  },
];

const rogueQuestions: QuizQuestion[] = [
  {
    id: 'rogue-otp',
    scenarioType: 'Token Trial',
    scenarioTitle: 'Six-Digit Snare',
    scenarioSubtitle: 'The rogue claims support needs your OTP to stop account closure.',
    questionText: 'Which action blocks the attack?',
    options: ['Share the OTP', 'Send half the code', 'Refuse and verify officially', 'Post it for advice'],
    xpReward: 45,
    correctIndex: 2,
    explanation: 'Correct. OTPs are private keys for one moment only. No real support agent needs them.',
  },
  {
    id: 'rogue-call',
    scenarioType: 'Token Trial',
    scenarioTitle: 'Support Impostor',
    scenarioSubtitle: 'A caller says your payment app is locked and asks for the login code.',
    questionText: 'What should you do?',
    options: ['Read the code aloud', 'End the call and use the official hotline', 'Wait for another OTP', 'Send a screenshot'],
    xpReward: 45,
    correctIndex: 1,
    explanation: 'Strong move. End the call and contact support through a number or app you trust.',
  },
  {
    id: 'rogue-recovery',
    scenarioType: 'Token Trial',
    scenarioTitle: 'Recovery Trap',
    scenarioSubtitle: 'Someone says they accidentally sent their code to your phone.',
    questionText: 'What is the warning sign?',
    options: ['They are polite', 'They ask for a code sent to you', 'They know your first name', 'They use a local number'],
    xpReward: 45,
    correctIndex: 1,
    explanation: 'Exactly. A code sent to your device protects your account, even if the story sounds harmless.',
  },
];

const golemQuestions: QuizQuestion[] = [
  {
    id: 'golem-form',
    scenarioType: 'Data Trap',
    scenarioTitle: 'Heavy Form',
    scenarioSubtitle: 'A giveaway asks for your birthday, address, ID number, and contacts.',
    questionText: 'What should you question first?',
    options: ['The prize color', 'Why so much data is needed', 'The page font', 'The number of emojis'],
    xpReward: 45,
    correctIndex: 1,
    explanation: 'Correct. Collecting unnecessary personal data is a major warning sign.',
  },
  {
    id: 'golem-permission',
    scenarioType: 'Data Trap',
    scenarioTitle: 'Permission Slam',
    scenarioSubtitle: 'A quiz app wants access to contacts and files.',
    questionText: 'What is safest?',
    options: ['Allow all permissions', 'Deny unnecessary access', 'Use a work account', 'Invite friends first'],
    xpReward: 45,
    correctIndex: 1,
    explanation: 'Right. Only grant permissions that match what the app truly needs.',
  },
  {
    id: 'golem-profile',
    scenarioType: 'Data Trap',
    scenarioTitle: 'Overshare Quarry',
    scenarioSubtitle: 'A public profile asks for security-question style details.',
    questionText: 'What should stay private?',
    options: ['Favorite public hobby', 'Pet name and mother maiden name', 'Display name', 'Profile color'],
    xpReward: 45,
    correctIndex: 1,
    explanation: 'Correct. Those details can be used to reset or break into accounts.',
  },
];

const knightQuestions: QuizQuestion[] = [
  {
    id: 'knight-boss',
    scenarioType: 'Authority Feint',
    scenarioTitle: 'Command From Above',
    scenarioSubtitle: 'A message that looks like your boss asks for urgent gift cards.',
    questionText: 'What is the safest response?',
    options: ['Buy immediately', 'Verify through another channel', 'Reply with card codes', 'Ask for a larger budget'],
    xpReward: 45,
    correctIndex: 1,
    explanation: 'Correct. Authority scams fail when you verify through a separate trusted channel.',
  },
  {
    id: 'knight-bank',
    scenarioType: 'Authority Feint',
    scenarioTitle: 'Official Seal',
    scenarioSubtitle: 'A caller says they are from the bank fraud team and needs your password.',
    questionText: 'What proves this is unsafe?',
    options: ['They sound calm', 'They ask for your password', 'They know the bank name', 'They call at noon'],
    xpReward: 45,
    correctIndex: 1,
    explanation: 'Exactly. A real bank will never ask for your password or OTP.',
  },
  {
    id: 'knight-pressure',
    scenarioType: 'Authority Feint',
    scenarioTitle: 'No Time To Think',
    scenarioSubtitle: 'The attacker says you will be punished if you verify first.',
    questionText: 'What tactic is being used?',
    options: ['Transparency', 'Pressure and intimidation', 'Account recovery', 'Normal support'],
    xpReward: 45,
    correctIndex: 1,
    explanation: 'Correct. Pressure is meant to shut down your judgment.',
  },
];

const banditQuestions: QuizQuestion[] = [
  {
    id: 'bandit-payment',
    scenarioType: 'Merchant Mirage',
    scenarioTitle: 'Off-Platform Deal',
    scenarioSubtitle: 'The seller offers a huge discount if you pay outside the marketplace.',
    questionText: 'What should you do?',
    options: ['Pay outside to save money', 'Stay inside protected checkout', 'Send a small deposit', 'Share your login'],
    xpReward: 45,
    correctIndex: 1,
    explanation: 'Right. Off-platform payments remove buyer protections and make fraud easier.',
  },
  {
    id: 'bandit-price',
    scenarioType: 'Merchant Mirage',
    scenarioTitle: 'Too-Cheap Treasure',
    scenarioSubtitle: 'A new shop sells a popular phone for 90 percent off.',
    questionText: 'What is the warning sign?',
    options: ['Impossible discount', 'Clear product photo', 'Long title', 'Free shipping'],
    xpReward: 45,
    correctIndex: 0,
    explanation: 'Correct. Unrealistic pricing is often bait for fake shops.',
  },
  {
    id: 'bandit-review',
    scenarioType: 'Merchant Mirage',
    scenarioTitle: 'Empty Stall',
    scenarioSubtitle: 'The seller has no history and copied reviews.',
    questionText: 'What should you check?',
    options: ['Seller age and review quality', 'Emoji count', 'Background color', 'How fast they reply'],
    xpReward: 45,
    correctIndex: 0,
    explanation: 'Correct. Seller history and review authenticity matter before payment.',
  },
];

const demonQuestions: QuizQuestion[] = [
  {
    id: 'demon-voice',
    scenarioType: 'Mirror Spirit',
    scenarioTitle: 'Familiar Voice',
    scenarioSubtitle: 'A voice note sounds like a relative asking for urgent cash.',
    questionText: 'Which response is safest?',
    options: ['Send money now', 'Verify on a known number', 'Ask the caller to repeat it', 'Send a smaller amount'],
    xpReward: 45,
    correctIndex: 1,
    explanation: 'Correct. Deepfake and impersonation scams fail when you verify through a trusted path.',
  },
  {
    id: 'demon-video',
    scenarioType: 'Mirror Spirit',
    scenarioTitle: 'Synthetic Proof',
    scenarioSubtitle: 'A short video uses a famous person to promote a guaranteed investment.',
    questionText: 'What should you suspect?',
    options: ['AI-generated endorsement', 'Official announcement', 'Bank guarantee', 'Free education'],
    xpReward: 45,
    correctIndex: 0,
    explanation: 'Right. Scammers use synthetic media to fake trust and authority.',
  },
  {
    id: 'demon-family-code',
    scenarioType: 'Mirror Spirit',
    scenarioTitle: 'Emergency Spell',
    scenarioSubtitle: 'A caller says not to tell anyone and to send funds immediately.',
    questionText: 'What defense helps families?',
    options: ['Secret verification phrase', 'Faster transfers', 'Turning off notifications', 'Using public Wi-Fi'],
    xpReward: 45,
    correctIndex: 0,
    explanation: 'Correct. A family phrase or second-channel check breaks urgent impersonation attempts.',
  },
];

export const battleEnemies: BattleEnemy[] = [
  {
    category: 'phishing',
    id: 'serpent-assassin',
    image: ui.battlefield.enemies[0],
    maxHP: 110,
    name: 'Phishing Serpent',
    title: 'False Link Assassin',
    weakness: 'Sender checks and official links',
    questions: serpentQuestions,
  },
  {
    category: 'otp_scams',
    id: 'shadow-rogue',
    image: ui.battlefield.enemies[1],
    maxHP: 120,
    name: 'Shadow Rogue',
    title: 'OTP Ninja',
    weakness: 'Never sharing one-time codes',
    questions: rogueQuestions,
  },
  {
    category: 'data_harvesting',
    id: 'stone-golem',
    image: ui.battlefield.enemies[2],
    maxHP: 140,
    name: 'Stone Golem',
    title: 'Data Harvester',
    weakness: 'Sharing only what is necessary',
    questions: golemQuestions,
  },
  {
    category: 'social_engineering',
    id: 'dark-knight',
    image: ui.battlefield.enemies[3],
    maxHP: 130,
    name: 'Dark Knight',
    title: 'Authority Impostor',
    weakness: 'Independent verification',
    questions: knightQuestions,
  },
  {
    category: 'fake_shopping',
    id: 'bandit-brute',
    image: ui.battlefield.enemies[8],
    maxHP: 125,
    name: 'Bandit Brute',
    title: 'Fake Merchant',
    weakness: 'Protected checkout and seller checks',
    questions: banditQuestions,
  },
  {
    category: 'ai_scams',
    id: 'fire-demon',
    image: ui.battlefield.enemies[6],
    maxHP: 135,
    name: 'Fire Demon',
    title: 'AI Panic Caller',
    weakness: 'Verifying through a second channel',
    questions: demonQuestions,
  },
];

export const battlefieldQuestions: QuizQuestion[] = serpentQuestions;

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
