/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Download, 
  TrendingDown, 
  Users, 
  Clock, 
  DollarSign, 
  PieChart,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Share2,
  FileText,
  Calendar,
  Mail,
  X,
  Printer,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Inputs {
  annualToolCost: number;
  trainingHours: number;
  staffTrained: number;
  hourlyCost: number;
  intendedUsers: number;
  activeUsers: number;
}

export default function App() {
  const [inputs, setInputs] = useState<Inputs>({
    annualToolCost: 50000,
    trainingHours: 5,
    staffTrained: 20,
    hourlyCost: 350,
    intendedUsers: 100,
    activeUsers: 60,
  });

  const [showReport, setShowReport] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: Math.max(0, parseFloat(value) || 0),
    }));
  };

  const results = useMemo(() => {
    const { 
      annualToolCost, 
      trainingHours, 
      staffTrained, 
      hourlyCost, 
      intendedUsers, 
      activeUsers 
    } = inputs;

    const adoptionRate = intendedUsers === 0 ? 0 : activeUsers / intendedUsers;
    const unusedToolCost = annualToolCost * (1 - adoptionRate);
    const trainingInvestment = trainingHours * staffTrained * hourlyCost;
    const wastedTrainingCost = trainingInvestment * (1 - adoptionRate);
    const totalInvestment = annualToolCost + trainingInvestment;
    const estimatedFinancialLoss = unusedToolCost + wastedTrainingCost;

    // Projections
    const loss3Year = estimatedFinancialLoss * 3;
    const loss5Year = estimatedFinancialLoss * 5;

    return {
      adoptionRate,
      unusedToolCost,
      trainingInvestment,
      wastedTrainingCost,
      totalInvestment,
      estimatedFinancialLoss,
      loss3Year,
      loss5Year
    };
  }, [inputs]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(value);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    const data = [
      ["EdTech Adoption Loss Calculator", ""],
      ["", ""],
      ["INPUTS", ""],
      ["Annual EdTech Tool Cost (R)", inputs.annualToolCost],
      ["Training Hours per Staff Member", inputs.trainingHours],
      ["Number of Staff Trained", inputs.staffTrained],
      ["Average Staff Hourly Cost (R)", inputs.hourlyCost],
      ["Intended Users", inputs.intendedUsers],
      ["Active Users", inputs.activeUsers],
      ["", ""],
      ["CALCULATIONS", ""],
      ["Adoption Rate", `${(results.adoptionRate * 100).toFixed(1)}%`],
      ["Unused Tool Cost (R)", results.unusedToolCost.toFixed(2)],
      ["Training Investment (R)", results.trainingInvestment.toFixed(2)],
      ["Wasted Training Cost (R)", results.wastedTrainingCost.toFixed(2)],
      ["Total Investment (R)", results.totalInvestment.toFixed(2)],
      ["Estimated Financial Loss (R)", results.estimatedFinancialLoss.toFixed(2)],
      ["", ""],
      ["PROJECTIONS (If adoption remains unchanged)", ""],
      ["3-Year Cumulative Loss (R)", results.loss3Year.toFixed(2)],
      ["5-Year Cumulative Loss (R)", results.loss5Year.toFixed(2)],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 35 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws, "Adoption Calculator");
    XLSX.writeFile(wb, "edtech_adoption_loss_calculator.xlsx");
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("EdTech Adoption Loss Report", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    autoTable(doc, {
      startY: 40,
      head: [['Category', 'Value']],
      body: [
        ['Annual Tool Cost', formatCurrency(inputs.annualToolCost)],
        ['Training Investment', formatCurrency(results.trainingInvestment)],
        ['Total Annual Investment', formatCurrency(results.totalInvestment)],
        ['Adoption Rate', `${(results.adoptionRate * 100).toFixed(1)}%`],
        ['Annual Financial Loss', formatCurrency(results.estimatedFinancialLoss)],
        ['3-Year Projected Loss', formatCurrency(results.loss3Year)],
        ['5-Year Projected Loss', formatCurrency(results.loss5Year)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save("edtech_adoption_report.pdf");
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("EdTech Adoption Loss Report Summary");
    const body = encodeURIComponent(
      `EdTech Adoption Loss Report Summary\n` +
      `-----------------------------------\n` +
      `Adoption Rate: ${(results.adoptionRate * 100).toFixed(1)}%\n` +
      `Annual Financial Loss: ${formatCurrency(results.estimatedFinancialLoss)}\n` +
      `Total Annual Investment: ${formatCurrency(results.totalInvestment)}\n\n` +
      `Projections (if adoption remains unchanged):\n` +
      `- 3-Year Cumulative Loss: ${formatCurrency(results.loss3Year)}\n` +
      `- 5-Year Cumulative Loss: ${formatCurrency(results.loss5Year)}\n\n` +
      `Generated via EdTech Adoption Loss Calculator.`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              EdTech <span className="text-indigo-600">Adoption</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReport(true)}
              className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg transition-all active:scale-95 font-medium text-sm shadow-sm"
            >
              <FileText className="w-4 h-4" />
              View Report
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-all active:scale-95 font-medium text-sm shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Inputs Section */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-indigo-500" />
                  Calculator Inputs
                </h2>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Step 01</span>
              </div>
              
              <div className="p-6 space-y-5">
                <InputGroup
                  label="Annual EdTech Tool Cost"
                  name="annualToolCost"
                  value={inputs.annualToolCost}
                  onChange={handleInputChange}
                  icon={<DollarSign className="w-4 h-4" />}
                  suffix="R"
                  description="Total yearly subscription or license cost"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup
                    label="Training Hours"
                    name="trainingHours"
                    value={inputs.trainingHours}
                    onChange={handleInputChange}
                    icon={<Clock className="w-4 h-4" />}
                    suffix="hrs"
                    description="Per staff member"
                  />
                  <InputGroup
                    label="Staff Trained"
                    name="staffTrained"
                    value={inputs.staffTrained}
                    onChange={handleInputChange}
                    icon={<Users className="w-4 h-4" />}
                    suffix="qty"
                    description="Total headcount"
                  />
                </div>

                <InputGroup
                  label="Average Staff Hourly Cost"
                  name="hourlyCost"
                  value={inputs.hourlyCost}
                  onChange={handleInputChange}
                  icon={<DollarSign className="w-4 h-4" />}
                  suffix="R/hr"
                  description="Including benefits and overhead"
                />

                <div className="pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup
                      label="Intended Users"
                      name="intendedUsers"
                      value={inputs.intendedUsers}
                      onChange={handleInputChange}
                      icon={<Users className="w-4 h-4" />}
                      description="Target population"
                    />
                    <InputGroup
                      label="Active Users"
                      name="activeUsers"
                      value={inputs.activeUsers}
                      onChange={handleInputChange}
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      description="Current usage"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-sm text-indigo-900 leading-relaxed">
                  <p className="font-semibold mb-1">Why this matters</p>
                  Low adoption doesn't just mean unused software; it represents a sunk cost in both capital and human resources. This calculator helps quantify the "invisible" loss of training time.
                </div>
              </div>
            </div>
          </div>

          {/* Results & Projections Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResultCard 
                title="Adoption Rate"
                value={`${(results.adoptionRate * 100).toFixed(1)}%`}
                subtitle="of intended users are active"
                icon={<PieChart className="w-5 h-5" />}
                color="indigo"
                progress={results.adoptionRate}
              />
              <ResultCard 
                title="Financial Loss"
                value={formatCurrency(results.estimatedFinancialLoss)}
                subtitle="Estimated total wasted investment"
                icon={<TrendingDown className="w-5 h-5" />}
                color="rose"
                highlight
              />
            </div>

            {/* Projections Section */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Long-term Projections
                </h2>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider text-rose-500">Risk Analysis</span>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-500 mb-6">
                  Cumulative financial loss if adoption rates remain at <span className="font-bold text-slate-900">{(results.adoptionRate * 100).toFixed(1)}%</span> over the next few years.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">3 Year Projection</span>
                      <TrendingDown className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(results.loss3Year)}</div>
                    <div className="mt-2 text-[10px] text-slate-400 font-medium uppercase">Cumulative Sunk Cost</div>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">5 Year Projection</span>
                      <TrendingDown className="w-4 h-4 text-rose-600" />
                    </div>
                    <div className="text-2xl font-bold text-rose-700">{formatCurrency(results.loss5Year)}</div>
                    <div className="mt-2 text-[10px] text-rose-400 font-medium uppercase">Cumulative Sunk Cost</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-indigo-500" />
                  Detailed Breakdown
                </h2>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Step 02</span>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <BreakdownRow 
                    label="Total Investment" 
                    value={formatCurrency(results.totalInvestment)} 
                    description="Tool Cost + Training Investment"
                  />
                  <BreakdownRow 
                    label="Training Investment" 
                    value={formatCurrency(results.trainingInvestment)} 
                    description="Cost of staff time spent in training"
                  />
                  <div className="h-px bg-slate-100 my-4" />
                  <BreakdownRow 
                    label="Unused Tool Cost" 
                    value={formatCurrency(results.unusedToolCost)} 
                    description="License cost for non-active users"
                    isLoss
                  />
                  <BreakdownRow 
                    label="Wasted Training Cost" 
                    value={formatCurrency(results.wastedTrainingCost)} 
                    description="Training value lost to non-adoption"
                    isLoss
                  />
                </div>

                <div className="mt-8 p-6 bg-slate-900 rounded-xl text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Impact Summary</span>
                    <TrendingDown className="w-5 h-5 text-rose-400" />
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {formatCurrency(results.estimatedFinancialLoss)}
                  </p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    You are losing <span className="text-white font-medium">{( (1 - results.adoptionRate) * 100 ).toFixed(1)}%</span> of your total investment due to adoption gaps.
                  </p>
                </div>
              </div>
            </section>
          </div>

        </div>
      </main>

      {/* Report Modal */}
      <AnimatePresence>
        {showReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReport(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900">Adoption Loss Report</h3>
                </div>
                <button 
                  onClick={() => setShowReport(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto max-h-[70vh]">
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Executive Summary</p>
                      <h4 className="text-2xl font-bold text-slate-900">Financial Impact Analysis</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                        results.adoptionRate > 0.7 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {results.adoptionRate > 0.7 ? "Healthy Adoption" : "Critical Loss Risk"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs font-medium text-slate-400 mb-1">Adoption Rate</p>
                      <p className="text-xl font-bold text-slate-900">{(results.adoptionRate * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400 mb-1">Annual Loss</p>
                      <p className="text-xl font-bold text-rose-600">{formatCurrency(results.estimatedFinancialLoss)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400 mb-1">Total Investment</p>
                      <p className="text-xl font-bold text-slate-900">{formatCurrency(results.totalInvestment)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Future Projections</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-sm font-medium text-slate-600">3-Year Cumulative Loss</span>
                        <span className="text-sm font-bold text-slate-900">{formatCurrency(results.loss3Year)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-100">
                        <span className="text-sm font-medium text-rose-700">5-Year Cumulative Loss</span>
                        <span className="text-sm font-bold text-rose-700">{formatCurrency(results.loss5Year)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Recommendation</p>
                    <p className="text-sm text-indigo-900 leading-relaxed">
                      Increasing adoption by just <span className="font-bold">10%</span> would recover approximately <span className="font-bold">{formatCurrency(results.totalInvestment * 0.1)}</span> in annual value. Focus on targeted retraining for non-active users.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={generatePDF}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-200"
                >
                  <Download className="w-4 h-4" />
                  Download PDF Report
                </button>
                <button 
                  onClick={shareViaEmail}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all active:scale-95"
                >
                  <Mail className="w-4 h-4" />
                  Share via Email
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Floating Action Button */}
      <div className="sm:hidden fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => setShowReport(true)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-xl shadow-indigo-200 active:scale-90 transition-transform"
        >
          <FileText className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

function InputGroup({ 
  label, 
  name, 
  value, 
  onChange, 
  icon, 
  suffix, 
  description 
}: { 
  label: string; 
  name: string; 
  value: number; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  suffix?: string;
  description?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700 block">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            {icon}
          </div>
        )}
        <input
          type="number"
          name={name}
          value={value === 0 ? '' : value}
          onChange={onChange}
          className={cn(
            "w-full bg-white border border-slate-200 rounded-xl py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all",
            icon ? "pl-10" : "pl-4",
            suffix ? "pr-12" : "pr-4"
          )}
          placeholder="0"
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
      {description && (
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tight pl-1">
          {description}
        </p>
      )}
    </div>
  );
}

function ResultCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  highlight,
  progress
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: React.ReactNode;
  color: 'indigo' | 'rose';
  highlight?: boolean;
  progress?: number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-2xl border transition-all",
        color === 'indigo' ? "bg-white border-slate-200" : "bg-rose-50 border-rose-100 shadow-sm shadow-rose-100/50",
        highlight && "ring-2 ring-rose-500/10"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "p-2 rounded-lg",
          color === 'indigo' ? "bg-indigo-50 text-indigo-600" : "bg-white text-rose-600 shadow-sm"
        )}>
          {icon}
        </div>
        {progress !== undefined && (
          <div className="text-xs font-bold text-slate-400">
            {Math.round(progress * 100)}%
          </div>
        )}
      </div>
      <h3 className={cn(
        "text-sm font-semibold mb-1",
        color === 'indigo' ? "text-slate-500" : "text-rose-600"
      )}>
        {title}
      </h3>
      <div className={cn(
        "text-3xl font-bold tracking-tight mb-1",
        color === 'indigo' ? "text-slate-900" : "text-rose-700"
      )}>
        {value}
      </div>
      <p className="text-xs text-slate-400 font-medium">
        {subtitle}
      </p>

      {progress !== undefined && (
        <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            className="h-full bg-indigo-500"
          />
        </div>
      )}
    </motion.div>
  );
}

function BreakdownRow({ 
  label, 
  value, 
  description, 
  isLoss 
}: { 
  label: string; 
  value: string; 
  description: string;
  isLoss?: boolean;
}) {
  return (
    <div className="flex items-center justify-between group">
      <div>
        <div className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
          {label}
        </div>
        <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
          {description}
        </div>
      </div>
      <div className={cn(
        "text-base font-bold",
        isLoss ? "text-rose-600" : "text-slate-900"
      )}>
        {value}
      </div>
    </div>
  );
}
