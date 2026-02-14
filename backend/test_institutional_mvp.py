
import requests
import json
import time

BASE_URL = "http://127.0.0.1:5000"

def print_result(step_name, data):
    print(f"\n🔹 {step_name}")
    print(json.dumps(data, indent=2))

def bootstrap_admin():
    print("\n🛠️ Bootstrapping Admin...")
    r = requests.post(f"{BASE_URL}/setup/bootstrap-admin", json={
        "email": "admin@codelens.com",
        "password": "adminSecret123",
        "full_name": "System Admin"
    })
    print_result("Admin Bootstrap", r.json())

def login(email, password, role_name):
    print(f"\n🔑 Logging in as {role_name}...")
    r = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    data = r.json()
    if data.get("success"):
        print(f"✅ Login Successful: {email}")
        return data["data"]["access_token"], data["data"]["user"]["id"]
    else:
        print(f"❌ Login Failed: {data.get('error')}")
        return None, None

def register_student(email, password, name):
    print(f"\n📝 Registering Student: {name}...")
    r = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": password,
        "full_name": name
    })
    print_result("Register Student", r.json())
    return r.json().get("data", {}).get("user_id")

def create_department(admin_token, name, code):
    print(f"\n🏫 Creating Department: {name} ({code})...")
    headers = {"Authorization": f"Bearer {admin_token}"}
    r = requests.post(f"{BASE_URL}/academics/departments", headers=headers, json={
        "name": name,
        "code": code
    })
    data = r.json()
    
    if data.get("success"):
        return data["data"]["id"]
    elif "already exists" in data.get("error", ""):
        print("Department exists, fetching ID...")
        r_List = requests.get(f"{BASE_URL}/academics/departments", headers=headers)
        for dept in r_List.json()["data"]:
            if dept["code"] == code:
                return dept["id"]
    else:
        print_result("Create Department Error", data)
        return None

def assign_department(admin_token, student_id, dept_id):
    print(f"\n🎓 Assigning Student {student_id} to Department {dept_id}...")
    headers = {"Authorization": f"Bearer {admin_token}"}
    r = requests.put(f"{BASE_URL}/students/{student_id}/assign-department", headers=headers, json={
        "department_id": dept_id
    })
    print_result("Assign Department", r.json())

def link_platform(student_token, platform, username):
    print(f"\n🔗 Linking Platform: {platform} ({username})...")
    headers = {"Authorization": f"Bearer {student_token}"}
    r = requests.post(f"{BASE_URL}/platforms/link", headers=headers, json={
        "platform_name": platform,
        "username": username
    })
    data = r.json()
    if data.get("success"):
        return data["data"]["id"]
    elif "already linked" in data.get("error", ""):
        # Fetch existing to get ID (Optional for test script simplicity, assume success for now or need endpoint)
        # Simplified: checking /platforms/my
        r_my = requests.get(f"{BASE_URL}/platforms/my", headers=headers)
        for p in r_my.json()["data"]:
            if p["platform_name"] == platform:
                return p["id"]
    return None

def add_snapshot(student_token, platform_id, total, rating, date):
    print(f"\n📸 Adding Snapshot: {date} (Solved: {total}, Rating: {rating})...")
    headers = {"Authorization": f"Bearer {student_token}"}
    r = requests.post(f"{BASE_URL}/snapshots", headers=headers, json={
        "platform_account_id": platform_id,
        "total_solved": total,
        "contest_rating": rating,
        "snapshot_date": date
    })
    print_result("Add Snapshot", r.json())

def check_summary(student_token):
    print("\n📊 Checking Student Summary...")
    headers = {"Authorization": f"Bearer {student_token}"}
    r = requests.get(f"{BASE_URL}/analytics/my-summary", headers=headers)
    print_result("Student Summary", r.json())

def check_leaderboard(admin_token, dept_id):
    print(f"\n🏆 Checking Leaderboard for Department {dept_id}...")
    headers = {"Authorization": f"Bearer {admin_token}"}
    r = requests.get(f"{BASE_URL}/analytics/department/{dept_id}/leaderboard", headers=headers)
    print_result("Department Leaderboard", r.json())

if __name__ == "__main__":
    print("🚀 STARTING INSTITUTIONAL MVP TEST")
    
    # 1. Bootstrap Admin
    bootstrap_admin()
    
    # 2. Add delay to ensure DB commits if async (not needed here but good practice)
    time.sleep(1)

    # 3. Admin Login
    admin_token, admin_user_id = login("admin@codelens.com", "adminSecret123", "Admin")
    if not admin_token:
        exit(1)

    # 4. Create Department
    dept_id = create_department(admin_token, "Computer Science & Engineering", "CSE")
    if not dept_id:
        print("Failed to get Department ID")
        exit(1)

    # 5. Register Student
    student_email = "student_mvp@codelens.com"
    student_pass = "student123"
    register_student(student_email, student_pass, "MVP Student")
    
    # 6. Student Login
    student_token, student_user_id = login(student_email, student_pass, "Student")

    # Important: We need the student's STUDENT_ID, not USER_ID, for assignment endpoint
    # However, the assignment endpoint currently takes STUDENT_ID in URL
    # We need to fetch the student object to get the ID. 
    # Or, the register response gives 'user_id', but we need the 'student' table ID.
    # Wait, the assignment endpoint takes student_id (UUID from students table). 
    # Let's see... auth/register returns user_id. 
    # We don't have a direct "get student ID from user ID" valid for Admin strictly without extra calls.
    # Actually, for MVP, let's assume we use the student's summary to get their ID if possible?
    # Or use admin view all students (not implemented yet). 
    # Hack for test: Student calls 'my-summary' -> gets their student_id -> passes to admin logic context (in simulation).
    
    print("\n🔍 Fetching Student ID (Self-Lookup)...")
    r_summary = requests.get(f"{BASE_URL}/analytics/my-summary", headers={"Authorization": f"Bearer {student_token}"})
    student_data = r_summary.json().get("data", {}).get("student_info", {})
    student_uuid = student_data.get("student_id")
    print(f"Student UUID: {student_uuid}")

    # 7. Admin Assign Department
    assign_department(admin_token, student_uuid, dept_id)

    # 8. Student Link Platform
    platform_id = link_platform(student_token, "leetcode", "mvp_coder")
    
    if platform_id:
        # 9. Add Snapshots (History)
        add_snapshot(student_token, platform_id, 100, 1400, "2026-02-10")
        add_snapshot(student_token, platform_id, 120, 1450, "2026-02-12") 
        # Growth should be 20 problems, 50 rating

        # 10. Check Summary (Growth)
        check_summary(student_token)
    
        # 11. Check Leaderboard
        check_leaderboard(admin_token, dept_id)

    print("\n✅ TEST SEQUENCE COMPLETE")
