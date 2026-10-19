import random

severityMap = {
    "critical": ["critical", "high"],
    "high": ["high", "medium"],
    "medium": ["medium", "low"],
    "low": ["low"]
}

def normalize_severity(level: str) -> str:
    """
    Core AI Safety Rule: 
    The backend AI-generated severity must NEVER exceed the severity selected by the reporting user.
    """
    if not level:
        return "low"
    
    options = severityMap.get(level.lower(), ["low"])
    return random.choice(options).capitalize()
