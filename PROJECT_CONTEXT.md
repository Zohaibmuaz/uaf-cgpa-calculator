# Project Context: UAF Smart Calculator (Academic Pro)

## 1. Project Overview
*   **Name**: UAF Smart Calculator (Powered by Nexus AI Digital)
*   **Domain**: `uafcgpacalculator.online`
*   **Primary Goal**: A 0% fault, mathematical CGPA/SGPA calculator for the University of Agriculture, Faisalabad (UAF).
*   **Key Distinction**: Handles UAF's unique fractional grading formula (for B, C, D grades) and strictly applies "Best Attempt" logic for repeated courses. It does not store user credentials.

## 2. Technology Stack
**Frontend (Client-Side)**
*   **Core**: React 19 + TypeScript + Vite
*   **UI/UX**: Tailwind CSS v4 (Glassmorphism, Adaptive Dark/Light Mode)
*   **Data Visualization**: Recharts (for SGPA trajectory line graphs)
*   **PDF Engine**: jsPDF + jspdf-autotable (for native, branded transcript generation)
*   **File Parsing**: SheetJS (xlsx) for parsing uploaded Class CSV/Excel files.

**Backend (Server-Side)**
*   **Core**: Python 3.9+ + FastAPI + Uvicorn
*   **Scraping Engine**: Asynchronous fetching using `aiohttp` and `asyncio`.
*   **Parsing**: `BeautifulSoup4` for extracting UAF LMS HTML tables.
*   **Hosting Architecture**: Backend deployed on `Render.com` (`https://uaf-cgpa-calculator.onrender.com`). Frontend deployed on `Vercel`. Kept awake using a 14-minute interval ping via `UptimeRobot`.

## 3. Core Features
1.  **Single Transcript Search**: Instant academic history retrieval via AG Number.
2.  **Class Leaderboard (Batch Mode)**: Upload a CSV/Excel file of AG numbers. The system auto-extracts them and generates a ranked podium and full class leaderboard.
3.  **Academic Forecast Planner**: AI-driven tool allowing students to set a target CGPA to calculate the required future SGPA.
4.  **GPA Optimization Filters**: Dynamic exclusion of specific subjects (e.g., "Pass Only" courses) to see real-time shifts in CGPA and class rank.

## 4. Key Engineering & UX Implementations

### A. The "Summer Session" Chronology Fix
*   **Issue Solved**: Backend previously sorted semesters naively, causing Summer sessions to shift the numerical order of regular semesters (e.g., Spring -> Summer -> Semester 4 instead of 3).
*   **Implementation**: Applied floating-point chronological mapping in `scraper.py` (Winter = .8, Spring = .2, Summer = .5). The frontend isolates these, applying a "SUMMER SESSION" badge while preserving the sequential count of regular semesters.

### B. Adaptive Dark Mode & Aesthetics
*   **UAF Logo Blending**: Used CSS `invert-[1] hue-rotate-[180deg]` to seamlessly blend a white-backed logo into the Dark Mode UI while preserving original brand colors (Green/Gold).
*   **Contextual Placeholders**: Dimmed input placeholders (`text-gray-600`) in dark mode to prevent users from thinking the fields were pre-filled.
*   **Adaptive Theme**: Frontend defaults to Dark Mode on mobile (`window.innerWidth < 768`) and Light Mode on Desktop.

### C. Premium Mobile-First Optimization (Zero Layout Breakage)
*   *Constraint: Desktop layouts (`md:`) were kept 100% strictly preserved.*
*   **Navigation**: Removed text-based navbar on mobile. Implemented a clickable Logo (routes to Home) and a subtle **3-dot options menu** that triggers a glassmorphism dropdown for secondary pages (Guide/Contact).
*   **Collapsible Cards**: Converted `SemesterCard` into a collapsible accordion, saving vertical space on mobile screens.
*   **Zero-Truncation Podium**: Removed `truncate` on the Top 3 leaderboard podium. Scaled fonts (`text-[7px]`) and applied `break-words` to fit long names perfectly. Added missing AG numbers for Ranks 2 and 3.
*   **Zero-Scroll Tables**: Condensed paddings (`px-3`) and font sizes (`text-[10px]`) in the Leaderboard and Semester Cards so that all columns (Name, Courses, CGPA, Grade, etc.) fit on a single smartphone screen without horizontal scrolling.
*   **Interactive Feedback**: Transformed the bulky "ANALYZE" button into a clean search icon that changes into a **spinning SVG animation** during data fetch.

### D. System Documentation
*   Integrated a `GuidePage` component.
*   Documented all features using custom SVGs and step-by-step instructions.

### E. SEO & Deployment Readiness
*   **Meta Injection**: Replaced default Vite tags in `index.html` with professional SEO tags (Title: *UAF CGPA Calculator - 100% Accurate*).
*   **Open Graph**: Configured `og:title`, `og:description`, and `og:image` for rich link previews on WhatsApp and Facebook.
*   **API Configuration**: Centralized the backend connection using an `API_BASE_URL` constant, successfully bridging the Vercel frontend with the live Render backend.
