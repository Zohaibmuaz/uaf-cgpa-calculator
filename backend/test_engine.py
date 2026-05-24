from engine import UAFEngine

def test_engine():
    # Test cases based on UAF Blueprint
    test_cases = [
        {"obtained": 85, "total": 100, "expected_gpa": 4.00}, # Grade A
        {"obtained": 72.5, "total": 100, "expected_gpa": 3.50}, # Grade B: 3.0 + (72.5-65)/15 = 3.0 + 7.5/15 = 3.5
        {"obtained": 57.5, "total": 100, "expected_gpa": 2.50}, # Grade C: 2.0 + (57.5-50)/15 = 2.0 + 7.5/15 = 2.5
        {"obtained": 45, "total": 100, "expected_gpa": 1.50}, # Grade D: 1.0 + (45-40)/10 = 1.0 + 5/10 = 1.5
        {"obtained": 35, "total": 100, "expected_gpa": 0.00}, # Grade F
    ]

    print("--- Running UAF Engine Accuracy Tests ---")
    all_passed = True
    for i, tc in enumerate(test_cases):
        actual = UAFEngine.calculate_subject_gpa(tc["obtained"], tc["total"])
        status = "PASSED" if actual == tc["expected_gpa"] else "FAILED"
        print(f"Test {i+1}: Obtained {tc['obtained']}/{tc['total']} | Expected: {tc['expected_gpa']} | Actual: {actual} | Status: {status}")
        if status == "FAILED":
            all_passed = False

    if all_passed:
        print("\n✅ All accuracy tests passed with 0% fault!")
    else:
        print("\n❌ Some tests failed. Check the logic.")
        exit(1)

if __name__ == "__main__":
    test_engine()
