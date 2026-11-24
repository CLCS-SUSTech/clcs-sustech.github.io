# Week 12 Lab · CheeseBench Operant Chamber

Use a two-lever Skinner box to observe whether an LLM adjusts its choices based on their outcomes. Allow **20–30 minutes** to try the chamber yourself, run two comparison policies, and discuss the model's behavior.

## Setup

From this lab directory, activate the `cogsci` Conda environment and install the requirements. The lab installs `cheesebench` from PyPI, as shown in the [official CheeseBench quick start](https://github.com/stef41/CheeseBench#quick-start). It pins version `0.2.0` so everyone runs the same implementation.

```bash
conda activate cogsci
python -m pip install -r requirements.txt
```

Open the [English notebook](lab_operant_chamber.ipynb) in Jupyter or VS Code and select the `cogsci` Python kernel. For the Chinese version, see the [中文 Notebook](lab_operant_chamber_zh.ipynb) and [中文说明](README_zh.md).

Run the cells in order. To press a lever by hand, edit and rerun the press cell. No API is needed to try the chamber, run the random and feedback policies, plot their results, or export the data. The last code cell writes `operant_results.csv`, with one row per press. The log includes the chosen lever, whether it delivered a pellet, and the cumulative pellet count. The active lever is added to the log after each session and is not shown to the model.

## Run an LLM

In the terminal you use to start Jupyter, set these variables for the course's Chat Completions compatible endpoint. `LAB_BASE_URL` is the API base URL, which often ends in `/v1`; leave off `/chat/completions`. Use the provider's model ID for `LAB_MODEL`. You can omit `LAB_API_KEY` if the endpoint does not require authentication.

```bash
export LAB_BASE_URL='your course API base URL'
export LAB_MODEL='your course model ID'
export LAB_API_KEY='your API key'
```

In Windows PowerShell, use `$env:LAB_BASE_URL = '…'` and the same syntax for the other variables. Start or restart the notebook kernel, then set `RUN_LLM = True`. To try one session first (12 requests), use `LLM_SEEDS = SEEDS[:1]`. Keep the key out of the notebook. If the model does not return `L` or `R`, the session stops with an error so malformed responses are not silently counted as choices.

## What comes from CheeseBench

- Source: Stéphane Bugaud (2026), [*From Water Mazes to Language Models: A Benchmark for Testing Rodent Bio-inspired Learning in LLMs*](https://arxiv.org/abs/2604.10825). See *Operant Chamber* on page 2. Figure 1 can introduce the apparatus.
- `operant_lab.py` wraps the installed [CheeseBench](https://github.com/stef41/CheeseBench) chamber. It uses the original top-down text view and FR1 pellet delivery. A choice of `L` or `R` turns the agent toward the lever before pressing it. With the cue light off, the feedback reports only whether the press delivered food.
- Each session is limited to 12 presses. The active side is fixed within a session and switches between the two sessions. All policies use the same active side for a given session. The two comparison policies illustrate behavior in the chamber; the lab does not fit rodent data or reproduce the full benchmark.

Check the offline path before class and run one live session with the course credentials to confirm the endpoint and response format. Ask students to submit both session curves, the CSV, and a short explanation that cites specific presses to show whether the model adjusted its choices.
