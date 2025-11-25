async def semantic_match(a: str, b: str):
    return 0.8 if a.lower() == b.lower() else 0.5
