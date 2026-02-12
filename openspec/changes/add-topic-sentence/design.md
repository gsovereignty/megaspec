# Design: add-topic-sentence

## Algorithm

Per the PRD (DF-055, RF-11):

1. Visit each `paragraph` node in the mdast AST
2. Extract the full text via `toString(node)`
3. Split into sentences using the existing `split(/(?<=[.!?])\s+/)` pattern
4. Skip paragraphs with ≤1 sentence (nothing to frontload)
5. Tokenize all sentences into lowercase words, filter out stopwords
6. Count frequency of each remaining word across all sentences
7. Identify the dominant keyword (highest frequency; ties broken by first-occurrence order)
8. Check if the dominant keyword appears in sentence 1
9. If not, emit WARN with the keyword, its first-appearing sentence number, and the paragraph's line number

## Stopword List

A compact English stopword list (~150 words) embedded inline — common function words (articles, prepositions, pronouns, auxiliaries, conjunctions). No external dependency needed.

## Edge Cases

- **Single-sentence paragraphs**: Skipped (no frontloading issue possible)
- **All stopwords**: If no non-stopword words remain, skip (no dominant keyword)
- **Tie for most frequent**: Use the word that appears first in the paragraph text
- **Very short paragraphs** (2 sentences, ≤10 words total): Skip to reduce noise
- **Code-heavy paragraphs**: These are already excluded from paragraph nodes by the AST parser (code blocks are separate nodes)

## Severity

Always WARN — this is a heuristic and will produce false positives. The PRD explicitly states WARN severity.
