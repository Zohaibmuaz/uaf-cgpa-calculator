import { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { StudentData, Semester, Subject } from './utils/engine';
import { processStudentData, calculateForecast } from './utils/engine';

// --- DEPLOYMENT CONFIGURATION ---
// Update this URL to your live Render backend URL before deploying to Vercel
// Example: export const API_BASE_URL = "https://uaf-api.onrender.com";
export const API_BASE_URL = "https://uaf-cgpa-calculator.onrender.com";

const AcademicForecastModal = ({ student, darkMode, onClose }: { student: StudentData, darkMode: boolean, onClose: () => void }) => {
  const [targetCgpa, setTargetCgpa] = useState(student.cgpa + 0.1 > 4.0 ? 4.0 : Math.round((student.cgpa + 0.1) * 10) / 10);
  const [remainingSemesters, setRemainingSemesters] = useState(1);
  const [customCH, setCustomCH] = useState<number | null>(null);
  const [isEditingCH, setIsEditingCH] = useState(false);

  const forecast = useMemo(() => {
    return calculateForecast(student, targetCgpa, remainingSemesters, customCH);
  }, [student, targetCgpa, remainingSemesters, customCH]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/60 animate-in fade-in duration-300 font-sans">
      <div className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.4)] border transition-all duration-500 relative flex flex-col ${
        darkMode ? 'bg-[#0a0a0a] border-white/10 text-white shadow-brand-primary/10' : 'bg-white border-gray-100 text-gray-800'
      }`}>
        <div className="flex justify-between items-start mb-8 shrink-0">
          <div>
            <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 ${darkMode ? 'text-brand-primary' : 'text-indigo-600'}`}>Intelligent Advisor</h4>
            <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Your Goal Planner</h3>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-10 leading-relaxed max-w-md">
          Hello! Let's figure out what you need to achieve your target. Just enter your goal below and tell me how many semesters you have left.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 shrink-0">
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ml-2 ${darkMode ? 'text-brand-primary' : 'text-indigo-600'}`}>What is your target CGPA?</label>
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all ${
              darkMode ? 'bg-white/[0.02] border-white/5 focus-within:border-brand-primary' : 'bg-gray-50 border-gray-100 focus-within:border-indigo-600'
            }`}>
              <input 
                type="number" step="0.01" min="0" max="4"
                value={targetCgpa}
                onChange={(e) => setTargetCgpa(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent font-black text-2xl focus:outline-none"
              />
              <span className="text-xs font-black text-gray-400 dark:text-gray-600">GOAL</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ml-2 ${darkMode ? 'text-brand-primary' : 'text-indigo-600'}`}>How many semesters left?</label>
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all ${
              darkMode ? 'bg-white/[0.02] border-white/5 focus-within:border-brand-primary' : 'bg-gray-50 border-gray-100 focus-within:border-indigo-600'
            }`}>
              <select 
                value={remainingSemesters}
                onChange={(e) => setRemainingSemesters(parseInt(e.target.value))}
                className="w-full bg-transparent font-black text-2xl appearance-none cursor-pointer focus:outline-none"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n} className="bg-white dark:bg-brand-dark">{n} Semesters</option>)}
              </select>
              <svg className="w-5 h-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <div className={`p-10 rounded-[3rem] mb-10 flex flex-col items-center text-center transition-all duration-700 relative overflow-hidden shrink-0 ${
          forecast.isPossible 
            ? (darkMode ? 'bg-brand-primary/10 border border-brand-primary/20 shadow-2xl shadow-brand-primary/5' : 'bg-indigo-50 border border-indigo-100 shadow-xl shadow-indigo-100/50')
            : (darkMode ? 'bg-red-500/10 border border-red-500/20 shadow-2xl shadow-red-500/5' : 'bg-red-50 border border-red-100 shadow-xl shadow-red-100/50')
        }`}>
          {forecast.isPossible && <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-50"></div>}
          
          <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-60">
            {forecast.isPossible ? 'Strategic Advice' : 'Mathematical Constraint'}
          </div>
          
          {forecast.isPossible ? (
            <>
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
                To reach your dream <span className="text-gray-900 dark:text-white">{targetCgpa.toFixed(2)} CGPA</span>, you must maintain:
              </p>
              <div className={`text-7xl font-black italic tracking-tighter mb-4 ${darkMode ? 'text-brand-primary' : 'text-indigo-600'}`}>
                {forecast.requiredSGPA.toFixed(2)}
              </div>
              <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Average SGPA in next {forecast.remainingCH} Credits
              </p>
            </>
          ) : (
            <>
              <p className="text-[11px] font-bold text-red-500/70 uppercase tracking-widest mb-4 leading-relaxed">
                Unfortunately, even with a perfect 4.00 in all remaining subjects, your highest possible CGPA will be:
              </p>
              <div className="text-7xl font-black italic tracking-tighter mb-4 text-red-500">
                {forecast.maxPossibleCGPA.toFixed(2)}
              </div>
              <p className="text-xs font-black text-red-500/40 uppercase tracking-widest">
                Goal mathematically out of reach
              </p>
            </>
          )}
        </div>

        <div className="space-y-6 shrink-0">
          <div className={`flex justify-between items-center text-[10px] font-black uppercase tracking-widest border-b pb-6 ${
            darkMode ? 'text-brand-primary border-white/10' : 'text-indigo-600 border-gray-100'
          }`}>
            <div className="flex items-center gap-3">
              <span className="opacity-80">Calculated Credits: </span>
              {isEditingCH ? (
                <input 
                  autoFocus type="number"
                  className="w-20 bg-white dark:bg-white/5 border-2 border-brand-primary/40 rounded-xl px-3 py-1 text-gray-800 dark:text-white font-black"
                  value={customCH || forecast.remainingCH}
                  onChange={(e) => setCustomCH(parseInt(e.target.value) || 0)}
                  onBlur={() => setIsEditingCH(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingCH(false)}
                />
              ) : (
                <button onClick={() => setIsEditingCH(true)} className="flex items-center gap-2 group hover:scale-105 transition-all">
                  <span className={`font-black text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{forecast.remainingCH} Credits Total</span>
                  <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              )}
            </div>
            <div className="text-right">
              <span className="opacity-80">AVG SPEED:</span> <span className={`font-black text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{forecast.averageCHPerSem} CH/Sem</span>
            </div>
          </div>
          
          <div className={`flex justify-between items-center p-7 rounded-[2.5rem] border-2 transition-all ${
            darkMode ? 'bg-brand-primary/5 border-brand-primary/20' : 'bg-indigo-50 border-indigo-100'
          }`}>
            <div className="flex flex-col">
              <div className={`text-[10px] font-black uppercase tracking-[0.3em] ${darkMode ? 'text-brand-primary' : 'text-indigo-600'}`}>🛡️ Safe Zone (Stay Stable)</div>
              <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>To maintain your current cgpa you need</p>
            </div>
            <div className="flex items-baseline gap-1.5 font-black italic">
              <span className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{forecast.maintenanceSGPA.toFixed(2)}</span>
              <span className={`text-[10px] not-italic uppercase ${darkMode ? 'text-brand-primary' : 'text-indigo-600'}`}>SGPA</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className={`w-full py-6 rounded-[2rem] font-black tracking-[0.4em] text-[10px] transition-all shadow-xl active:scale-95 uppercase ${
              darkMode ? 'bg-brand-primary text-black hover:brightness-110 shadow-brand-primary/20' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            I UNDERSTAND, GO BACK
          </button>
        </div>
      </div>
    </div>
  );
};

const PerformanceGraph = ({ semesters, darkMode }: { semesters: Semester[], darkMode: boolean }) => {
  const data = useMemo(() => {
    let regularCount = 1;
    return [...semesters]
      .sort((a, b) => a.semester_number - b.semester_number)
      .map(s => {
        const isSummer = s.session_name.toLowerCase().includes('summer');
        const label = isSummer ? 'SUMMER' : `S${regularCount}`;
        if (!isSummer) regularCount++;
        return {
          name: label,
          sgpa: parseFloat(s.sgpa.toFixed(2)),
          session: s.session_name
        };
      });
  }, [semesters]);

  if (data.length === 0) return null;

  return (
    <div className={`w-full h-56 md:h-72 mt-8 rounded-[2rem] p-4 md:p-8 border transition-all duration-500 overflow-hidden ${
      darkMode ? 'bg-[#0c0c0c] border-white/[0.04]' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/20'
    }`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-1 ${darkMode ? 'text-brand-primary' : 'text-indigo-600'}`}>Academic Trend</h4>
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-tighter">SGPA Trajectory</h3>
        </div>
      </div>
      <div className="w-full h-[140px] md:h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#ffffff08' : '#00000008'} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 900, fill: darkMode ? '#555' : '#aaa' }}
              dy={10}
            />
            <YAxis 
              domain={[0, 4]} 
              tickCount={9}
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 900, fill: darkMode ? '#555' : '#aaa' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: darkMode ? '#151515' : '#fff', 
                borderRadius: '1.5rem', 
                border: darkMode ? '1px solid #ffffff10' : '1px solid #00000005', 
                boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                fontSize: '12px',
                fontWeight: '900',
                padding: '15px'
              }}
              cursor={{ stroke: darkMode ? '#ffffff10' : '#00000010', strokeWidth: 2 }}
              itemStyle={{ color: darkMode ? '#ff8c00' : '#4f46e5' }}
            />
            <Line 
              type="monotone" 
              dataKey="sgpa" 
              stroke={darkMode ? '#ff8c00' : '#4f46e5'} 
              strokeWidth={5}
              dot={{ r: 6, fill: darkMode ? '#ff8c00' : '#4f46e5', strokeWidth: 3, stroke: darkMode ? '#0c0c0c' : '#fff' }}
              activeDot={{ r: 8, strokeWidth: 0 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const AddSubjectPopup = ({ 
  onClose, 
  onAdd, 
  darkMode 
}: { 
  onClose: () => void, 
  onAdd: (sub: Partial<Subject>) => void, 
  darkMode: boolean 
}) => {
  const [formData, setFormData] = useState({
    course_code: '',
    name: '',
    credit_hours: 3,
    obtained_marks: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      total_marks: formData.credit_hours * 20,
      grade: 'F',
      grade_points: 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-300 font-sans">
      <div className={`w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border transition-all duration-500 ${
        darkMode ? 'bg-[#0f0f0f] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-800'
      }`}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 ${darkMode ? 'text-brand-primary' : 'text-indigo-600'}`}>Transcript Editor</h4>
            <h3 className="text-2xl font-black tracking-tighter uppercase leading-none">Add New Subject</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Course Code</label>
            <input 
              required
              className={`w-full bg-transparent border-b-2 py-2 font-black text-lg focus:outline-none transition-colors ${darkMode ? 'border-white/10 focus:border-brand-primary' : 'border-gray-100 focus:border-indigo-600'}`}
              placeholder="e.g. CS-511"
              value={formData.course_code}
              onChange={e => setFormData({...formData, course_code: e.target.value})}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Course Title</label>
            <input 
              required
              className={`w-full bg-transparent border-b-2 py-2 font-black text-lg focus:outline-none transition-colors ${darkMode ? 'border-white/10 focus:border-brand-primary' : 'border-gray-100 focus:border-indigo-600'}`}
              placeholder="e.g. Software Engineering"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Credit Hours</label>
              <input 
                type="number"
                required
                className={`w-full bg-transparent border-b-2 py-2 font-black text-lg focus:outline-none transition-colors ${darkMode ? 'border-white/10 focus:border-brand-primary' : 'border-gray-100 focus:border-indigo-600'}`}
                value={formData.credit_hours}
                onChange={e => setFormData({...formData, credit_hours: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Obtained Marks</label>
              <input 
                type="number"
                required
                className={`w-full bg-transparent border-b-2 py-2 font-black text-lg focus:outline-none transition-colors ${darkMode ? 'border-white/10 focus:border-brand-primary' : 'border-gray-100 focus:border-indigo-600'}`}
                value={formData.obtained_marks}
                onChange={e => setFormData({...formData, obtained_marks: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <button 
            type="submit"
            className={`w-full mt-8 py-5 rounded-[1.8rem] font-black tracking-[0.2em] text-xs transition-all shadow-xl active:scale-95 ${
              darkMode ? 'bg-brand-primary text-black hover:brightness-110' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            ADD TO TRANSCRIPT
          </button>
        </form>
      </div>
    </div>
  );
};

const SubjectInfoPopup = ({ subject, onClose, darkMode }: { subject: Subject, onClose: () => void, darkMode: boolean }) => {
  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case 'A': return darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700';
      case 'B': return darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700';
      case 'C': return darkMode ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-700';
      case 'D': return darkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-700';
      case 'F': return darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700';
      case 'P': return darkMode ? 'bg-slate-500/10 text-slate-400' : 'bg-slate-50 text-slate-700';
      default: return darkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-200">
      <div className={`w-full max-w-xl max-h-[90vh] rounded-[3rem] shadow-2xl border transition-all duration-500 overflow-hidden flex flex-col ${
        darkMode ? 'bg-[#0a0a0a] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-800'
      }`}>
        <div className="flex justify-between items-center p-10 border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.02] shrink-0">
          <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Course Details</h3>
          <button onClick={onClose} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${darkMode ? 'hover:bg-white/10 bg-white/[0.03]' : 'hover:bg-gray-100 bg-gray-50'}`}>
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
          <div className="flex justify-between items-end">
            <div>
              <h4 className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-[0.3em] mb-2">COURSE CODE</h4>
              <div className="text-2xl font-black tracking-tight">{subject.course_code}</div>
            </div>
            <div className="text-right">
              <h4 className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-[0.3em] mb-2">CREDIT HOURS</h4>
              <div className="text-2xl font-black tracking-tight">
                {subject.credit_hours} <span className="text-gray-400 dark:text-gray-600">({subject.credit_hours}-{subject.credit_hours > 2 ? '1' : '0'})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className={`flex-1 p-6 rounded-[2rem] border ${darkMode ? 'bg-white/[0.02] border-white/5' : 'bg-indigo-50/30 border-indigo-100/50'}`}>
              <h4 className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-[0.3em] mb-4">GRADE PERFORMANCE</h4>
              <div className="flex items-center gap-4">
                <span className={`w-12 h-12 flex items-center justify-center rounded-2xl text-lg font-black shadow-sm ${getGradeStyle(subject.grade)}`}>
                  {subject.grade}
                </span>
                <div>
                  <div className="text-sm font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">Status</div>
                  <div className={`text-sm font-black ${subject.grade === 'F' ? 'text-red-500' : 'text-green-500'}`}>
                    {subject.grade === 'F' ? 'REQUIRES ATTENTION' : 'SUCCESSFULLY PASSED'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-[2.5rem] p-10 border relative overflow-hidden ${darkMode ? 'bg-white/[0.01] border-white/[0.04]' : 'bg-gray-50/50 border-gray-100'}`}>
            <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-8 ${darkMode ? 'text-brand-primary' : 'text-indigo-600'}`}>Detailed Marks Breakdown</h4>
            
            <div className="grid grid-cols-2 gap-y-8 gap-x-16">
              <div className="relative">
                <div className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-1.5 opacity-60">Mid Term</div>
                <div className="text-2xl font-black tracking-tight font-mono">{subject.mid_term ?? 0}</div>
                <div className="absolute -bottom-3 left-0 w-8 h-0.5 bg-brand-primary/20 rounded-full"></div>
              </div>
              <div className="relative">
                <div className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-1.5 opacity-60">Assignment</div>
                <div className="text-2xl font-black tracking-tight font-mono">{subject.assignment ?? 0}</div>
                <div className="absolute -bottom-3 left-0 w-8 h-0.5 bg-blue-500/20 rounded-full"></div>
              </div>
              <div className="relative">
                <div className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-1.5 opacity-60">Final Term</div>
                <div className="text-2xl font-black tracking-tight font-mono">{subject.final_term ?? 0}</div>
                <div className="absolute -bottom-3 left-0 w-8 h-0.5 bg-green-500/20 rounded-full"></div>
              </div>
              <div className="relative">
                <div className="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-1.5 opacity-60">Practical</div>
                <div className="text-2xl font-black tracking-tight font-mono">{subject.practical ?? 0}</div>
                <div className="absolute -bottom-3 left-0 w-8 h-0.5 bg-purple-500/20 rounded-full"></div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-1">CUMULATIVE RESULT</span>
                <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Obtained Marks</span>
              </div>
              <span className={`text-6xl font-black italic tracking-tighter ${darkMode ? 'text-brand-primary' : 'text-indigo-600'}`}>
                {subject.obtained_marks}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExcludeSubjectsPopup = ({ 
  subjects, 
  excluded, 
  onToggle, 
  onClose, 
  darkMode 
}: { 
  subjects: { code: string, name: string, isPass: boolean }[], 
  excluded: string[], 
  onToggle: (code: string) => void, 
  onClose: () => void, 
  darkMode: boolean 
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-300 font-sans">
      <div className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] border transition-all duration-500 relative flex flex-col ${
        darkMode ? 'bg-[#0f0f0f] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-800'
      }`}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 ${darkMode ? 'text-brand-primary' : 'text-indigo-600'}`}>GPA Optimization</h4>
            <h3 className="text-3xl font-black tracking-tighter uppercase leading-none text-gray-800 dark:text-white">Exclude Subjects</h3>
          </div>
          <button onClick={onClose} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${darkMode ? 'hover:bg-white/5 bg-white/[0.02]' : 'hover:bg-gray-50 bg-gray-50/50'}`}>
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${darkMode ? 'text-brand-primary' : 'text-indigo-600'}`}>Select subjects to exclude and re-rank.</p>
        
        <div className="max-h-[650px] overflow-y-auto pr-4 space-y-2 custom-scrollbar">
          {subjects.map((sub) => (
            <div 
              key={sub.code}
              onClick={() => onToggle(sub.code)}
              className={`group flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                excluded.includes(sub.code)
                ? (darkMode ? 'bg-red-500/10 border-red-500/30 text-white' : 'bg-red-50 border-red-100')
                : (darkMode ? 'bg-white/[0.02] border-white/5 hover:border-brand-primary/20 text-gray-200' : 'bg-gray-50/50 border-gray-100 hover:border-indigo-200 text-gray-800')
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  excluded.includes(sub.code) 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : (darkMode ? 'bg-white/10 text-gray-500' : 'bg-gray-200 text-gray-400')
                }`}>
                  {excluded.includes(sub.code) && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                </div>
                <div>
                  <div className={`text-sm font-black uppercase font-mono tracking-tighter ${excluded.includes(sub.code) ? 'text-red-500' : 'text-gray-800 dark:text-gray-200'}`}>
                    {sub.code}
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 opacity-60 uppercase truncate max-w-[250px]">{sub.name}</div>
                  {sub.isPass && (
                    <span className="text-[8px] font-black text-brand-secondary uppercase tracking-widest mt-1 block">Pass Only Course</span>
                  )}
                </div>
              </div>
              <span className={`text-[10px] font-black transition-opacity ${excluded.includes(sub.code) ? 'opacity-100' : 'opacity-0'}`}>EXCLUDED</span>
            </div>
          ))}
        </div>

        <button 
          onClick={onClose}
          className={`w-full mt-10 py-5 rounded-[1.8rem] font-black tracking-[0.2em] text-xs transition-all shadow-xl active:scale-95 ${
            darkMode ? 'bg-brand-primary text-black hover:brightness-110' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
          }`}
        >
          APPLY & RECALCULATE
        </button>
      </div>
    </div>
  );
};

const SemesterCard = ({ 
  semester, 
  darkMode, 
  onShowInfo,
  onDeleteSubject,
  onAddSubject,
  visualLabel
}: { 
  semester: Semester, 
  darkMode: boolean, 
  onShowInfo: (s: Subject) => void,
  onDeleteSubject: (semNum: number, subIdx: number) => void,
  onAddSubject: (semNum: number) => void,
  visualLabel: string
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case 'A': return darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700';
      case 'B': return darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700';
      case 'C': return darkMode ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-700';
      case 'D': return darkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-700';
      case 'F': return darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700';
      case 'P': return darkMode ? 'bg-slate-500/10 text-slate-400' : 'bg-slate-50 text-slate-700';
      default: return darkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/[0.06] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-brand-primary/20 shadow-xl shadow-gray-200/20 dark:shadow-none font-sans">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-6 md:p-8 flex justify-between items-center border-b border-gray-100 dark:border-white/[0.04] bg-gray-50/30 dark:bg-white/[0.01] cursor-pointer group/card"
      >
        <div className="flex items-center gap-3 md:gap-5">
          <div className={`w-10 h-10 md:w-14 md:h-14 bg-brand-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-brand-primary shadow-inner border border-brand-primary/20 transition-all ${!isExpanded ? 'rotate-[-90deg]' : ''}`}>
            <svg className={`w-5 h-5 md:w-8 md:h-8 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-black text-gray-700 dark:text-gray-200 leading-tight uppercase tracking-tighter">{visualLabel}</h3>
            <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] block mt-0.5 ${darkMode ? 'text-brand-primary' : 'text-indigo-600'}`}>
              {semester.session_name}
            </span>
          </div>
        </div>
        <div className="text-right flex items-center gap-2 md:gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onAddSubject(semester.semester_number); }}
            className="group relative w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gray-100 dark:bg-white/[0.03] flex items-center justify-center transition-all hover:bg-brand-primary/20 hover:text-brand-primary text-gray-400"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </button>
          <div className="flex flex-col items-end">
            <span className="text-[8px] md:text-[9px] text-gray-500 font-black block uppercase tracking-widest mb-1 leading-none">GPA</span>
            <span className={`text-2xl md:text-3xl font-black leading-none tracking-tighter italic ${darkMode ? 'text-brand-primary/90' : 'text-indigo-600'}`}>{semester.sgpa.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 md:p-8">
          <div className="overflow-x-auto custom-scrollbar rounded-2xl md:rounded-3xl border border-gray-100 dark:border-white/[0.04] bg-white dark:bg-white/[0.01]">
            <table className="w-full text-left border-collapse min-w-[320px] md:min-w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.02] text-[8px] md:text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest md:tracking-[0.3em]">
                  <th className="px-2 md:px-6 py-4 md:py-5">COURSE</th>
                  <th className="px-1 md:px-6 py-4 md:py-5 text-center">HRS</th>
                  <th className="px-1 md:px-6 py-4 md:py-5 text-center">MARKS</th>
                  <th className="px-1 md:px-6 py-4 md:py-5 text-center">GRD</th>
                  <th className="px-2 md:px-6 py-4 md:py-5 text-center">GP</th>
                  <th className="px-1 md:px-6 py-4 md:py-5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {semester.subjects.map((sub, idx) => (
                  <tr key={idx} className={`group transition-colors ${darkMode ? 'hover:bg-brand-primary/[0.02]' : 'hover:bg-indigo-50/50'}`}>
                    <td className="px-2 py-3 md:py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] md:text-[15px] font-black text-gray-800 dark:text-white uppercase font-sans tracking-tight">
                          {sub.course_code || sub.name}
                        </span>
                        <button onClick={() => onShowInfo(sub)} className="p-0.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400 dark:text-gray-600 shrink-0">
                          <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-1 py-3 md:py-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] md:text-[12px] text-gray-800 dark:text-white font-black font-sans leading-none">
                          {sub.credit_hours}
                        </span>
                        <span className="hidden md:inline text-[11px] text-gray-400 font-bold mt-0.5">({sub.credit_hours}-{sub.credit_hours > 2 ? '1' : '0'})</span>
                      </div>
                    </td>
                    <td className="px-1 py-3 md:py-4 text-center">
                      <span className="text-[10px] md:text-[12px] text-gray-800 dark:text-white font-black font-sans">
                        {sub.obtained_marks}
                      </span>
                    </td>
                    <td className="px-1 py-3 md:py-4 text-center">
                      <div className="flex justify-center">
                        <span className={`w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-lg text-[10px] md:text-[11px] font-black ${getGradeStyle(sub.grade)}`}>
                          {sub.grade}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-3 md:py-4 text-center">
                      <span className={`text-[10px] md:text-[14px] font-black italic font-sans ${darkMode ? 'text-brand-primary' : 'text-indigo-600'}`}>
                        {(sub.grade_points * sub.credit_hours).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-1 py-3 md:py-4 text-right">
                      <button 
                        onClick={() => onDeleteSubject(semester.semester_number, idx)}
                        className="p-1.5 md:p-2 hover:bg-red-500/10 text-gray-500 dark:text-gray-400 hover:text-red-500 rounded-lg transition-all"
                      >
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
import { generateTranscriptPDF, generateClassReportPDF } from './utils/pdfGenerator';

const GuidePage = ({ darkMode, onContactClick }: { darkMode: boolean, onContactClick: () => void }) => {
  const features = [
    {
      title: "Single Transcript Search",
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h.01M15 10h.01M12 10h.01" />
        </svg>
      ),
      description: "Instantly fetch any UAF student's record using their AG number. The system mimics a real browser to fetch data directly from the LMS securely.",
      steps: ["Enter the Year (e.g. 2023)", "Enter the Registration ID (e.g. 10160)", "Click ANALYZE to fetch the complete academic history."]
    },
    {
      title: "Class Result & Leaderboards",
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: "Upload a CSV or Excel file containing student AG numbers to generate a fully ranked class leaderboard with a beautiful podium visualization.",
      steps: ["Switch to 'Class Result' mode", "Upload any sheet containing AG numbers", "The system auto-scans and extracts students for batch processing."]
    },
    {
      title: "Academic Forecast Planner",
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      description: "Set your dream CGPA and let our AI-driven planner calculate exactly what SGPA you need to maintain in your remaining semesters.",
      steps: ["Open a student transcript", "Click 'Achieve Target CGPA'", "Adjust your target and remaining semesters for real-time forecasting."]
    },
    {
      title: "GPA Optimization Filters",
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      description: "Experiment with your GPA by excluding specific subjects. Useful for 'Pass Only' courses or seeing how ranks change if certain subjects are ignored.",
      steps: ["Generate a Class Leaderboard", "Open 'Filters'", "Toggle subjects to see how the entire class is instantly re-ranked."]
    },
    {
      title: "Branded PDF Export",
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h1a1 1 0 110 2H9a1 1 0 010-2z" />
        </svg>
      ),
      description: "Generate professional, text-searchable performance reports for individual students or the entire class leaderboard with Nexus AI branding.",
      steps: ["Click 'Download Result' on a student or leaderboard", "The PDF includes a complete breakdown of Mid/Assignment/Final marks.", "Optimized for mobile viewing and high-quality printing."]
    },
    {
      title: "Summer Session Handling",
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ),
      description: "Our system intelligently isolates Summer Sessions. They don't increment your regular semester count but their marks contribute to the CGPA correctly.",
      steps: ["The system identifies 'Summer' in the session name", "A special 'SUMMER SESSION' badge is applied", "Calculations use 'Best Attempt' rules for repeated summer courses."]
    }
  ];

  return (
    <div className={`animate-in fade-in slide-in-from-bottom-12 duration-1000 max-w-6xl mx-auto font-sans`}>
      <div className="text-center mb-20">
        <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-4 ${darkMode ? 'text-brand-primary' : 'text-indigo-600'}`}>System Documentation</h4>
        <h2 className={`text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Mastering the Smart Calculator</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed font-medium uppercase tracking-widest">
          A comprehensive guide to utilizing the full potential of UAF's most accurate academic intelligence tool.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <div key={idx} className={`p-10 rounded-[3rem] border transition-all duration-500 hover:scale-[1.02] relative overflow-hidden group ${
            darkMode ? 'bg-[#0f0f0f] border-white/10 hover:border-brand-primary/30' : 'bg-white border-gray-100 hover:border-indigo-300 shadow-xl shadow-gray-200/20'
          }`}>
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm transition-all group-hover:rotate-6 ${
              darkMode ? 'bg-brand-primary/10 text-brand-primary' : 'bg-indigo-50 text-indigo-600'
            }`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter mb-4">{feature.title}</h3>
            <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed mb-8 font-medium">
              {feature.description}
            </p>
            <div className="space-y-3">
              {feature.steps.map((step, sIdx) => (
                <div key={sIdx} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black ${
                    darkMode ? 'bg-white/5 text-brand-primary border border-white/10' : 'bg-indigo-600 text-white'
                  }`}>
                    {sIdx + 1}
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide leading-tight">{step}</p>
                </div>
              ))}
            </div>
            {darkMode && <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
          </div>
        ))}
      </div>

      <div className={`mt-20 p-12 rounded-[3.5rem] border text-center transition-all ${
        darkMode ? 'bg-white/[0.02] border-white/5' : 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200'
      }`}>
        <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Still have questions?</h3>
        <p className={`text-sm mb-8 max-w-xl mx-auto font-medium ${darkMode ? 'text-gray-400' : 'text-indigo-100'}`}>
          If you need further assistance or want to report a mathematical discrepancy, our support team is available 24/7.
        </p>
        <button 
          onClick={onContactClick}
          className={`px-10 py-4 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all ${
            darkMode ? 'bg-brand-primary text-black hover:brightness-110' : 'bg-white text-indigo-600 hover:bg-gray-100'
          }`}
        >
          Get In Touch
        </button>
      </div>
    </div>
  );
};

const ContactPage = ({ darkMode }: { darkMode: boolean }) => {
  return (
    <div className={`animate-in fade-in slide-in-from-bottom-12 duration-1000 max-w-4xl mx-auto rounded-[3rem] p-12 md:p-16 border shadow-2xl relative overflow-hidden ${
      darkMode ? 'bg-[#0f0f0f] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-800'
    }`}>
      {darkMode && <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/5 blur-[120px] -mr-80 -mt-80 pointer-events-none"></div>}
      
      <div className="relative z-10 text-center mb-12">
        <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-4 ${darkMode ? 'text-brand-primary' : 'text-indigo-600'}`}>Get In Touch</h4>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-6">Contact Nexus AI Digital</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
          For any inquiries, feedback, or collaboration opportunities, feel free to reach out to us. We are dedicated to providing the best academic solutions for UAF students.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        <div className={`p-8 rounded-[2rem] border transition-all ${darkMode ? 'bg-white/[0.02] border-white/5 hover:border-brand-primary/30' : 'bg-indigo-50/30 border-indigo-100 hover:border-indigo-300'}`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${darkMode ? 'bg-brand-primary/10 text-brand-primary' : 'bg-indigo-100 text-indigo-600'}`}>
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest mb-2">Email Address</h3>
          <a href="mailto:zohaibmuaz@gmail.com" className={`text-xl font-bold tracking-tight transition-colors ${darkMode ? 'text-gray-200 hover:text-brand-primary' : 'text-gray-800 hover:text-indigo-600'}`}>zohaibmuaz@gmail.com</a>
        </div>

        <div className={`p-8 rounded-[2rem] border transition-all ${darkMode ? 'bg-white/[0.02] border-white/5 hover:border-brand-primary/30' : 'bg-indigo-50/30 border-indigo-100 hover:border-indigo-300'}`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${darkMode ? 'bg-brand-primary/10 text-brand-primary' : 'bg-indigo-100 text-indigo-600'}`}>
             <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest mb-2">Developed By</h3>
          <p className="text-xl font-bold tracking-tight">Zohaib Muaz</p>
          <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-bold">Nexus AI Digital Systems</p>
        </div>
      </div>
      
      <div className="mt-12 text-center relative z-10">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">We usually respond within 24 hours.</p>
      </div>
    </div>
  );
};

export default function App() {
  const regIdRef = useRef<HTMLInputElement>(null);
  const [year, setYear] = useState('');
  const [regId, setRegId] = useState('');
  const [student, setStudent] = useState<StudentData | null>(null);
  const [batchResults, setBatchResults] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'single' | 'batch' | 'csv' | 'saved' | 'contact' | 'guide'>('single');
  const [darkMode, setDarkMode] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [excludedSubjects, setExcludedSubjects] = useState<string[]>([]);
  const [showExcludeModal, setShowExcludeModal] = useState(false);
  const [addingToSemester, setAddingToSemester] = useState<number | null>(null);
  const [customAgList, setCustomAgList] = useState<string[]>([]);
  const [uploadedFilename, setUploadedFilename] = useState<string>('');
  const [sortMode, setSortMode] = useState<'ranked' | 'original'>('ranked');
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [darkMode]);

  const totalCourses = useMemo(() => {
    if (!student) return 0;
    return student.semesters.reduce((acc, sem) => acc + sem.subjects.length, 0);
  }, [student]);

  const regularSemestersCount = useMemo(() => {
    if (!student) return 0;
    return student.semesters.filter(s => !s.session_name.toLowerCase().includes('summer')).length;
  }, [student]);

  const visualSemesterLabels = useMemo(() => {
    if (!student) return new Map<number, string>();
    const labels = new Map<number, string>();
    let regularCount = 1;
    [...student.semesters]
      .sort((a, b) => a.semester_number - b.semester_number)
      .forEach(sem => {
        if (sem.session_name.toLowerCase().includes('summer')) {
          labels.set(sem.semester_number, 'SUMMER SESSION');
        } else {
          labels.set(sem.semester_number, `SEMESTER ${regularCount}`);
          regularCount++;
        }
      });
    return labels;
  }, [student]);

  const sortedSemesters = useMemo(() => {
    if (!student) return [];
    return [...student.semesters].reverse();
  }, [student]);

  // Available Subjects mapped to Course Codes
  const availableSubjects = useMemo(() => {
    const subjectMap = new Map<string, { name: string, isPass: boolean }>();
    batchResults.forEach(s => s.semesters.forEach(sem => sem.subjects.forEach(sub => {
      const isPass = sub.grade === 'P';
      if (!subjectMap.has(sub.course_code) || isPass) {
        subjectMap.set(sub.course_code, { name: sub.name, isPass });
      }
    })));
    
    return Array.from(subjectMap.entries())
      .map(([code, info]) => ({ code, ...info }))
      .sort((a, b) => {
        if (a.isPass && !b.isPass) return -1;
        if (!a.isPass && b.isPass) return 1;
        return a.code.localeCompare(b.code);
      });
  }, [batchResults]);

  // Recalculate CGPA using course_code for exclusion
  const studentsWithRanks = useMemo(() => {
    const recalculated = batchResults.map((s, index) => {
      const bestAttempts = new Map<string, { qp: number, ch: number }>();
      
      s.semesters.forEach(sem => {
        sem.subjects.forEach(sub => {
          if (excludedSubjects.includes(sub.course_code)) return;

          const cleanGrade = sub.grade.trim().toUpperCase();
          // UAF Rule: Skip excluded subjects and non-GPA grades (P, W, etc.)
          if (['P', 'W', 'I', 'S', 'U', 'PASS', 'FAIL', 'SATISFACTORY', 'UNSATISFACTORY'].includes(cleanGrade)) {
            // It's a non-GPA grade. Set ch to 0 to wipe out any previous failed attempt in bestAttempts.
            bestAttempts.set(sub.course_code, { qp: 0, ch: 0 });
            return;
          }

          const qp = sub.grade_points * sub.credit_hours;
          
          // Only keep the attempt with the highest Quality Points for each course code
          const existing = bestAttempts.get(sub.course_code);
          if (!existing || qp > existing.qp) {
            bestAttempts.set(sub.course_code, { qp, ch: sub.credit_hours });
          }
        });
      });

      let totalQP = 0;
      let totalCH = 0;
      bestAttempts.forEach(attempt => {
        totalQP += attempt.qp;
        totalCH += attempt.ch;
      });

      return { ...s, cgpa: totalCH > 0 ? totalQP / totalCH : 0, originalIndex: index };
    });

    // 1. Sort by CGPA to assign globalRank
    const sortedByRank = [...recalculated].sort((a, b) => b.cgpa - a.cgpa);
    return sortedByRank.map((s, i) => ({ ...s, globalRank: i + 1 }));
  }, [batchResults, excludedSubjects]);

  const rankedStudents = useMemo(() => {
    // 2. Apply view sort based on sortMode
    const finalSorted = sortMode === 'original'
      ? [...studentsWithRanks].sort((a, b) => (a as any).originalIndex - (b as any).originalIndex)
      : studentsWithRanks;

    if (!leaderboardSearch) return finalSorted;
    
    const query = leaderboardSearch.toLowerCase();
    return finalSorted.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.ag_number.toLowerCase().includes(query)
    );
  }, [studentsWithRanks, leaderboardSearch, sortMode]);

  const podiumStudents = useMemo(() => studentsWithRanks.slice(0, 3), [studentsWithRanks]);

  const fetchResults = async () => {
    setLoading(true);
    setError('');
    setStudent(null);
    setBatchResults([]);
    setProgress(0);
    setExcludedSubjects([]);
    setSortMode('ranked');
    
    try {
      if (viewMode === 'single') {
        const fullAg = `${year}-ag-${regId}`;
        const response = await fetch(`${API_BASE_URL}/student/${fullAg}`);
        if (!response.ok) throw new Error('Student not found or server error');
        const data = await response.json();
        setStudent(data);
      } else if (viewMode === 'csv') {
        if (customAgList.length === 0) throw new Error('Please upload a valid CSV file with AG numbers');
        const total = customAgList.length;
        const results: StudentData[] = [];
        const chunkSize = 5;
        for (let i = 0; i < customAgList.length; i += chunkSize) {
          const chunk = customAgList.slice(i, i + chunkSize);
          const tasks = chunk.map(ag => fetch(`${API_BASE_URL}/student/${ag}`).then(r => r.json()));
          const chunkResults = await Promise.all(tasks);
          results.push(...chunkResults.filter(r => r.ag_number));
          setProgress(((i + chunk.length) / total) * 100);
          setBatchResults([...results]);
        }
        if (results.length === 0) throw new Error('No students found in the uploaded file');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExclusion = (code: string) => {
    setExcludedSubjects(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleDeleteSubject = (semNum: number, subIdx: number) => {
    if (!student) return;
    const updatedSemesters = student.semesters.map(sem => {
      if (sem.semester_number === semNum) {
        return { ...sem, subjects: sem.subjects.filter((_, idx) => idx !== subIdx) };
      }
      return sem;
    });
    setStudent(processStudentData({ ...student, semesters: updatedSemesters }));
  };

  const handleAddSubjectWithData = (semNum: number, subData: Partial<Subject>) => {
    if (!student) return;
    const newSubject: Subject = {
      name: subData.name || 'New Subject',
      course_code: subData.course_code || 'SUB-101',
      obtained_marks: subData.obtained_marks || 0,
      total_marks: subData.total_marks || 100,
      credit_hours: subData.credit_hours || 3,
      grade: 'F',
      grade_points: 0
    };
    const updatedSemesters = student.semesters.map(sem => {
      if (sem.semester_number === semNum) {
        return { ...sem, subjects: [...sem.subjects, newSubject] };
      }
      return sem;
    });
    setStudent(processStudentData({ ...student, semesters: updatedSemesters }));
  };

  const fetchPinnedSection = async () => {
    const pinned = localStorage.getItem('pinned_section');
    if (!pinned) {
      setError('No pinned section found.');
      return;
    }
    const agNumbers = JSON.parse(pinned) as string[];
    setLoading(true);
    setError('');
    setBatchResults([]);
    setProgress(0);
    
    const results: StudentData[] = [];
    const chunkSize = 5;
    for (let i = 0; i < agNumbers.length; i += chunkSize) {
      const chunk = agNumbers.slice(i, i + chunkSize);
      const tasks = chunk.map(ag => fetch(`${API_BASE_URL}/student/${ag}`).then(r => r.json()));
      const chunkResults = await Promise.all(tasks);
      results.push(...chunkResults.filter(r => r.ag_number));
      setProgress(((i + chunk.length) / agNumbers.length) * 100);
      setBatchResults([...results]);
    }
    setLoading(false);
  };

  const handlePruneStudent = (ag: string) => {
    setBatchResults(prev => prev.filter(s => s.ag_number !== ag));
  };

  useEffect(() => {
    // Clear results when switching between tabs for state isolation
    setStudent(null);
    setBatchResults([]);
    setError('');
    setProgress(0);
    setExcludedSubjects([]);
    setSortMode('ranked');

    if (viewMode === 'saved') {
      fetchPinnedSection();
    }
  }, [viewMode]);

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-brand-dark text-gray-800 dark:text-gray-200 font-sans selection:bg-indigo-100 dark:selection:bg-brand-primary selection:text-indigo-900 dark:selection:text-black pb-32 transition-colors duration-500 text-gray-800 dark:text-white">
      
      {selectedSubject && (
        <SubjectInfoPopup 
          subject={selectedSubject} 
          onClose={() => setSelectedSubject(null)} 
          darkMode={darkMode} 
        />
      )}

      {addingToSemester !== null && (
        <AddSubjectPopup 
          darkMode={darkMode}
          onClose={() => setAddingToSemester(null)}
          onAdd={(data) => handleAddSubjectWithData(addingToSemester, data)}
        />
      )}

      {showExcludeModal && (
        <ExcludeSubjectsPopup 
          subjects={availableSubjects} 
          excluded={excludedSubjects} 
          onToggle={toggleExclusion} 
          onClose={() => setShowExcludeModal(false)} 
          darkMode={darkMode} 
        />
      )}

      <nav className="px-10 py-5 flex justify-between items-center backdrop-blur-2xl border-b border-gray-100 dark:border-white/[0.04] sticky top-0 z-50 bg-white/70 dark:bg-brand-dark/60 transition-colors duration-500 text-gray-800 dark:text-white font-sans">
        <div 
          onClick={() => { setViewMode('single'); setStudent(null); setBatchResults([]); setIsMobileMenuOpen(false); }}
          className="flex items-center gap-4 text-gray-800 dark:text-white cursor-pointer group active:scale-95 transition-all"
        >
          <div className="w-12 h-12 flex items-center justify-center bg-transparent">
            <img 
              src="/uafnelogo.webp" 
              alt="UAF Logo" 
              className={`w-full h-full object-contain transition-all duration-700 ${darkMode ? 'invert-[1] hue-rotate-[180deg] brightness-[1.1] contrast-[1.1]' : 'mix-blend-multiply'}`} 
            />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter leading-none uppercase group-hover:text-brand-primary transition-colors">UAF CGPA</h1>
            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 tracking-[0.3em] uppercase leading-none font-sans">Calculator</span>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden md:flex items-center gap-6 mr-4 font-sans text-gray-800 dark:text-white">
            <button 
              onClick={() => setViewMode('single')} 
              className={`text-[10px] font-black tracking-[0.3em] uppercase transition-all ${viewMode === 'single' || viewMode === 'batch' || viewMode === 'csv' || viewMode === 'saved' ? (darkMode ? 'text-brand-primary border-b-2 border-brand-primary pb-0.5' : 'text-indigo-600 border-b-2 border-indigo-600 pb-0.5') : 'text-gray-400 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'}`}
            >
              HOME
            </button>
            <button 
              onClick={() => setViewMode('guide')}
              className={`text-[10px] font-black tracking-[0.3em] uppercase transition-all ${viewMode === 'guide' ? (darkMode ? 'text-brand-primary border-b-2 border-brand-primary pb-0.5' : 'text-indigo-600 border-b-2 border-indigo-600 pb-0.5') : 'text-gray-400 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'}`}
            >
              GUIDE
            </button>
            <button 
              onClick={() => setViewMode('contact')}
              className={`text-[10px] font-black tracking-[0.3em] uppercase transition-all ${viewMode === 'contact' ? (darkMode ? 'text-brand-primary border-b-2 border-brand-primary pb-0.5' : 'text-indigo-600 border-b-2 border-indigo-600 pb-0.5') : 'text-gray-400 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100'}`}
            >
              CONTACT
            </button>
          </div>
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-11 h-11 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all shadow-sm bg-white dark:bg-transparent active:scale-90 overflow-hidden"
          >
            <span className="text-xl leading-none select-none text-gray-800 dark:text-white font-sans">{darkMode ? '☀️' : '🌙'}</span>
          </button>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-11 h-11 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all shadow-sm bg-white dark:bg-transparent active:scale-95 text-gray-500"
          >
            <svg className={`w-6 h-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90 text-brand-primary' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          
          <div className="h-6 w-px bg-gray-200 dark:bg-white/10 font-sans hidden md:block"></div>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      <div className={`md:hidden fixed top-24 left-6 right-6 z-[60] transition-all duration-500 ease-out origin-top ${
        isMobileMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
      }`}>
        <div className={`p-4 rounded-[2.5rem] border shadow-[0_30px_70px_rgba(0,0,0,0.3)] backdrop-blur-3xl transition-colors duration-500 ${
          darkMode ? 'bg-[#0f0f0f]/90 border-white/10 text-white shadow-brand-primary/5' : 'bg-white/90 border-gray-100 text-gray-800 shadow-indigo-100'
        }`}>
          <div className="space-y-1">
            {[
              { id: 'single', label: 'HOME', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { id: 'guide', label: 'GUIDE', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
              { id: 'contact', label: 'CONTACT', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setViewMode(item.id as any); setIsMobileMenuOpen(false); setStudent(null); setBatchResults([]); }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-[10px] tracking-[0.3em] ${
                  (viewMode === item.id || (item.id === 'single' && (viewMode === 'batch' || viewMode === 'csv' || viewMode === 'saved')))
                    ? (darkMode ? 'bg-brand-primary text-black' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100')
                    : (darkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-50 text-gray-500')
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-12 max-w-7xl">
        {viewMode === 'contact' ? (
          <ContactPage darkMode={darkMode} />
        ) : viewMode === 'guide' ? (
          <GuidePage darkMode={darkMode} onContactClick={() => setViewMode('contact')} />
        ) : (
          <>
            <section className={`transition-all duration-700 ${student || batchResults.length > 0 ? 'mb-10' : 'py-20 text-center'}`}>
          {!(student || batchResults.length > 0) && (
            <>
              <h2 className={`text-4xl md:text-8xl font-black mb-6 tracking-tighter bg-clip-text text-transparent ${darkMode ? 'bg-gradient-to-b from-white to-white/10' : 'bg-gradient-to-b from-gray-900 to-gray-400'}`}>
                CGPA <span className={`${darkMode ? 'text-brand-primary/80' : 'text-indigo-600'} italic`}>CALCULATOR</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-500 font-medium max-w-2xl mx-auto text-sm md:text-lg leading-relaxed mb-16 italic font-sans text-gray-800 dark:text-white/80 px-4">
                UAF CGPA Calculator - Enter your registration number and get instant results.
              </p>
            </>
          )}

          <div className="max-w-2xl mx-auto relative font-sans">
             <div className="flex justify-center gap-3 mb-6 p-1.5 bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04] rounded-2xl w-fit mx-auto backdrop-blur-md shadow-sm transition-colors duration-500">
                {[
                  { id: 'single', label: 'Single' },
                  { id: 'csv', label: 'Class Result' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as any)}
                    className={`px-8 py-2 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all ${
                      viewMode === mode.id 
                        ? (darkMode ? 'bg-brand-primary/90 text-black shadow-lg shadow-brand-primary/10' : 'bg-indigo-600 text-white shadow-md') 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 text-gray-400 dark:text-gray-500'
                    } scale-105`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {viewMode === 'csv' && (
                <div className="text-center mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
                  <p className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-900 dark:text-white/80">
                    Upload section file (CSV/Excel) to generate full class leaderboard
                  </p>
                </div>
              )}

              <div className="bg-white dark:bg-white/[0.01] p-1.5 md:p-3 rounded-[2.5rem] shadow-2xl shadow-gray-300/30 dark:shadow-none border border-gray-100 dark:border-white/[0.05] flex items-center gap-1 md:gap-3 pl-3 md:pl-8 pr-1.5 md:pr-3 group focus-within:border-indigo-500/30 dark:focus-within:border-brand-primary/20 transition-all backdrop-blur-3xl relative overflow-hidden font-sans">
                <svg className="w-5 h-5 md:w-6 h-6 text-gray-300 dark:text-gray-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                
                {viewMode === 'csv' ? (
                  <div className="flex-1 relative flex items-center gap-2 md:gap-4 px-2 md:px-4 overflow-hidden">
                    <input 
                      type="file" 
                      accept=".csv,.txt,.xlsx,.xls"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadedFilename(file.name);
                        
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const data = ev.target?.result;
                          let text = '';
                          
                          if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                            const workbook = XLSX.read(data, { type: 'array' });
                            // Combine all sheets into one string for regex search
                            text = workbook.SheetNames.map(sheetName => {
                              return XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
                            }).join('\n');
                          } else {
                            text = new TextDecoder().decode(data as ArrayBuffer);
                          }

                          const matches = text.match(/\d{4}-ag-\d+/gi);
                          if (matches) {
                            const uniqueAgs = Array.from(new Set(matches.map(a => a.toLowerCase())));
                            setCustomAgList(uniqueAgs);
                          } else {
                            setCustomAgList([]);
                          }
                        };
                        reader.readAsArrayBuffer(file);
                      }}
                    />
                    <div className="bg-gray-100 dark:bg-white/[0.03] px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-gray-500 dark:text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 md:gap-3 shrink-0 group/btn max-w-[100px] md:max-w-none">
                      <svg className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      <span className="truncate">{uploadedFilename ? uploadedFilename : 'UPLOAD'}</span>
                    </div>
                    {customAgList.length > 0 ? (
                      <span className="text-[10px] md:text-[11px] font-black text-brand-primary uppercase tracking-widest animate-in fade-in truncate">
                        {customAgList.length} AGs
                      </span>
                    ) : (
                      <span className="text-[8px] md:text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest animate-in fade-in italic truncate">
                        AUTO-SCAN
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-0.5 md:gap-3 min-w-0">
                    <input 
                      type="text" 
                      value={year} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setYear(val);
                        if (val.length === 4) {
                          regIdRef.current?.focus();
                        }
                      }}
                      className="w-12 md:w-16 text-center font-black text-lg md:text-xl bg-transparent text-gray-800 dark:text-white focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 shrink-0"
                      placeholder="2023"
                    />
                    <div className="bg-gray-100 dark:bg-white/[0.03] px-1.5 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-gray-400 dark:text-gray-700 text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] shrink-0">-ag-</div>
                    <input 
                      type="text" 
                      value={regId} 
                      ref={regIdRef}
                      onChange={(e) => setRegId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchResults()}
                      className="w-16 md:w-20 text-center font-black text-lg md:text-xl bg-transparent text-gray-800 dark:text-white focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 border-b border-transparent focus:border-brand-primary/30 font-sans shrink-0"
                      placeholder="10160"
                    />
                  </div>
                )}
                <button 
                  onClick={fetchResults}
                  disabled={loading}
                  className={`w-11 h-11 md:w-auto md:h-auto md:px-10 md:py-4 rounded-xl md:rounded-[1.8rem] font-black tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 text-sm whitespace-nowrap shrink-0 ${
                    darkMode ? 'bg-brand-primary/90 text-black shadow-brand-primary/10 hover:brightness-105' : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
                  } active:scale-95`}
                >
                  <span className="hidden md:inline">{loading ? (viewMode === 'batch' ? `${Math.round(progress)}%` : '...') : 'ANALYZE'}</span>
                  {loading ? (
                    <svg className="w-5 h-5 md:w-5 md:h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-2 duration-300 text-center font-sans">
                  {error}
                </div>
              )}
          </div>
        </section>

        {batchResults.length > 0 && student && (
          <button 
            onClick={() => setStudent(null)}
            className={`mb-8 flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] tracking-[0.2em] transition-all shadow-sm font-sans ${
              darkMode ? 'bg-white/5 text-gray-400 hover:text-brand-primary border border-white/5 hover:border-brand-primary/20' : 'bg-white text-gray-500 hover:text-indigo-600 border border-gray-100 hover:border-indigo-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            BACK TO LEADERBOARD
          </button>
        )}

        {batchResults.length > 0 && !student && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {/* Podium Component */}
            <div className="grid grid-cols-3 gap-2 md:gap-8 mb-16 max-w-5xl mx-auto items-end pt-10 font-sans text-gray-800 dark:text-white">
              {/* Rank 2 */}
              {podiumStudents[1] && (
                <div className="flex flex-col items-center group">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gray-100 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 flex items-center justify-center text-xl md:text-2xl font-black mb-4 group-hover:scale-110 transition-transform">🥈</div>
                  <div className="text-xl md:text-3xl font-black text-gray-400 italic mb-4 font-sans">{podiumStudents[1].cgpa.toFixed(2)}</div>
                  <div className="h-20 md:h-32 w-full bg-gradient-to-t from-gray-100 dark:from-white/5 to-transparent rounded-t-2xl md:rounded-t-3xl border-x-2 border-t-2 border-gray-200 dark:border-white/10 p-2 md:p-6 text-center">
                    <div className="text-[7px] md:text-[10px] font-black uppercase tracking-tight md:tracking-widest leading-none whitespace-normal break-words">{podiumStudents[1].name}</div>
                    <div className="text-[6px] md:text-[9px] font-bold text-gray-400 opacity-60 uppercase mt-1 leading-none">{podiumStudents[1].ag_number}</div>
                  </div>
                </div>
              )}
              {/* Rank 1 */}
              {podiumStudents[0] && (
                <div className="flex flex-col items-center group">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-orange-500/10 dark:bg-brand-primary/10 border-4 border-orange-500 dark:border-brand-primary flex items-center justify-center text-3xl md:text-4xl font-black mb-6 animate-bounce shadow-2xl shadow-brand-primary/20">🥇</div>
                  <div className="text-3xl md:text-5xl font-black text-orange-500 dark:text-brand-primary italic mb-6 font-sans">{podiumStudents[0].cgpa.toFixed(2)}</div>
                  <div className="h-32 md:h-48 w-full bg-gradient-to-t from-orange-500/10 dark:from-brand-primary/10 to-transparent rounded-t-[2rem] md:rounded-t-[3rem] border-x-4 border-t-4 border-orange-500 dark:border-brand-primary p-3 md:p-8 text-center relative overflow-hidden">
                    {darkMode && <div className="absolute inset-0 bg-brand-primary/5 blur-3xl -z-10"></div>}
                    <div className="text-[8px] md:text-xs font-black uppercase tracking-tight md:tracking-widest leading-none whitespace-normal break-words">{podiumStudents[0].name}</div>
                    <div className="text-[7px] md:text-[9px] font-bold text-orange-500 dark:text-brand-primary opacity-60 uppercase mt-1 leading-none">{podiumStudents[0].ag_number}</div>
                  </div>
                </div>
              )}
              {/* Rank 3 */}
              {podiumStudents[2] && (
                <div className="flex flex-col items-center group">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-orange-900/10 dark:bg-orange-900/20 border-2 border-orange-700/30 flex items-center justify-center text-lg md:text-xl font-black mb-4 group-hover:scale-110 transition-transform">🥉</div>
                  <div className="text-xl md:text-3xl font-black text-orange-700/60 italic mb-4 font-sans">{podiumStudents[2].cgpa.toFixed(2)}</div>
                  <div className="h-16 md:h-24 w-full bg-gradient-to-t from-orange-900/10 dark:from-orange-900/20 to-transparent rounded-t-xl md:rounded-t-3xl border-x-2 border-t-2 border-orange-700/30 p-2 md:p-5 text-center">
                    <div className="text-[7px] md:text-[10px] font-black uppercase tracking-tight md:tracking-widest leading-none whitespace-normal break-words">{podiumStudents[2].name}</div>
                    <div className="text-[6px] md:text-[9px] font-bold text-orange-700 opacity-60 uppercase mt-1 leading-none">{podiumStudents[2].ag_number}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 px-4 md:px-6 font-sans text-gray-800 dark:text-white w-full">
              <div className="shrink-0">
                <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 ${darkMode ? 'text-brand-primary' : 'text-indigo-600'}`}>Class Analysis</h4>
                <h3 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none">Class Leaderboard</h3>
              </div>
              <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto">
                 <button 
                  onClick={() => setSortMode(sortMode === 'ranked' ? 'original' : 'ranked')}
                  title={sortMode === 'ranked' ? "Switch to the original order from your uploaded CSV/Excel file" : "Sort students by their CGPA performance"}
                  className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-2xl text-[9px] md:text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${darkMode ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20' : 'bg-orange-50 text-orange-700 border border-orange-100 hover:bg-orange-100'}`}
                 >
                   <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                   <span className="hidden md:inline">{sortMode === 'ranked' ? 'View CSV Order' : 'View Ranked Order'}</span>
                   <span className="md:hidden">{sortMode === 'ranked' ? 'CSV ORDER' : 'RANKED'}</span>
                 </button>
                 <button 
                  onClick={() => generateClassReportPDF(rankedStudents, sortMode)}
                  title="Export this leaderboard as a professional PDF report"
                  className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-2xl text-[9px] md:text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${darkMode ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20' : 'bg-green-50 text-green-700 border border-green-100 hover:bg-green-100'}`}
                 >
                   <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                   <span className="hidden md:inline">Download Result</span>
                   <span className="md:hidden">PDF</span>
                 </button>
                 <div className="relative group flex-1 md:flex-none w-full md:w-auto mt-2 md:mt-0">
                    <input 
                      type="text" 
                      placeholder="SEARCH..."
                      className={`bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] pl-9 pr-4 py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-brand-primary/30 transition-all w-full md:w-64 shadow-sm`}
                      value={leaderboardSearch}
                      onChange={(e) => setLeaderboardSearch(e.target.value)}
                    />
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                 </div>
                 <button 
                  onClick={() => setShowExcludeModal(true)}
                  title="Exclude specific subjects from CGPA calculation"
                  className={`px-4 md:px-6 py-3 rounded-2xl text-[9px] md:text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${darkMode ? 'bg-white/5 hover:bg-white/10 border border-white/5' : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'} mt-2 md:mt-0 flex-none`}
                 >
                   <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                   Filters
                 </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-white/[0.05] bg-white dark:bg-white/[0.01] shadow-2xl shadow-gray-200/20 dark:shadow-none font-sans text-gray-800 dark:text-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`bg-gray-50/50 dark:bg-white/[0.02] text-[9px] md:text-[10px] font-black uppercase tracking-widest md:tracking-[0.4em] ${darkMode ? 'text-brand-primary' : 'text-indigo-600'}`}>
                   <th className="px-3 md:px-10 py-4 md:py-6">{sortMode === 'ranked' ? 'Rank' : '#'}</th>
                   <th className="px-3 md:px-10 py-4 md:py-6">Student</th>
                   <th className="px-2 md:px-10 py-4 md:py-6 text-center">Courses</th>
                   <th className="px-3 md:px-10 py-4 md:py-6 text-right font-sans tracking-tight">CGPA</th>
                   <th className="px-2 md:px-10 py-4 md:py-6"></th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-800 dark:text-white font-sans">
                  {rankedStudents.map((s, index) => (
                   <tr key={s.ag_number} className="group hover:bg-brand-primary/[0.02] transition-all">
                     <td className="px-3 md:px-10 py-4 md:py-6 cursor-pointer" onClick={() => { setStudent(s); window.scrollTo({top: 400, behavior: 'smooth'}); }}>
                       <span className={`text-lg md:text-xl font-black italic ${s.globalRank === 1 ? 'text-orange-500' : s.globalRank < 4 ? 'text-gray-400' : 'text-gray-500'}`}>
                         {sortMode === 'ranked' ? `#${s.globalRank}` : `${index + 1}`}
                       </span>
                     </td>                      <td className="px-3 md:px-10 py-4 md:py-6 cursor-pointer" onClick={() => { setStudent(s); window.scrollTo({top: 400, behavior: 'smooth'}); }}>
                        <div className="font-black text-[11px] md:text-lg uppercase leading-none tracking-tight whitespace-normal break-words">{s.name}</div>
                        <div className="text-[7px] md:text-[10px] font-bold text-gray-400 mt-1 font-mono tracking-widest uppercase">{s.ag_number}</div>
                      </td>
                      <td className="px-2 md:px-10 py-4 md:py-6 text-center font-bold cursor-pointer" onClick={() => { setStudent(s); window.scrollTo({top: 400, behavior: 'smooth'}); }}>
                        <span className="bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-lg text-[9px] md:text-[10px] font-black text-gray-400 font-sans">{s.semesters.reduce((acc, sem) => acc + sem.subjects.length, 0)}</span>
                      </td>
                      <td className="px-3 md:px-10 py-4 md:py-6 text-right cursor-pointer" onClick={() => { setStudent(s); window.scrollTo({top: 400, behavior: 'smooth'}); }}>
                        <span className={`text-lg md:text-2xl font-black italic font-sans ${s.globalRank === 1 ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}`}>{s.cgpa.toFixed(2)}</span>
                      </td>
                      <td className="px-2 md:px-10 py-4 md:py-6 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handlePruneStudent(s.ag_number); }}
                          className="p-2 md:p-3 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {student && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
             {/* Compact Student Banner */}
            <div className={`border rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 flex flex-col md:flex-row justify-between items-center mb-10 relative overflow-hidden shadow-xl transition-all duration-500 ${
              darkMode ? 'bg-[#0c0c0c] border-white/[0.04]' : 'bg-white border-gray-100'
            }`}>
              {darkMode && <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/5 blur-[120px] -mr-80 -mt-80 font-sans"></div>}
              <div className="flex flex-col md:flex-row items-center gap-5 md:gap-8 z-10 text-gray-800 dark:text-white font-sans w-full md:w-auto">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] flex items-center justify-center shadow-lg border transition-colors ${
                  darkMode ? 'bg-brand-primary/5 text-brand-primary/60 border-brand-primary/10' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                }`}>
                  <svg className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-2.75.191 1 1 0 00-.246.162l-3 3a1 1 0 001.414 1.414l2.583-2.583c.311.954.83 1.834 1.533 2.566l2.316 2.317a1 1 0 001.414-1.414l-2.317-2.316a7.003 7.003 0 01-1.343-1.63L11 12.12v-4.102l-1.31-.562a1 1 0 00-.787 0l-5.593 2.397z"/><path d="M14.903 12.355l-2.518 1.08a1 1 0 00-.787 1.838l2.518-1.08a1 1 0 00.787-1.838z"/></svg>
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-gray-100 tracking-tighter uppercase leading-none font-sans whitespace-normal break-words max-w-[250px] md:max-w-none">{student.name}</h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4 mt-3 font-sans">
                    <span className={`text-[8px] md:text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] border shadow-sm ${
                      darkMode ? 'bg-brand-primary/10 text-brand-primary/80 border-brand-primary/10' : 'bg-green-50 text-green-700 border-green-100'
                    }`}>Verified Record</span>
                    <span className="text-gray-400 dark:text-gray-600 font-bold text-base md:text-lg tracking-tighter uppercase font-sans">{student.ag_number}</span>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-right z-10 mt-8 md:mt-0 font-sans text-gray-800 dark:text-white w-full md:w-auto">
                <div className="flex items-center gap-2 justify-center md:justify-end mb-1 text-gray-400 dark:text-gray-600">
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em]">Cumulative GPA</span>
                </div>
                <div className={`text-5xl md:text-7xl font-black leading-none tracking-tighter italic ${darkMode ? 'text-white' : 'text-gray-900'}`}>{student.cgpa.toFixed(2)}</div>
                <div className="flex items-center gap-4 mt-4 md:mt-6 justify-center md:justify-end">
                  <button 
                    onClick={() => generateTranscriptPDF(student)}
                    className={`px-6 py-2.5 rounded-2xl text-[9px] font-black tracking-widest uppercase transition-all flex items-center gap-2 ${darkMode ? 'bg-brand-primary text-black hover:brightness-110 shadow-lg shadow-brand-primary/10' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download Result
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mb-12 ml-6 text-gray-800 dark:text-white font-sans">
              <div className="flex items-center gap-3 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.04] px-6 py-2.5 rounded-2xl shadow-sm transition-colors duration-500">
                <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-brand-primary/60' : 'bg-green-500'}`}></div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">{regularSemestersCount} Semesters Data</span>
              </div>
              <div className="flex items-center gap-3 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.04] px-6 py-2.5 rounded-2xl shadow-sm transition-colors duration-500 font-sans">
                <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-brand-secondary/60' : 'bg-indigo-500'}`}></div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">{totalCourses} Courses Analyzed</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 font-sans text-gray-800 dark:text-white">
              <div className="md:col-span-2">
                <PerformanceGraph semesters={student.semesters} darkMode={darkMode} />
                <div className="mt-8 flex justify-start">
                    <button 
                    onClick={() => setShowForecastModal(true)}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-3 group ${
                      darkMode 
                        ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 hover:bg-brand-primary/20' 
                        : 'bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 shadow-sm'
                    }`}
                  >
                    <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Acheive Target CGPA
                  </button>
                </div>
              </div>
              {showForecastModal && (
                <AcademicForecastModal 
                  student={student} 
                  darkMode={darkMode} 
                  onClose={() => setShowForecastModal(false)} 
                />
              )}
              {sortedSemesters.map((sem) => (
                <SemesterCard 
                  key={sem.semester_number} 
                  semester={sem} 
                  darkMode={darkMode} 
                  onShowInfo={(sub) => setSelectedSubject(sub)}
                  onDeleteSubject={handleDeleteSubject}
                  onAddSubject={(semNum) => setAddingToSemester(semNum)}
                  visualLabel={visualSemesterLabels.get(sem.semester_number) || ''}
                />
              ))}
            </div>
          </div>
        )}
        </>
      )}
      </main>

      <footer className="mt-32 text-center opacity-10 font-sans">
        <p className="text-[9px] font-black tracking-[1em] uppercase text-gray-500 dark:text-white font-mono leading-none">Academic Intelligence System v2.4</p>
      </footer>
    </div>
  );
}
