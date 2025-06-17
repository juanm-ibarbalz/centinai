# analyzer/behavior_analysis/keyword_loader.py

import yaml

def load_keywords(filepath="analyzer/behavior_analysis/keywords.yaml") -> dict:
    with open(filepath, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)