export const STORY_START = 'awakening'

export const STORY_NODES = {
  // ===== Step 1: The Awakening =====
  awakening: {
    step: 1,
    mood: 'awakening',
    title: 'The Awakening',
    narration:
      "The story starts in silence. You open your eyes and see a smooth white stone path running through a big, quiet forest. In front of you, three glowing arches float in the air, and each one leads somewhere different.",
    choices: [
      {
        id: 'A',
        label: 'The Arch of Curiosity',
        sublabel: 'Warm, shifting light that keeps changing',
        next: 'curiosity',
      },
      {
        id: 'B',
        label: 'The Arch of Serenity',
        sublabel: 'Calm, still, and full of peace',
        next: 'serenity',
      },
      {
        id: 'C',
        label: 'The Arch of Shadows',
        sublabel: 'Mysterious, bold, and unknown',
        next: 'shadows',
      },
    ],
  },

  // ===== Step 2: The Core Elements =====
  curiosity: {
    step: 2,
    mood: 'curiosity',
    title: 'The Core Elements',
    narration:
      "The air fills with the sound of far-away laughter and soft, sweet music. As you walk, a crystal stand shows up on the path, holding a glowing hourglass. A voice speaks:",
    prompt: 'Time is a gift. How do you choose to spend it?',
    choices: [
      {
        id: 'A',
        label: 'Going after wild, fun moments that make me laugh till my stomach hurts.',
        next: 'curiosity_festival',
      },
      {
        id: 'B',
        label: 'Building quiet, deep bonds with the people who matter most.',
        next: 'curiosity_cafe',
      },
    ],
  },
  serenity: {
    step: 2,
    mood: 'serenity',
    title: 'The Core Elements',
    narration:
      "A deep calm spreads over you. The path runs along a still lake, smooth like glass, that mirrors a sky full of stars. By the edge of the water, a silver pen floats above an empty book. The voice speaks:",
    prompt: 'Every life is a blank page. What matters most to you in yours?',
    choices: [
      {
        id: 'A',
        label: 'Being free to fully be myself, without any pretending.',
        next: 'serenity_garden',
      },
      {
        id: 'B',
        label: 'Finding someone who really gets the thoughts I keep inside.',
        next: 'serenity_key',
      },
    ],
  },
  shadows: {
    step: 2,
    mood: 'shadows',
    title: 'The Core Elements',
    narration:
      "The path turns smooth, bold, and modern, running through a canyon under a bright midnight sky. Suddenly the ground under you shines, showing a tricky, glowing maze of light. The voice speaks:",
    prompt: "The best paths are the ones we don't see coming. What keeps you moving forward?",
    choices: [
      {
        id: 'A',
        label: 'The thrill of finding something totally new.',
        next: 'shadows_compass',
      },
      {
        id: 'B',
        label: 'The loyalty and warmth of someone who is always by my side.',
        next: 'shadows_cave',
      },
    ],
  },

  // ===== Step 3: Deep Personalization =====
  curiosity_festival: {
    step: 3,
    mood: 'curiosity_festival',
    title: 'Spark of Joy',
    narration:
      "The path turns into a busy night festival. A street seller hands you a strange velvet box. 'Inside is a spark of pure joy,' he says.",
    prompt: 'How will you share it?',
    choices: [
      {
        id: 'A',
        label: "I'd open it right away to turn a regular day into a wild party.",
        next: 'gate',
      },
      {
        id: 'B',
        label: "I'd save it for that one person who always matches my energy.",
        next: 'gate',
      },
    ],
  },
  curiosity_cafe: {
    step: 3,
    mood: 'curiosity_cafe',
    title: 'The Late-Night Café',
    narration:
      "The festival lights fade into a cozy, late-night café. Two empty chairs sit by a window with soft rain falling outside. A small note on the table asks:",
    prompt: 'What makes a talk truly unforgettable?',
    choices: [
      {
        id: 'A',
        label: 'Staying up till 3 AM, talking about everything and nothing at the same time.',
        next: 'gate',
      },
      {
        id: 'B',
        label: 'When the other person remembers the small things you forgot you even said.',
        next: 'gate',
      },
    ],
  },
  serenity_garden: {
    step: 3,
    mood: 'serenity_garden',
    title: 'The Greenhouse Garden',
    narration:
      "The starlit lake opens up to a wide, beautiful greenhouse garden. The plants grow in shapes that match your thoughts perfectly. A stone carving reads:",
    prompt: 'Real freedom is rare. When do you feel most at ease?',
    choices: [
      {
        id: 'A',
        label: 'When I can drop my guard fully and just laugh without thinking too much.',
        next: 'gate',
      },
      {
        id: 'B',
        label: 'When someone accepts my quiet side just as much as my loud one.',
        next: 'gate',
      },
    ],
  },
  serenity_key: {
    step: 3,
    mood: 'serenity_key',
    title: 'The Silver Key',
    narration:
      "The lake starts to glow from below, casting soft light on the trees. A silver key shows up in your hand and fits into a hidden lock floating in the air. A whisper speaks:",
    prompt: 'Being truly understood is a rare gift. What are you looking for?',
    choices: [
      {
        id: 'A',
        label: "Someone who reads between the lines when I say ‘I'm fine.’",
        next: 'gate',
      },
      {
        id: 'B',
        label: 'Someone whose company makes the rest of the noisy world feel totally quiet.',
        next: 'gate',
      },
    ],
  },
  shadows_compass: {
    step: 3,
    mood: 'shadows_compass',
    title: 'The Neon Compass',
    narration:
      "The maze walls fade away, leaving you on a mountain top looking over a huge digital skyline. A neon compass shows up, its needle spinning fast until it points straight ahead. 'The horizon is calling,' the wind whispers.",
    prompt: 'What are you looking for?',
    choices: [
      {
        id: 'A',
        label: 'A surprise twist that completely changes the direction of my year.',
        next: 'gate',
      },
      {
        id: 'B',
        label: 'A solid partner to share the craziest roads with.',
        next: 'gate',
      },
    ],
  },
  shadows_cave: {
    step: 3,
    mood: 'shadows_cave',
    title: 'The Sheltered Cave',
    narration:
      "The modern canyon path narrows into a safe cave lit by a warm, crackling campfire. It feels totally cut off from the rest of the world. A shield on the wall is carved with one question:",
    prompt: "What's the strongest thing against the dark?",
    choices: [
      {
        id: 'A',
        label: "Trust that doesn't need to be proven over and over.",
        next: 'gate',
      },
      {
        id: 'B',
        label: "Knowing there's one person who always has your back, no matter what.",
        next: 'gate',
      },
    ],
  },

  // ===== Step 4: The Gate =====
  gate: {
    step: 4,
    mood: 'gate',
    kind: 'gate',
    title: 'The Gate',
    narration:
      "Every path you walked led here. A gate of soft, golden light stands between you and an open horizon — and something on the other side has been waiting for you.",
    cta: 'Unlock the Horizon',
    next: 'reveal',
  },

  // ===== Step 5: The Reveal =====
  reveal: {
    step: 5,
    mood: 'reveal',
    kind: 'reveal',
    title: 'The Reveal',
    paragraphs: [
      "The gates swing open.",
      "This world didn't exist until today. I made this.",
      "Qismat ka intezar nahin kiya،Apni khamoshi ko mehnat mein badal diya.Yeh sab tumhare liye tha,Bas dua hai ke main tumhari kahani ka ajnabi musafir na banun."
    ],
    cta: 'Next',
    next: null,
  },
}
