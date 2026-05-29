import aiohttp
from bs4 import BeautifulSoup
from schemas import StudentData, Semester, Subject
import re
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UAFScraper:
    BASE_URL = "https://lms.uaf.edu.pk"
    RESULT_URL = f"{BASE_URL}/course/uaf_student_result.php"

    def __init__(self, use_mock=False):
        self.use_mock = use_mock

    async def fetch_student_data(self, ag_number: str) -> StudentData:
        if self.use_mock:
            return self.get_mock_data(ag_number)

        # Realistic headers to mimic a browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
        }

        # Disabling SSL verification for LMS connection if local environment has cert issues
        connector = aiohttp.TCPConnector(ssl=False)
        
        # We need a session to hold cookies between the GET (login page) and POST (result page)
        async with aiohttp.ClientSession(headers=headers, connector=connector) as session:
            try:
                # Step 1: Visit login page to get the dynamic token
                login_url = f"{self.BASE_URL}/login/index.php"
                async with session.get(login_url, timeout=15) as login_resp:
                    if login_resp.status != 200:
                        logger.error("Failed to load login page to extract token.")
                        if self.use_mock: return self.get_mock_data(ag_number)
                        raise ValueError("LMS is unreachable")
                    
                    login_html = await login_resp.text()
                    
                    # Extract the token. In the provided HTML, it's set via a script at the bottom:
                    # document.getElementById('token').value='5ae7...';
                    token_match = re.search(r"getElementById\('token'\)\.value\s*=\s*'([^']+)'", login_html)
                    
                    if not token_match:
                        # Fallback: maybe it's in the input value attribute directly
                        soup = BeautifulSoup(login_html, 'html.parser')
                        token_input = soup.find('input', {'id': 'token'})
                        token = token_input['value'] if token_input and token_input.get('value') else ""
                    else:
                        token = token_match.group(1)

                # Step 2: Send POST request to the result page with the token and Register number
                post_data = {
                    'token': token,
                    'Register': ag_number
                }
                
                # Add referer for the POST request
                session.headers.update({'Referer': login_url})

                async with session.post(self.RESULT_URL, data=post_data, timeout=15) as response:
                    if response.status != 200:
                        logger.error(f"LMS returned status {response.status} for {ag_number}")
                        if self.use_mock: return self.get_mock_data(ag_number)
                        raise ValueError(f"LMS error: {response.status}")
                    
                    html = await response.text()
                    if "You are not authorize" in html:
                        logger.warning(f"Unauthorized access for {ag_number}.")
                        if self.use_mock: return self.get_mock_data(ag_number)
                        raise ValueError("Student record not found or unauthorized")
                        
                    return self.parse_html(html, ag_number)
            except Exception as e:
                logger.error(f"Error fetching data for {ag_number}: {e}")
                raise e


    def parse_html(self, html: str, ag_number: str) -> StudentData:
        soup = BeautifulSoup(html, 'html.parser')
        tables = soup.find_all('table')
        
        # Search for the correct result table containing course data
        res_table = None
        student_info_table = tables[0] if len(tables) > 0 else None
        
        # Extract student name from the first table (Student Info Table)
        name = "Unknown"
        if student_info_table:
            info_rows = student_info_table.find_all('tr')
            for row in info_rows:
                cols = [td.get_text().strip() for td in row.find_all(['td', 'th'])]
                if len(cols) >= 2 and any(k in cols[0].lower() for k in ['name', 'student']):
                    name = cols[1]
                    break

        for table in tables:
            headers = [th.get_text().strip().lower() for th in table.find_all(['th', 'td'])]
            if any('code' in h for h in headers) and any('total' in h for h in headers):
                res_table = table
                break
        
        if not res_table:
            logger.warning(f"Could not find result table for {ag_number}.")
            if self.use_mock: return self.get_mock_data(ag_number)
            raise ValueError("LMS is unreachable")

        all_rows = res_table.find_all('tr')
        header_cols = [th.get_text().strip().lower() for th in all_rows[0].find_all(['td', 'th'])]
        
        # Broad keyword matching for UAF LMS headers
        def find_idx(keywords):
            for i, h in enumerate(header_cols):
                if any(k in h for k in keywords): return i
            return -1

        idx_map = {
            'sem': find_idx(['semester', 'session']),
            'code': find_idx(['code']),
            'title': find_idx(['title', 'subject', 'name']),
            'credit': find_idx(['cr', 'hrs', 'hour']),
            'mid': find_idx(['mid']),
            'sess': find_idx(['session', 'assign', 'sessional', 'marks']),
            'final': find_idx(['final']),
            'prac': find_idx(['prac']),
            'total': find_idx(['total', 'obtained']),
            'grade': find_idx(['grade'])
        }

        # Safe parsing with fallback to common indices if headers are missing
        mid_idx = idx_map['mid'] if idx_map['mid'] != -1 else 6
        sess_idx = idx_map['sess'] if idx_map['sess'] != -1 else 7
        final_idx = idx_map['final'] if idx_map['final'] != -1 else 8
        prac_idx = idx_map['prac'] if idx_map['prac'] != -1 else 9
        total_idx = idx_map['total'] if idx_map['total'] != -1 else 10
        grade_idx = idx_map['grade'] if idx_map['grade'] != -1 else 11

        semester_map = {} 
        for row in all_rows[1:]:
            cols = [td.get_text().strip() for td in row.find_all('td')]
            if len(cols) > 5:
                sem_name = cols[idx_map['sem']] if idx_map['sem'] != -1 else "Unknown"
                course_code = cols[idx_map['code']] if idx_map['code'] != -1 else ""
                subject_name = cols[idx_map['title']] if idx_map['title'] != -1 else f"Course {course_code}"
                
                raw_credits = cols[idx_map['credit']] if idx_map['credit'] != -1 else "0"
                credit_match = re.search(r'^(\d+)', raw_credits)
                credit_hours = int(credit_match.group(1)) if credit_match else 0
                
                def safe_float(val):
                    try:
                        # Improved regex to capture fractional marks like .5 or 6.5
                        match = re.search(r'(\d*\.?\d+)', val)
                        return float(match.group(1)) if match else 0.0
                    except: return 0.0

                subject = Subject(
                    name=subject_name,
                    course_code=course_code,
                    obtained_marks=safe_float(cols[total_idx]),
                    total_marks=float(credit_hours * 20) if credit_hours > 0 else 100.0,
                    credit_hours=credit_hours,
                    grade=cols[grade_idx] if grade_idx != -1 else "F",
                    grade_points=0.0,
                    mid_term=safe_float(cols[mid_idx]),
                    assignment=safe_float(cols[sess_idx]),
                    final_term=safe_float(cols[final_idx]),
                    practical=safe_float(cols[prac_idx])
                )
                if sem_name not in semester_map: semester_map[sem_name] = []
                semester_map[sem_name].append(subject)

        # Chronological Sorting Logic
        def get_sem_order(name):
            match = re.search(r'(\d{4})', name)
            year = int(match.group(1)) if match else 0
            if "Winter" in name: season = 0
            elif "Spring" in name: season = 1
            elif "Summer" in name: season = 2
            else: season = 3
            return (year, season)

        sorted_sessions = sorted(semester_map.keys(), key=get_sem_order)
        semesters = [Semester(semester_number=i+1, session_name=s, subjects=semester_map[s], sgpa=0.0) for i, s in enumerate(sorted_sessions)]

        if not semesters: 
            if self.use_mock: return self.get_mock_data(ag_number)
            raise ValueError("No semester data found for this student")
            
        return StudentData(name=name, ag_number=ag_number, degree="UAF", semesters=semesters, cgpa=0.0)

    def get_mock_data(self, ag_number: str) -> StudentData:
        # Returns realistic mock data for development when LMS is unreachable
        return StudentData(
            name=f"Student {ag_number.split('-')[-1]}",
            ag_number=ag_number,
            degree="BS Computer Science",
            semesters=[
                Semester(
                    semester_number=1,
                    session_name="Winter Semester 2023-2024",
                    subjects=[
                        Subject(
                            name="Introduction to ICT", 
                            course_code="CS-305",
                            obtained_marks=82, 
                            total_marks=100, 
                            credit_hours=3, 
                            grade="A", 
                            grade_points=4.0,
                            mid_term=18,
                            assignment=10,
                            final_term=44,
                            practical=10
                        ),
                        Subject(
                            name="Programming Fundamentals", 
                            course_code="CS-306",
                            obtained_marks=75, 
                            total_marks=100, 
                            credit_hours=4, 
                            grade="B", 
                            grade_points=3.6,
                            mid_term=15,
                            assignment=8,
                            final_term=32,
                            practical=20
                        ),
                    ],
                    sgpa=3.8
                )
            ],
            cgpa=3.8
        )
