from schemas import StudentData, Semester, Subject

def test_schemas():
    try:
        subject = Subject(
            name="Computer Programming",
            obtained_marks=85,
            total_marks=100,
            credit_hours=4,
            grade="A",
            grade_points=4.0
        )
        semester = Semester(
            semester_number=1,
            subjects=[subject],
            sgpa=3.8
        )
        student = StudentData(
            name="Test Student",
            ag_number="2020-ag-1234",
            degree="BSCS",
            semesters=[semester],
            cgpa=3.8
        )
        print("Schema validation successful!")
    except Exception as e:
        print(f"Schema validation failed: {e}")
        exit(1)

if __name__ == "__main__":
    test_schemas()
