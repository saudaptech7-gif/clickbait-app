
import os
import csv
from pathlib import Path
from io import BytesIO

from datasets import load_dataset
from huggingface_hub import HfApi
from PIL import Image

# Hugging Face settings
REPO_ID = "xtcrypto/adimagenet-hosted-images"
SOURCE_DATASET = "PeterBrendan/AdImageNet"
MAX_IMAGES = 100

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "output"
IMAGES_DIR = OUTPUT_DIR / "images"
CSV_PATH = OUTPUT_DIR / "image_urls.csv"

TOKEN = os.environ.get("HF_TOKEN")

if not TOKEN:
    raise RuntimeError(
        "HF_TOKEN nahi mila. Pehle PowerShell mein token set karo."
    )

IMAGES_DIR.mkdir(parents=True, exist_ok=True)

api = HfApi(token=TOKEN)

print("1. Source dataset load ho raha hai...")

dataset = load_dataset(
    SOURCE_DATASET,
    split="train",
    token=TOKEN,
)

print(f"Dataset ready. Total rows: {len(dataset)}")
print("2. Images extract ho rahi hain...")

rows = []

for index, item in enumerate(dataset):
    if len(rows) >= MAX_IMAGES:
        break

    try:
        image_data = item.get("image")

        if image_data is None:
            print(f"Image missing: row {index}")
            continue

        if isinstance(image_data, Image.Image):
            image = image_data
        elif isinstance(image_data, dict):
            if image_data.get("bytes"):
                image = Image.open(
                    BytesIO(image_data["bytes"])
                )
            elif image_data.get("path"):
                image = Image.open(image_data["path"])
            else:
                print(f"Image data missing: row {index}")
                continue
        else:
            print(f"Unsupported image format: row {index}")
            continue

        image = image.convert("RGB")
        filename = f"ad_{len(rows):06d}.jpg"
        image_path = IMAGES_DIR / filename
        image.save(image_path, format="JPEG", quality=90)

        image_url = (
            f"https://huggingface.co/datasets/{REPO_ID}"
            f"/resolve/main/images/{filename}"
        )

        dimensions = image.size
        text_value = item.get("text", "")

        rows.append({
            "image_id": filename.removesuffix(".jpg"),
            "image_url": image_url,
            "text": str(text_value or ""),
            "dimensions": f"{dimensions[0]}x{dimensions[1]}",
        })

        print(f"Saved {len(rows)}/{MAX_IMAGES}: {filename}")

    except Exception as error:
        print(f"Row {index} skip hui: {error}")

if not rows:
    raise RuntimeError(
        "Koi image extract nahi hui. Dataset access aur image column check karo."
    )

print("3. CSV file ban rahi hai...")

with CSV_PATH.open("w", newline="", encoding="utf-8-sig") as file:
    writer = csv.DictWriter(
        file,
        fieldnames=["image_id", "image_url", "text", "dimensions"],
    )
    writer.writeheader()
    writer.writerows(rows)

print("4. Hugging Face repository par upload ho raha hai...")

api.create_repo(
    repo_id=REPO_ID,
    repo_type="dataset",
    private=False,
    exist_ok=True,
)

api.upload_folder(
    folder_path=str(OUTPUT_DIR),
    repo_id=REPO_ID,
    repo_type="dataset",
    commit_message="Upload extracted ad images and image URL CSV",
)

print("\nUpload complete!")
print(f"Images uploaded: {len(rows)}")
print(f"CSV saved locally: {CSV_PATH}")
print(f"Dataset: https://huggingface.co/datasets/{REPO_ID}")
print(f"CSV URL: https://huggingface.co/datasets/{REPO_ID}/resolve/main/image_urls.csv")
