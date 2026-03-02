import csv
import random
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DEI10_CSV = ROOT / "out" / "dei10" / "dei10_item_filtered.csv"
EXP_DIR = ROOT / "exp"


def load_items():
    ids_to_drop = {"80685", "7480", "51266", "3841"}
    items = []
    with DEI10_CSV.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["id"] in ids_to_drop:
                continue
            items.append({"id": row["id"], "text": row["dutch"]})
    if len(items) != 100:
        raise ValueError(f"Expected 100 items after dropping, got {len(items)}")
    return items


def write_list_csv(list_idx, rows):
    """
    Write a single list CSV in the sample_texts.csv-compatible format: id,text
    """
    filename = EXP_DIR / f"dei10_list_{list_idx}.csv"
    with filename.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "text"])
        for row in rows:
            writer.writerow([row["id"], row["text"]])


def main():
    items = load_items()

    # Stable, reproducible shuffling before list assignment
    rng = random.Random(42)
    rng.shuffle(items)

    n_lists = 20
    items_per_list = 5
    total_needed = n_lists * items_per_list
    assert total_needed == len(items), "Number of items must equal n_lists * items_per_list"

    for i in range(n_lists):
        start = i * items_per_list
        end = start + items_per_list
        subset = items[start:end]
        write_list_csv(i + 1, subset)


if __name__ == "__main__":
    main()

