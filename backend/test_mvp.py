import requests

BASE_URL = "http://127.0.0.1:5000"

def register_user():
    print("Registering user...")
    r = requests.post(
        f"{BASE_URL}/auth/register",
        json={
            "email": "mvp_test@example.com",
            "password": "test123",
            "full_name": "MVP Test"
        }
    )
    print(r.json())
    return r

def login_user():
    print("Logging in...")
    r = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "mvp_test@example.com",
            "password": "test123"
        }
    )
    data = r.json()
    print(data)
    return data["data"]["access_token"]

def link_platform(token):
    print("Linking platform...")
    r = requests.post(
        f"{BASE_URL}/platforms/link",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "platform_name": "leetcode",
            "username": "mvp_user",
            "profile_url": "https://leetcode.com/mvp_user"
        }
    )
    data = r.json()
    print(data)
    return data["data"]["id"]

def add_snapshot(token, platform_id, total, rating, date):
    print(f"Adding snapshot {date}...")
    r = requests.post(
        f"{BASE_URL}/snapshots",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "platform_account_id": platform_id,
            "total_solved": total,
            "easy_solved": total // 3,
            "medium_solved": total // 3,
            "hard_solved": total // 3,
            "contest_rating": rating,
            "snapshot_date": date
        }
    )
    print(r.json())

def test_growth(token, platform_id):
    print("Testing growth...")
    r = requests.get(
        f"{BASE_URL}/analytics/my-growth/{platform_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    print(r.json())

def test_leaderboard(token, department_id):
    print("Testing leaderboard...")
    r = requests.get(
        f"{BASE_URL}/analytics/department/{department_id}/leaderboard",
        headers={"Authorization": f"Bearer {token}"}
    )
    print(r.json())


if __name__ == "__main__":
    register_user()
    token = login_user()
    platform_id = link_platform(token)

    add_snapshot(token, platform_id, 100, 1500, "2026-02-01")
    add_snapshot(token, platform_id, 130, 1600, "2026-02-10")

    test_growth(token, platform_id)

    print("\n--- DONE ---")
