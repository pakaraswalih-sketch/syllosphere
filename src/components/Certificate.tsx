import React, { useState, useRef, useEffect } from 'react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { supabase } from '../lib/supabaseClient';
import { Header } from './Header';
import { 
  CheckCircleIcon, LockIcon, UserIcon, BookOpenIcon, 
  ShieldCheckIcon, AwardIcon, BrainCircuitIcon, EyeIcon, ArrowLeftIcon, XCircleIcon,
  ChevronRightIcon, StarIcon, ClipboardListIcon, LayoutDashboardIcon, LogOutIcon
} from './Icons';

interface CertificateData {
  certificate_id: string;
  completion_date: string;
  course_name: string;
  issued_by: string;
}

interface CertificateProps {
  userName: string;
  completedLessons: number;
  totalLessons: number;
  quizzesPassed: number;
  totalQuizzes: number;
  unlocked: boolean;
  certificateData: CertificateData | null;
  onContinue: () => void;
  onBack: () => void;
  isAdmin?: boolean;
}

const Certificate = ({ 
  userName, 
  completedLessons, 
  totalLessons, 
  quizzesPassed, 
  totalQuizzes, 
  unlocked, 
  certificateData, 
  onContinue,
  onBack,
  isAdmin = false
}: CertificateProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [modalScale, setModalScale] = useState(0.8);
  const [isDownloading, setIsDownloading] = useState(false);

  // Responsive scaling for the main preview (perfect fit, no grey space)
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Container width (no padding)
        const width = entry.contentRect.width;
        setScale(Math.max(0.1, width / 1100));
      }
    });
    if (previewContainerRef.current) {
      observer.observe(previewContainerRef.current);
    }
    return () => observer.disconnect();
  }, [unlocked]);

  // Responsive scaling for the modal
  useEffect(() => {
    if (!isPreviewOpen) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width - 64; // More padding for modal
        const height = entry.contentRect.height - 120; // Account for close button
        // Calculate scale to fit either width or height constraints
        const scaleX = width / 1100;
        const scaleY = height / 800;
        setModalScale(Math.max(0.2, Math.min(scaleX, scaleY, 1.2)));
      }
    });
    if (modalContainerRef.current) {
      observer.observe(modalContainerRef.current);
    }
    return () => observer.disconnect();
  }, [isPreviewOpen]);

  // ESC key listener for modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPreviewOpen(false);
    };
    if (isPreviewOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isPreviewOpen]);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    const fallbackId = certificateData?.certificate_id || 'SYL-PREVIEW';
    const filename = `Certificate_${userName.replace(/\s+/g, '_')}_${fallbackId}.pdf`;
    
    try {
      const previewElement = document.getElementById('preview');
      if (!previewElement) throw new Error("Preview element not found in DOM");
      
      const clone = previewElement.cloneNode(true) as HTMLElement;
      
      // Override any styles that might cause html2canvas to fail
      Object.assign(clone.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '1100px',
        height: '800px',
        zIndex: '-9999',
        transform: 'none',
        opacity: '1'
      });
      
      document.body.appendChild(clone);

      const imgData = await toJpeg(clone, {
        pixelRatio: 3, 
        backgroundColor: '#ffffff'
      });
      
      document.body.removeChild(clone);

      // 3. Create PDF and calculate dimensions (Fixed to 1100x800 resolution mapping)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1100, 800]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 1100, 800);
      pdf.save(filename);
      
    } catch (e: any) {
      console.error("PDF Generation failed:", e);
      alert("Unable to generate certificate: " + (e?.message || e));
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Header userName={userName} isAdmin={isAdmin} />
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 pb-20">
          <div className="w-full max-w-[1000px] mb-6 flex justify-start">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#0F172A] transition-colors font-semibold text-sm bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm w-fit">
            <ArrowLeftIcon className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
        
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 max-w-[1000px] w-full flex flex-col md:flex-row overflow-hidden mb-10">
          {/* Left Graphic Side */}
          <div className="w-full md:w-[45%] bg-white flex items-center justify-center p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-100 relative min-h-[300px]">
             {/* Abstract Background */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
               <div className="w-[300px] h-[300px] bg-[#EFF6FF] rounded-full blur-3xl opacity-60"></div>
             </div>
             
             {/* Certificate Graphic Illustration */}
             <div className="relative z-10 w-full max-w-[320px] aspect-[4/3] flex items-center justify-center mt-10 md:mt-0">
               <div className="relative w-[200px] h-[260px] bg-[#F8FAFC] rounded-2xl border-[3px] border-[#DBEAFE] shadow-sm flex flex-col items-center pt-8 px-6">
                 <div className="w-full h-2.5 bg-[#DBEAFE] rounded-full mb-3"></div>
                 <div className="w-3/4 h-2.5 bg-[#DBEAFE] rounded-full mb-8"></div>
                 <h3 className="text-lg font-black text-[#93C5FD] tracking-widest mb-10 opacity-70">CERTIFICATE</h3>
                 
                 <div className="absolute bottom-8 left-6 w-12 h-12 rounded-full border-4 border-[#93C5FD] bg-[#EFF6FF] flex items-center justify-center">
                   <div className="w-5 h-5 rounded-full bg-[#93C5FD]"></div>
                 </div>
                 <div className="absolute bottom-5 left-9 w-6 h-10 bg-[#DBEAFE] -z-10 rotate-12"></div>
                 <div className="absolute bottom-5 left-9 w-6 h-10 bg-[#DBEAFE] -z-10 -rotate-12 translate-x-3"></div>
               </div>
               
               {/* Large Padlock Overlap */}
               <div className="absolute -bottom-2 right-4 w-28 h-28">
                 <div className="w-full h-full bg-[#60A5FA] rounded-[24px] shadow-lg flex items-center justify-center relative shadow-blue-400/20 translate-y-2 translate-x-4">
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-14 h-16 border-[6px] border-[#60A5FA] border-b-0 rounded-t-[20px]"></div>
                   <div className="w-3.5 h-3.5 bg-white rounded-full shadow-inner z-10"></div>
                   <div className="w-2 h-4 bg-white absolute top-1/2 left-1/2 -translate-x-1/2 mt-1.5 rounded-full shadow-inner z-10"></div>
                 </div>
               </div>
               
               {/* Scattered Shapes */}
               <div className="absolute top-4 right-4 text-[#BFDBFE]"><XCircleIcon className="w-4 h-4" /></div>
               <div className="absolute bottom-12 -left-4 text-[#BFDBFE]"><XCircleIcon className="w-4 h-4" /></div>
               <div className="absolute -bottom-8 right-16 text-[#BFDBFE]"><div className="w-3 h-3 rounded-full bg-[#BFDBFE]"></div></div>
             </div>
          </div>
          
          {/* Right Content Side */}
          <div className="w-full md:w-[55%] p-8 md:p-12 lg:p-14 flex flex-col justify-center bg-white relative">
            <div className="flex items-center gap-2 bg-[#FFF7ED] text-[#EA580C] px-3 py-1.5 rounded-full w-fit mb-5 border border-[#FFEDD5]">
              <LockIcon className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Not Yet Unlocked</span>
            </div>
            
            <h2 className="text-[28px] md:text-[32px] font-bold text-[#0F172A] mb-2 leading-tight">Certificate Locked</h2>
            <p className="text-slate-500 text-[14px] mb-8 leading-relaxed max-w-sm">
              Complete all {totalLessons} lessons and pass every quiz to unlock your Certificate of Completion.
            </p>
            
            {/* Progress Bars */}
            <div className="flex flex-col gap-3 mb-6">
              {/* Lessons Progress */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3.5 mb-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#3466F6] flex items-center justify-center shrink-0">
                    <BookOpenIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 flex justify-between items-center mt-1">
                    <span className="font-bold text-[#0F172A] text-[13px]">Lessons Progress</span>
                    <span className="font-bold text-[#3466F6] text-[13px]">{completedLessons} / {totalLessons} Completed</span>
                  </div>
                </div>
                <div className="ml-[54px] h-2 bg-slate-100 rounded-full overflow-hidden mr-2">
                  <div className="h-full bg-[#3466F6] rounded-full transition-all duration-1000" style={{ width: `${(completedLessons / totalLessons) * 100}%` }}></div>
                </div>
              </div>
              
              {/* Quiz Progress */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3.5 mb-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
                    <ClipboardListIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 flex justify-between items-center mt-1">
                    <span className="font-bold text-[#0F172A] text-[13px]">Quiz Progress</span>
                    <span className="font-bold text-[#10B981] text-[13px]">{quizzesPassed} / {totalQuizzes} Passed</span>
                  </div>
                </div>
                <div className="ml-[54px] h-2 bg-slate-100 rounded-full overflow-hidden mr-2">
                  <div className="h-full bg-[#10B981] rounded-full transition-all duration-1000" style={{ width: `${(quizzesPassed / totalQuizzes) * 100}%` }}></div>
                </div>
              </div>
            </div>
            
            {/* Keep Going Card */}
            <div className="bg-[#EFF6FF] rounded-2xl p-4 border border-blue-50 flex items-start gap-3.5 mb-8">
              <div className="w-10 h-10 rounded-full bg-white text-[#3466F6] flex items-center justify-center shrink-0 shadow-sm border border-blue-50">
                <StarIcon className="w-5 h-5" />
              </div>
              <div className="mt-0.5">
                <h4 className="font-bold text-[#0F172A] text-[13px] mb-1">Keep Going!</h4>
                <p className="text-[12px] text-slate-500 leading-relaxed pr-2">
                  You're doing great. Just a little more effort and your certificate will be yours!
                </p>
              </div>
            </div>
            
            {/* Action Area */}
            <div className="flex flex-col items-center w-full">
              <button 
                onClick={onContinue}
                className="bg-[#2563EB] text-white font-bold text-sm px-6 py-4 rounded-[14px] hover:bg-blue-700 transition-all w-full flex items-center justify-center gap-2 mb-3 shadow-sm hover:shadow-md"
              >
                <BookOpenIcon className="w-4 h-4 mr-1" /> Continue Learning <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
              <p className="text-[11px] text-slate-400">We'll take you to your next lesson</p>
            </div>
            
          </div>
        </div>
        </div>
      </div>
    );
  }

  // Certificate Render Template
  const CertificateTemplate = ({ id = "preview" }: { id?: string }) => (
    <div id={id} className="relative w-[1100px] h-[800px] bg-white overflow-hidden shrink-0" ref={id === "download" ? certificateRef : null}>
      {/* Background Frame Elements */}
      <div className="absolute inset-0 border-[20px] border-[#F8FAFC]"></div>
      <div className="absolute inset-4 border-2 border-amber-400/30"></div>
      
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#0F172A] -translate-x-1/2 -translate-y-1/2 rotate-45 border-b-[8px] border-amber-400 shadow-xl"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#0F172A] translate-x-1/2 translate-y-1/2 rotate-45 border-t-[8px] border-amber-400 shadow-xl"></div>
      
      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-16 text-center z-10">
        {/* Header Logo */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-[#3466F6] rounded-2xl flex items-center justify-center">
            <BrainCircuitIcon className="w-10 h-10 text-white" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-2xl font-black tracking-[0.15em] text-[#0F172A] font-serif leading-none">SYLLOSPHERE</span>
            <span className="text-sm font-bold tracking-[0.2em] text-[#3466F6]">LEARNING PLATFORM</span>
          </div>
        </div>
        
        {/* Title */}
        <h1 className="text-6xl font-serif text-[#0F172A] tracking-widest mb-2 font-black">CERTIFICATE</h1>
        <h2 className="text-2xl font-bold tracking-[0.3em] text-[#64748B] mb-12">OF COMPLETION</h2>
        
        <p className="text-lg font-medium text-slate-500 mb-6">This is to certify that</p>
        
        {/* Student Name */}
        <div className="text-7xl font-serif italic text-[#3466F6] mb-8 border-b border-slate-200 pb-4 px-20">
          {userName}
        </div>
        
        <p className="text-lg font-medium text-slate-500 mb-4">has successfully completed</p>
        
        {/* Course Name */}
        <h3 className="text-3xl font-extrabold text-[#3466F6] uppercase tracking-widest mb-16">
          {certificateData?.course_name || 'SYLLOGISM COURSE'}
        </h3>
        
        {/* Footer Grid */}
        <div className="w-full flex justify-between items-end px-20">
          {/* Left Footer - Date & Signature */}
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Completion Date</p>
              <p className="text-xl font-bold text-[#0F172A]">{formatDate(certificateData?.completion_date)}</p>
            </div>
            <div className="text-center mt-4 border-t border-slate-300 pt-3 w-48">
              <p className="font-bold text-[#0F172A]">Syllosphere Team</p>
              <p className="text-sm text-slate-500">Instructor</p>
            </div>
          </div>
          
          {/* Center Badge */}
          <div className="w-40 h-40 relative">
            <div className="absolute inset-0 bg-[#0F172A] rounded-full flex items-center justify-center border-[6px] border-amber-400 shadow-lg z-10">
              <BrainCircuitIcon className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -bottom-8 left-4 w-12 h-20 bg-[#3466F6] rotate-[15deg]"></div>
            <div className="absolute -bottom-8 right-4 w-12 h-20 bg-[#3466F6] -rotate-[15deg]"></div>
          </div>
          
          {/* Right Footer - ID */}
          <div className="flex flex-col items-center gap-6">
             <div className="text-center">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Certificate ID</p>
              <p className="text-xl font-bold text-[#0F172A]">{certificateData?.certificate_id}</p>
            </div>
            <div className="h-16"></div> {/* Spacer to align with signature */}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans relative overflow-x-hidden flex flex-col pb-20 md:pb-0">
      <Header userName={userName} isAdmin={isAdmin} />

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-6 md:pt-12 pb-12 flex flex-col">
        {/* Page Title */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#0F172A] mb-1.5 tracking-tight">Your Certificate</h1>
          <p className="text-[14px] md:text-[15px] text-slate-500 font-medium">
            Congratulations! You have successfully completed the {certificateData?.course_name || 'Syllogism'} Course.
          </p>
        </div>

        {/* Main Certificate Card (CSS Grid for perfect mobile reordering) */}
        <div className="bg-white rounded-[24px] p-5 lg:p-8 xl:p-10 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 grid grid-cols-1 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px] gap-y-6 lg:gap-y-8 gap-x-8 lg:gap-x-12 w-full">
          
          {/* Cell 1: Certificate Preview (Top on Mobile, Left on Desktop) */}
          <div className="flex flex-col w-full min-w-0 order-1 lg:col-start-1 lg:row-start-1">
            <h3 className="text-[16px] md:text-[18px] font-bold text-[#0F172A] mb-4">Certificate Preview</h3>
            
            {/* Dynamic Scaling Container for Preview (Zero Grey Space) */}
            <div 
              ref={previewContainerRef}
              className="w-full flex items-start justify-start overflow-hidden border border-slate-100 rounded-xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.08)] bg-white"
              style={{ height: `${800 * scale}px` }}
            >
              <div 
                className="relative origin-top-left"
                style={{ transform: `scale(${scale})`, width: '1100px', height: '800px' }}
              >
                {CertificateTemplate({ id: "preview" })}
              </div>
            </div>
          </div>

          {/* Cell 2: Details List (Middle on Mobile, Right on Desktop) */}
          <div className="w-full flex flex-col order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 pt-2 lg:pt-0">
            <h3 className="text-[16px] md:text-[18px] font-bold text-[#0F172A] mb-2 lg:mb-4">Certificate Details</h3>
            
            <div className="flex flex-col flex-1">
              {/* Detail Row: Student Name */}
              <div className="flex items-center gap-4 py-3.5 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#3466F6] flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-slate-500 mb-0.5">Student Name</p>
                  <p className="font-bold text-[#0F172A] text-[15px] leading-tight">{userName}</p>
                </div>
              </div>

              {/* Detail Row: Course Name */}
              <div className="flex items-center gap-4 py-3.5 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#3466F6] flex items-center justify-center shrink-0">
                  <BookOpenIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-slate-500 mb-0.5">Course Name</p>
                  <p className="font-bold text-[#0F172A] text-[15px] leading-tight">{certificateData?.course_name || 'Syllogism'}</p>
                </div>
              </div>

              {/* Detail Row: Completion Date */}
              <div className="flex items-center gap-4 py-3.5 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#3466F6] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-slate-500 mb-0.5">Completion Date</p>
                  <p className="font-bold text-[#0F172A] text-[15px] leading-tight">{formatDate(certificateData?.completion_date)}</p>
                </div>
              </div>

              {/* Detail Row: Certificate ID */}
              <div className="flex items-center gap-4 py-3.5 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#3466F6] flex items-center justify-center shrink-0">
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-slate-500 mb-0.5">Certificate ID</p>
                  <p className="font-bold text-[#0F172A] text-[15px] leading-tight break-all">{certificateData?.certificate_id}</p>
                </div>
              </div>

              {/* Detail Row: Issued By */}
              <div className="flex items-center gap-4 py-3.5">
                <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#3466F6] flex items-center justify-center shrink-0">
                  <AwardIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-slate-500 mb-0.5">Issued By</p>
                  <p className="font-bold text-[#0F172A] text-[15px] leading-tight">{certificateData?.issued_by || 'Syllosphere Learning Platform'}</p>
                </div>
              </div>
            </div>

            {/* Verified Badge */}
            <div className="bg-[#ECFDF5] rounded-[16px] p-4 flex items-start gap-3 mt-4 lg:mt-6 border border-[#D1FAE5]/50">
              <CheckCircleIcon className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-[#065F46] text-[13px] mb-1 leading-tight">Verified Certificate</h4>
                <p className="text-[12px] text-[#047857] leading-relaxed">
                  This certificate is valid and issued by Syllosphere Learning Platform.
                </p>
              </div>
            </div>
          </div>

          {/* Cell 3: Action Buttons (Bottom on Mobile, Left-Under-Preview on Desktop) */}
          <div className="flex flex-row gap-3 w-full order-3 lg:col-start-1 lg:row-start-2 mt-2 lg:mt-auto">
            <button 
              onClick={() => setIsPreviewOpen(true)}
              disabled={isDownloading}
              className={`flex-1 bg-white border border-[#E2E8F0] text-[#3466F6] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all text-[14px] md:text-[15px] shadow-sm ${isDownloading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-200 hover:bg-slate-50'}`}
            >
              <EyeIcon className="w-5 h-5" /> Preview
            </button>
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className={`flex-1 bg-[#3466F6] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-[14px] md:text-[15px] shadow-sm ${isDownloading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <ArrowLeftIcon className="w-5 h-5 rotate-[-90deg]" /> Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div 
            className="relative w-full h-full max-w-[1200px] flex flex-col items-center justify-center overflow-auto touch-pan-x touch-pan-y"
            ref={modalContainerRef}
            onClick={(e) => e.stopPropagation()} 
          >
            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 right-4 md:right-0 text-white/70 hover:text-white flex items-center gap-2 font-bold z-10 transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full"
            >
              Close <XCircleIcon className="w-6 h-6" />
            </button>
            
            <div 
              className="relative origin-center bg-transparent transition-transform duration-300 ease-out"
              style={{ transform: `scale(${modalScale})`, width: '1100px', height: '800px' }}
            >
              <div className="w-full h-full shadow-2xl rounded-[4px] overflow-hidden bg-white">
                <CertificateTemplate id="modal-preview" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificate;
