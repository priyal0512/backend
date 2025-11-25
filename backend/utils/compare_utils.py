from difflib import SequenceMatcher

def compare_text(a, b):
    return SequenceMatcher(None, a, b).ratio()
