#!/usr/bin/env python3
"""
Drishti Codebase Snapshot Generator
Generates a comprehensive snapshot.txt file capturing all critical project code,
configurations, types, components, and documentation while ignoring binaries,
dependencies, and build artifacts.
"""

import os
from datetime import datetime

# Root directory of the project
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(ROOT_DIR, "snapshot.txt")

# Directories to strictly ignore
IGNORED_DIRS = {
    "node_modules",
    ".next",
    ".git",
    "out",
    "build",
    "dist",
    "coverage",
    ".vercel",
    "__pycache__",
    ".pytest_cache",
    ".tempmediaStorage",
    ".system_generated",
}

# Files to strictly ignore
IGNORED_FILES = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "snapshot.py",
    "snapshot.txt",
    ".DS_Store",
    "next-env.d.ts",
}

# Binary and non-code file extensions to ignore
IGNORED_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg",
    ".mp3", ".wav", ".ogg", ".mp4", ".mov",
    ".woff", ".woff2", ".ttf", ".eot", ".otf",
    ".zip", ".tar", ".gz", ".7z",
    ".pdf", ".exe", ".bin",
    ".pyc", ".pyo", ".tsbuildinfo",
}

# Target text/code extensions to include
ALLOWED_EXTENSIONS = {
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".json",
    ".css", ".sql", ".md", ".txt", ".html",
    ".env.example", ".gitignore",
}


def should_include_file(file_path: str, file_name: str) -> bool:
    """Determine if a file should be included in the snapshot."""
    if file_name in IGNORED_FILES:
        return False
    if any(file_name.endswith(ext) for ext in IGNORED_EXTENSIONS):
        return False
    # Include dotfiles like .gitignore, .env.example
    if file_name.startswith(".") and file_name in {".gitignore", ".env.example"}:
        return True
    return any(file_name.endswith(ext) for ext in ALLOWED_EXTENSIONS)


def generate_tree(dir_path: str, prefix: str = "") -> list:
    """Generate visual ASCII directory tree of included files."""
    tree_lines = []
    try:
        entries = sorted(os.listdir(dir_path))
    except PermissionError:
        return tree_lines

    # Filter entries
    filtered = []
    for e in entries:
        full_p = os.path.join(dir_path, e)
        if os.path.isdir(full_p):
            if e not in IGNORED_DIRS and not e.startswith("."):
                filtered.append(e)
        else:
            if should_include_file(full_p, e):
                filtered.append(e)

    for idx, entry in enumerate(filtered):
        full_path = os.path.join(dir_path, entry)
        is_last = idx == len(filtered) - 1
        connector = "└── " if is_last else "├── "
        tree_lines.append(f"{prefix}{connector}{entry}")

        if os.path.isdir(full_path):
            extension_prefix = "    " if is_last else "│   "
            tree_lines.extend(generate_tree(full_path, prefix + extension_prefix))

    return tree_lines


def generate_snapshot():
    """Scan directory and write project snapshot to snapshot.txt."""
    print(f"[*] Scanning project at: {ROOT_DIR}")
    start_time = datetime.now()

    collected_files = []

    # Walk through directory
    for root, dirs, files in os.walk(ROOT_DIR):
        # Remove ignored directories in-place
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS and not d.startswith(".")]

        for file in sorted(files):
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, ROOT_DIR)

            if should_include_file(full_path, file):
                collected_files.append((rel_path, full_path))

    print(f"[*] Found {len(collected_files)} critical code files.")

    # Write snapshot
    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        # Header
        out.write("=" * 80 + "\n")
        out.write("DRISHTI (दृष्टि) - COMPLETE CODEBASE SNAPSHOT\n")
        out.write(f"Generated on: {start_time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        out.write(f"Total files captured: {len(collected_files)}\n")
        out.write("=" * 80 + "\n\n")

        # Project File Tree
        out.write("PROJECT FILE TREE:\n")
        out.write(".\n")
        tree_lines = generate_tree(ROOT_DIR)
        for line in tree_lines:
            out.write(line + "\n")
        out.write("\n" + "=" * 80 + "\n\n")

        # Individual File Contents
        for rel_path, full_path in collected_files:
            out.write("=" * 80 + "\n")
            out.write(f"FILE: {rel_path}\n")
            out.write("=" * 80 + "\n")

            try:
                with open(full_path, "r", encoding="utf-8", errors="replace") as f:
                    content = f.read()
                    out.write(content)
                    if not content.endswith("\n"):
                        out.write("\n")
            except Exception as err:
                out.write(f"[ERROR READING FILE: {err}]\n")

            out.write("\n\n")

    file_size_kb = os.path.getsize(OUTPUT_FILE) / 1024
    print(f"[+] Successfully generated snapshot: {OUTPUT_FILE}")
    print(f"[+] Total size: {file_size_kb:.2f} KB")


if __name__ == "__main__":
    generate_snapshot()
