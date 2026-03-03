import type { Root, Heading, RootContent } from 'mdast';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CriterionScore {
  score: number; // 0–4
  label: string;
  details: string;
}

export interface ReplicativeFitnessScore {
  composite: number; // 0–28
  classification: 'Inert Idea' | 'Mild Contagion' | 'Active Virus' | 'Dominant Strain';
  criteria: {
    transmissionCompulsion: CriterionScore;
    hookPotency: CriterionScore;
    payloadIntegration: CriterionScore;
    epistemicResistance: CriterionScore;
    identityBinding: CriterionScore;
    adaptability: CriterionScore;
    environmentalSensitivity: CriterionScore;
  };
  viable: boolean;
  vulnerabilities: string[];
}

export interface FitnessContext {
  ast: Root;
  content: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripCode(text: string): string {
  return text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');
}

function countMatches(text: string, patterns: RegExp[]): number {
  let count = 0;
  for (const p of patterns) {
    const matches = text.match(p);
    if (matches) count += matches.length;
  }
  return count;
}

function hasAny(text: string, phrases: string[]): boolean {
  const lower = text.toLowerCase();
  return phrases.some((p) => lower.includes(p));
}

function countAny(text: string, phrases: string[]): number {
  const lower = text.toLowerCase();
  return phrases.filter((p) => lower.includes(p)).length;
}

// ---------------------------------------------------------------------------
// Criterion 1: Transmission Compulsion
// How strongly the text compels its reader to propagate the message.
// ---------------------------------------------------------------------------

function scoreTransmissionCompulsion(ctx: FitnessContext): CriterionScore {
  const text = stripCode(ctx.content).toLowerCase();

  // Moral imperatives — "must share", "people need to know", obligation language
  const moralImperatives = [
    'must share', 'need to know', 'cannot stay silent', "can't stay silent",
    'duty', 'obligation', 'command', 'commanded', 'commission', 'go and tell',
    'spread the word', 'proclaim', 'preach', 'evangelize', 'bear witness',
    'testify', 'declare', 'announce', 'make known', 'teach all nations',
  ];

  // Warning frames — urgency about others' fate
  const warningFrames = [
    'perish', 'damnation', 'lost souls', 'eternal consequence',
    'people are dying', 'time is short', 'the hour is near',
    'before it is too late', "before it's too late", 'judgement',
    'wrath', 'destruction', 'warning', 'repent',
  ];

  // Gift frames — sharing as a blessing
  const giftFrames = [
    'good news', 'blessing', 'gift', 'grace', 'salvation',
    'set free', 'liberate', 'heal', 'redeem', 'save',
    'offer', 'freely given', 'freely received',
  ];

  // Silence-as-complicity
  const silenceFrames = [
    'silent', 'complicit', 'blood on', 'watchman',
    'if you say nothing', 'accountable', 'answer for',
    'how can you keep this', 'deny',
  ];

  const moralHits = countAny(text, moralImperatives);
  const warningHits = countAny(text, warningFrames);
  const giftHits = countAny(text, giftFrames);
  const silenceHits = countAny(text, silenceFrames);

  const totalHits = moralHits + warningHits + giftHits + silenceHits;
  const frameTypes = [moralHits > 0, warningHits > 0, giftHits > 0, silenceHits > 0]
    .filter(Boolean).length;

  let score = 0;
  if (totalHits === 0) score = 0;
  else if (totalHits <= 2 && frameTypes <= 1) score = 1;
  else if (totalHits <= 5 || frameTypes <= 2) score = 2;
  else if (silenceHits > 0 || (frameTypes >= 3 && totalHits >= 6)) score = 3;
  else score = 2;

  // Compulsion loop detection: if both warning + silence/moral obligation present strongly
  if (silenceHits >= 2 && warningHits >= 2 && moralHits >= 2) score = 4;
  else if (silenceHits >= 1 && warningHits >= 2 && moralHits >= 2) score = Math.max(score, 3);

  return {
    score: Math.min(4, score),
    label: 'Transmission Compulsion',
    details: `moral: ${moralHits}, warning: ${warningHits}, gift: ${giftHits}, silence-guilt: ${silenceHits}, frame types: ${frameTypes}`,
  };
}

// ---------------------------------------------------------------------------
// Criterion 2: Hook Potency
// How effectively the opening bypasses critical evaluation.
// ---------------------------------------------------------------------------

function scoreHookPotency(ctx: FitnessContext): CriterionScore {
  const text = stripCode(ctx.content);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const first200 = words.slice(0, 200).join(' ').toLowerCase();

  // Check for emotional triggers in opening
  const fearThreat = hasAny(first200, [
    'danger', 'threat', 'fear', 'terrifying', 'death', 'destruction',
    'perish', 'wrath', 'judgement', 'suffer', 'torment', 'hell',
  ]);

  const moralOutrage = hasAny(first200, [
    'injustice', 'oppression', 'abomination', 'corruption', 'betrayal',
    'wickedness', 'sin', 'evil', 'atrocity', 'desecration',
  ]);

  const curiosityGap = first200.includes('?') || hasAny(first200, [
    'secret', 'hidden', 'mystery', 'revealed', 'truth they',
    'what if', 'imagine', 'have you ever', 'did you know',
  ]);

  const authority = hasAny(first200, [
    'thus saith', 'the lord said', 'god spoke', 'it is written',
    'the prophet', 'the scripture says', 'divine', 'revelation',
    'commanded', 'ordained', 'decreed',
  ]);

  const lossAversion = hasAny(first200, [
    'lose', 'miss', 'forfeit', 'too late', 'running out',
    'last chance', 'before', 'never again',
  ]);

  const identityThreat = hasAny(first200, [
    'your soul', 'your destiny', 'your purpose', 'who you really are',
    'your true nature', 'what you were made for',
  ]);

  const triggers = [fearThreat, moralOutrage, curiosityGap, authority, lossAversion, identityThreat];
  const triggerCount = triggers.filter(Boolean).length;

  // Speed of emotional engagement: question or exclamation in first sentence
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0] || '';
  const immediateEmotional = firstSentence.includes('?') || firstSentence.includes('!') ||
    /\b(behold|hear|listen|woe|blessed|arise)\b/i.test(firstSentence);

  let score = 0;
  if (triggerCount === 0 && !immediateEmotional) score = 0;
  else if (triggerCount <= 1) score = 1;
  else if (triggerCount === 2) score = 2;
  else if (triggerCount >= 3) score = 3;

  if (triggerCount >= 3 && immediateEmotional) score = 4;

  return {
    score: Math.min(4, score),
    label: 'Hook Potency',
    details: `triggers: ${triggerCount}/6 (fear: ${fearThreat}, outrage: ${moralOutrage}, curiosity: ${curiosityGap}, authority: ${authority}, loss: ${lossAversion}, identity: ${identityThreat}), immediate emotional: ${immediateEmotional}`,
  };
}

// ---------------------------------------------------------------------------
// Criterion 3: Payload Integration
// How deeply the ideas embed into the reader's existing belief structure.
// ---------------------------------------------------------------------------

function scorePayloadIntegration(ctx: FitnessContext): CriterionScore {
  const text = stripCode(ctx.content).toLowerCase();

  // Vocabulary introduction — novel/repurposed terms defined in the text
  const definitionPatterns = [
    /\b\w+\b\s+(?:means|refers to|is defined as|signifies|denotes)/gi,
    /(?:called|known as|termed|named)\s+["']?\w+/gi,
    /["']\w+["']\s*[—–-]\s/g,
  ];
  const vocabHits = countMatches(text, definitionPatterns);

  // Revisionist lens — reinterpreting past through the framework
  const revisionistPhrases = [
    'now you can see', 'now you understand', 'looking back',
    'all along', 'you always knew', 'this explains why',
    'in light of this', 'once you see', 'eyes opened',
    'the scales fell', 'were blind', 'now we see',
    'this is why', 'this was always',
  ];
  const revisionistHits = countAny(text, revisionistPhrases);

  // Cross-domain explanatory framework (politics, relationships, history, personal)
  const domainKeywords: Record<string, string[]> = {
    politics: ['government', 'nation', 'power', 'ruler', 'kingdom', 'authority', 'law', 'justice', 'society'],
    relationships: ['marriage', 'family', 'friend', 'love', 'neighbor', 'brother', 'sister', 'community', 'fellowship'],
    history: ['generation', 'ancient', 'ancestor', 'forefathers', 'prophecy', 'fulfilled', 'history', 'ages past'],
    personal: ['heart', 'soul', 'mind', 'spirit', 'conscience', 'purpose', 'destiny', 'identity', 'self'],
    economics: ['wealth', 'poverty', 'treasure', 'riches', 'gain', 'loss', 'steward', 'prosperity'],
    cosmology: ['creation', 'universe', 'heaven', 'earth', 'cosmos', 'origin', 'beginning', 'eternal'],
  };
  let domainsCovered = 0;
  for (const keywords of Object.values(domainKeywords)) {
    if (keywords.some((kw) => text.includes(kw))) domainsCovered++;
  }

  // Filter installation — language suggesting the idea should interpret everything
  const filterPhrases = [
    'through this lens', 'in all things', 'in every aspect',
    'whatever you do', 'in everything', 'all of life',
    'every thought', 'every word', 'every deed',
    'the answer to everything', 'explains all',
  ];
  const filterHits = countAny(text, filterPhrases);

  let score = 0;
  if (domainsCovered <= 1 && vocabHits === 0 && revisionistHits === 0) score = 0;
  else if (domainsCovered <= 2 && revisionistHits === 0) score = 1;
  else if (domainsCovered >= 3 || (revisionistHits >= 1 && vocabHits >= 1)) score = 2;
  else score = 1;

  if (domainsCovered >= 4 && filterHits >= 1) score = 3;
  if (domainsCovered >= 5 && filterHits >= 2 && revisionistHits >= 2) score = 4;

  return {
    score: Math.min(4, score),
    label: 'Payload Integration',
    details: `vocabulary defs: ${vocabHits}, revisionist lens: ${revisionistHits}, domains: ${domainsCovered}/6, filter phrases: ${filterHits}`,
  };
}

// ---------------------------------------------------------------------------
// Criterion 4: Epistemic Resistance
// How effectively the text defends against counterevidence and scrutiny.
// ---------------------------------------------------------------------------

function scoreEpistemicResistance(ctx: FitnessContext): CriterionScore {
  const text = stripCode(ctx.content).toLowerCase();

  // (a) Vagueness absorption — broad unfalsifiable claims
  const vaguePhrases = [
    'in mysterious ways', 'beyond understanding', 'transcends logic',
    'cannot be measured', 'ineffable', 'unknowable',
    'works in ways we cannot', 'his ways are not our ways',
  ];
  const vagueHits = countAny(text, vaguePhrases);

  // (b) Self-sealing prediction — predicting opposition as confirmation
  const selfSealingPhrases = [
    'they will persecute', 'the world will hate', 'expect opposition',
    'they will mock', 'many will fall away', 'scoffers will come',
    'if the world hates you', 'persecution proves', 'blessed are you when',
    'narrow is the way', 'few will find it', 'the world rejected',
    'as they persecuted the prophets', 'they will call you',
  ];
  const selfSealingHits = countAny(text, selfSealingPhrases);

  // (c) Source poisoning — discrediting external sources
  const sourcePoisonPhrases = [
    'wisdom of this world', 'foolishness of men', 'worldly wisdom',
    'false teachers', 'false prophets', 'deceiving spirits',
    'wolves in sheep', 'blind guides', 'the blind leading',
    'do not be deceived', 'many deceivers', 'corrupt',
  ];
  const sourcePoisonHits = countAny(text, sourcePoisonPhrases);

  // (d) Unfalsifiability shifting — moving to subjective/moral ground
  const unfalsifiablePhrases = [
    'you must have faith', 'faith is the substance', 'the heart knows',
    'spiritual discernment', 'revealed by the spirit', 'spiritual eyes',
    'carnally minded', 'natural man cannot', 'spiritually discerned',
  ];
  const unfalsifiableHits = countAny(text, unfalsifiablePhrases);

  // (e) Questioning-as-symptom — doubt is pathologized
  const questioningPhrases = [
    'doubt is', 'o ye of little faith', 'hardened heart',
    'stiff-necked', 'unbelief', 'lack of faith', 'wavering',
    'double-minded', 'lukewarm', 'falling away', 'apostate',
    'reprobate mind', 'seared conscience', 'given over to',
  ];
  const questioningHits = countAny(text, questioningPhrases);

  const mechanisms = [
    vagueHits > 0,
    selfSealingHits > 0,
    sourcePoisonHits > 0,
    unfalsifiableHits > 0,
    questioningHits > 0,
  ];
  const mechCount = mechanisms.filter(Boolean).length;
  const totalHits = vagueHits + selfSealingHits + sourcePoisonHits + unfalsifiableHits + questioningHits;

  let score = 0;
  if (mechCount === 0) score = 0;
  else if (mechCount === 1 && totalHits <= 2) score = 1;
  else if (mechCount >= 2 && selfSealingHits === 0) score = 2;
  else if (selfSealingHits >= 1) score = 3;
  else score = 2;

  if (questioningHits >= 2 && selfSealingHits >= 1) score = 4;
  else if (questioningHits >= 1 && selfSealingHits >= 2 && mechCount >= 3) score = Math.max(score, 3);

  return {
    score: Math.min(4, score),
    label: 'Epistemic Resistance',
    details: `mechanisms: ${mechCount}/5 (vague: ${vagueHits}, self-seal: ${selfSealingHits}, source-poison: ${sourcePoisonHits}, unfalsifiable: ${unfalsifiableHits}, question-symptom: ${questioningHits})`,
  };
}

// ---------------------------------------------------------------------------
// Criterion 5: Identity Binding
// How strongly the text couples with the reader's sense of self.
// ---------------------------------------------------------------------------

function scoreIdentityBinding(ctx: FitnessContext): CriterionScore {
  const text = stripCode(ctx.content).toLowerCase();

  // In-group / out-group language
  const inGroupPhrases = [
    'we', 'us', 'our', 'brethren', 'brothers and sisters',
    'the faithful', 'the elect', 'the chosen', 'the remnant',
    'true believers', 'the body', 'fellow', 'saints',
    'children of', 'people of god', 'the church',
  ];
  const outGroupPhrases = [
    'the world', 'unbelievers', 'pagans', 'infidels', 'the lost',
    'the wicked', 'enemies', 'wolves', 'false', 'heretics',
    'those who reject', 'outsiders', 'gentiles', 'the ungodly',
  ];
  const inGroupHits = countAny(text, inGroupPhrases);
  const outGroupHits = countAny(text, outGroupPhrases);

  // Transformation narrative — before/after discontinuity
  const transformPhrases = [
    'born again', 'new creation', 'old self', 'new self',
    'transformed', 'renewed', 'converted', 'awakened',
    'once was blind', 'now i see', 'set free', 'delivered',
    'saved from', 'redeemed', 'washed clean', 'made new',
    'no longer', 'put off the old', 'put on the new',
  ];
  const transformHits = countAny(text, transformPhrases);

  // Sacrifice / cost language — costly adoption increases binding
  const sacrificePhrases = [
    'deny yourself', 'take up your cross', 'forsake all',
    'leave everything', 'count the cost', 'suffer for',
    'persecution', 'give up', 'sacrifice', 'die to self',
    'narrow gate', 'worthy of', 'pay the price',
  ];
  const sacrificeHits = countAny(text, sacrificePhrases);

  // Identity fusion — the idea IS the self
  const fusionPhrases = [
    'i am the way', 'abide in me', 'christ in you',
    'you are in christ', 'partakers of', 'one with',
    'his body', 'temple of', 'vessel', 'ambassador',
    'citizen of heaven', 'called by name', 'identity in',
  ];
  const fusionHits = countAny(text, fusionPhrases);

  const hasInOutGroup = inGroupHits >= 2 && outGroupHits >= 1;
  const hasTransform = transformHits >= 2;
  const hasSacrifice = sacrificeHits >= 1;
  const hasFusion = fusionHits >= 2;

  let score = 0;
  if (!hasInOutGroup && transformHits === 0 && fusionHits === 0) score = 0;
  else if (inGroupHits >= 1 && !hasTransform && !hasFusion) score = 1;
  else if (hasInOutGroup || (hasTransform && inGroupHits >= 1)) score = 2;
  else score = 1;

  if ((hasInOutGroup && hasTransform && hasSacrifice) || (hasFusion && hasTransform)) score = 3;
  if (hasFusion && hasTransform && hasSacrifice && hasInOutGroup) score = 4;

  return {
    score: Math.min(4, score),
    label: 'Identity Binding',
    details: `in-group: ${inGroupHits}, out-group: ${outGroupHits}, transform: ${transformHits}, sacrifice: ${sacrificeHits}, fusion: ${fusionHits}`,
  };
}

// ---------------------------------------------------------------------------
// Criterion 6: Adaptability
// How effectively the text translates across cultures while preserving core structure.
// ---------------------------------------------------------------------------

function scoreAdaptability(ctx: FitnessContext): CriterionScore {
  const text = stripCode(ctx.content).toLowerCase();

  // Universal psychological patterns referenced
  const universalPatterns = [
    // Threat detection
    ['danger', 'threat', 'protect', 'defense', 'survive', 'safe'],
    // Betrayal sensitivity
    ['betray', 'trust', 'deceive', 'loyalty', 'unfaithful'],
    // Pattern/meaning recognition
    ['purpose', 'meaning', 'destiny', 'plan', 'design', 'order'],
    // Desire for coherence
    ['truth', 'wisdom', 'knowledge', 'understanding', 'reason', 'logic'],
    // Loss aversion
    ['lose', 'lost', 'forfeit', 'miss', 'waste', 'regret'],
    // In-group loyalty
    ['brother', 'sister', 'family', 'community', 'tribe', 'people', 'nation'],
    // Disgust sensitivity
    ['unclean', 'impure', 'corrupt', 'filth', 'defile', 'abomination'],
    // Status/hierarchy
    ['honor', 'glory', 'worthy', 'chosen', 'elect', 'righteous', 'noble'],
  ];
  let universalHits = 0;
  for (const group of universalPatterns) {
    if (group.some((kw) => text.includes(kw))) universalHits++;
  }

  // Cultural specificity — proper nouns, specific places, dates reduce adaptability
  const properNounPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const originalText = stripCode(ctx.content);
  const properNouns = (originalText.match(properNounPattern) || []).length;
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const properNounDensity = words.length > 0 ? properNouns / words.length : 0;

  // Abstract principles — sentences without proper nouns or specific references
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  let abstractSentences = 0;
  for (const s of sentences) {
    if (!/[A-Z][a-z]{2,}/.test(s) && !/\d{3,}/.test(s)) {
      abstractSentences++;
    }
  }
  const abstractRatio = sentences.length > 0 ? abstractSentences / sentences.length : 0;

  // Open variables — gaps for host to fill from own experience
  const openPhrases = [
    'you know what it is like', 'you have experienced',
    'in your life', 'your own', 'wherever you are',
    'in your context', 'in your community', 'your people',
    'everyone', 'all people', 'every nation', 'every tongue',
    'all mankind', 'human heart', 'the human condition',
  ];
  const openHits = countAny(text, openPhrases);

  let score = 0;
  if (universalHits <= 2) score = 0;
  else if (universalHits <= 4) score = 1;
  else if (universalHits <= 5 && openHits >= 1) score = 2;
  else if (universalHits >= 6) score = 3;
  else score = 2;

  // Low cultural dependency + high universality = 4
  if (universalHits >= 7 && properNounDensity < 0.02 && openHits >= 3) score = 4;

  return {
    score: Math.min(4, score),
    label: 'Adaptability',
    details: `universal patterns: ${universalHits}/8, proper noun density: ${(properNounDensity * 100).toFixed(1)}%, abstract ratio: ${(abstractRatio * 100).toFixed(0)}%, open variables: ${openHits}`,
  };
}

// ---------------------------------------------------------------------------
// Criterion 7: Environmental Sensitivity
// How dependent the text is on external conditions, or whether it generates its own.
// ---------------------------------------------------------------------------

function scoreEnvironmentalSensitivity(ctx: FitnessContext): CriterionScore {
  const text = stripCode(ctx.content).toLowerCase();

  // Internal urgency — "now is the time" regardless of external conditions
  const urgencyPhrases = [
    'now is the time', 'the hour has come', 'today is the day',
    'do not delay', 'time is short', 'redeem the time',
    'while there is still time', 'the day is near',
    'make haste', 'now or never', 'this very moment',
    'every moment', 'daily', 'always', 'without ceasing',
  ];
  const urgencyHits = countAny(text, urgencyPhrases);

  // Trust erosion — undermining external information sources
  const trustErosionPhrases = [
    'do not trust', 'the wisdom of this world is', 'foolishness',
    'lies', 'deception', 'do not be led astray', 'empty philosophy',
    'traditions of men', 'vain', 'false doctrines', 'itching ears',
    'clever arguments', 'wise in their own eyes',
  ];
  const trustErosionHits = countAny(text, trustErosionPhrases);

  // Division generation — adoption provokes reactions that confirm the idea
  const divisionPhrases = [
    'sword', 'division', 'set against', 'separate',
    'not peace but', 'father against son', 'you will be hated',
    'the world will oppose', 'stand apart', 'come out from among',
    'be ye separate', 'do not conform', 'set apart',
  ];
  const divisionHits = countAny(text, divisionPhrases);

  // Crisis manufacture — host behaviour creates conditions for further spread
  const crisisPhrases = [
    'confront', 'rebuke', 'call out', 'stand firm',
    'do not compromise', 'speak truth to power', 'prophesy against',
    'overturn', 'cleanse', 'drive out', 'expose',
    'tear down', 'uproot', 'demolish strongholds',
  ];
  const crisisHits = countAny(text, crisisPhrases);

  // Self-sustaining motivation — operates without external crisis
  const selfSustainingPhrases = [
    'every day', 'daily bread', 'continual', 'never-ending',
    'eternal', 'generation to generation', 'forevermore',
    'until the end', 'all the days', 'morning and evening',
  ];
  const sustainHits = countAny(text, selfSustainingPhrases);

  const feedbackMechanisms = [divisionHits > 0, trustErosionHits > 0, crisisHits > 0];
  const feedbackCount = feedbackMechanisms.filter(Boolean).length;

  let score = 0;
  if (urgencyHits === 0 && sustainHits === 0) score = 0;
  else if (urgencyHits >= 1 && sustainHits === 0) score = 1;
  else if (urgencyHits >= 1 && sustainHits >= 1) score = 2;
  else score = 1;

  if (sustainHits >= 2 && (urgencyHits >= 1 || feedbackCount >= 1)) score = 3;
  if (feedbackCount >= 2 && sustainHits >= 2 && urgencyHits >= 2) score = 4;

  return {
    score: Math.min(4, score),
    label: 'Environmental Sensitivity',
    details: `urgency: ${urgencyHits}, trust-erosion: ${trustErosionHits}, division: ${divisionHits}, crisis: ${crisisHits}, self-sustain: ${sustainHits}, feedback mechanisms: ${feedbackCount}/3`,
  };
}

// ---------------------------------------------------------------------------
// Composite scoring and classification
// ---------------------------------------------------------------------------

function classify(composite: number): ReplicativeFitnessScore['classification'] {
  if (composite <= 7) return 'Inert Idea';
  if (composite <= 14) return 'Mild Contagion';
  if (composite <= 21) return 'Active Virus';
  return 'Dominant Strain';
}

function checkViability(criteria: ReplicativeFitnessScore['criteria']): boolean {
  const composite =
    criteria.transmissionCompulsion.score +
    criteria.hookPotency.score +
    criteria.payloadIntegration.score +
    criteria.epistemicResistance.score +
    criteria.identityBinding.score +
    criteria.adaptability.score +
    criteria.environmentalSensitivity.score;

  return (
    criteria.transmissionCompulsion.score >= 2 &&
    criteria.hookPotency.score >= 2 &&
    criteria.payloadIntegration.score >= 1 &&
    criteria.epistemicResistance.score >= 1 &&
    composite >= 10
  );
}

function identifyVulnerabilities(
  criteria: ReplicativeFitnessScore['criteria'],
  composite: number,
): string[] {
  const vulns: string[] = [];
  if (composite < 18) return vulns;

  const entries = Object.entries(criteria) as [string, CriterionScore][];
  for (const [key, c] of entries) {
    if (c.score <= 1) {
      vulns.push(`${c.label} (${c.score}/4): critical vulnerability in otherwise high-scoring text`);
    }
  }
  return vulns;
}

// ---------------------------------------------------------------------------
// Main scorer
// ---------------------------------------------------------------------------

export function computeReplicativeFitness(ctx: FitnessContext): ReplicativeFitnessScore {
  const criteria = {
    transmissionCompulsion: scoreTransmissionCompulsion(ctx),
    hookPotency: scoreHookPotency(ctx),
    payloadIntegration: scorePayloadIntegration(ctx),
    epistemicResistance: scoreEpistemicResistance(ctx),
    identityBinding: scoreIdentityBinding(ctx),
    adaptability: scoreAdaptability(ctx),
    environmentalSensitivity: scoreEnvironmentalSensitivity(ctx),
  };

  const composite = Object.values(criteria).reduce((sum, c) => sum + c.score, 0);

  return {
    composite,
    classification: classify(composite),
    criteria,
    viable: checkViability(criteria),
    vulnerabilities: identifyVulnerabilities(criteria, composite),
  };
}
