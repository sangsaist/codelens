"""
Shared utilities for seed scripts
"""

import os
import sys

# Define path to parent 'data' directory relative to backend/scripts/seeds/
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data'))

def get_data_file(filename):
    """Get absolute path to a file in the data directory"""
    return os.path.join(DATA_DIR, filename)

def log_info(msg):
    print(f"[INFO] {msg}")

def log_ok(msg):
    print(f"[OK] {msg}")

def log_warn(msg):
    print(f"[WARN] {msg}")

def log_error(msg):
    print(f"[ERROR] {msg}")

def log_key(msg):
    print(f"[KEY] {msg}")

def log_start(msg):
    print(f"[START] {msg}")

def log_done(msg):
    print(f"[DONE] {msg}")
