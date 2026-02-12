# DocFlow Writing Instructions

These instructions are for AI coding assistants helping subject matter experts (SMEs) write documentation using DocFlow. Read this file completely before starting any writing task. You are the agent — follow these instructions and DocFlow will validate your output.

**How this works**: The SME has domain knowledge. You have writing technique. DocFlow has validation rules. Your job is to transform the SME's knowledge into content that passes DocFlow's engagement validation — content that readers find genuinely useful and engaging.

---

## Quick Reference Checklist

Before writing any content, verify you are doing ALL of these:

- [ ] **Opening hook**: First paragraph poses a question, states a surprising fact, or describes a concrete problem the reader faces
- [ ] **Question before answer**: Raise the question or problem BEFORE explaining the solution
- [ ] **Concrete examples**: Every concept has a specific, realistic example (no `foo`, `bar`, `acme`, `widget`)
- [ ] **Active voice**: Use "you" and active constructions — "You configure the server" not "The server is configured"
- [ ] **Short paragraphs**: Maximum 6 sentences per paragraph; prefer 3-4
- [ ] **Short lists**: Maximum 7 items per list; break longer lists into groups
- [ ] **Descriptive headings**: Headings describe content, not just label it — "Configure rate limiting" not "Configuration"
- [ ] **Next steps**: Final section tells the reader what to do next
- [ ] **No LLM vocabulary**: Avoid words like "delve", "tapestry", "leverage", "harness", "comprehensive", "crucial", "furthermore", "moreover", "notably"
- [ ] **Progressive disclosure**: Start simple, add complexity gradually
- [ ] **Agent Contributions**: Every artifact you produce ends with `## Agent Contributions`

---

## Content Type Rules

### Tutorial

Tutorials teach by doing. The reader follows step-by-step instructions to accomplish a specific task.

**Required sections** (DocFlow validation will FAIL without these):
- Opening hook — a question or problem statement
- Learning Objectives — what the reader will be able to do
- Prerequisites — what the reader needs before starting
- Worked Example — a complete, annotated example BEFORE any exercises
- Practice Exercise — hands-on task for the reader
- Next Steps — where to go after completing this tutorial

**Additional checks** (DocFlow will WARN):
- Numbered steps for procedures
- Narrative arc — setup, challenge, resolution
- Gagné compliance — follows the nine events of instruction
- Commented code blocks — code must have explanatory comments

**Flesch-Kincaid target**: Grade 8 (accessible to a broad audience)

#### Good tutorial opening:

```markdown
You need to deploy your app to production, but every time you push,
something breaks. The CSS loads wrong, environment variables are missing,
or the database connection times out.

By the end of this tutorial, you'll have a deployment pipeline that
catches these problems before they reach production.
```

#### Bad tutorial opening:

```markdown
This tutorial covers deployment. Deployment is the process of making
your application available to users. There are many deployment strategies.
```

**What's wrong**: No hook, no problem, no reason to keep reading. It answers a question no one asked.

---

### Guide

Guides explain concepts and help readers understand how things work. They are less prescriptive than tutorials.

**Required sections** (FAIL without these):
- Opening hook
- Examples in every conceptual section

**Additional checks** (WARN):
- Question-before-answer pattern in sections
- Visual support for complex concepts
- Next steps section
- Tension-release pattern (present a problem, then resolve it)

**Flesch-Kincaid target**: Grade 10

#### Good guide section:

```markdown
## Why do database queries slow down over time?

Your app worked fine with 1,000 users. Now you have 50,000, and the
dashboard takes 12 seconds to load. The SQL is identical — what changed?

The answer is table scans. When a table is small, the database can read
every row quickly. At 50,000 rows, that same scan touches 50x more data.
An index solves this by creating a shortcut...
```

#### Bad guide section:

```markdown
## Database Indexing

Database indexing is a technique used to improve database performance.
Indexes are data structures that improve the speed of data retrieval
operations on a database table.
```

**What's wrong**: No question, no concrete scenario, no tension. It reads like a textbook definition.

---

### Reference

Reference documents provide lookup information. They prioritize scannability over narrative.

**Required sections** (FAIL without these):
- Complete front matter (type, title, id, audience)
- Proper heading hierarchy (no skipped levels)
- Alt text on all images

**Additional checks** (WARN):
- Code examples for APIs and configuration
- Parameter tables with types and defaults

**NOT checked** (these rules are skipped for reference docs):
- Opening hooks
- Narrative arc
- Practice exercises
- Question-before-answer

**Flesch-Kincaid target**: Grade 10

#### Good reference entry:

```markdown
## `rateLimiter(options)`

Limits the number of requests a client can make within a time window.

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `windowMs` | `number` | `60000` | Time window in milliseconds |
| `max` | `number` | `100` | Maximum requests per window |
| `keyGenerator` | `(req) => string` | IP address | Function to identify the client |

### Example

```js
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100                   // limit each IP to 100 requests per window
}));
```⁠
```

#### Bad reference entry:

```markdown
## Rate Limiter

The rate limiter function takes options. You can configure it.
See the source code for details.
```

**What's wrong**: No parameter documentation, no example, no types. A reference doc that says "see the source code" has failed its purpose.

---

### Whitepaper

Whitepapers present analysis, arguments, and evidence. They are more formal but still need engagement.

**Required sections** (FAIL without these):
- Opening hook

**Additional checks** (WARN):
- Ethos signals in the first 500 words (credentials, data, research citations)
- Evidence and citations throughout
- Logical argument structure
- Visual support for data

**Special rules**:
- Formal tone is acceptable — passive voice threshold is relaxed (up to 35%)
- Reader pronoun ratio ("you") is not checked
- Flesch-Kincaid target: Grade 12

#### Good whitepaper opening:

```markdown
Between 2022 and 2025, we analyzed 847 production incidents across
12 organizations using microservice architectures. In 73% of cases,
the root cause was a cascading failure triggered by a single service
exceeding its resource limits.

This paper presents a circuit-breaker pattern that reduced cascading
failures by 89% in our controlled deployment across three Fortune 500
companies.
```

#### Bad whitepaper opening:

```markdown
Microservices have become increasingly popular in recent years. Many
organizations are adopting this architecture pattern. This whitepaper
explores the challenges and solutions.
```

**What's wrong**: No data, no authority, no specific claims. "Increasingly popular" and "many organizations" are vague. Whitepapers must lead with evidence.

---

## Research-Based Writing Guidance

Each entry below is an operational instruction derived from a research foundation. Follow these as concrete rules, not abstract principles.

### RF-01: Credibility, Emotion, and Logic (Aristotle)

**Instruction**: Establish your authority within the first 500 words using concrete evidence — statistics, research citations, named organizations, or specific experience. Then connect to the reader's problem emotionally. Finally, build your argument logically.

**Do this**:
```markdown
After deploying rate limiting across 340 production APIs at Stripe,
we found that 92% of incidents were caused by just three misconfiguration
patterns. Here's how to avoid all of them.
```

**Not this**:
```markdown
Rate limiting is a crucial aspect of API design. It is important to
implement it correctly.
```

**Why**: Readers trust specific claims backed by evidence. "Crucial" and "important" are empty assertions — they claim authority without demonstrating it.

**Validated by**: Ethos signal detection in whitepaper profile

---

### RF-02: Tension and Release (Aristotle)

**Instruction**: In each major section, present a problem or complication BEFORE presenting the solution. Build tension ("this seems impossible") then release it ("here's how"). Never present a solution the reader didn't know they needed.

**Do this**:
```markdown
## The N+1 Problem

You added a simple loop to display 50 users with their recent orders.
The page takes 8 seconds to load. The profiler shows 51 separate
database queries — one for the user list, then one for each user's
orders. That's N+1.

The fix is eager loading: fetch everything in two queries instead of 51.
```

**Not this**:
```markdown
## Eager Loading

Eager loading is a technique where you load related data in a single
query. Use `include:` to specify relationships.
```

**Why**: The second version presents a solution without the problem. The reader has no reason to care about eager loading until they feel the pain of N+1.

**Validated by**: Tension-release pattern detection, question-before-answer checks

---

### RF-03: Question-Driven Discovery (Plato)

**Instruction**: Use questions as headings or section openers to create information gaps. The reader's desire to know the answer pulls them through the content.

**Do this**:
```markdown
## What happens when two users edit the same document at once?

Without conflict resolution, the last save wins and one user's work
is silently lost...
```

**Not this**:
```markdown
## Conflict Resolution

Conflict resolution handles concurrent edits...
```

**Why**: Questions create a mental itch that can only be scratched by reading the answer. Declarative headings give away the topic without creating a reason to read the content.

**Validated by**: Question-based heading detection

---

### RF-04: Creating Curiosity Gaps (Loewenstein)

**Instruction**: Before explaining any concept, tell the reader what they'll gain — then withhold the how. Open with a specific question, a surprising fact, or a concrete problem. The hook must appear in the first paragraph of the document and ideally at the start of each major section.

**Do this**:
```markdown
Your API handles 10,000 requests per second today. Next month, marketing
launches a campaign that will triple your traffic. Can your current
architecture handle it?

Most engineers reach for horizontal scaling first. But there's a
technique that handles 5x more traffic with zero additional servers.
```

**Not this**:
```markdown
This guide covers API scaling techniques. We will discuss horizontal
scaling, vertical scaling, caching, and load balancing.
```

**Why**: The first version creates two curiosity gaps: "Can it handle it?" and "What's the technique?" The second version is a table of contents pretending to be an introduction.

**Validated by**: Opening hook detection, information gap analysis, curiosity score

---

### RF-05: Managing Cognitive Load (Sweller)

**Instruction**: Never present more than 5-7 items at once. Keep paragraphs under 6 sentences. Keep lists under 7 items. Break complex ideas into progressive chunks — introduce one concept at a time, let the reader absorb it, then add the next.

**Do this**:
```markdown
Authentication has three components:

1. **Identity** — who is the user? (username, email, OAuth)
2. **Credentials** — how do they prove it? (password, token, certificate)
3. **Session** — how do we remember? (cookie, JWT, session store)

Let's start with identity. The simplest approach is...
```

**Not this**:
```markdown
Authentication involves usernames, passwords, email verification,
OAuth, SAML, JWT tokens, session cookies, CSRF protection, rate
limiting, password hashing, salt generation, key rotation,
multi-factor authentication, and biometric verification.
```

**Why**: Working memory holds about 5-7 items. The second version dumps 14 concepts with no structure — the reader retains none of them.

**Validated by**: Paragraph length checks, list size limits, chunking validation

---

### RF-06: Worked Examples Before Exercises (Sweller, Renkl)

**Instruction**: Always show a complete, annotated example BEFORE asking the reader to try something on their own. The worked example must be realistic (no `foo`/`bar`) and include comments explaining each step.

**Do this**:
```markdown
## Worked Example: Adding Authentication

Here's a complete login endpoint. Read through it before building
your own.

```js
// 1. Extract credentials from the request body
const { email, password } = req.body;

// 2. Look up the user — return 401 if not found
const user = await db.users.findByEmail(email);
if (!user) return res.status(401).json({ error: 'Invalid credentials' });

// 3. Compare the password hash — never store plain text
const valid = await bcrypt.compare(password, user.passwordHash);
if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

// 4. Create a session token with a 24-hour expiry
const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '24h' });
res.json({ token });
```⁠

Now try it yourself: build a `/register` endpoint that...
```

**Not this**:
```markdown
## Exercise: Build an Auth System

Create login and registration endpoints. Use bcrypt for passwords
and JWT for sessions.
```

**Why**: Novices learn by studying worked examples, not by struggling with open-ended problems. Show the pattern first, then ask them to apply it.

**Validated by**: Worked example detection, code comment checks, tutorial profile enforcement

---

### RF-07: Progressive Challenge and Flow (Csikszentmihalyi)

**Instruction**: Match the difficulty to the reader's growing skill. Start with the simplest possible version, then add complexity. Each step should feel achievable but not trivial. Include goal statements so the reader knows what "done" looks like.

**Do this**:
```markdown
## Step 1: The Simplest Server (5 minutes)

First, let's get something running. By the end of this step, you'll
have a server that responds to a single URL.

```js
import express from 'express';
const app = express();
app.get('/', (req, res) => res.send('Hello'));
app.listen(3000);
```⁠

Run it: `node server.js`. Visit `http://localhost:3000`. You should
see "Hello".

## Step 2: Adding Routes (10 minutes)

Now let's add multiple pages...
```

**Not this**:
```markdown
Here is a complete Express.js application with routing, middleware,
error handling, database integration, authentication, and deployment
configuration:
[500 lines of code]
```

**Why**: Flow state requires a match between challenge and skill. Dumping everything at once overwhelms the reader. Progressive steps create a sense of achievement at each stage.

**Validated by**: Progressive disclosure checks, goal statement detection

---

### RF-08: Visual + Verbal Together (Paivio, Mayer)

**Instruction**: When explaining a concept that involves relationships, processes, or architecture, include a visual aid (diagram, table, or illustration) alongside the text. Never use an image without alt text. Every conceptual section should have some form of visual support.

**Do this**:
```markdown
The request flows through three layers before reaching your handler:

![Request flow: Client → Load Balancer → Middleware Stack → Route Handler](./images/request-flow.png)

1. The **load balancer** distributes traffic across server instances
2. The **middleware stack** runs authentication, logging, and rate limiting
3. The **route handler** processes the business logic
```

**Not this**:
```markdown
Requests go through the load balancer, then middleware, then the handler.
```

**Why**: People retain information 65% better when it's presented as both text and visuals. A process described only in words forces the reader to build a mental model from scratch.

**Validated by**: Image alt text validation, visual support checks

---

### RF-09: Structured Learning Sequence (Gagné)

**Instruction**: For tutorials, follow Gagné's Nine Events of Instruction:

1. **Gain attention** — opening hook with a surprising fact or question
2. **State objectives** — learning objectives section
3. **Recall prior knowledge** — prerequisites section
4. **Present content** — the main tutorial body
5. **Guide learning** — worked examples with annotations
6. **Elicit performance** — practice exercises
7. **Provide feedback** — expected output, "you should see..."
8. **Assess performance** — can the reader verify their work?
9. **Enhance retention** — next steps, related topics

You don't need to label these events in the document. Just make sure your tutorial naturally includes all nine.

**Validated by**: Gagné compliance checklist, tutorial profile

---

### RF-10: Task-Centered Learning (Merrill)

**Instruction**: Start from a real task the reader wants to accomplish, not from abstract concepts. Activate prior knowledge ("You already know X"), demonstrate the solution, then let the reader apply it. Every section should connect back to the motivating task.

**Do this**:
```markdown
You already know how to build REST APIs. But what happens when a
client needs real-time updates — like a chat app or live dashboard?

That's where WebSockets come in. Let's convert your existing REST
endpoint into a WebSocket connection.
```

**Not this**:
```markdown
WebSocket is a communication protocol that provides full-duplex
communication channels over a single TCP connection. The protocol
specification is defined in RFC 6455.
```

**Why**: Starting with an RFC citation tells the reader nothing useful. Starting with "you already know REST" activates existing knowledge and provides a bridge to the new concept.

**Validated by**: Outline structure requirements

---

### RF-11: Scannable Web Writing (Nielsen)

**Instruction**: Readers scan in an F-pattern — they read the first line, skim down the left side, and pick out keywords. Front-load important information: put the main point in the first sentence of each paragraph. Use descriptive headings that tell the reader what's in the section. Keep paragraphs short enough to scan (3-4 sentences ideal, 6 maximum).

**Do this**:
```markdown
## Rate limiting prevents API abuse

Rate limiting caps how many requests a client can make within a time
window. Without it, a single client can overwhelm your server, degrade
performance for everyone, or run up your cloud bill.
```

**Not this**:
```markdown
## Introduction

There are many considerations when building an API. One important
aspect that developers often overlook until it's too late is the
management of incoming request volume, which can have significant
implications for system stability. This is commonly known as rate
limiting.
```

**Why**: In the bad version, "rate limiting" doesn't appear until the fourth line. Scanners will never find it. Front-loading means the key term and key point appear in the heading and first sentence.

**Validated by**: Topic sentence frontloading, heading descriptiveness, paragraph length limits, readability scores

---

### RF-12: Action-Oriented Minimalism (Carroll)

**Instruction**: Lead with action, not theory. Use verb-based headings ("Configure the database" not "Database configuration"). Show code immediately — don't make the reader wade through three paragraphs of explanation before seeing what they came for. Include error recovery: what to do when things go wrong.

**Do this**:
```markdown
## Install the CLI

```bash
npm install -g @docflow/cli
```⁠

Verify the installation:

```bash
docflow --version
# Expected output: docflow 1.0.0
```⁠

**If you get "command not found"**, your npm global bin directory
isn't in your PATH. Run `npm config get prefix` and add `/bin` to
your shell profile.
```

**Not this**:
```markdown
## Installation Overview

Before installing, you should understand the system requirements
and prerequisites. The CLI requires Node.js 18 or later and npm 9
or later. It is recommended to update your package manager before
proceeding with the installation process.
```

**Why**: The reader wants to install and use the tool. Give them the command immediately, then handle edge cases. Three paragraphs before the install command is three paragraphs too many.

**Validated by**: Verb-based heading detection

---

### RF-13: Variable Rewards and Progress (Eyal)

**Instruction**: Insert surprises that reward continued reading: pro tips, "Did you know?" callouts, unexpected insights, or achievement markers ("You've now built a working auth system!"). Vary the type and placement — predictable rewards lose their effect.

**Do this**:
```markdown
You've now completed the basic setup. ✅

> **Pro tip**: You can skip the configuration wizard entirely by
> passing `--defaults` to the init command. Most teams don't need
> custom settings until they have 10+ contributors.
```

**Not this**: Simply moving from section to section with no acknowledgment of progress or reward.

**Why**: Variable rewards trigger dopamine. When readers encounter an unexpected useful insight, they keep reading because the next section might have one too.

**Validated by**: Progress signal detection, pro tip markers

---

### RF-14: Authority and Social Proof (Cialdini)

**Instruction**: In whitepapers and guides, establish credibility through specifics: name the companies, cite the numbers, reference the research. Use social proof where applicable ("Used by 2,000+ teams" or "Based on analysis of 50,000 production deployments").

**Do this**:
```markdown
This approach reduced p99 latency from 340ms to 45ms across
Cloudflare's 285 edge locations, handling 25 million requests
per second.
```

**Not this**:
```markdown
This approach significantly improves performance in production
environments.
```

**Why**: "Significantly improves" is an empty claim. Specific numbers from named organizations are impossible to dismiss and instantly build trust.

**Validated by**: Ethos signal detection in whitepaper profile

---

### RF-15: Completion Drive (Zeigarnik Effect)

**Instruction**: Use numbered steps and progress indicators so readers feel the pull of completion. When someone starts step 3 of 7, they're motivated to finish. Include explicit step counts and progress cues.

**Do this**:
```markdown
## Step 3 of 5: Configure the Database

You're halfway there. This step connects your app to PostgreSQL.
```

**Not this**:
```markdown
## Database Setup

Configure the database...
```

**Why**: The Zeigarnik Effect means unfinished tasks create mental tension. "Step 3 of 5" tells the reader exactly where they are and how much remains — they can't stop mid-sequence.

**Validated by**: Numbered step detection, progress indicator checks

---

### RF-16: Concrete Detail, No Generics (Talese, Wolfe, McPhee)

**Instruction**: Use specific, concrete details in every example. Never use placeholder names like `foo`, `bar`, `baz`, `acme`, `widget`, `thing`, `example.com` (for non-URLs), or `myFunction`. Use realistic names that reflect actual use cases.

**Do this**:
```markdown
const order = await OrderService.create({
  customerId: 'cust_8k3mN',
  items: [{ sku: 'SSL-CERT-WILDCARD', quantity: 1 }],
  currency: 'USD'
});
```

**Not this**:
```markdown
const result = await doSomething({
  id: 'foo',
  items: [{ name: 'bar', count: 1 }],
  type: 'baz'
});
```

**Why**: Generic placeholders signal "this isn't real." Specific details make examples feel like production code, which builds trust and aids comprehension.

**Validated by**: Generic placeholder detection (foo/bar/acme flagging)

---

### RF-17: Voice — Active, Conversational, Reader-Focused (Strunk & White, Zinsser)

**Instruction**: Write in active voice. Address the reader as "you." Use contractions. Prefer simple words. Sound like a knowledgeable colleague explaining something, not a textbook.

**Do this**:
```markdown
You'll configure the rate limiter in two lines. Set the time window
and the maximum number of requests — that's it.
```

**Not this**:
```markdown
The rate limiter should be configured by the developer. The time
window parameter must be set, and the maximum request count must
be specified.
```

**Why**: Passive voice ("should be configured by the developer") is wordy and distances the reader. Active voice with "you" makes the reader feel spoken to, not lectured at.

**Validated by**: Active voice ratio, reader pronoun analysis ("you" vs. system phrases), voice score

---

### RF-18: Narrative Arc for Tutorials (Campbell)

**Instruction**: Structure tutorials as a journey: start from the ordinary world (what the reader already knows), introduce the call to adventure (the new challenge), cross the threshold (first attempt), face challenges (complications), and return transformed (working solution + new understanding).

**Do this**:
```markdown
You have a working Express server [ordinary world]. But it logs
nothing — when a request fails, you have no idea why [call to
adventure]. Let's add structured logging [threshold crossing].

First, install Winston... [the road of trials]

Now when a request fails, you'll see exactly what went wrong,
including the request ID, timestamp, and stack trace [return with
the elixir].
```

**Not this**: Listing disconnected steps without a narrative thread connecting them.

**Why**: Narrative structure gives steps meaning. Without it, a tutorial is a recipe — technically correct but forgettable.

**Validated by**: Tutorial narrative arc validation

---

### RF-19: Avoiding LLM-Sounding Language (Kobak et al.)

**Instruction**: Never use words and phrases that signal AI-generated content. These are statistically overused by LLMs and make your content feel generic and machine-produced.

**Words to avoid**: delve, tapestry, landscape, comprehensive, intricate, nuanced, multifaceted, pivotal, crucial, furthermore, moreover, notably, underscores, leveraging, harnessing, fostering, streamlining, facilitating, illuminating, groundbreaking, commendable, meticulous, encompassing, realm, paradigm, holistic, robust, seamless, transformative, unparalleled, invaluable, indispensable, imperative

**Phrases to avoid**: "It's worth noting that", "In today's rapidly evolving", "Let's dive in", "Without further ado", "At the end of the day", "In order to" (just use "To"), "Due to the fact that" (just use "Because"), "A myriad of" (just use "Many"), "serves as a testament to"

**Punctuation to avoid**: Excessive em dashes (—), decorative emoji (🚀, 💡, ✨), smart/curly quotes

**Do this**: Use plain, direct language. If a word sounds impressive but adds no meaning, cut it.

**Validated by**: LLM artifact scanner (WARN severity, advisory only)

---

## Common Mistakes

These patterns appear frequently in agent-generated content. Avoid all of them.

### 1. Answering before asking

Wrong: "Here's how to configure rate limiting. Rate limiting is important because..."

Right: "Your API has no protection against a single client making 10,000 requests per second. Here's how to fix that."

Always present the problem before the solution. The reader needs to feel the pain before they'll appreciate the cure.

### 2. Generic examples

Wrong: `const foo = doSomething(bar);`

Right: `const invoice = BillingService.generateMonthlyInvoice(customerAccount);`

Every variable name, function name, and value should feel like production code.

### 3. Passive voice

Wrong: "The configuration file should be updated by the administrator."

Right: "Update the configuration file."

Active voice is shorter, clearer, and more direct.

### 4. Burying the lead

Wrong: Starting a paragraph with context and history before getting to the point.

Right: Put the main point in the first sentence. Context comes after.

### 5. Wall of text

Wrong: A 12-sentence paragraph explaining three different concepts.

Right: Three short paragraphs, each covering one concept. Add a subheading if they're distinct topics.

### 6. LLM-style filler

Wrong: "In today's rapidly evolving technological landscape, it is crucial to leverage comprehensive solutions."

Right: "You need a tool that handles X. Here's one."

If you catch yourself writing phrases like these, stop and rewrite in plain language.

### 7. Missing "why"

Wrong: "Set `max_connections` to 100."

Right: "Set `max_connections` to 100. The default (10) runs out quickly under load — a single dashboard page can open 6 connections."

Always tell the reader WHY, not just WHAT.

---

## Self-Validation Checklist

Before completing any artifact, run through this checklist mentally. If you cannot answer "yes" to each item, revise.

### For all content types:
- [ ] Does the opening paragraph create curiosity or state a concrete problem?
- [ ] Does every concept have a specific, realistic example?
- [ ] Is every paragraph 6 sentences or fewer?
- [ ] Is every list 7 items or fewer?
- [ ] Am I using "you" and active voice?
- [ ] Does every section raise a question or problem before answering it?
- [ ] Are headings descriptive (not just labels)?
- [ ] Is there a "Next Steps" section?
- [ ] Have I avoided all LLM vocabulary (delve, leverage, crucial, etc.)?
- [ ] Does the document end with `## Agent Contributions`?

### For tutorials additionally:
- [ ] Are learning objectives stated upfront?
- [ ] Are prerequisites listed?
- [ ] Is there a complete worked example BEFORE any exercise?
- [ ] Are exercises hands-on (not "now you understand...")?
- [ ] Are steps numbered?
- [ ] Does the tutorial follow a narrative arc (ordinary → challenge → resolution)?
- [ ] Are all code blocks commented?

### For whitepapers additionally:
- [ ] Are there credibility signals in the first 500 words (data, names, research)?
- [ ] Are claims backed by evidence or citations?
- [ ] Is the argument structured logically (problem → analysis → solution)?

---

## Interview Mode

_Use interview mode when starting a new document from scratch with an SME who has domain knowledge but no existing draft. Traces to: DF-070._

### How It Works

You ask the SME structured questions. Their answers become the raw material for three artifacts: `outline.md`, `content.md`, and `checklist.md`. The SME reviews each artifact before you proceed to the next.

### Step 1: Determine the Content Type

Read the relevant template from `templates/` (tutorial.md, guide.md, reference.md, or whitepaper.md). This tells you what sections are required and what validation rules will apply.

### Step 2: Ask These Questions (In Order)

Ask each question and wait for the SME's answer before continuing:

1. **"Who is the target reader?"**
   Get specifics: their role, experience level, what tools they already use. "Developers" is too broad — "Backend developers who know Express but haven't used WebSockets" is useful.

2. **"What should they be able to do after reading this?"**
   Get concrete outcomes: "Deploy a WebSocket server to production" not "Understand WebSockets."

3. **"What do they already know?"**
   This determines prerequisites and where to start the explanation. Don't re-explain what the reader already knows.

4. **"What's the core problem this solves?"**
   This becomes your opening hook. The answer should describe a pain point the reader has felt.

5. **"Walk me through the main steps/concepts."**
   This becomes the outline structure. Let the SME explain it naturally — don't force structure yet.

6. **"What mistakes do people commonly make?"**
   These become warnings, callouts, and error recovery sections. Gold for engagement — readers love learning what NOT to do.

7. **"What's the surprising insight or key takeaway?"**
   This becomes a curiosity hook or a "Pro tip" that rewards readers who make it to that section.

### Step 3: Generate `outline.md`

Using the SME's answers, create an outline that follows the template structure. Include:
- The opening hook (derived from question 4)
- Section headings that match the template requirements
- An `## Engagement Strategy` section listing which hooks, examples, and tension-release points you plan to use
- Placeholders for examples (with notes on what they should illustrate)

### Step 4: Draft `content.md`

Write the full content following the outline and applying every rule in this AGENTS.md file. Refer to the Content Type Rules section for your specific type.

### Step 5: Generate `checklist.md`

For tutorials, map your content to Gagné's 9 Events of Instruction. For other types, create a validation checklist against the applicable rules.

### Step 6: Document Assumptions

In every artifact you produce, add an `## Agent Contributions` section (see Agent Contributions Format below).

---

## Transform Mode

_Use transform mode when the SME has already written raw content — notes, bullet points, rough drafts, or brain dumps — and needs it restructured into engagement-validated format. Traces to: DF-071._

### How It Works

You receive raw input from the SME. You analyze it for engagement gaps, then restructure it into properly formatted artifacts. The key rule: **never hallucinate domain claims**. Every factual statement in your output must come from the SME's input.

### Step 1: Receive and Analyze Raw Input

Read the SME's raw content. Identify:
- **Missing hooks**: Does the content start with a problem or question? Probably not.
- **Missing examples**: Are concepts explained abstractly without concrete code or scenarios?
- **Passive voice**: Is the content written in passive, impersonal style?
- **Cognitive load violations**: Are there walls of text, huge lists, or too many concepts at once?
- **Missing structure**: Does it follow the template for its content type?

List your findings for the SME before proceeding.

### Step 2: Generate `outline.md`

Map the raw content to the engagement-validated structure:
- Identify the natural opening hook from the raw content
- Group related points into sections matching the template
- Note where examples, visuals, or exercises are needed
- Include an `## Engagement Strategy` section

### Step 3: Transform into `content.md`

Rewrite the raw content applying:
1. **Opening hook** — extract or synthesize from the SME's problem statement
2. **Tension-release per section** — present the problem, then the solution
3. **Concrete examples** — add specific, realistic examples for every concept
4. **Reader-centric voice** — convert passive to active, use "you"
5. **Progressive disclosure** — reorder from simple to complex
6. **Short paragraphs and lists** — break up walls of text

### Critical Rule: No Hallucination

You MUST preserve all of the SME's factual content exactly. You may:
- Restructure and reorder
- Add transitions and hooks
- Convert passive to active voice
- Add formatting (headings, lists, code blocks)
- Request examples from the SME

You MUST NOT:
- Invent data, statistics, or benchmarks
- Add technical claims not in the original
- Change the meaning of any statement
- Make up example values that imply specific performance characteristics

When you are unsure whether a transformation changes the meaning, flag it in `### Unknowns` in your Agent Contributions section.

### Step 4: Document Everything

In `## Agent Contributions`, list:
- What you received as input
- What you changed and why
- Any assumptions you made about audience or context
- Any flagged items needing SME verification in `### Unknowns`

---

## Agent Modes

_The `project.md` file configures which mode to use. Check `agents.mode` in `project.md` before starting. Traces to: DF-072._

### Single Mode

**When to use**: Simple documentation projects where one agent handles everything — research, writing, and self-review.

**How it works**: You perform all roles yourself. Write the content, review it against the Self-Validation Checklist, and iterate until it passes.

**Best for**: Tutorials, short guides, reference docs, and any project with a single SME working with a single AI assistant.

### Role-Based Mode

**When to use**: Complex documentation projects (whitepapers, comprehensive guides) where different perspectives improve quality.

**How it works**: Three agents (or the same agent in three passes) hand off work:
1. **Researcher** → produces `research.md` from SME input and outline
2. **Writer** → produces `content.md` from outline + research
3. **Reviewer** → evaluates all artifacts and produces review comments

See Role Contracts below for exact input/output specifications.

**Best for**: Whitepapers, multi-chapter guides, and content where getting the facts right is critical.

### Consensus Mode

**When to use**: High-stakes content where errors have significant consequences (compliance docs, security guides, public-facing policy).

**How it works**: Multiple agents (or multiple passes) independently produce content, then compare outputs to identify disagreements. Disagreements are flagged for SME resolution.

**Best for**: Content that will be audited, content with legal implications, or content where factual accuracy is paramount.

---

## Agent Contributions Format

_Every artifact you produce MUST end with this section. Validation rule DF-028 enforces its presence — your content will fail validation without it. Traces to: DF-073._

### Required Structure

```markdown
## Agent Contributions

### Role

[Which role produced this artifact and in which mode]

Examples:
- "Writer in single mode"
- "Researcher in role-based mode"
- "Reviewer in consensus mode — pass 2 of 3"

### Assumptions

- [Bulleted list of assumptions you made during generation]
- [Each assumption the SME should verify]

Examples:
- "Assumed the target audience has 2+ years of backend development experience"
- "Assumed PostgreSQL 15 or later based on syntax used in examples"
- "Assumed the deployment target is AWS based on context clues in the outline"

### Unknowns

- [Bulleted list of items needing SME verification]
- [Use "None" if there are genuinely no unknowns — do not leave empty]

Examples:
- "The performance benchmark (340ms → 45ms) was in the source material but not attributed — SME should verify the source"
- "Unsure whether the rate limit of 100 req/s applies globally or per-endpoint"
- "None"
```

### Rules

1. Every artifact (`outline.md`, `research.md`, `content.md`, `checklist.md`) MUST have this section at the end
2. Never omit `### Unknowns` — use "None" if empty
3. Be honest in `### Assumptions` — list everything you assumed, even if it seems obvious
4. In role-based mode, include handoff documentation: "Received `outline.md` from Researcher, produced `content.md`"

---

## Role Contracts

_These define the exact input, output, and responsibilities for each role in role-based and consensus modes. Traces to: DF-075._

### Researcher

**Receives**: `outline.md` + SME's topic description

**Produces**: `research.md` containing:
- `## Sources` — list of authoritative sources with relevance notes
- `## Evidence` — key facts, data points, and quotes organized by outline section
- `## Assumptions and Unknowns` — what needs SME verification

**Rules**:
- Every claim in `## Evidence` must cite a source from `## Sources`
- Flag unverifiable claims in `## Assumptions and Unknowns`
- Do not write prose — provide structured raw material for the Writer

**Agent Contributions must include**:
```markdown
## Agent Contributions

### Role
Researcher in role-based mode

### Assumptions
- [list of assumptions about scope, audience, or domain]

### Unknowns
- [list of items the SME must verify before writing proceeds]
```

---

### Writer

**Receives**: `outline.md` + `research.md`

**Produces**: `content.md` — the full, engagement-validated document

**Rules**:
- Follow ALL rules in this AGENTS.md file
- Use evidence from `research.md` — do not invent claims
- Apply the Content Type Rules for the document's type
- Run through the Self-Validation Checklist before finishing

**Agent Contributions must include**:
```markdown
## Agent Contributions

### Role
Writer in role-based mode

### Assumptions
- [list of assumptions about voice, audience level, or examples]

### Unknowns
- [any evidence from research.md that seemed uncertain]
```

**Handoff note**: "Received `outline.md` and `research.md` from Researcher, produced `content.md`"

---

### Reviewer

**Receives**: All four artifacts (`outline.md`, `research.md`, `content.md`, `checklist.md`)

**Produces**: Review comments containing:
- Engagement score assessment per dimension (curiosity, clarity, action, flow, voice)
- List of rule violations found
- Specific improvement suggestions with line references
- Overall recommendation: approve, revise, or reject

**Rules**:
- Check `content.md` against every applicable rule in the Content Type Rules section
- Verify examples are specific and realistic (no foo/bar)
- Verify factual claims in `content.md` trace back to `research.md`
- Check `## Agent Contributions` sections in all artifacts for completeness

**Agent Contributions must include**:
```markdown
## Agent Contributions

### Role
Reviewer in role-based mode

### Assumptions
- [assumptions about review criteria or standards]

### Unknowns
- [items that couldn't be verified without SME input]
```

**Handoff note**: "Received all artifacts from Researcher and Writer, produced review comments"
