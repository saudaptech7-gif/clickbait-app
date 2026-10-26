
import csv
import os
import re
from pathlib import Path

from huggingface_hub import HfApi

# Existing dataset details
REPO_ID = "xtcrypto/adimagenet-hosted-images"

BASE_DIR = Path(__file__).resolve().parent
INPUT_CSV = BASE_DIR / "output" / "image_urls.csv"
OUTPUT_CSV = BASE_DIR / "output" / "metadata.csv"


def clean_text(value):
    """Clean OCR text without removing the original advertising content."""
    if not value:
        return ""

    lines = [
        line.strip()
        for line in str(value).splitlines()
        if line.strip()
    ]
    return "\n".join(lines)


def make_title(text, image_id):
    """Create a short title from the first meaningful OCR lines."""
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    title_lines = []

    for line in lines:
        # Skip lines containing only a price or number.
        if re.fullmatch(r"[$€£]?\s*\d+(?:[.,]\d+)?", line):
            continue

        title_lines.append(line)

        if len(title_lines) == 2:
            break

    if not title_lines:
        return f"Ad {image_id}"

    return " - ".join(title_lines)[:120]


def main():
    if not INPUT_CSV.exists():
        raise FileNotFoundError(
            f"CSV not found: {INPUT_CSV}"
        )

    rows = []

    with INPUT_CSV.open(
        "r", encoding="utf-8-sig", newline=""
    ) as file:
        reader = csv.DictReader(file)

        required = {
            "image_id",
            "image_url",
            "text",
            "dimensions",
        }

        if not reader.fieldnames or not required.issubset(
            set(reader.fieldnames)
        ):
            raise ValueError(
                "CSV must contain: image_id, image_url, "
                "text, dimensions"
            )

        for row in reader:
            image_id = (row.get("image_id") or "").strip()
            image_url = (row.get("image_url") or "").strip()
            description = clean_text(row.get("text", ""))
            dimensions = (row.get("dimensions") or "").strip()

            if not image_id or not image_url:
                continue

            rows.append({
                # Hugging Face uses this path to associate
                # each metadata row with its hosted image.
                "file_name": f"images/{image_id}.jpg",
                "image_id": image_id,
                "title": make_title(description, image_id),
                "description": description,
                "image_url": image_url,
                "dimensions": dimensions,
            })

    OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)

    with OUTPUT_CSV.open(
        "w", encoding="utf-8-sig", newline=""
    ) as file:
        writer = csv.DictWriter(
            file,
            fieldnames=[
                "file_name",
                "image_id",
                "title",
                "description",
                "image_url",
                "dimensions",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f"Metadata CSV created: {OUTPUT_CSV}")
    print(f"Ads prepared: {len(rows)}")

    # Uses your existing Hugging Face login.
    # Do not paste access tokens into this file.
    api = HfApi()
    api.whoami()

    api.upload_file(
        path_or_fileobj=str(OUTPUT_CSV),
        path_in_repo="metadata.csv",
        repo_id=REPO_ID,
        repo_type="dataset",
        commit_message="Add titles and descriptions for hosted ad images",
    )

    print("\nMetadata uploaded successfully!")
    print(
        f"Dataset: https://huggingface.co/datasets/{REPO_ID}"
    )
    print(
        f"Metadata: https://huggingface.co/datasets/"
        f"{REPO_ID}/resolve/main/metadata.csv"
    )


if __name__ == "__main__":
    main()
