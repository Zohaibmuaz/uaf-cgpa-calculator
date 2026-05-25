<div align="center">
  <img src="frontend/public/nexuslogo.png" alt="Nexus AI Digital" width="100" />
  <h1>UAF Smart Calculator (Academic Pro)</h1>
  <p><strong>A Next-Generation, 0% Fault Mathematical CGPA Calculator for the University of Agriculture, Faisalabad (UAF).</strong></p>
  <p><i>Developed by Zohaib Muaz | Powered by Nexus AI Digital</i></p>
</div>

---

## 🌟 Overview
The **UAF Smart Calculator** is an enterprise-grade academic utility designed to resolve the mathematical discrepancies found in standard calculators. It strictly adheres to the official fractional grading rules of the University of Agriculture, Faisalabad (UAF). 

Whether you are checking a single transcript or analyzing an entire class section, this tool provides lightning-fast, 100% accurate results with a premium user interface.

## 🔥 Key Features

### 1. 💯 0% Fault Mathematical Engine
*   **Precision Fractional Mathematics**: Implements official UAF formulas for B, C, and D grades to maintain exact floating-point precision.
*   **Intelligent "Best Attempt" Logic**: Automatically tracks course codes across multiple attempts. If a student repeats a course in a regular semester or Summer, the system strictly utilizes the attempt with the highest quality points for CGPA calculation.
*   **Non-GPA Grade Handling**: Correctly filters out non-contributing grades (`P`, `W`, `I`, `S`, `U`) ensuring they do not affect the CGPA denominator.

### 2. ☀️ Integrated Summer Session Support
*   **Chronological Chronology**: Backend sorting logic ensures Summer sessions are accurately placed within the academic timeline (e.g., Summer 2024 appearing before Winter 2024-25).
*   **Visual Distinction**: Summer sessions are uniquely branded as **"SUMMER SESSION"** in the UI and PDFs, ensuring they do not disrupt the sequential numbering of regular semesters.
*   **Trajectory Accuracy**: The SGPA graph specifically labels summer data points to provide a clear view of academic progress.

### 3. 📂 Class Leaderboard & Smart Search
*   **Zero-Configuration Uploads**: Supports raw Excel (`.xlsx`, `.xls`), CSV, or Text files.
*   **Intelligent Regex Extraction**: Auto-scans all spreadsheet cells to extract valid AG numbers, fetching a complete class leaderboard instantly.
*   **Dynamic Ranking & Filters**: View results in "Ranked Order" (by CGPA) or "CSV Order". Use powerful filters to exclude specific subjects from the entire class calculation to see how rankings shift.

### 4. 📄 Professional PDF Export
*   **Native Transcript Generation**: Generates branded, text-searchable PDFs with detailed marks breakdowns (Mid-Term, Assignment, Final, Practical).
*   **Class Reports**: Export the entire leaderboard with global rankings as a professional performance report.

### 5. 🎯 Academic Forecast Planner
*   **Target CGPA Predictor**: Calculate the exact SGPA required in remaining semesters to reach a target CGPA goal.
*   **Credit Hour Customization**: Dynamically adjust remaining credit hours to see real-time impact on future academic requirements.

---

## 💻 Tech Stack
*   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4 (with Dark Mode support), Recharts, SheetJS, jsPDF.
*   **Backend**: Python, FastAPI, aiohttp (Asynchronous Scraping), BeautifulSoup4, Pydantic.
*   **Architecture**: Decoupled Client-Server model with asynchronous background fetching and memory-mapped math caching.

---

## 🚀 Local Development Setup

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+)

### 1. Start the Backend
```bash
cd backend
python -m venv venv
# Activate venv:
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` to view the application.

---

## 🔒 Security & Privacy
This application acts as a pass-through calculator. It does not store, log, or database any student credentials or academic records. All scraping is done dynamically, and section pinning utilizes secure local browser storage (`LocalStorage`).

---
<div align="center">
  <p><b>Confidential Academic Record Utility | Nexus AI Digital</b></p>
</div>
