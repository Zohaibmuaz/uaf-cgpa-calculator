export interface Subject {
    name: string;
    course_code: string;
    instructor?: string;
    obtained_marks: number;
    total_marks: number;
    credit_hours: number;
    grade: string;
    grade_points: number;
    mid_term?: number;
    assignment?: number;
    final_term?: number;
    practical?: number;
}

export interface Semester {
    semester_number: number;
    session_name: string;
    subjects: Subject[];
    sgpa: number;
}

export interface StudentData {
    name: string;
    ag_number: string;
    degree: string;
    semesters: Semester[];
    cgpa: number;
}

export const calculateSubjectGPA = (obtained: number, total: number): number => {
    if (total <= 0) return 0.0;
    
    // Keep exact floating point precision for the percentage to maintain absolute accuracy
    const percentage = (obtained / total) * 100;

    if (percentage >= 80) return 4.00;
    if (percentage >= 65) return 3.00 + (percentage - 65) / 15;
    if (percentage >= 50) return 2.00 + (percentage - 50) / 15;
    if (percentage >= 40) return 1.00 + (percentage - 40) / 10;
    return 0.00;
};

export const calculateQualityPoints = (gpa: number, creditHours: number): number => {
    // Quality Points are calculated using exact GPA and then rounded to 2 decimal places
    return Math.round(gpa * creditHours * 100) / 100;
};

export const processStudentData = (data: StudentData): StudentData => {
    const bestAttempts = new Map<string, { qp: number, ch: number }>();

    const updatedSemesters = data.semesters.map(semester => {
        let semQualityPoints = 0;
        let semCreditHours = 0;

        const updatedSubjects = semester.subjects.map(subject => {
            const cleanGrade = subject.grade.trim().toUpperCase();
            
            // UAF Rule: Pass/Fail or improvement-excluded subjects do not contribute to CGPA denominator
            if (['P', 'W', 'I', 'S', 'U', 'PASS', 'FAIL', 'SATISFACTORY', 'UNSATISFACTORY'].includes(cleanGrade)) {
                // Wipe out any previous failed attempt's credit hours
                bestAttempts.set(subject.course_code, { qp: 0, ch: 0 });
                return { ...subject, grade_points: 0, grade: subject.grade };
            }

            const gradePoints = calculateSubjectGPA(subject.obtained_marks, subject.total_marks);
            const qp = calculateQualityPoints(gradePoints, subject.credit_hours);
            
            semQualityPoints += qp;
            semCreditHours += subject.credit_hours;

            let grade = "F";
            if (gradePoints >= 4.0) grade = "A";
            else if (gradePoints >= 3.0) grade = "B";
            else if (gradePoints >= 2.0) grade = "C";
            else if (gradePoints >= 1.0) grade = "D";

            // Track for CGPA: only keep the attempt with highest quality points
            const existing = bestAttempts.get(subject.course_code);
            if (!existing || qp > existing.qp) {
                bestAttempts.set(subject.course_code, { qp, ch: subject.credit_hours });
            }

            return { ...subject, grade_points: gradePoints, grade };
        });

        const sgpa = semCreditHours > 0 ? Math.round((semQualityPoints / semCreditHours) * 100) / 100 : 0;
        
        return { ...semester, subjects: updatedSubjects, sgpa };
    });

    let totalQualityPoints = 0;
    let totalCreditHours = 0;
    
    bestAttempts.forEach(attempt => {
        totalQualityPoints += attempt.qp;
        totalCreditHours += attempt.ch;
    });

    const cgpa = totalCreditHours > 0 ? Math.round((totalQualityPoints / totalCreditHours) * 100) / 100 : 0;

    return { ...data, semesters: updatedSemesters, cgpa };
};
