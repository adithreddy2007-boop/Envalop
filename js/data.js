/**
 * data.js
 * Static content for the app: the six "vibes" a card can have, and the
 * four relationship types. Kept separate from logic/state so the copy
 * can be edited without touching any behaviour.
 *
 * Every template string may contain a {name} token, which gets replaced
 * with the display name the sender chooses (see utils.substituteName).
 */

export const VIBES = {
  feel_good: {
    label: 'Feel Good',
    emoji: '🌟',
    motif: '🌻',
    blurb: 'No occasion needed — just because',
    envelopeTitle: 'Something for no reason at all',
    photoHeadline: 'Just a little reminder.',
    orbLines: [
      'You crossed my mind today.',
      'Not for any reason.',
      'Just because you deserve it.',
      "The world's better with you in it."
    ],
    templates: [
      'No reason, no occasion, {name} — just wanted you to know you crossed my mind today, and it made everything a little better.',
      "A tiny reminder, completely unprompted, {name}: you're doing better than you think, and you're loved more than you know."
    ]
  },
  sorry: {
    label: 'Sorry',
    emoji: '💔',
    motif: '🌹',
    blurb: 'Skip the awkward text. Send a moment',
    envelopeTitle: 'Something I needed to say',
    photoHeadline: 'All I want is for you to smile again.',
    orbLines: [
      "I've been thinking about this.",
      'About what I said. What I did.',
      "I'm sorry. Really.",
      'I want to do better.'
    ],
    templates: [
      "{name}, I've been sitting with how much I hurt you, and I'm truly sorry. You matter more to me than being right ever could.",
      "I keep replaying it and wishing I'd handled it differently, {name}. You deserved better, and I want the chance to show you that."
    ]
  },
  birthday: {
    label: 'Birthday',
    emoji: '🎂',
    motif: '🎈',
    blurb: 'Make their whole day stop and smile',
    envelopeTitle: 'A little birthday magic',
    photoHeadline: 'Hope today feels this good.',
    orbLines: [
      'Another year, another you.',
      'Lucky us.',
      "Today's all about you.",
      'Happy birthday.'
    ],
    templates: [
      'Another year of you being exactly the kind of person who makes everything better just by showing up, {name}. Happy birthday.',
      "Today's just a reminder of something I already know every day, {name}: things are better with you in them. Happy birthday."
    ]
  },
  congrats: {
    label: 'Congrats',
    emoji: '🏆',
    motif: '🎉',
    blurb: 'Their big win deserves a moment',
    envelopeTitle: 'You need to see this',
    photoHeadline: 'Look what you did.',
    orbLines: [
      'You did the work.',
      'Nobody saw the late nights.',
      'But everyone sees this.',
      'So proud of you.'
    ],
    templates: [
      '{name}, you worked for this, you earned this, and I am so unbelievably proud watching it pay off.',
      "This is the part where I say I always knew you would, {name}. So proud of you. Congratulations."
    ]
  },
  thank_you: {
    label: 'Thank You',
    emoji: '🙏',
    motif: '🌼',
    blurb: "Real gratitude, not just 'tysm'",
    envelopeTitle: 'Two words, fully meant',
    photoHeadline: "This one's overdue.",
    orbLines: [
      'This is overdue.',
      'But I mean every word.',
      'Thank you —',
      'for being exactly who you are.'
    ],
    templates: [
      "A plain 'thanks' never felt like enough for everything you've done, {name}, so here's the real version: I notice it, I appreciate it.",
      "This is overdue, but I wanted you to actually hear it, {name}: thank you, for showing up, for caring, for being exactly who you are."
    ]
  },
  miss_you: {
    label: 'Miss You',
    emoji: '🌙',
    motif: '🌙',
    blurb: 'Tell them before another day slips by',
    envelopeTitle: 'Thinking of you, tonight',
    photoHeadline: 'Wish you were here.',
    orbLines: [
      "It's quieter without you.",
      'I keep noticing the gaps.',
      'Just wanted you to know —',
      "you're on my mind."
    ],
    templates: [
      "Some days the distance just hits different, {name}, and today's one of those days. Missing you more than usual.",
      "It's quieter without you around, {name}. Just wanted you to know you're on my mind, today and most days."
    ]
  }
};

export const RELATIONSHIPS = {
  friend: {
    label: 'Friend', sub: 'Close friend', emoji: '🤝',
    eyebrow: 'TO MY PERSON', eyebrowSmall: 'For a friend',
    sign: '— your person, no matter what'
  },
  partner: {
    label: 'Partner', sub: 'Girlfriend / boyfriend', emoji: '💞',
    eyebrow: 'TO MY EVERYTHING', eyebrowSmall: 'For my partner',
    sign: 'All my heart, always'
  },
  spouse: {
    label: 'Spouse', sub: 'Wife / husband', emoji: '💍',
    eyebrow: 'TO MY FOREVER', eyebrowSmall: 'For my person',
    sign: 'Forever your person'
  },
  date: {
    label: 'Date', sub: 'First date or crush', emoji: '🦋',
    eyebrow: 'TO YOU', eyebrowSmall: 'Just for you',
    sign: 'Hoping this made you smile'
  }
};
