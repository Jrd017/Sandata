const Module = require('../models/Module');
const Badge = require('../models/Badge');

const modules = [
  {
    title: 'The Prophecy of the Phishing Serpent',
    category: 'phishing',
    difficulty: 'beginner',
    icon: 'phishing',
    description: 'Decipher sender, link, and urgency clues that reveal false scrolls.',
    completionXP: 100,
    questions: [
      {
        questionText: 'You received an email from "security@paypa1.com" asking you to verify your account. What should you do?',
        scenarioType: 'email',
        options: ['Click the link and verify', 'Reply to the email', 'Ignore and delete the email', 'Forward it to your friends'],
        correctIndex: 2,
        explanation: 'Legitimate companies never ask for credentials through surprise email links. The domain uses the number 1 instead of the letter l.',
        xpReward: 20,
      },
      {
        questionText: 'A message says "Congrats! You won PHP 5,000! Click the link to claim." What is this most likely?',
        scenarioType: 'sms',
        options: ['A real prize', 'A phishing scam', 'A government announcement', 'A bank promotion'],
        correctIndex: 1,
        explanation: 'Unsolicited prize messages are usually phishing or smishing attempts designed to collect private information.',
        xpReward: 20,
      },
      {
        questionText: 'Which of the following is a red flag in an email?',
        scenarioType: 'email',
        options: ['Proper grammar and logo', "Sender's domain matches company name", 'Urgent language like "Act NOW or lose access"', 'Clear unsubscribe button'],
        correctIndex: 2,
        explanation: 'Urgency is a pressure tactic. Slow down and verify through the official site or app.',
        xpReward: 20,
      },
      {
        questionText: 'A login page opened from an email looks real, but the URL is "secure-paypal.verify-user.co". What is safest?',
        scenarioType: 'browser',
        options: ['Enter your password if the logo looks correct', 'Open PayPal manually in a new tab', 'Ask the sender if it is real', 'Bookmark the fake page'],
        correctIndex: 1,
        explanation: 'A real-looking page can still be fake. Navigate directly to the official website or app.',
        xpReward: 20,
      },
    ],
  },
  {
    title: 'The Merchant Mirage',
    category: 'fake_shopping',
    difficulty: 'beginner',
    icon: 'fake_shopping',
    description: 'Unmask false merchants, impossible discounts, and unsafe payment gates.',
    completionXP: 80,
    questions: [
      {
        questionText: 'An online shop offers a brand-new iPhone for PHP 1,000. What should you do?',
        scenarioType: 'shop',
        options: ['Buy it immediately', 'Share it with friends', 'Be suspicious because it is likely a scam', 'Check reviews then buy instantly'],
        correctIndex: 2,
        explanation: 'Extreme discounts are a major warning sign for counterfeit, stolen, or non-existent products.',
        xpReward: 20,
      },
      {
        questionText: 'A seller says they only accept bank transfer and refuses platform checkout. What is the safest response?',
        scenarioType: 'chat',
        options: ['Pay quickly to reserve the item', 'Use platform checkout or walk away', 'Send half now and half later', 'Ask for more product photos only'],
        correctIndex: 1,
        explanation: 'Platform checkout gives dispute protection. Moving payments outside the app is a common scam tactic.',
        xpReward: 20,
      },
      {
        questionText: 'Which seller profile looks risky?',
        scenarioType: 'marketplace',
        options: ['Long history and verified purchases', 'Many detailed buyer reviews', 'New account with copied photos and urgent payment demand', 'Clear return policy'],
        correctIndex: 2,
        explanation: 'New profiles, copied photos, and payment urgency often appear together in fake shopping scams.',
        xpReward: 20,
      },
    ],
  },
  {
    title: 'The Sacred Token Trial',
    category: 'otp_scams',
    difficulty: 'popular',
    icon: 'otp',
    description: 'Protect one-time passwords and account recovery codes.',
    completionXP: 90,
    questions: [
      {
        questionText: 'Someone calls claiming to be from your bank and asks for your OTP. What do you do?',
        scenarioType: 'call',
        options: ['Give the OTP quickly', 'Hang up and call your bank directly', 'Give only the last 3 digits', 'Send it by text instead'],
        correctIndex: 1,
        explanation: 'Banks never ask for your OTP by phone or text. Call the official hotline yourself.',
        xpReward: 20,
      },
      {
        questionText: 'A delivery rider asks for an OTP to "release a refund" for a package you did not order. What is safest?',
        scenarioType: 'sms',
        options: ['Share the OTP', 'Ignore the OTP and report the message', 'Ask them to wait while you check', 'Send a screenshot of the OTP page'],
        correctIndex: 1,
        explanation: 'An OTP authorizes account access or payment. Never share it with anyone.',
        xpReward: 20,
      },
      {
        questionText: 'Which phrase should make you stop immediately?',
        scenarioType: 'call',
        options: ['Please call our official hotline', 'Never share your OTP', 'Read the six-digit code to confirm your account', 'Use the official app'],
        correctIndex: 2,
        explanation: 'Anyone asking you to read an OTP is trying to bypass your account protection.',
        xpReward: 20,
      },
    ],
  },
  {
    title: 'The Mirror Spirit Illusion',
    category: 'ai_scams',
    difficulty: 'advanced',
    icon: 'ai_scams',
    description: 'Identify deepfake calls, synthetic images, and AI-generated bait.',
    completionXP: 120,
    questions: [
      {
        questionText: 'You receive a video call from your "boss" asking for an emergency bank transfer. The voice sounds exactly right. What do you do?',
        scenarioType: 'video',
        options: ['Transfer immediately', 'Hang up and verify through a different channel', 'Transfer half and wait', 'Ask for their employee ID'],
        correctIndex: 1,
        explanation: 'AI can clone faces and voices. Verify unusual money requests through a separate trusted channel.',
        xpReward: 30,
      },
      {
        questionText: 'A relative sends a voice note asking for emergency cash, but the number is new. What should you do?',
        scenarioType: 'voice',
        options: ['Send cash right away', 'Call their known number or another family contact', 'Ask the new number for a selfie', 'Post about it publicly'],
        correctIndex: 1,
        explanation: 'Voice clones are convincing. Use a trusted contact path you already know.',
        xpReward: 30,
      },
      {
        questionText: 'Which verification step is strongest for a suspicious video call?',
        scenarioType: 'video',
        options: ['Trust the face on screen', 'Ask a private question only they know and verify separately', 'Check if the camera quality is high', 'Look for a company logo'],
        correctIndex: 1,
        explanation: 'A separate verification channel and private context are stronger than visual appearance.',
        xpReward: 30,
      },
    ],
  },
];

const badges = [
  {
    key: 'phishing_fighter',
    name: 'Phishing Fighter',
    description: 'Complete five quiz attempts and keep reporting suspicious links.',
    icon: 'shield',
    xpThreshold: 0,
    condition: 'complete_5_quizzes',
  },
  {
    key: 'quiz_master',
    name: 'Quiz Master',
    description: 'Reach at least 90 percent overall accuracy.',
    icon: 'star',
    xpThreshold: 0,
    condition: 'accuracy_90',
  },
  {
    key: 'streak_warrior',
    name: 'Streak Warrior',
    description: 'Log in for seven consecutive days.',
    icon: 'flame',
    xpThreshold: 0,
    condition: 'day_streak_7',
  },
  {
    key: 'sharp_observer',
    name: 'Sharp Observer',
    description: 'Earn a perfect score on any module.',
    icon: 'eye',
    xpThreshold: 0,
    condition: 'perfect_score',
  },
  {
    key: 'community_helper',
    name: 'Community Helper',
    description: 'Earn 500 Spirit Shards by improving your scam awareness.',
    icon: 'users',
    xpThreshold: 500,
    condition: 'xp_500',
  },
];

async function seedAll({ force = false } = {}) {
  if (force) {
    await Promise.all([Module.deleteMany({}), Badge.deleteMany({})]);
  }

  if ((await Module.countDocuments()) === 0) {
    await Module.insertMany(modules);
  }

  for (const badge of badges) {
    await Badge.findOneAndUpdate({ key: badge.key }, badge, { upsert: true, new: true });
  }
}

async function seedIfEmpty() {
  await seedAll({ force: false });
}

module.exports = { modules, badges, seedAll, seedIfEmpty };
