# Week 7 Lab: Context-Free Grammars and CKY Parsing

[中文说明](README_zh.md)

Complete this lab in two stages: **finish T1–T4 within one week for an in-class check during the Week 8 lab; continue working independently on T5–T6 and submit all tasks by the assignment deadline.** T5–T6 are required.

Use [lab_w7_cfg.ipynb](lab_w7_cfg.ipynb) and `atis3.cfg`, and complete T1–T6 in the notebook. You need Python 3 and Jupyter; the algorithms require only the Python standard library. Run the notebook from this directory, complete the marked sections, and keep the existing tests.

## Stage 1: T1–T4

| Task | Requirements |
| --- | --- |
| T1: Count rules | Count the rules with `NP` on the left-hand side: 276 rules. |
| T2: Read the grammar | Implement `parse_rule` and `CFG`, and build indexes for both sides of the rules. The right-hand-side index has 852 keys; the left-hand-side index has 300 keys. The start symbol is `TOP`. |
| T3: CKY recognition | Fill the lexical cells and cells for longer spans, then check whether the start symbol covers the entire sentence. |
| T4: Encapsulate the algorithm | Implement `CKY.is_grammatical(tokens)`. Return `True` for the provided original sentence and `False` for its scrambled version. |

**Week 8 in-class check:** demonstrate a working implementation of T1–T4, run the tests, and explain the roles of the span `[i,j)`, split point `k`, and grammar indexes. No separate report is required for this stage.

## Stage 2: T5–T6

Design your own data structures and add tests. Implement the algorithms yourself rather than calling an existing CKY or syntactic parser. This lab uses binary phrasal rules and lexical rules; support for general CFGs, PCFGs, or the most probable parse is not required.

### T5: Store Backpointers

Extend the recognition table so that parse trees can be reconstructed. Lexical cells record terminal words; other cells record the symbols and spans of the left and right children, together with the split point. **For each nonterminal in a span, retain all distinct backpointers**, not just the first one, so that all trees can be enumerated.

Display the root cell and at least one internal cell for the example sentence.

### T6: Generate Parse Trees Recursively

- Implement `build_tree` to reconstruct one complete tree from the start symbol. Display it as a nested tuple or in bracket notation.
- Implement `build_tree_full` to traverse all backpointers, combine the left and right subtrees, and return all distinct parse trees.
- For unrecognized input, explicitly return a no-tree result, such as `None` for one tree or `[]` for all trees. A missing root must not cause an error.

**Include at least the following tests and their outputs:**

| Input | Checks |
| --- | --- |
| `flights from miami to cleveland .` | Recognized; the tree root is `TOP`, the leaves reproduce the input in order, and every node follows a grammar rule. |
| `miami flights cleveland from to .` | Not recognized; no tree is generated. |
| A sentence containing a word outside the grammar | Not recognized; no tree is generated, and the program does not raise an error. |
| An empty token list | Returns `False`; no tree is generated. |
| A custom ambiguous grammar with start symbol `S` and rules `S -> S S` and `S -> a`; input `a a a` | `build_tree_full` returns exactly two distinct trees, both with leaves `a a a`. |

The ambiguity test checks whether you generate **all trees**. Successfully producing one tree is insufficient. Symbol order and tree output order may differ between implementations.

## Final Submission

Submit `studentID_name_w7_cfg.zip` on **Blackboard**, containing:

1. `studentID_name_w7_cfg.ipynb`: completed T1–T6, your own tests, and actual execution outputs.
2. Any additional `.py` modules or custom grammar files your implementation uses. You may also define the custom grammar directly in the notebook.

Replace `studentID` and `name` with your student ID and name. Before submitting, restart the kernel, run all cells from the beginning, check that there are no errors, and save the outputs. You do not need to resubmit the original `atis3.cfg`. Do not include virtual environments, caches, or solution files. **No separate PDF report is required.**
