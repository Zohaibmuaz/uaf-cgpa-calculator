from pydantic import BaseModel
from typing import List, Optional

class Subject(BaseModel):
    name: str
    course_code: str
    instructor: Optional[str] = None
    obtained_marks: float
    total_marks: float
    credit_hours: int
    grade: str
    grade_points: float
    mid_term: float = 0
    assignment: float = 0
    final_term: float = 0
    practical: float = 0

class Semester(BaseModel):
    semester_number: int
    session_name: str
    subjects: List[Subject]
    sgpa: float

class StudentData(BaseModel):
    name: str
    ag_number: str
    degree: str
    semesters: List[Semester]
    cgpa: float
