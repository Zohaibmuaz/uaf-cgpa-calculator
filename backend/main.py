from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import StudentData
from scraper import UAFScraper
from engine import UAFEngine
from typing import List
import asyncio
import re

app = FastAPI(title="UAF Smart Calculator API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set use_mock=False for live testing
scraper = UAFScraper(use_mock=False)

@app.get("/")
async def root():
    return {"message": "UAF Smart Calculator API is running"}

@app.get("/student/{ag_number}", response_model=StudentData)
async def get_student(ag_number: str):
    try:
        data = await scraper.fetch_student_data(ag_number)
        # Process data through the math engine for 0% fault accuracy
        processed_data = UAFEngine.process_student_data(data)
        return processed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/batch/{start_ag}/{end_ag}", response_model=List[StudentData])
async def get_batch_students(start_ag: str, end_ag: str):
    try:
        match_start = re.search(r'(\d+)$', start_ag)
        match_end = re.search(r'(\d+)$', end_ag)
        
        if not match_start or not match_end:
            raise HTTPException(status_code=400, detail="Invalid AG number format for batch")
        
        prefix = start_ag[:match_start.start()]
        start_num = int(match_start.group(1))
        end_num = int(match_end.group(1))
        
        if end_num < start_num:
            raise HTTPException(status_code=400, detail="End AG must be greater than start AG")

        tasks = []
        for i in range(start_num, end_num + 1):
            # Maintain the same padding as the original AG number
            num_str = f"{i:0{len(match_start.group(1))}d}"
            ag = f"{prefix}{num_str}"
            tasks.append(scraper.fetch_student_data(ag))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        final_results = []
        for r in results:
            if isinstance(r, StudentData):
                # Process each student through the math engine
                final_results.append(UAFEngine.process_student_data(r))
        
        return final_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
