import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';
import {
  TrendingUp, TrendingDown, Activity, Target, Filter,
  ChevronDown, X, Download, Grid, LineChart as LineIcon,
  Sparkles
} from "lucide-react";

// Sample data
const ALL_YEARS = ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
const EXAM_STAGES = ['Prelims', 'Mains'];
const PAPERS = {
  Prelims: ['GS Paper 1', 'GS Paper 2 (CSAT)'],
  Mains: ['GS Paper 1', 'GS Paper 2', 'GS Paper 3', 'GS Paper 4', 'Optional'],
};
const YEAR_RANGES = ['Only 2025', 'Last 5 Years', 'Last 10 Years', 'All Years (2013-2025)', 'Custom Range'];

type HubView = 'pilot' | 'overview' | 'focused' | 'forecast' | 'compare';
type HeatmapPalette = 'spectral' | 'ocean' | 'sunset' | 'forest';

const SUBJECTS = [
  'Polity & Governance', 'Economy', 'Environment & Ecology',
  'Science & Technology', 'Geography', 'History & Culture',
  'International Relations', 'Internal Security', 'Ethics', 'CSAT'
];

const trendData = [
  { year: '2016', polity: 20, economy: 48, environment: 22 },
  { year: '2017', polity: 27, economy: 39, environment: 20 },
  { year: '2018', polity: 18, economy: 48, environment: 21 },
  { year: '2019', polity: 23, economy: 38, environment: 25 },
  { year: '2020', polity: 34, economy: 43, environment: 21 },
  { year: '2021', polity: 33, economy: 33, environment: 27 },
  { year: '2022', polity: 38, economy: 40, environment: 30 },
  { year: '2023', polity: 45, economy: 35, environment: 35 },
  { year: '2024', polity: 42, economy: 38, environment: 32 },
  { year: '2025', polity: 48, economy: 42, environment: 38 },
];

const distributionData = [
  { name: 'Polity & Governance', value: 245 },
  { name: 'Economy', value: 198 },
  { name: 'Environment & Ecology', value: 176 },
  { name: 'Science & Technology', value: 154 },
  { name: 'Geography', value: 132 },
  { name: 'Others', value: 95 },
];

const COLORS = ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];

export const PYQAnalysis = () => {
  const [activeHub, setActiveHub] = useState<HubView>('pilot');
  const [examStage, setExamStage] = useState('Prelims');
  const [selectedPaper, setSelectedPaper] = useState('GS Paper 1');
  const [yearRange, setYearRange] = useState('Last 10 Years');
  const [customYearStart, setCustomYearStart] = useState('2016');
  const [customYearEnd, setCustomYearEnd] = useState('2025');
  const [showFilters, setShowFilters] = useState(true);

  const [heatmapPalette, setHeatmapPalette] = useState<HeatmapPalette>('spectral');
  const [pilotSubject, setPilotSubject] = useState<string | null>(null);
  const [pilotSection, setPilotSection] = useState<string | null>(null);

  const subjectHeatmapData = useMemo(() => {
    return SUBJECTS.slice(0, 12).map(subject => {
      const row: any = { subject };
      ALL_YEARS.forEach(year => {
        row[year] = Math.floor(Math.random() * 18) + 2;
      });
      return row;
    });
  }, []);

  const sectionData = useMemo(() => {
    if (!pilotSubject) return [];
    return [
      { name: 'Constitutional Framework', value: 85, '2023': 8, '2024': 9, '2025': 10 },
      { name: 'Governance', value: 72, '2023': 7, '2024': 8, '2025': 8 },
      { name: 'Rights & Duties', value: 58, '2023': 5, '2024': 6, '2025': 7 },
      { name: 'Parliament', value: 45, '2023': 4, '2024': 5, '2025': 5 },
    ];
  }, [pilotSubject]);

  const microTopicData = useMemo(() => {
    if (!pilotSection) return [];
    return [
      { name: 'Fundamental Rights', value: 32 },
      { name: 'Constitutional Amendments', value: 28 },
      { name: 'Federal Structure', value: 24 },
      { name: 'Judicial Review', value: 18 },
    ];
  }, [pilotSection]);

  const getHeatmapBgStyle = (value: number, max: number = 22): React.CSSProperties => {
    if (!value) return { backgroundColor: 'rgba(241, 245, 249, 0.4)' };
    const ratio = Math.min(1, value / max);

    if (heatmapPalette === 'spectral') {
      const h = 70 + (ratio * 155);
      const s = 65 + (ratio * 25);
      const l = 85 - (ratio * 55);
      return { backgroundColor: `hsl(${h}, ${s}%, ${l}%)` };
    } else if (heatmapPalette === 'ocean') {
      const h = 210 + (ratio * 15);
      const s = 60 + (ratio * 35);
      const l = 90 - (ratio * 65);
      return { backgroundColor: `hsl(${h}, ${s}%, ${l}%)` };
    } else if (heatmapPalette === 'sunset') {
      const h = 10 + (ratio * 20);
      const s = 75 + (ratio * 20);
      const l = 80 - (ratio * 55);
      return { backgroundColor: `hsl(${h}, ${s}%, ${l}%)` };
    } else {
      const h = 100 + (ratio * 80);
      const s = 40 + (ratio * 45);
      const l = 80 - (ratio * 50);
      return { backgroundColor: `hsl(${h}, ${s}%, ${l}%)` };
    }
  };

  const getHeatmapTextColor = (value: number, max: number = 22) => {
    if (!value) return 'text-slate-400';
    const ratio = Math.min(1, value / max);
    const lightness = 85 - (ratio * 55);
    return lightness < 55 ? 'text-white' : 'text-slate-900';
  };

  const HeatmapTable = ({
    data,
    title,
    years,
    onRowClick,
    onCellClick,
    compact = false
  }: {
    data: any[],
    title: string,
    years: string[],
    onRowClick?: (label: string) => void,
    onCellClick?: (label: string, year: string) => void,
    compact?: boolean
  }) => (
    <div className="backdrop-blur-xl bg-white/40 border border-white/20 rounded-3xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>

      {!compact && (
        <div className="mb-4 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
          <p className="text-xs text-blue-900 font-semibold">
            💡 Click subject names to drill down • Click cells to view questions
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="flex items-center border-b border-slate-200/50 pb-3 mb-2 sticky top-0 bg-white/50 backdrop-blur-sm z-10">
            <div className="w-48 px-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</span>
            </div>
            {years.map(year => (
              <div key={year} className="w-20 text-center">
                <span className="text-xs font-bold text-slate-600">{year}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {data.map((row, idx) => (
              <div key={idx} className="flex items-center hover:bg-white/30 rounded-xl transition-all duration-200 py-1">
                <div className="w-48 px-3">
                  <button
                    onClick={() => onRowClick?.(row.subject)}
                    className="text-left text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors w-full"
                  >
                    {row.subject}
                  </button>
                </div>
                {years.map(year => {
                  const value = row[year] || 0;
                  return (
                    <div key={year} className="w-20 px-1">
                      <button
                        onClick={() => onCellClick?.(row.subject, year)}
                        className={`w-full h-14 rounded-xl flex items-center justify-center font-extrabold text-sm transition-all hover:scale-105 hover:shadow-lg ${getHeatmapTextColor(value)}`}
                        style={getHeatmapBgStyle(value)}
                      >
                        {value || ''}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto p-6 lg:p-12 pb-24 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">PYQ Analysis</h1>
            <p className="text-slate-500 text-lg mt-2">Comprehensive analysis to optimize your UPSC strategy</p>
          </div>
          <button className="backdrop-blur-xl bg-white/40 border border-white/20 rounded-2xl px-6 py-3 font-bold text-sm text-slate-700 hover:bg-white/60 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="backdrop-blur-xl bg-white/40 border border-white/20 rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters & Configuration
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-slate-600 hover:text-slate-900 lg:hidden"
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className={`space-y-6 ${showFilters || 'hidden lg:block'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stage</label>
              <select
                value={examStage}
                onChange={(e) => {
                  setExamStage(e.target.value);
                  setSelectedPaper(PAPERS[e.target.value as keyof typeof PAPERS][0]);
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/30 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm"
              >
                {EXAM_STAGES.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paper</label>
              <select
                value={selectedPaper}
                onChange={(e) => setSelectedPaper(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/30 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm"
              >
                {PAPERS[examStage as keyof typeof PAPERS].map(paper => (
                  <option key={paper} value={paper}>{paper}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Year Range</label>
              <select
                value={yearRange}
                onChange={(e) => setYearRange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/30 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm"
              >
                {YEAR_RANGES.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
          </div>

          {yearRange === 'Custom Range' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">From Year</label>
                <input
                  type="number"
                  value={customYearStart}
                  onChange={(e) => setCustomYearStart(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/30 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="2016"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">To Year</label>
                <input
                  type="number"
                  value={customYearEnd}
                  onChange={(e) => setCustomYearEnd(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/30 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="2025"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-white/30">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
              Heatmap Color Theme
            </label>
            <div className="flex flex-wrap gap-2">
              {(['spectral', 'ocean', 'sunset', 'forest'] as HeatmapPalette[]).map(palette => (
                <button
                  key={palette}
                  onClick={() => setHeatmapPalette(palette)}
                  className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all ${
                    heatmapPalette === palette
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-white/50 text-slate-700 hover:bg-white/70'
                  }`}
                >
                  {palette}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hub Navigation */}
      <div className="flex flex-wrap gap-3">
        {[
          { key: 'pilot', label: 'Deep Dive', icon: Target },
          { key: 'overview', label: 'Overview', icon: TrendingUp },
          { key: 'focused', label: 'Focused Trend', icon: LineIcon },
          { key: 'forecast', label: 'Forecast 2026', icon: Sparkles },
          { key: 'compare', label: 'Compare', icon: Grid },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveHub(key as HubView)}
            className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all ${
              activeHub === key
                ? 'bg-slate-900 text-white shadow-xl scale-105'
                : 'backdrop-blur-xl bg-white/40 border border-white/20 text-slate-700 hover:bg-white/60'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Hub Content */}
      {activeHub === 'pilot' && (
        <div className="space-y-6">
          <HeatmapTable
            data={subjectHeatmapData}
            title="1. Global Subject × Year Heatmap"
            years={ALL_YEARS}
            onRowClick={(subject) => {
              setPilotSubject(subject);
              setPilotSection(null);
            }}
            onCellClick={(subject, year) => {
              console.log(`Navigate to ${subject} questions from ${year}`);
            }}
          />

          {pilotSubject && (
            <div className="backdrop-blur-xl bg-white/40 border border-white/20 rounded-3xl p-6 shadow-lg space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{pilotSubject} Deep Dive</h3>
                  <p className="text-sm text-slate-600 mt-1">Section groups and micro-topics breakdown</p>
                </div>
                <button
                  onClick={() => {
                    setPilotSubject(null);
                    setPilotSection(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm flex items-center gap-2 transition-all"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">2. Section Groups</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sectionData.map((section, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPilotSection(section.name)}
                      className={`p-4 rounded-2xl transition-all text-left ${
                        pilotSection === section.name
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'backdrop-blur-xl bg-white/50 hover:bg-white/70 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm">{section.name}</span>
                        <span className="font-extrabold text-lg">{section.value}</span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className={pilotSection === section.name ? 'text-blue-100' : 'text-slate-500'}>
                          2023: {section['2023']} | 2024: {section['2024']} | 2025: {section['2025']}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {pilotSection && (
                <div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                    3. Micro Topics - {pilotSection}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {microTopicData.map((micro, idx) => (
                      <button
                        key={idx}
                        onClick={() => console.log(`Open questions for ${micro.name}`)}
                        className="p-4 rounded-2xl backdrop-blur-xl bg-white/50 hover:bg-emerald-100 text-slate-800 hover:text-emerald-900 transition-all text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{micro.name}</span>
                          <span className="font-bold text-lg group-hover:text-emerald-700">{micro.value}</span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500 group-hover:text-emerald-600">
                          Click to view questions
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeHub === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900 text-white border-transparent">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-slate-200">Most Asked</span>
                </div>
                <div className="text-2xl font-bold mb-1">Polity & Governance</div>
                <div className="text-sm text-slate-400">245 questions</div>
              </CardContent>
            </Card>

            <Card className="bg-emerald-50 border-emerald-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="font-medium text-emerald-800">Rising</span>
                </div>
                <div className="text-2xl font-bold text-emerald-950 mb-1">Environment Tech</div>
                <div className="text-sm text-emerald-600/80">+40% since 2020</div>
              </CardContent>
            </Card>

            <Card className="bg-rose-50 border-rose-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-rose-100 rounded-xl">
                    <TrendingDown className="w-5 h-5 text-rose-600" />
                  </div>
                  <span className="font-medium text-rose-800">Declining</span>
                </div>
                <div className="text-2xl font-bold text-rose-950 mb-1">World History</div>
                <div className="text-sm text-rose-600/80">Minimal</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 backdrop-blur-xl bg-white/40 border-white/20">
              <CardHeader>
                <CardTitle>10-Year Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPolity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEconomy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEnv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                    <Area type="monotone" dataKey="polity" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorPolity)" />
                    <Area type="monotone" dataKey="economy" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorEconomy)" />
                    <Area type="monotone" dataKey="environment" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorEnv)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/40 border-white/20">
              <CardHeader>
                <CardTitle>Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <span className="text-3xl font-bold text-slate-900">1000</span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Questions</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeHub === 'focused' && (
        <Card className="backdrop-blur-xl bg-white/40 border-white/20">
          <CardHeader>
            <CardTitle>Focused Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Line type="monotone" dataKey="polity" stroke="#0f172a" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="economy" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {activeHub === 'forecast' && (
        <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-purple-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Probable Hot Topics for 2026
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { topic: 'Climate Change & COP', subject: 'Environment', forecast: '8-12', hotScore: 92 },
                { topic: 'Digital Economy', subject: 'Economy', forecast: '6-10', hotScore: 88 },
                { topic: 'Governance Reforms', subject: 'Polity', forecast: '7-11', hotScore: 85 },
              ].map((item, idx) => (
                <div key={idx} className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl p-5">
                  <h4 className="font-bold text-slate-900 text-sm mb-2">{item.topic}</h4>
                  <div className="text-xs text-slate-600 mb-3">{item.subject}</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Forecast:</span>
                    <span className="font-bold text-purple-700">{item.forecast} Qs</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
