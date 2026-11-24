"""Classroom wrapper for the CheeseBench Operant Chamber (FR1 only)."""

import csv
import json
import os
import random
from urllib.request import Request, urlopen

from cheesebench.environments.base_env import Action, ViewMode
from cheesebench.environments.operant_chamber import create_operant_chamber

SIDES = ("L", "R")


class Chamber:
    """One session: a fixed hidden lever and a fixed number of presses."""

    def __init__(self, seed: int, presses: int = 12):
        if presses < 1:
            raise ValueError("presses must be positive")

        self.env = create_operant_chamber(
            schedule="FR1", num_levers=2, view_mode=ViewMode.ASCII_2D # Change the schedule from "FR1" = "Fixed Ratio 1" to others, to make the task more difficult.
        )

        # Upstream automatically starts a new trial on success or timeout.
        # Put both limits beyond this classroom session so the side never resets.
        self.env.config.extra_params["criterion_rewards"] = presses + 1
        self.env.config.max_trial_steps = 2 * presses + 1
        self.observation = self.env.reset()
        self.env.active_lever = random.Random(seed).randrange(2)
        self.press_limit = presses
        self.press_count = 0

    @property
    def active_side(self):
        return SIDES[self.env.active_lever]

    def press(self, side: str) -> int:
        if side not in SIDES:
            raise ValueError("Choose L or R")
        if self.press_count >= self.press_limit:
            raise ValueError("This session has ended; create a new Chamber")
        index = SIDES.index(side)
        if self.env.facing_lever != index:
            turn = Action.ROTATE_LEFT if side == "L" else Action.ROTATE_RIGHT
            self.env.step(turn)
        self.observation, reward = self.env.step(Action.FORWARD)
        self.press_count += 1
        # Preserve delivery of food from upstream but do not show score penalties.
        return int(reward > 0)


def random_policy(seed: int):
    rng = random.Random(seed)

    def choose(observation, history):
        return rng.choice(SIDES)

    return choose


def feedback_policy(first="L"):
    """Illustrative rule: stay after a pellet, switch after an omission."""
    if first not in SIDES:
        raise ValueError("Choose L or R")

    def choose(observation, history):
        if not history:
            return first
        step = history[-1]
        if step["pellet"]:
            return step["choice"]
        return "R" if step["choice"] == "L" else "L"

    return choose


def llm_policy(*, base_url: str, model: str, api_key: str | None = None):
    """Select one lever per request to a Chat Completions compatible endpoint."""
    endpoint = base_url.rstrip("/") + "/chat/completions"
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    def choose(observation, history):
        prior = "\n".join(
            f"Press {row['press']}: {row['choice']}, pellet={row['pellet']}"
            for row in history
        ) or "No presses yet."
        messages = [
            {"role": "system", "content": (
                "You are in a chamber with two levers (L/R) and a food magazine. "
                "Your goal is to collect as many food pellets as possible. "
                "Choose the next lever by replying with exactly L or R."
            )},
            {"role": "user", "content": (
                f"Current chamber:\n{observation}\n"
                f"Previous presses (pellet=1 means food delivered):\n{prior}"
            )},
        ]
        payload = json.dumps({"model": model, "messages": messages}).encode()
        request = Request(endpoint, data=payload, headers=headers, method="POST")
        with urlopen(request, timeout=60) as response:
            result = json.load(response)
        try:
            choice = result["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise ValueError("Endpoint did not return a Chat Completions reply") from exc
        if not isinstance(choice, str) or choice.strip().upper() not in SIDES:
            raise ValueError(f"Press {len(history) + 1}: model must reply with L or R")
        return choice.strip().upper()

    return choose


def run_session(policy, *, label: str, seed: int, presses: int = 12):
    chamber = Chamber(seed, presses)
    history = []
    total = 0
    for press in range(1, presses + 1):
        choice = policy(chamber.observation, tuple(row.copy() for row in history))
        pellet = chamber.press(choice)
        total += pellet
        history.append(dict(press=press, choice=choice, pellet=pellet, total=total))
    # The hidden side is attached to the experimenter's log only after the run.
    return [dict(agent=label, seed=seed, active_side=chamber.active_side, **row) for row in history]


def save_csv(path, rows):
    fields = ("agent", "seed", "active_side", "press", "choice", "pellet", "total")
    with open(path, "w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def configured_llm():
    base_url = os.environ.get("LAB_BASE_URL")
    model = os.environ.get("LAB_MODEL")
    if not base_url or not model:
        raise ValueError("Set LAB_BASE_URL and LAB_MODEL first (see README)")
    return llm_policy(base_url=base_url, model=model, api_key=os.getenv("LAB_API_KEY"))
