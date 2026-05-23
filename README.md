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
*   **Precision Fractional Mathematics**: Retains exact floating-point precision for intermediate GPAs before calculating Quality Points, eliminating the common rounding errors found in other systems.
*   **"Best Attempt" Repeats**: Intelligently scans a student's history to identify repeated courses and strictly uses only the highest-scoring attempt for the CGPA denominator.
*   **Pass/Fail Handling**: Automatically ignores non-contributing grades (`P`, `W`, `I`, `S`, `U`) ensuring the CGPA is never artificially diluted.

### 2. 📂 Class Result Analysis (CSV/XLSX Upload)
*   **Zero-Configuration Uploads**: Upload any raw Excel (`.xlsx`, `.xls`), CSV, or Text file representing your section.
*   **Smart Extraction**: The system uses intelligent Regex to auto-scan all spreadsheet cells, extract valid AG numbers, and fetch a complete class leaderboard instantly. No manual typing required.

### 3. 📄 Premium Branded PDF Export
*   **Text-Searchable Native PDFs**: Generates crystal-clear, text-selectable PDF documents for both Individual Transcripts and Class Leaderboards.
*   **Detailed Marks Breakdown**: Unlike standard portals, the PDF explicitly shows Mid-Term, Assignment, Final, and Practical marks.
*   **Official Aesthetic**: Branded with Nexus AI Digital and UAF official assets.

### 4. 🎨 Advanced Transcript Dashboard
*   **Dark/Light Mode**: A sleek, responsive UI built with Tailwind CSS.
*   **SGPA Trajectory Graph**: Visualizes academic performance across semesters using Recharts.
*   **Dynamic Pruning**: Remove students from the batch leaderboard to instantly recalculate class rankings and the Top 3 Podium.

---

## 💻 Tech Stack
*   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, SheetJS, jsPDF.
*   **Backend**: Python, FastAPI, aiohttp (Async Scraping), BeautifulSoup4, Pydantic.
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
