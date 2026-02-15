#!/bin/bash

echo "🎓 CodeLens Complete Test Data Setup"
echo "===================================="

# Determine script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

# Navigate to backend root to run scripts correctly if needed, or run from here
# Since the python scripts add '..' to path, we can run them from anywhere, 
# but let's cd to scripts dir to be safe.
cd "$SCRIPT_DIR"

# Install dependencies
echo "📦 Installing dependencies..."
pip install faker > /dev/null 2>&1

# Generate data
echo "📊 Generating test data..."
python generate_all_data.py

# Import to database
echo "💾 Importing to database..."
python seed_data.py

# Generate snapshots (optional)
read -p "Generate performance snapshots? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    python generate_snapshots.py
fi

echo "✨ Setup complete!"
