import pandas as pd

def read_master_sheet(path: str):
    df = pd.read_excel(path)
    return df.to_dict(orient="records")
