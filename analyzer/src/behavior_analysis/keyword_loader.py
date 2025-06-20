# analyzer/behavior_analysis/keyword_loader.py

import yaml
import os

def load_keywords(filepath=None) -> dict:
    if filepath is None:
        filepath = os.path.join(os.path.dirname(__file__), "keywords.yaml")
    with open(filepath, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)