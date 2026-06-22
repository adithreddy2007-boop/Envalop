/**
 * data.js
 * Static content: six vibes, four relationship types.
 *
 * templates is now split by relationship category:
 *   templates.friend  — for close friends
 *   templates.partner — for partner, spouse, and date
 *
 * Each has exactly 2 options. Tone: warm, human, cute, no dashes.
 * Every string may contain a {name} token.
 */

export const VIBES = {
  feel_good: {
    label: 'Feel Good',
    emoji: '🌟',
    motif: '🌻',
    blurb: 'No occasion needed, just because',
    envelopeTitle: 'Something for no reason at all',
    photoHeadline: 'Just a little reminder.',
    orbLines: [
      'You crossed my mind today.',
      'Not for any reason.',
      'Just because you deserve it.',
      'The world is better with you in it.'
    ],
    templates: {
      friend: [
        'Hey {name}, I just randomly thought about you and honestly? I am really glad you exist. No reason, no occasion. Just wanted you to know that.',
        'Out of nowhere I thought about {name} and smiled. You make things better without even trying. That is all, that is the whole message.'
      ],
      partner: [
        'Hi {name}. No reason for this, no occasion. I just got that feeling again where I realised how lucky I am that you are mine. Wanted you to know.',
        'I was just sitting here thinking about you and I had to say something. You have no idea how happy I am that you exist and that somehow you chose me.'
      ]
    }
  },

  sorry: {
    label: 'Sorry',
    emoji: '💔',
    motif: '🌹',
    blurb: 'For a patch up or owning a mistake',
    envelopeTitle: 'Something I needed to say',
    photoHeadline: 'All I want is for you to smile again.',
    orbLines: [
      'I have been sitting with this.',
      'About what I said. What I did.',
      'I am sorry. Really.',
      'I want to do better.'
    ],
    templates: {
      friend: [
        'Hey {name}, I have been sitting with this for a while and I really am sorry. I messed up and I know it. You matter too much to me to let this go unsaid.',
        '{name} I know sorry does not fix things but I mean it with everything I have. I hate that I hurt you. I really do. Please know that.'
      ],
      partner: [
        '{name} I am so sorry. Not the kind of sorry you say to end an argument. The kind where I genuinely hate that I hurt you and would take it back in a second if I could.',
        'I keep thinking about what happened and I hate how I made you feel. You deserve so much better from me {name} and I really want to do better. I am truly sorry.'
      ]
    }
  },

  birthday: {
    label: 'Birthday',
    emoji: '🎂',
    motif: '🎈',
    blurb: 'To surprise them on their day',
    envelopeTitle: 'A little birthday magic',
    photoHeadline: 'Hope today feels this good.',
    orbLines: [
      'Another year, another you.',
      'Lucky us.',
      'Today is all about you.',
      'Happy birthday.'
    ],
    templates: {
      friend: [
        'Happy birthday {name}!! Okay but genuinely, having you in my life is one of the best things that ever happened to me. I hope today is as good as you are.',
        '{name} it is your birthday and I just want you to know that the world got a lot better the day you were born. Go celebrate yourself, you absolutely deserve it.'
      ],
      partner: [
        'Happy birthday my love. I could write a hundred reasons why I am the luckiest person alive but honestly it all comes down to you. Hope today feels as special as you are to me.',
        'Happy birthday {name}. Another year with you is honestly a gift. I love you more than I ever knew was possible and I cannot wait to celebrate every single birthday with you.'
      ]
    }
  },

  congrats: {
    label: 'Congrats',
    emoji: '🏆',
    motif: '🎉',
    blurb: 'The big win deserves a moment',
    envelopeTitle: 'You need to see this',
    photoHeadline: 'Look what you did.',
    orbLines: [
      'You did the work.',
      'Nobody saw the late nights.',
      'But everyone sees this.',
      'So proud of you.'
    ],
    templates: {
      friend: [
        '{name} you actually did it!! I knew you would. I have watched you work so hard for this and seeing it pay off makes me so genuinely happy. Go celebrate this properly!',
        'Okay {name} this is your moment. You earned every single bit of this. Nobody worked harder and nobody deserves it more. I am so proud of you it is ridiculous.'
      ],
      partner: [
        '{name} I have watched you give everything to this and seeing you win is one of the most beautiful things. I am so proud of you. Come here so I can celebrate you properly.',
        'You did it {name}. You actually did it. I always knew you would but watching it happen still made my heart so full. Nobody deserves this more than you do.'
      ]
    }
  },

  thank_you: {
    label: 'Thank You',
    emoji: '🙏',
    motif: '🌼',
    blurb: 'Real gratitude, not just tysm',
    envelopeTitle: 'Two words, fully meant',
    photoHeadline: 'This one is overdue.',
    orbLines: [
      'This is overdue.',
      'But I mean every word.',
      'Thank you.',
      'For being exactly who you are.'
    ],
    templates: {
      friend: [
        'Hey {name}, I do not say this enough but genuinely thank you. For everything. For showing up, for being you, for making things better without even trying. I see it and I appreciate it more than you know.',
        '{name} I have been meaning to say this for a while. Thank you. Not just for the big things but for all the small things you do that you probably do not even realise matter. They really do.'
      ],
      partner: [
        '{name} I want you to know that I notice everything you do for us. Every small thing. And I am so grateful for you. You make loving you the easiest thing in the world.',
        'Thank you {name}. For loving me the way you do, for choosing me every single day, for making me feel safe. I do not say it enough but I feel it always.'
      ]
    }
  },

  miss_you: {
    label: 'Miss You',
    emoji: '🌙',
    motif: '🌙',
    blurb: 'Tell them before another day slips by',
    envelopeTitle: 'Thinking of you, tonight',
    photoHeadline: 'Wish you were here.',
    orbLines: [
      'It is quieter without you.',
      'I keep noticing the gaps.',
      'Just wanted you to know.',
      'You are on my mind.'
    ],
    templates: {
      friend: [
        'I know it has been a while {name} but I have genuinely been thinking about you. I miss you. Not in a dramatic way, just in the way where everything funny happens and you are the first person I want to tell.',
        '{name} I just really miss you. Miss laughing about nothing with you. Miss how easy everything feels when you are around. Just wanted you to know that.'
      ],
      partner: [
        'I miss you {name}. Like actually miss you. The kind of miss where I reach for you without thinking and then remember you are not there. Come back to me soon.',
        'Everything is a little quieter and a little less right when you are not here {name}. I miss you more than I usually admit. Just needed you to know that today.'
      ]
    }
  }
};

export const RELATIONSHIPS = {
  friend: {
    label: 'Friend', sub: 'Close friend', emoji: '🤝',
    eyebrow: 'TO MY PERSON', eyebrowSmall: 'For a friend',
    sign: 'your person, no matter what',
    templateKey: 'friend'
  },
  partner: {
    label: 'Partner', sub: 'Girlfriend / boyfriend', emoji: '💞',
    eyebrow: 'TO MY EVERYTHING', eyebrowSmall: 'For my partner',
    sign: 'all my heart, always',
    templateKey: 'partner'
  },
  spouse: {
    label: 'Spouse', sub: 'Wife / husband', emoji: '💍',
    eyebrow: 'TO MY FOREVER', eyebrowSmall: 'For my person',
    sign: 'forever your person',
    templateKey: 'partner'
  },
  date: {
    label: 'Date', sub: 'First date or crush', emoji: '🦋',
    eyebrow: 'TO YOU', eyebrowSmall: 'Just for you',
    sign: 'hoping this made you smile',
    templateKey: 'partner'
  }
};
