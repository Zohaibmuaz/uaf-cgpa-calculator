import unittest
from engine import UAFEngine
from schemas import StudentData, Semester, Subject

class TestUAFCalculator(unittest.TestCase):
    
    def setUp(self):
        self.engine = UAFEngine()

    def test_gpa_formula_precision(self):
        """Phase 3: Verify the official fractional GPA formula matches UAF standards."""
        # 80% = 4.00
        self.assertEqual(self.engine.calculate_subject_gpa(80, 100), 4.00)
        # 65% = 3.00
        self.assertEqual(self.engine.calculate_subject_gpa(65, 100), 3.00)
        # 50% = 2.00
        self.assertEqual(self.engine.calculate_subject_gpa(50, 100), 2.00)
        # 57.5% = 2.50 (linear interpolation)
        self.assertEqual(round(self.engine.calculate_subject_gpa(57.5, 100), 2), 2.50)

    def test_quality_points_exact_multiplication(self):
        """Phase 3: Ensure Quality Points don't lose precision during intermediate rounding."""
        # 1.5 GPA * 3 Credit Hours = 4.5 Quality Points
        self.assertEqual(self.engine.calculate_quality_points(1.5, 3), 4.50)
        # Fractional GPA Check: 2.2222... * 3 should round correctly to 6.67
        gpa = 20 / 9 # approx 2.22222222222
        self.assertEqual(self.engine.calculate_quality_points(gpa, 3), 6.67)

    def test_repeated_course_best_attempt(self):
        """Phase 6 Logic: Only the best attempt of a repeated course should count in CGPA."""
        # Scenario: Student fails CS-408 in Sem 1 (0 QP, 3 CH) 
        # then gets B in Sem 2 (9.0 QP, 3 CH)
        student = StudentData(
            name="Zain", ag_number="2023-ag-10160", degree="CS",
            semesters=[
                Semester(semester_number=1, session_name="S1", subjects=[
                    Subject(name="Math", course_code="MATH-101", obtained_marks=80, total_marks=100, credit_hours=3, grade="A", grade_points=4.0),
                    Subject(name="DLD", course_code="CS-308", obtained_marks=0, total_marks=100, credit_hours=3, grade="F", grade_points=0.0)
                ], sgpa=0.0),
                Semester(semester_number=2, session_name="S2", subjects=[
                    Subject(name="DLD Repeat", course_code="CS-308", obtained_marks=65, total_marks=100, credit_hours=3, grade="B", grade_points=3.0)
                ], sgpa=0.0)
            ], cgpa=0.0
        )
        
        processed = self.engine.process_student_data(student)
        
        # Total Credit Hours should be 3 (Math) + 3 (DLD Best) = 6. 
        # Denominator should NOT be 9.
        # Total Quality Points = (4.0 * 3) + (3.0 * 3) = 12 + 9 = 21
        # CGPA = 21 / 6 = 3.50
        self.assertEqual(processed.cgpa, 3.50)

    def test_pass_grade_exclusion(self):
        """Phase 6 Logic: Non-GPA grades (P, W, I) must be excluded from denominator."""
        student = StudentData(
            name="Test", ag_number="2023-ag-1111", degree="BS",
            semesters=[
                Semester(semester_number=1, session_name="S1", subjects=[
                    Subject(name="Major", course_code="CS-101", obtained_marks=80, total_marks=100, credit_hours=3, grade="A", grade_points=4.0),
                    Subject(name="Pass Course", course_code="IS-401", obtained_marks=50, total_marks=100, credit_hours=1, grade="P", grade_points=0.0)
                ], sgpa=0.0)
            ], cgpa=0.0
        )
        
        processed = self.engine.process_student_data(student)
        
        # CGPA should be (4.0*3)/3 = 4.0. 
        # If 'P' was counted, it would be (12)/4 = 3.0.
        self.assertEqual(processed.cgpa, 4.00)

    def test_grade_sanitization(self):
        """Phase 6: Ensure trailing spaces or lowercase in LMS grades don't break logic."""
        student = StudentData(
            name="Test", ag_number="2023-ag-2222", degree="BS",
            semesters=[
                Semester(semester_number=1, session_name="S1", subjects=[
                    # Grade has trailing space and is lowercase
                    Subject(name="Course", course_code="CS-500", obtained_marks=0, total_marks=100, credit_hours=3, grade="p ", grade_points=0.0)
                ], sgpa=0.0)
            ], cgpa=0.0
        )
        
        processed = self.engine.process_student_data(student)
        
        # Should be ignored. Credit hours should be 0.
        self.assertEqual(processed.cgpa, 0.00)

if __name__ == "__main__":
    unittest.main()
