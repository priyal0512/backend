import json

def generate_json_report(data, path):
    with open(path, "w") as f:
        json.dump(data, f, indent=4)
