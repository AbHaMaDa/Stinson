export const STORY_START = 'awakening'

export const STORY_NODES = {
  // ===== Step 1: The Awakening =====
  awakening: {
    step: 1,
    mood: 'awakening',
    title: 'The Awakening',
    narration:
      "The story begins in silence. You open your eyes to find yourself standing on a path made of polished white stone, cutting through a vast, quiet forest. Hanging in the air before you are three glowing archways, each leading a completely different way.",
    choices: [
      {
        id: 'A',
        label: 'The Arch of Curiosity',
        sublabel: 'Warm, unpredictable shifting light',
        next: 'curiosity',
      },
      {
        id: 'B',
        label: 'The Arch of Serenity',
        sublabel: 'Calm, still, and deeply peaceful',
        next: 'serenity',
      },
      {
        id: 'C',
        label: 'The Arch of Shadows',
        sublabel: 'Mysterious, daring, and unknown',
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
      "The air instantly fills with the sound of distant laughter and faint, beautiful music. As you walk, a crystal pedestal appears in your path, holding a glowing hourglass. A voice echoes:",
    prompt: "Time is a gift. How do you choose to spend it?",
    choices: [
      {
        id: 'A',
        label: 'Chasing chaotic moments that make me laugh until my stomach hurts.',
        next: 'curiosity_festival',
      },
      {
        id: 'B',
        label: 'Building quiet, deep connections with the people who matter.',
        next: 'curiosity_cafe',
      },
    ],
  },
  serenity: {
    step: 2,
    mood: 'serenity',
    title: 'The Core Elements',
    narration:
      "A wave of profound calm washes over you. The path winds along a perfectly still, glass-like lake reflecting a sky full of stars. At the edge of the water, a silver quill hovers over a blank book. The voice echoes:",
    prompt: "Every life is a blank page. What matters most to you in your chapters?",
    choices: [
      {
        id: 'A',
        label: 'Having the freedom to be entirely myself without any pretense.',
        next: 'serenity_garden',
      },
      {
        id: 'B',
        label: 'Finding someone who truly understands the thoughts I keep to myself.',
        next: 'serenity_key',
      },
    ],
  },
  shadows: {
    step: 2,
    mood: 'shadows',
    title: 'The Core Elements',
    narration:
      "The path becomes sleek, bold, and modern, cutting through a canyon under a brilliant midnight sky. Suddenly, the ground beneath you shimmers, revealing a complex, glowing labyrinth of light. The voice echoes:",
    prompt: "The best paths are the ones we don't expect. What drives you forward?",
    choices: [
      {
        id: 'A',
        label: 'The excitement of discovering something entirely new.',
        next: 'shadows_compass',
      },
      {
        id: 'B',
        label: 'The loyalty and warmth of a steady presence beside me.',
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
      "The path transforms into a lively night festival. A street vendor offers you a mysterious velvet box. 'Inside is a spark of absolute joy,' he says.",
    prompt: 'How will you share it?',
    choices: [
      {
        id: 'A',
        label: "I'd open it immediately to turn a normal day into a wild celebration.",
        next: 'gate',
      },
      {
        id: 'B',
        label: "I'd save it for that one specific person who always matches my energy.",
        next: 'gate',
      },
    ],
  },
  curiosity_cafe: {
    step: 3,
    mood: 'curiosity_cafe',
    title: 'The Late-Night Café',
    narration:
      "The festival lights soften into a cozy, late-night café setup. Two empty chairs sit by a window looking out at a gentle rainstorm. A small note on the table asks:",
    prompt: 'What makes a conversation truly unforgettable?',
    choices: [
      {
        id: 'A',
        label: 'Staying up until 3 AM talking about everything and absolutely nothing at all.',
        next: 'gate',
      },
      {
        id: 'B',
        label: 'When you realize the other person remembers the tiny details you forgot you even said.',
        next: 'gate',
      },
    ],
  },
  serenity_garden: {
    step: 3,
    mood: 'serenity_garden',
    title: 'The Greenhouse Garden',
    narration:
      "The starlit lake opens up to a sprawling, beautiful greenhouse garden. The plants grow in patterns that perfectly mimic your thoughts. A stone inscription reads:",
    prompt: 'True freedom is rare. When do you feel most comfortable?',
    choices: [
      {
        id: 'A',
        label: 'When I can drop my guard completely and just laugh without overthinking.',
        next: 'gate',
      },
      {
        id: 'B',
        label: 'When someone accepts my quiet moments just as much as my loud ones.',
        next: 'gate',
      },
    ],
  },
  serenity_key: {
    step: 3,
    mood: 'serenity_key',
    title: 'The Silver Key',
    narration:
      "The lake water begins to glow from beneath, casting soft patterns on the trees. A silver key appears in your hand, fitting perfectly into a hidden lock in the air. A whisper echoes:",
    prompt: 'To be truly understood is a rare treasure. What are you looking for?',
    choices: [
      {
        id: 'A',
        label: "Someone who reads between the lines when I say 'I'm fine.'",
        next: 'gate',
      },
      {
        id: 'B',
        label: 'A presence that makes the rest of the chaotic world feel completely quiet.',
        next: 'gate',
      },
    ],
  },
  shadows_compass: {
    step: 3,
    mood: 'shadows_compass',
    title: 'The Neon Compass',
    narration:
      "The labyrinth walls dissolve, leaving you on a mountain peak overlooking a vast digital skyline. A neon compass appears, its needle spinning wildly until it points directly forward. 'The horizon is calling,' the wind whispers.",
    prompt: 'What are you looking for?',
    choices: [
      {
        id: 'A',
        label: 'An unexpected plot twist that completely changes the direction of my year.',
        next: 'gate',
      },
      {
        id: 'B',
        label: 'A reliable co-pilot to share the craziest paths with.',
        next: 'gate',
      },
    ],
  },
  shadows_cave: {
    step: 3,
    mood: 'shadows_cave',
    title: 'The Sheltered Cave',
    narration:
      "The modern canyon pathway narrows into a safe, sheltered cave lit by a warm, crackling campfire. It feels entirely isolated from the rest of the world. A shield on the wall is engraved with a single question:",
    prompt: 'What is the strongest force against the dark?',
    choices: [
      {
        id: 'A',
        label: "Unconditional trust that doesn't need to be constantly proven.",
        next: 'gate',
      },
      {
        id: 'B',
        label: 'Knowing there is one specific person who always has your back, no matter what.',
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
      "This world didn't exist until today. I built it for you.",
      "Every path you walked, every tier you unlocked, and every line of code on this page was crafted by me — because standard words couldn't possibly capture how much you mean to me.",
    ],
    cta: 'Next',
    next: null,
  },
}
