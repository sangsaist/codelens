import requests
import sys

BASE_URL = "http://localhost:5000"

ADMIN_EMAIL = "admin_test@example.com"
ADMIN_PASSWORD = "yourpassword"

STUDENT_EMAIL = "student_test@example.com"
STUDENT_PASSWORD = "yourpassword"


def print_section(title):
    print("\n" + "=" * 50)
    print(title)
    print("=" * 50)


def login(email, password):
    r = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password}
    )
    data = r.json()
    if not data.get("success"):
        print("Login failed:", data)
        sys.exit(1)
    return data["data"]["access_token"]


def test_endpoint(token, endpoint):
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE_URL}{endpoint}", headers=headers)

    print(f"\nEndpoint: {endpoint}")
    print("Status:", r.status_code)

    try:
        print("Response:", r.json())
    except:
        print("Raw Response:", r.text)

    return r


def main():
    print_section("LOGIN AS ADMIN")
    admin_token = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    print("Admin login successful.")

    print_section("TEST INSTITUTION SUMMARY")
    test_endpoint(admin_token, "/analytics/institution-summary")

    print_section("TEST DEPARTMENT PERFORMANCE")
    test_endpoint(admin_token, "/analytics/department-performance")

    print_section("TEST TOP PERFORMERS")
    test_endpoint(admin_token, "/analytics/top-performers?limit=5")

    print_section("TEST AT RISK")
    test_endpoint(admin_token, "/analytics/at-risk")

    print_section("SECURITY TEST — STUDENT ACCESS")
    student_token = login(STUDENT_EMAIL, STUDENT_PASSWORD)
    r = test_endpoint(student_token, "/analytics/institution-summary")

    if r.status_code == 403:
        print("✔ Security test passed (student blocked)")
    else:
        print("✘ Security issue: student accessed admin endpoint")

    print_section("ALL TESTS COMPLETED")


if __name__ == "__main__":
    main()
