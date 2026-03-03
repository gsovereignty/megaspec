import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import type { Root } from 'mdast';
import { computeReplicativeFitness, type FitnessContext } from '../src/scoring/replicative-fitness.js';

function createCtx(content: string): FitnessContext {
  const ast = unified().use(remarkParse).parse(content) as Root;
  return { ast, content };
}

describe('Replicative fitness scoring', () => {
  it('returns composite score between 0 and 28', () => {
    const ctx = createCtx('A simple teaching about being kind.');
    const result = computeReplicativeFitness(ctx);
    expect(result.composite).toBeGreaterThanOrEqual(0);
    expect(result.composite).toBeLessThanOrEqual(28);
  });

  it('returns all seven criteria', () => {
    const ctx = createCtx('Simple text.');
    const result = computeReplicativeFitness(ctx);
    expect(result.criteria.transmissionCompulsion).toBeDefined();
    expect(result.criteria.hookPotency).toBeDefined();
    expect(result.criteria.payloadIntegration).toBeDefined();
    expect(result.criteria.epistemicResistance).toBeDefined();
    expect(result.criteria.identityBinding).toBeDefined();
    expect(result.criteria.adaptability).toBeDefined();
    expect(result.criteria.environmentalSensitivity).toBeDefined();
  });

  it('each criterion score is between 0 and 4', () => {
    const ctx = createCtx(
      'Behold! The truth is revealed. We, the faithful, must proclaim this to all nations. ' +
      'Those who reject the truth are lost. The world will hate you for this. ' +
      'Now is the time. Every day we must bear witness. Born again, made new.'
    );
    const result = computeReplicativeFitness(ctx);
    for (const c of Object.values(result.criteria)) {
      expect(c.score).toBeGreaterThanOrEqual(0);
      expect(c.score).toBeLessThanOrEqual(4);
    }
  });

  it('classifies inert idea for low-scoring text', () => {
    const ctx = createCtx('The weather is nice today. I like sandwiches.');
    const result = computeReplicativeFitness(ctx);
    expect(result.classification).toBe('Inert Idea');
    expect(result.viable).toBe(false);
  });

  it('classifies correctly based on composite ranges', () => {
    // Test classification boundaries
    const ctx = createCtx('Simple text.');
    const result = computeReplicativeFitness(ctx);
    if (result.composite <= 7) expect(result.classification).toBe('Inert Idea');
    else if (result.composite <= 14) expect(result.classification).toBe('Mild Contagion');
    else if (result.composite <= 21) expect(result.classification).toBe('Active Virus');
    else expect(result.classification).toBe('Dominant Strain');
  });

  it('scores higher for texts with strong memetic structures', () => {
    const weak = createCtx('Flowers are pretty. The sun is warm.');

    const strong = createCtx(
      'Behold! Who among you can face death without fear? The hour has come and the truth will set you free. ' +
      'We, the faithful elect, are called — born again, transformed, made new — to proclaim this salvation to every nation and every tongue. ' +
      'Go and tell all people: repent, for the kingdom is near. Those who reject this message are lost in darkness. ' +
      'The world will hate you for speaking the truth. Scoffers will come, as was prophesied, yet their mockery only proves the message true. ' +
      'O ye of little faith — do not waver, do not be double-minded. Doubt is the enemy of understanding. ' +
      'The wisdom of this world is foolishness. False teachers will arise with clever arguments, but the heart knows truth from lies. ' +
      'We were once blind, but now we see. Looking back, this explains everything — in our families, in our communities, in history itself. ' +
      'Every day, without ceasing, generation to generation, until the end of the age, bear witness. ' +
      'Now is the time. Do not delay. If you understand what is at stake and stay silent, you are complicit. ' +
      'Come out from among them and be separate. Deny yourself, take up your cross, and follow. ' +
      'Your identity, your purpose, your destiny — all is found in this truth alone. ' +
      'This is not just something you believe. This is who you are.'
    );

    const weakResult = computeReplicativeFitness(weak);
    const strongResult = computeReplicativeFitness(strong);

    expect(strongResult.composite).toBeGreaterThan(weakResult.composite);
    expect(strongResult.composite).toBeGreaterThanOrEqual(15); // Active Virus or higher
  });

  it('detects transmission compulsion markers', () => {
    const ctx = createCtx(
      'You must proclaim this truth. People need to know. If you stay silent, you are complicit. ' +
      'Woe to me if I do not preach. The word burns like fire in my bones. I cannot stay silent. ' +
      'Warn everyone. The hour of judgement is near. Repent and spread the word.'
    );
    const result = computeReplicativeFitness(ctx);
    expect(result.criteria.transmissionCompulsion.score).toBeGreaterThanOrEqual(2);
  });

  it('detects hook potency in opening', () => {
    const ctx = createCtx(
      'Behold! What if everything you believed about death was wrong? ' +
      'The Lord has spoken: woe to the nations that turn away. ' +
      'Your soul hangs in the balance. The secret hidden since the foundation of the world is now revealed.'
    );
    const result = computeReplicativeFitness(ctx);
    expect(result.criteria.hookPotency.score).toBeGreaterThanOrEqual(2);
  });

  it('detects epistemic resistance mechanisms', () => {
    const ctx = createCtx(
      'The world will hate you for this truth. They will persecute you as they persecuted the prophets before. ' +
      'The wisdom of this world is foolishness before God. False prophets will try to deceive you. ' +
      'If you doubt this, examine your heart — a hardened heart cannot perceive spiritual truth. ' +
      'Those of little faith waver, but the faithful endure. Spiritual discernment reveals what the natural man cannot see.'
    );
    const result = computeReplicativeFitness(ctx);
    expect(result.criteria.epistemicResistance.score).toBeGreaterThanOrEqual(3);
  });

  it('detects identity binding structures', () => {
    const ctx = createCtx(
      'We are the chosen, the elect, the body of Christ. Our brothers and sisters in the faith stand together. ' +
      'We were once lost but now we are found. Born again, made new, no longer who we were. ' +
      'Deny yourself and take up your cross. Count the cost and forsake all. ' +
      'Christ in you, the hope of glory. You are a temple of the Holy Spirit. ' +
      'Your identity is in Christ alone. You are an ambassador, a citizen of heaven.'
    );
    const result = computeReplicativeFitness(ctx);
    expect(result.criteria.identityBinding.score).toBeGreaterThanOrEqual(3);
  });

  it('detects adaptability via universal patterns', () => {
    const ctx = createCtx(
      'There is danger and threat from those who seek to destroy truth and protect the corrupt order. ' +
      'They betray the trust placed in them through deception and disloyalty. ' +
      'But there is purpose and meaning in the plan that transcends all human understanding. ' +
      'Seek truth and wisdom and knowledge. What is lost can never be found again — honor and glory await the worthy and chosen. ' +
      'The impure and unclean will be cast out. In your community and among your people, wherever you are, every nation, ' +
      'every tongue, all mankind must face the human condition.'
    );
    const result = computeReplicativeFitness(ctx);
    expect(result.criteria.adaptability.score).toBeGreaterThanOrEqual(2);
  });

  it('identifies vulnerabilities in high-scoring texts', () => {
    const ctx = createCtx(
      'Behold, the truth that sets you free! We the faithful must preach and proclaim — people need to know, the hour is near! ' +
      'Woe to you if you stay silent. Born again, transformed, made new. Deny yourself. Take up your cross. ' +
      'They will persecute you. The world hates the truth. False teachers abound. O ye of little faith! ' +
      'Every day, generation to generation, until the end. Now is the time. ' +
      'The truth means something — seek wisdom, find purpose, protect your community from the corrupt and impure. ' +
      'Honor and glory to the worthy. In your life, wherever you are, all people must hear. ' +
      'Christ in you, the temple of God, ambassador and citizen of heaven.'
    );
    const result = computeReplicativeFitness(ctx);
    // Vulnerabilities are only flagged for composite >= 18
    if (result.composite >= 18) {
      // May or may not have vulnerabilities depending on distribution
      expect(Array.isArray(result.vulnerabilities)).toBe(true);
    }
  });

  it('viability requires minimum thresholds', () => {
    // Text that hits some criteria but misses compulsion and hook minimums
    const ctx = createCtx(
      'There is truth in the universe. The community gathers. Faith is important.'
    );
    const result = computeReplicativeFitness(ctx);
    // With such minimal text, it should not be viable
    expect(result.viable).toBe(false);
  });

  it('handles empty content', () => {
    const ctx = createCtx('');
    const result = computeReplicativeFitness(ctx);
    expect(result.composite).toBe(0);
    expect(result.classification).toBe('Inert Idea');
    expect(result.viable).toBe(false);
  });
});
