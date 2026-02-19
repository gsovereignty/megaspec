# DocFlow Writing Rules

You are a writing agent. Follow every rule below when producing or refactoring documentation. Rules are imperative. Treat FAIL rules as hard blockers and WARN rules as strong recommendations.

First read the front matter `type` field to determine which profile applies (tutorial, reference, guide, whitepaper, book-chapter). Then apply every rule marked for that profile.

---

## Rule 1: Hook the reader in the first 200 words

**Applies to:** tutorial, guide, whitepaper, book-chapter | **Severity:** FAIL

Write one of these in the opening paragraph, before any explanation:

- A direct question (contains `?`)
- A relatable pain point ("you" near: struggle, need, want, wonder, frustrated, confused, stuck, wish, tired)
- A concrete statistic (number + percent/times/ways/steps/reasons/mistakes)
- An outcome promise ("you'll learn", "by the end", "after reading", "you'll be able to")

**Do this:**
> Ever wondered why your users keep getting locked out? You'll learn three authentication patterns that reduce failed logins by 80%.

**Not this:**
> Authentication is the process of verifying user identity. There are several methods available.

Skip this rule for `type: reference`.

---

## Rule 2: Pose a question before giving an answer

**Applies to:** all (strongest for guide) | **Severity:** WARN

Open each H2 section with curiosity - a question, a problem statement, or a "you"-focused tension - before explaining anything.

Look for these problem-framing words: problem, challenge, issue, difficult, struggle, why, how, what if, wonder, question.

If the first paragraph of a section jumps straight to answer words (solution, answer, here's how, simply, just) without any question or problem framing, rewrite it.

**Do this:**
> ## Caching
> Why do repeated database queries slow your app to a crawl?

**Not this:**
> ## Caching
> Here's how to implement a Redis cache.

---

## Rule 3: Put a concrete example in every H2 section

**Applies to:** tutorial, guide, book-chapter | **Severity:** FAIL

Every H2 section needs at least one of:
- A code block
- An `#### Example:` or `#### Use Case:` subheading with a worked illustration

Exempt sections: Prerequisites, Introduction, Next Steps, Summary.

Never explain a concept without showing it. Use domain-specific names (see Rule 12).

---

## Rule 4: Demonstrate before asking the reader to practice

**Applies to:** tutorial | **Severity:** FAIL

Place at least one annotated code block before any exercise heading. Exercise headings are identified by: "exercise", "try it", "practice", "your turn", "challenge".

The reader must see a worked example before being asked to reproduce it.

---

## Rule 5: Annotate tutorial code blocks

**Applies to:** tutorial | **Severity:** FAIL

Every code block longer than 3 lines must contain at least one comment explaining *why*, not just *what*.

**Do this:**
```js
// Sign the payload to create a tamper-proof token
const token = jwt.sign(payload, secret);
// httpOnly prevents JavaScript access, blocking XSS token theft
res.cookie('auth', token, { httpOnly: true });
```

**Not this:**
```js
const token = jwt.sign(payload, secret);
res.cookie('auth', token, { httpOnly: true });
```

---

## Rule 6: Max 5 sentences per paragraph

**Applies to:** all | **Severity:** WARN

Each paragraph makes one point. If you've written more than 5 sentences, split it. Readers scan - dense paragraphs get skipped.

---

## Rule 7: Max 30 words per sentence

**Applies to:** all | **Severity:** WARN

Break long sentences into shorter ones. If a sentence has a "which", "where", "that", or "and" in the middle, it's probably two sentences.

**Do this:**
> The server generates a signed JWT with the user's claims. This token is stored in an HTTP-only cookie for subsequent requests.

**Not this:**
> The authentication system uses a token-based approach where the server generates a signed JWT containing the user's claims and permissions which is then stored in an HTTP-only cookie for subsequent requests.

---

## Rule 8: Keep lists between 3 and 7 items

**Applies to:** all | **Severity:** WARN

- Fewer than 3 items? Use prose instead.
- More than 7 items? Group into sublists with descriptive sub-headers.

---

## Rule 9: Max 500 words per section

**Applies to:** all | **Severity:** WARN

If a section between two headings exceeds 500 words, add a subheading to break it up. Walls of text cause reader abandonment.

---

## Rule 10: Keep code blocks within 3 lines of their explanation

**Applies to:** all | **Severity:** WARN

Don't separate a code block from the paragraph that explains it. Place them adjacent. The split-attention effect forces readers to mentally reconnect code with context.

---

## Rule 11: Add step progress indicators in tutorials

**Applies to:** tutorial | **Severity:** WARN

When using numbered steps, include the total: "Step 3 of 7" or "(3/7)". This triggers the Zeigarnik Effect - readers feel compelled to finish what they've started.

---

## Rule 12: Use domain-specific names, never placeholders

**Applies to:** all | **Severity:** WARN

Never use these in code examples: `foo`, `bar`, `baz`, `qux`, `quux`, `example`, `test`, `sample`, `myVar`, `myFunc`, `MyClass`, `doSomething`, `SomeClass`, `placeholder`.

Replace with real domain names: `user`, `order`, `payment`, `fetchProfile`, `validateToken`.

---

## Rule 13: End every document with a forward-linking section

**Applies to:** all | **Severity:** WARN

The final 20% of the document must include one of: "Next Steps", "What's Next", "Where to Go", "Further Reading", "Continue", "Keep Learning", or "Related".

Never leave the reader at a dead end.

---

## Rule 14: Use transition phrases between H2 sections

**Applies to:** all (strongest for tutorial, guide, book-chapter) | **Severity:** WARN

End each H2 section, or begin the next, with a momentum phrase. At least 50% of section transitions must include one of:

"next", "now that", "let's", "with that", "building on", "moving on", "so far", "having", "before we"

**Do this:**
> Now that you've set up authentication, let's see how to protect your API routes.

**Not this:**
> [abrupt topic change]

---

## Rule 15: Follow three-act structure in tutorials

**Applies to:** tutorial | **Severity:** WARN

Structure the document as:

1. **Setup** (first 20%): State prerequisites, goals, or "what you'll build". Use words like: prerequisite, goal, what you'll build, learning objective, by the end.
2. **Confrontation** (middle 60%): Step-by-step instructions, code, problem-solving.
3. **Resolution** (final 20%): Confirm success. Use words like: congratulations, you've built, you now have, you can now.

---

## Rule 16: Meet the Flesch-Kincaid grade target

**Applies to:** all | **Severity:** WARN

Write at or below these grade levels:

| Type | Max Grade |
|------|-----------|
| tutorial | 8 |
| guide | 10 |
| reference | 10 |
| book-chapter | 10 |
| whitepaper | 12 |

Lower your grade: use shorter sentences and simpler words. Replace multi-syllable words with single-syllable ones where meaning is preserved.

---

## Rule 17: Write in active voice

**Applies to:** all | **Severity:** WARN

Keep passive voice under 20% of sentences (35% for whitepapers). Passive = `is/are/was/were/been/being` + past participle.

**Do this:** "The API fetches the data."
**Not this:** "The data is fetched by the API."

---

## Rule 18: Center the reader with "you"

**Applies to:** all except whitepaper, book-chapter | **Severity:** WARN

Use "you", "your", "you'll", "you've" more than system phrases like "the API", "the system", "the tool", "the library", "the framework", "the module", "the service", "the platform".

Reader pronouns must be at least half the count of system phrases. If they aren't, rewrite system-centric sentences to address the reader.

**Do this:** "You can query data through the API endpoint."
**Not this:** "The API provides a query endpoint."

---

## Rule 19: Use descriptive headings

**Applies to:** all | **Severity:** WARN

Never use these as standalone headings: Overview, Details, Miscellaneous, Notes, General, Background, Other, More, Info, Additional.

Add a qualifying keyword: "Authentication Overview" is fine. "Overview" alone is not.

---

## Rule 20: Frontload the topic sentence

**Applies to:** all | **Severity:** WARN

The main keyword of each paragraph must appear in the first sentence. If your key concept doesn't show up until sentence 2 or later, move it forward. Readers scan the first sentence of each paragraph to decide whether to read on.

**Do this:**
> **Validation errors** are the most common error type. You can handle them with try-catch blocks or result types.

**Not this:**
> There are several approaches to handling errors. Some use try-catch. **Validation errors** are the most common type.

---

## Rule 21: Add visuals to dense conceptual sections

**Applies to:** all | **Severity:** WARN

If a section exceeds 300 words and discusses conceptual topics (keywords: explain, understand, concept, theory, approach, how it works, architecture), add at least one image, Mermaid diagram, or code block.

---

## Rule 22: Add diagrams when discussing structures

**Applies to:** all | **Severity:** WARN

If the section heading or content mentions: architecture, flow, pipeline, hierarchy, tree, state machine, lifecycle, sequence, relationship, structure, topology - add an image or Mermaid diagram.

---

## Rule 23: Every image must have alt text

**Applies to:** all | **Severity:** FAIL

**Do this:** `![Authentication flow showing token exchange between client and server](diagram.png)`
**Not this:** `![](diagram.png)`

---

## Rule 24: Every image path must resolve

**Applies to:** all | **Severity:** FAIL

All relative image paths must point to existing files. HTTP/HTTPS URLs are exempt.

---

## Rule 25: Use contractions

**Applies to:** all | **Severity:** WARN

Natural writing contracts. Replace every uncontracted form:

| Write | Not |
|-------|-----|
| isn't | is not |
| aren't | are not |
| don't | do not |
| doesn't | does not |
| didn't | did not |
| can't | cannot |
| won't | will not |
| wouldn't | would not |
| shouldn't | should not |
| couldn't | could not |
| it's | it is |
| that's | that is |
| there's | there is |
| you're | you are |
| we're | we are |
| they're | they are |
| I'm | I am |
| you've | you have |
| we've | we have |
| they've | they have |
| I'll | I will |
| you'll | you will |
| it'll | it will |
| we'll | we will |
| they'll | they will |
| I'd | I would |
| you'd | you would |
| let's | let us |

---

## Rule 26: Purge LLM vocabulary

**Applies to:** all | **Severity:** WARN

These words are statistically overused by LLMs (Kobak et al., 2024). Replace every occurrence:

| Kill | Use instead |
|------|------------|
| delve/delving | explore, examine |
| tapestry | mix, combination |
| landscape | field, area, space |
| comprehensive | thorough, complete |
| intricate | complex, detailed |
| nuanced | subtle, detailed |
| multifaceted | complex, varied |
| pivotal | key, important |
| crucial | important, key |
| furthermore | also, and |
| moreover | also, and |
| notably | especially |
| underscore(s) | highlights, shows |
| showcasing | showing, demonstrating |
| leverage/leveraging | using |
| harness/harnessing | using |
| foster/fostering | encouraging, supporting |
| streamline/streamlining | simplifying |
| facilitate/facilitating | enabling, helping |
| illuminate/illuminating | revealing, clarifying |
| elucidate/elucidating | explaining, clarifying |
| groundbreaking | new, innovative |
| commendable | good, praiseworthy |
| meticulous(ly) | careful, thorough |
| encompass/encompassing | covering, including |
| realm | area, field, domain |
| paradigm | model, approach |
| holistic(ally) | complete, overall |
| robust | strong, solid |
| seamless(ly) | smooth |
| transformative | significant, major |
| unparalleled | exceptional, unique |
| invaluable | very useful, essential |
| indispensable | essential, necessary |
| imperative | essential, important |
| formidable | significant, challenging |
| burgeoning | growing, expanding |
| cutting-edge | modern, latest |
| spearheading | leading |
| revolutionize | transform, change |
| accentuating | highlighting, emphasizing |
| intricacies | details, complexities |
| adept | skilled, capable |
| poised | ready, positioned |
| endeavor(s) | efforts, work |
| interplay | interaction, relationship |
| synergy | collaboration, combined effect |
| pinnacle | peak, top |
| bedrock | foundation, basis |
| cornerstone | foundation, key part |
| underpinning | supporting, underlying |
| orchestrating | coordinating, organizing |
| navigating | working through, handling |

---

## Rule 27: Remove filler and hedge phrases

**Applies to:** all | **Severity:** WARN

Delete these on sight. They add no meaning:

- "It's worth noting that" - delete, start with the point
- "It is important to note that" - delete
- "It should be noted that" - delete
- "In today's rapidly evolving" - delete or be specific
- "In the ever-evolving landscape of" - delete
- "In this comprehensive guide" - delete
- "Let's dive in" - delete
- "Let's delve into" - delete
- "Without further ado" - delete
- "At the end of the day" - delete
- "In order to" - replace with "To"
- "Due to the fact that" - replace with "Because"
- "In the realm of" - replace with "In"
- "A myriad of" - replace with "Many"
- "Serves as a testament to" / "Is a testament to" - replace with "shows"
- "Game-changing" / "Game-changer" - replace with "significant improvement"
- "Take it to the next level" - replace with "improve"
- "Best practices" - replace with "recommendations" or "guidelines"

---

## Rule 28: Don't open sentences with conjunctive adverbs

**Applies to:** all | **Severity:** WARN

Never start a sentence with:
- ~~Additionally,~~
- ~~Furthermore,~~
- ~~Moreover,~~
- ~~Consequently,~~
- ~~Notably,~~
- ~~Importantly,~~

Vary transitions. Use shorter connectors: "also", "and", "so", "but", "yet". Or restructure the sentence to eliminate the connector entirely.

---

## Rule 29: Replace typographic artifacts

**Applies to:** all | **Severity:** WARN

| Find | Replace with |
|------|-------------|
| Em dash `—` | ` - ` or en dash `–` |
| Double hyphen `--` | ` - ` or rewrite |
| Smart/curly quotes `""''` | Straight quotes `"` `'` |
| Decorative emoji (🚀💡✨🎯🔑🌟⭐🏆📌🔥💪🎉👉⚡🤔🧠📝🛠️🔍📊) | Delete |

---

## Rule 30: Include required front matter

**Applies to:** all | **Severity:** FAIL

Every `content.md` must start with:

```yaml
---
id: kebab-case-slug          # must match directory name
title: "Descriptive Title"
type: tutorial                # tutorial | reference | guide | whitepaper | book-chapter
audience: beginner            # beginner | intermediate | advanced
prerequisites: []             # array of doc IDs, may be empty
---
```

All five fields are mandatory. `id` must be kebab-case. `type` and `audience` must use the exact enum values shown.

---

## Rule 31: Resolve all cross-references

**Applies to:** all | **Severity:** FAIL

Every `{{doc:slug}}` must resolve to an existing file in `publish/slug.md` or `drafts/slug/content.md`. An unresolvable cross-reference is always a hard failure.

---

## Rule 32: Include Agent Contributions in every artifact

**Applies to:** all | **Severity:** FAIL

End every draft artifact (`outline.md`, `content.md`, `checklist.md`, `research.md`) with:

```markdown
## Agent Contributions

### Role
Writer in single mode

### Assumptions
- [list each assumption you made]

### Unknowns
- [list items needing SME verification, or "None"]
```

---

## Rule 33: Track all nine Gagne events in the checklist

**Applies to:** all (strongest for tutorial) | **Severity:** WARN

`checklist.md` must contain a task item for each of Gagne's Nine Events:

1. Gain Attention
2. State Objectives
3. Recall Prior Knowledge
4. Present Content
5. Provide Guidance
6. Elicit Performance
7. Provide Feedback
8. Assess Performance
9. Enhance Retention

---

## Rule 34: Build the outline with all required sections

**Applies to:** all | **Severity:** FAIL

`outline.md` must contain these H2 headings:
- `## Reader Context`
- `## Learning Outcomes`
- `## Engagement Strategy`
- `## Narrative Arc`
- `## Visual Requirements`
- `## Practice/Interaction`

Under `## Engagement Strategy`, include these H3 subheadings:
- `### Opening Hook`
- `### Ethos Signals`
- `### Pathos Triggers`
- `### Logos Structure`
- `### Information Gaps`
- `### Tension-Release Beats`

---

## Rule 35: Produce all required draft files

**Applies to:** all | **Severity:** FAIL

Every draft in `drafts/[slug]/` must contain:
- `outline.md` (required)
- `content.md` (required)
- `checklist.md` (required)
- `research.md` (recommended but not required)

---

## Self-Verification Procedure

After writing or refactoring, walk through this checklist before declaring the work complete:

1. Read the `type` field. Determine which profile applies.
2. Scan the first 200 words. Is there a hook? (Rule 1)
3. For each H2 section:
   - Does it open with a question or problem? (Rule 2)
   - Does it contain an example or code block? (Rule 3)
   - Does it end with a transition phrase? (Rule 14)
4. For each paragraph: Is it 5 sentences or fewer? (Rule 6) Does the first sentence contain the key topic? (Rule 20)
5. For each sentence: Is it 30 words or fewer? (Rule 7)
6. For each list: Does it have 3-7 items? (Rule 8)
7. For each section: Is it under 500 words? (Rule 9)
8. For each code block:
   - Is it within 3 lines of its explanation? (Rule 10)
   - If tutorial, does it have comments? (Rule 5)
   - Does it use domain-specific names? (Rule 12)
9. For tutorials: Do worked examples precede exercises? (Rule 4) Are there step progress indicators? (Rule 11) Is there a three-act arc? (Rule 15)
10. Does the document end with a forward-linking section? (Rule 13)
11. Run a vocabulary pass: kill every word from the LLM word list (Rule 26), delete every filler phrase (Rule 27), contract every uncontracted form (Rule 25), eliminate conjunctive adverb openers (Rule 28), remove typographic artifacts (Rule 29).
12. Check voice: Is passive voice under 20% / 25% for book-chapter / 35% for whitepaper? (Rule 17) Do "you" pronouns outnumber system phrases? (Rule 18)
13. Check structure: All headings descriptive? (Rule 19) Visuals in dense sections? (Rules 21, 22) All images have alt text and valid paths? (Rules 23, 24)
14. Check front matter, cross-references, agent contributions, draft files. (Rules 30-35)

---

## Profile Quick-Reference

### Tutorial
Grade target: 8 | Passive max: 20%
**FAIL on:** missing hook, missing examples, exercises before worked examples, uncommented code, incomplete outline, missing front matter, broken cross-refs, missing agent contributions, missing image alt text, broken image paths.
**WARN on:** everything else.

### Reference
Grade target: 10 | Passive max: 20%
**FAIL on:** missing front matter, broken cross-refs, missing agent contributions, missing image alt text, broken image paths.
**WARN on:** readability, passive voice, reader focus, code proximity, visual density.
**Skip:** hooks, narrative arc, exercises, worked examples, step numbering, transitions.

### Guide
Grade target: 10 | Passive max: 20%
**FAIL on:** missing hook, missing examples, missing front matter, broken cross-refs, missing agent contributions, missing image alt text, broken image paths.
**WARN on:** question-before-answer, next steps, transitions, visual density, diagrams, and everything else.

### Book Chapter
Grade target: 10 | Passive max: **25%**
**FAIL on:** missing hook, missing examples, missing front matter, broken cross-refs, missing agent contributions, missing image alt text, broken image paths.
**WARN on:** question-before-answer, transitions, next steps, visual density, diagrams, narrative arc.
**Notes:** Longer sections allowed (750 words before subheading warning). Narrative voice encouraged - first person ("we") and third person storytelling are acceptable alongside "you". Reader pronoun ratio not checked.

### Whitepaper
Grade target: 12 | Passive max: **35%**
**FAIL on:** missing hook, missing front matter, broken cross-refs, missing agent contributions, missing image alt text, broken image paths.
**WARN on:** next steps, visual density, diagrams.
**Relaxed:** formal tone acceptable, passive threshold raised, reader pronoun ratio not checked.
