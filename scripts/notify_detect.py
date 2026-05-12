#!/usr/bin/env python3
"""Resource update detection for notify workflow."""

import json
import subprocess
import sys
import os
from pathlib import Path

NOTIFY_LAST = ".notify-last"


def detect_categories():
    """Find all category directories under docs/public/."""
    docs_public = Path("docs/public")
    if not docs_public.exists():
        return []
    return sorted([
        d.name for d in docs_public.iterdir()
        if d.is_dir() and d.name not in ('.git',)
    ])


def get_latest_md_file(category):
    """Find the latest .md file (by name) in a category directory."""
    cat_dir = Path(f"docs/public/{category}")
    if not cat_dir.exists():
        return None, 0
    md_files = sorted(cat_dir.glob("[0-9][0-9][0-9][0-9][0-9][0-9].md"))
    if not md_files:
        return None, 0
    latest = md_files[-1]
    return latest.name, latest.stat().st_size  # name and line count handled separately


def init_baseline():
    """Initialize .notify-last for all categories (first run)."""
    print("Initializing .notify-last for all categories...")
    data = {}
    for cat in detect_categories():
        fname, total_lines = get_latest_md_file(cat)
        if fname:
            data[cat] = {"file": fname, "line": total_lines}
            print(f"  Initialized {cat}: {fname}, line {total_lines}")
        else:
            print(f"  No .md files found for category: {cat}")
    with open(NOTIFY_LAST, "w") as f:
        json.dump(data, f, indent=2)
    print("Initialization complete.")
    print(f"Baseline set to:")
    print(json.dumps(data, indent=2))
    print("No new resources to notify this run.")
    sys.exit(0)


def is_legacy_format():
    """Check if .notify-last is old SHA format (not JSON)."""
    if not os.path.exists(NOTIFY_LAST):
        return False
    with open(NOTIFY_LAST, "r") as f:
        first_char = f.read(1)
    return first_char != "{"


def process_category(cat, baseline_info, all_files):
    """Process a single category and return (has_update, json_payload)."""
    baseline_file = baseline_info.get("file", "")
    baseline_line = baseline_info.get("line", 0)

    if not baseline_file:
        print(f"  No baseline for {cat}, skipping.")
        return False, []

    # Find baseline file position in sorted list
    baseline_path = None
    baseline_idx = -1
    for i, f in enumerate(all_files):
        if f.name == baseline_file:
            baseline_path = f
            baseline_idx = i
            break

    if baseline_path is None:
        print(f"  Baseline file {baseline_file} not found in {cat}, skipping.")
        return False, []

    print(f"  Processing {cat}: baseline={baseline_file} line={baseline_line}, total files={len(all_files)}")

    new_lines = []
    last_file = baseline_file
    last_line_num = baseline_line

    # Read from baseline file, starting at line (baseline_line + 1)
    lines_in_baseline = baseline_path.read_text().splitlines()
    if baseline_line < len(lines_in_baseline):
        new_lines.extend(lines_in_baseline[baseline_line:])
        last_file = baseline_file
        last_line_num = len(lines_in_baseline)
        print(f"  Read {baseline_file} from line {baseline_line + 1}: {len(lines_in_baseline) - baseline_line} lines")

    # Read from next file(s) fully
    for i in range(baseline_idx + 1, len(all_files)):
        nf = all_files[i]
        nf_content = nf.read_text().splitlines()
        new_lines.extend(nf_content)
        last_file = nf.name
        last_line_num = len(nf_content)
        print(f"  Read full file {nf.name}: {len(nf_content)} lines")

    # Filter valid resource lines (starting with "- ")
    filtered = [line.strip() for line in new_lines if line.strip().startswith("- ")]
    filtered = filtered[:50]  # cap at 50 lines

    if filtered:
        print(f"  -> Found {len(filtered)} resource lines")
        return True, {"category": cat, "file": last_file, "lines": filtered}
    else:
        print(f"  -> No new resource lines in {cat}")
        return False, []


def main():
    # Check for legacy format
    if os.path.exists(NOTIFY_LAST) and is_legacy_format():
        print("Legacy SHA format detected. Re-initialize to line-based format.")
        os.remove(NOTIFY_LAST)

    # Initialize if no baseline file
    if not os.path.exists(NOTIFY_LAST):
        init_baseline()

    print("Current baseline:")
    with open(NOTIFY_LAST) as f:
        data = json.load(f)
    print(json.dumps(data, indent=2))
    print("---")

    all_updates = []

    # Process each category
    for cat in sorted(data.keys()):
        cat_dir = Path(f"docs/public/{cat}")
        if not cat_dir.exists():
            continue

        all_md_files = sorted(cat_dir.glob("[0-9][0-9][0-9][0-9][0-9][0-9].md"))
        if not all_md_files:
            continue

        has_update, payload = process_category(cat, data[cat], all_md_files)

        if has_update:
            all_updates.append(payload)

        # Update baseline for this category
        last_f = payload["file"] if has_update else data[cat]["file"]
        # Find the actual line count
        last_path = cat_dir / last_f
        if last_path.exists():
            last_line = len(last_path.read_text().splitlines())
        else:
            last_line = data[cat]["line"]

        data[cat] = {"file": last_f, "line": last_line}

        # Write updated baseline immediately
        with open(NOTIFY_LAST, "w") as f:
            json.dump(data, f, indent=2)
        print(f"  Updated baseline: {last_f} line {last_line}")
        print()

    if not all_updates:
        print("No Resource Update, skipping.")
        sys.exit(0)

    print("Sending notification with payload:")
    print(json.dumps(all_updates, indent=2, ensure_ascii=False))

    # Write JSON for the email script
    with open("/tmp/notify_payload.json", "w") as f:
        json.dump(all_updates, f, indent=2, ensure_ascii=False)

    # Call email script
    result = subprocess.run(
        ["python3", "scripts/notify_email.py"],
        input=json.dumps(all_updates, ensure_ascii=False),
        capture_output=True, text=True
    )
    print("Email script output:", result.stdout)
    if result.returncode != 0:
        print("Email script error:", result.stderr)

    # Commit updated baseline
    subprocess.run(["git", "add", NOTIFY_LAST], check=True)
    subprocess.run(["git", "config", "user.name", "GitHub Actions"], check=True)
    subprocess.run(["git", "config", "user.email", "actions@github.com"], check=True)
    subprocess.run(["git", "commit", "-m", "chore: update notify baseline"], check=True)
    subprocess.run(["git", "push"], check=True)
    print("Done.")


if __name__ == "__main__":
    main()