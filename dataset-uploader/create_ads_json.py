
import csv
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
INPUT_CSV = BASE_DIR / "output" / "metadata.csv"
OUTPUT_JSON = BASE_DIR / "output" / "ads.json"


def main():
    if not INPUT_CSV.exists():
        raise FileNotFoundError(
            f"Metadata CSV not found: {INPUT_CSV}"
        )

    ads = []

    with INPUT_CSV.open(
        "r", encoding="utf-8-sig", newline=""
    ) as file:
        reader = csv.DictReader(file)

        for row in reader:
            image_url = (row.get("image_url") or "").strip()

            if not image_url:
                continue

            ads.append({
                "title": (row.get("title") or "").strip(),
                "description": (
                    row.get("description") or ""
                ).strip(),
                "imageUrl": image_url,
                "dimensions": (
                    row.get("dimensions") or ""
                ).strip(),
            })

    OUTPUT_JSON.parent.mkdir(
        parents=True, exist_ok=True
    )

    with OUTPUT_JSON.open(
        "w", encoding="utf-8"
    ) as file:
        json.dump(ads, file, ensure_ascii=False, indent=2)

    print("JSON file created successfully!")
    print(f"Total ads: {len(ads)}")
    print(f"File location: {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
