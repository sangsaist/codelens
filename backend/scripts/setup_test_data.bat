@echo off
echo.
echo [INFO] Installing dependencies...
pip install faker

echo.
echo [INFO] Generating test data...
python generate_all_data.py

echo.
echo [INFO] Seeding database...
python run_seeds.py

echo.
echo [DONE] Setup complete!
pause
