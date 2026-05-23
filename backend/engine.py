import math

class UAFEngine:
    @staticmethod
    def calculate_subject_gpa(obtained: float, total: float) -> float:
        """
        Calculates the exact fractional GPA for a subject based on UAF's official formula.
        """
        if total <= 0:
            return 0.0
            
        # Keep exact floating point precision for the percentage to maintain absolute accuracy
        percentage = (obtained / total) * 100

        if percentage >= 80:
            return 4.00
        elif percentage >= 65:
            # Grade B (65% - 79%): GPA = 3.00 + ((P - 65) / 15)
            return 3.00 + ((percentage - 65) / 15)
        elif percentage >= 50:
            # Grade C (50% - 64%): GPA = 2.00 + ((P - 50) / 15)
            return 2.00 + ((percentage - 50) / 15)
        elif percentage >= 40:
            # Grade D (40% - 49%): GPA = 1.00 + ((P - 40) / 10)
            return 1.00 + ((percentage - 40) / 10)
        else:
            return 0.00

    @staticmethod
    def calculate_quality_points(gpa: float, credit_hours: int) -> float:
        # Quality Points are calculated using exact GPA and then rounded to 2 decimal places
        return round(gpa * credit_hours, 2)

    @classmethod
    def process_student_data(cls, student_data):
        """
        Processes a StudentData object, calculating all GPAs and Quality Points.
        Note: Operates on a dictionary or Pydantic model.
        """
        best_attempts = {}
        
        for semester in student_data.semesters:
            sem_quality_points = 0.0
            sem_credit_hours = 0
            
            for subject in semester.subjects:
                # Clean grade to avoid whitespace issues from LMS
                clean_grade = subject.grade.strip().upper()
                
                # UAF Rule: Pass/Fail or improvement-excluded subjects do not contribute to CGPA denominator
                if clean_grade in ["P", "W", "I", "S", "U", "PASS", "FAIL", "SATISFACTORY", "UNSATISFACTORY"]:
                    subject.grade_points = 0.0
                    subject.grade = clean_grade  # Preserve the original grade text
                    # Override any previous 'F' attempt in best_attempts to nullify its credit hours
                    best_attempts[subject.course_code] = {'qp': 0.0, 'ch': 0}
                    continue

                # Calculate GPA for the subject using exact precision
                subject.grade_points = cls.calculate_subject_gpa(subject.obtained_marks, subject.total_marks)
                
                qp = cls.calculate_quality_points(subject.grade_points, subject.credit_hours)
                sem_quality_points += qp
                sem_credit_hours += subject.credit_hours
                
                # Update grade label based on GPA points
                if subject.grade_points >= 4.0: subject.grade = "A"
                elif subject.grade_points >= 3.0: subject.grade = "B"
                elif subject.grade_points >= 2.0: subject.grade = "C"
                elif subject.grade_points >= 1.0: subject.grade = "D"
                else: subject.grade = "F"

                # Track best attempt for CGPA: only keep the attempt with highest quality points
                existing = best_attempts.get(subject.course_code)
                if not existing or qp > existing['qp']:
                    best_attempts[subject.course_code] = {'qp': qp, 'ch': subject.credit_hours}

            if sem_credit_hours > 0:
                semester.sgpa = round(sem_quality_points / sem_credit_hours, 2)
            else:
                semester.sgpa = 0.0

        # CGPA calculation based ONLY on the best attempt of unique courses
        total_quality_points = sum(att['qp'] for att in best_attempts.values())
        total_credit_hours = sum(att['ch'] for att in best_attempts.values())

        if total_credit_hours > 0:
            student_data.cgpa = round(total_quality_points / total_credit_hours, 2)
        else:
            student_data.cgpa = 0.0
            
        return student_data
