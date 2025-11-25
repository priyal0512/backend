import datetime

def log(msg: str):
    with open("logs.txt", "a") as f:
        f.write(f"[{datetime.datetime.now()}] {msg}\n")
