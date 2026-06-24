import {
  Search, Bookmark, Clock, ChevronRight, FileText,
  X, Filter as FilterIcon, ChevronDown,
  Check
} from "lucide-react";
import { createPortal } from "react-dom";
import { Input } from "../components/ui/Input";
import { useState, useMemo, useRef, useEffect } from "react";

// ─── 5-Layer Hierarchy ────────────────────────────────────────────────────────
type SubTopics = string[];
type Sections = Record<string, SubTopics>;
type SectionGroups = Record<string, Sections>;
type Subjects = Record<string, SectionGroups>;
type Hierarchy = Record<string, Subjects>;

const HIERARCHY: Hierarchy = {
  GS1: {
    Geography: {
      "Economic & Resource Geography": {
        "Distribution of Key Natural Resources": ["Energy", "Natural Resources Potential"],
        "Factors for Industrial Location": ["Land Use Planning", "Primary Sector", "Secondary Sector", "Tertiary Sector"],
      },
      "Environmental Geography & Climate Dynamics": {
        "Geographical Features & Changes": ["Climate Change", "Cryosphere", "Flora and Fauna", "Water Management", "Miscellaneous"],
      },
      "Physical Geography & Geophysical Phenomena": {
        "Salient Features of World Physical Geography": ["Climatology", "Geomorphology", "Monsoon", "Oceanography"],
        "Important Geophysical Phenomena": ["Aurora", "Cloudbursts", "Cyclone", "Landslides", "Tsunamis", "Twisters", "Volcanic Activity"],
      },
    },
    History: {
      "Art and Culture": {
        "Indian Culture — Salient Aspects": ["Bhakti & Sufi Movement", "Buddhism", "Civilizations & Highlights", "Conservation of Indian Heritage", "Dance Forms", "Indian Philosophy", "Kingdoms & Highlights", "Kings & Contributions", "Literature as Sources", "Rock-cut Architecture", "Sculptures", "Travellers", "Miscellaneous"],
      },
      "Modern History": {
        "Modern Indian History (18th century–Present)": ["Colonial Rule & Impact", "Gandhi & Indian Leaders", "Revolt and Mutiny", "Socio-religious Reform", "Viceroy & Administration"],
        "Freedom Struggle": ["Acts and Their Features", "Important Contributors", "Various Stages of Freedom Struggle"],
      },
      "Post Independence": {
        "Post-Independence Consolidation": ["Consolidation after Independence", "Foreign Influence on Policy", "Land Reform", "Personalities Contribution", "Slogan Based", "States Reorganisation", "Wars after Independence"],
      },
      "World History": {
        "Events from 18th Century Onwards": ["American & French Revolution", "Anti-colonial Struggles", "Great Economic Depression", "Industrial Revolution", "World Wars", "Miscellaneous"],
      },
    },
    Society: {
      "Foundations & Diversity": {
        "Diversity of India": ["Diversity and Pluralism", "Tribes & Related Issues"],
        "Salient Features of Indian Society": ["Family", "Uniqueness of Indian Society"],
      },
      "Gender & Demographics": {
        "Population and Associated Issues": ["Population Dynamics"],
        "Role of Women": ["Women and Associated Concerns"],
      },
      "Poverty, Empowerment & Development": {
        "Social Empowerment, Poverty & Development": ["Development & Related Issues", "Poverty & Related Issues", "Social Empowerment"],
      },
      "Social Dynamics & Ideologies": {
        "Effects of Globalisation": ["Globalisation"],
        "National Integration & Challenges": ["Caste System", "Communalism", "Regionalism", "Secularism", "Miscellaneous"],
      },
      "Urbanisation": {
        "Urbanisation: Problems & Remedies": ["Emerging Urbanisation Trends", "Environmental Issues", "Urban Planning", "Urban Poverty & Migration", "Urban Water Management"],
      },
    },
  },
  GS2: {
    Polity: {
      "Constitutional Framework": {
        "Constitutional Provisions": ["Fundamental Rights", "Directive Principles", "Fundamental Duties"],
        "Constitutional Bodies": ["Election Commission", "CAG", "UPSC", "Finance Commission"],
      },
      "Governance & Administration": {
        "Centre-State Relations": ["Legislative Relations", "Administrative Relations", "Financial Relations"],
        "Local Government": ["Panchayati Raj", "Urban Local Bodies"],
      },
    },
    "International Relations": {
      "India's Foreign Policy": {
        "Bilateral Relations": ["India-US", "India-China", "India-Russia", "India-Pakistan", "India-Bangladesh"],
        "Multilateral Groupings": ["BRICS", "SCO", "SAARC", "G20", "UN System"],
      },
    },
    "Social Justice": {
      "Welfare Schemes": {
        "Government Schemes": ["Health Schemes", "Education Schemes", "Employment Schemes"],
      },
    },
  },
  GS3: {
    Economy: {
      "Indian Economy": {
        "Planning & Development": ["Five Year Plans", "NITI Aayog", "Budget & Fiscal Policy"],
        "Agriculture": ["Cropping Patterns", "Land Reforms", "Food Security", "Agricultural Reforms"],
        "Industry & Infrastructure": ["Industrial Policy", "Infrastructure Development", "Make in India"],
      },
    },
    Environment: {
      "Environment & Ecology": {
        "Biodiversity": ["Hotspots", "Protected Areas", "Species Conservation"],
        "Environmental Issues": ["Pollution", "Climate Change", "Desertification", "Wetlands"],
        "Environmental Laws": ["Environmental Acts", "International Agreements"],
      },
    },
    "Science & Technology": {
      "Technology & Innovation": {
        "Space Technology": ["ISRO Missions", "Satellites", "Space Applications"],
        "Biotechnology": ["Genetic Engineering", "Biofuels", "GMOs"],
        "Defence Technology": ["Missiles", "Nuclear Programme", "Cybersecurity"],
      },
    },
  },
  GS4: {
    Ethics: {
      "Foundations of Ethics": {
        "Ethical Theories": ["Utilitarianism", "Deontology", "Virtue Ethics", "Consequentialism"],
        "Ethics in Public Life": ["Public Service Values", "Integrity", "Impartiality", "Objectivity"],
      },
      "Case Studies": {
        "Administrative Ethics": ["Conflicts of Interest", "Whistleblowing", "Corruption"],
        "Corporate Ethics": ["CSR", "Corporate Governance"],
      },
    },
  },
};

const PAPERS = ["GS1", "GS2", "GS3", "GS4", "Essay", "Optional"];
const INSTITUTES = ["UPSC Official", "Vision IAS", "Insights IAS", "Vajiram", "ForumIAS", "Drishti IAS"];

const questions = [
  { id: 1, title: "Discuss the role of the Election Commission of India in the light of the evolution of the Model Code of Conduct.", paper: "GS2", subject: "Polity", sectionGroup: "Governance & Administration", section: "Centre-State Relations", subTopic: "Legislative Relations", wordLimit: 250, year: 2022, institute: "UPSC Official", isPyq: true },
  { id: 2, title: "How do ocean currents and water masses differ in their impacts on marine life and coastal environment?", paper: "GS1", subject: "Geography", sectionGroup: "Physical Geography & Geophysical Phenomena", section: "Salient Features of World Physical Geography", subTopic: "Oceanography", wordLimit: 150, year: 2019, institute: "UPSC Official", isPyq: true },
  { id: 3, title: "What are the main socio-economic implications arising out of the development of IT industries in major cities of India?", paper: "GS1", subject: "Society", sectionGroup: "Urbanisation", section: "Urbanisation: Problems & Remedies", subTopic: "Emerging Urbanisation Trends", wordLimit: 250, year: 2021, institute: "Vision IAS", isPyq: false },
  { id: 4, title: "Examine the role of 'Gig Economy' in the process of empowerment of women in India.", paper: "GS3", subject: "Economy", sectionGroup: "Indian Economy", section: "Industry & Infrastructure", subTopic: "Industrial Policy", wordLimit: 150, year: 2023, institute: "UPSC Official", isPyq: true },
  { id: 5, title: "Distinguish between religiosity/religiousness and communalism giving one example of how the former can lead to the latter and how it can be prevented.", paper: "GS1", subject: "Society", sectionGroup: "Social Dynamics & Ideologies", section: "National Integration & Challenges", subTopic: "Communalism", wordLimit: 150, year: 2017, institute: "UPSC Official", isPyq: true },
  { id: 6, title: "The Bhakti movement received a remarkable re-orientation with the advent of Sri Chaitanya Mahaprabhu. Discuss.", paper: "GS1", subject: "History", sectionGroup: "Art and Culture", section: "Indian Culture — Salient Aspects", subTopic: "Bhakti & Sufi Movement", wordLimit: 150, year: 2018, institute: "UPSC Official", isPyq: true },
  { id: 7, title: "Discuss the causes of depletion of mangroves and explain their importance in maintaining coastal ecology.", paper: "GS1", subject: "Geography", sectionGroup: "Environmental Geography & Climate Dynamics", section: "Geographical Features & Changes", subTopic: "Flora and Fauna", wordLimit: 150, year: 2019, institute: "UPSC Official", isPyq: true },
  { id: 8, title: "What is the significance of Industrial Corridors in India? Identifying industrial corridors, explain their main characteristics.", paper: "GS3", subject: "Economy", sectionGroup: "Indian Economy", section: "Industry & Infrastructure", subTopic: "Infrastructure Development", wordLimit: 250, year: 2020, institute: "Insights IAS", isPyq: false },
];

// ─── Hierarchy Filter Popover ─────────────────────────────────────────────────
type HierarchySelection = {
  paper?: string;
  subject?: string;
  sectionGroup?: string;
  section?: string;
  subTopic?: string;
};

function HierarchyPanel({
  selection,
  onChange,
  onClose,
  anchorRef,
}: {
  selection: HierarchySelection;
  onChange: (sel: HierarchySelection) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const papers = Object.keys(HIERARCHY);
  const subjects = selection.paper ? Object.keys(HIERARCHY[selection.paper] || {}) : [];
  const sectionGroups = selection.paper && selection.subject
    ? Object.keys(HIERARCHY[selection.paper]?.[selection.subject] || {})
    : [];
  const sections = selection.paper && selection.subject && selection.sectionGroup
    ? Object.keys(HIERARCHY[selection.paper]?.[selection.subject]?.[selection.sectionGroup] || {})
    : [];
  const subTopics = selection.paper && selection.subject && selection.sectionGroup && selection.section
    ? HIERARCHY[selection.paper]?.[selection.subject]?.[selection.sectionGroup]?.[selection.section] || []
    : [];

  const col = (
    label: string,
    items: string[],
    selected: string | undefined,
    onSelect: (v: string | undefined) => void,
    color: string
  ) => (
    <div className="flex flex-col min-w-0 flex-1 border-r border-white/20 last:border-r-0">
      <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${color} border-b border-white/20`}>
        {label}
      </div>
      <div className="flex-1 overflow-y-auto max-h-64">
        {items.length === 0 ? (
          <div className="px-3 py-4 text-[11px] text-slate-400 italic">—</div>
        ) : (
          items.map(item => (
            <button
              key={item}
              onClick={() => onSelect(selected === item ? undefined : item)}
              className={`w-full text-left px-3 py-2 text-[12px] flex items-center gap-2 transition-all hover:bg-white/30 ${
                selected === item ? "bg-blue-50/80 text-blue-700 font-semibold" : "text-slate-700"
              }`}
            >
              <span className="flex-1 leading-tight">{item}</span>
              {selected === item && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
            </button>
          ))
        )}
      </div>
    </div>
  );

  const rect = anchorRef.current?.getBoundingClientRect();
  const top = rect ? rect.bottom + 8 : 120;
  const left = rect ? rect.left : 24;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/10 backdrop-blur-[1px]"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className="fixed z-[9999] rounded-2xl overflow-hidden shadow-2xl border border-white/40 backdrop-blur-2xl bg-white/90"
        style={{ top, left, right: left < window.innerWidth / 2 ? 24 : undefined, maxWidth: "calc(100vw - 48px)" }}
      >
        {/* Breadcrumb header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 flex-wrap">
            {!selection.paper && <span className="text-slate-400 italic">Select a level to drill down</span>}
            {selection.paper && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">{selection.paper}</span>}
            {selection.subject && <><ChevronRight className="w-3 h-3 text-slate-300" /><span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">{selection.subject}</span></>}
            {selection.sectionGroup && <><ChevronRight className="w-3 h-3 text-slate-300" /><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">{selection.sectionGroup}</span></>}
            {selection.section && <><ChevronRight className="w-3 h-3 text-slate-300" /><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">{selection.section}</span></>}
            {selection.subTopic && <><ChevronRight className="w-3 h-3 text-slate-300" /><span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold">{selection.subTopic}</span></>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors ml-3 shrink-0">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Cascading columns */}
        <div className="flex divide-x divide-slate-100 overflow-x-auto" style={{ maxHeight: "50vh" }}>
          {col("Paper", papers, selection.paper, v => onChange({ paper: v }), "text-blue-600")}
          {col("Subject", subjects, selection.subject, v => onChange({ ...selection, subject: v, sectionGroup: undefined, section: undefined, subTopic: undefined }), "text-purple-600")}
          {col("Section Group", sectionGroups, selection.sectionGroup, v => onChange({ ...selection, sectionGroup: v, section: undefined, subTopic: undefined }), "text-amber-600")}
          {col("Section", sections, selection.section, v => onChange({ ...selection, section: v, subTopic: undefined }), "text-emerald-600")}
          {col("Sub-topic", subTopics, selection.subTopic, v => onChange({ ...selection, subTopic: v }), "text-rose-600")}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-white/50 flex justify-between items-center">
          <button onClick={() => onChange({})} className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors">
            Clear
          </button>
          <button onClick={onClose} className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
            Apply
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

// ─── Source Popover ───────────────────────────────────────────────────────────
function SourcePanel({
  selected,
  onChange,
  onClose,
  anchorRef,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const rect = anchorRef.current?.getBoundingClientRect();
  const top = rect ? rect.bottom + 8 : 120;
  const left = rect ? rect.left : 24;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div
        className="fixed z-[9999] w-56 rounded-2xl overflow-hidden shadow-2xl border border-slate-100 bg-white"
        style={{ top, left }}
      >
        <div className="px-4 py-2.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400">Sources</div>
        {INSTITUTES.map(inst => (
          <button
            key={inst}
            onClick={() => {
              const next = selected.includes(inst) ? selected.filter(i => i !== inst) : [...selected, inst];
              onChange(next);
            }}
            className={`w-full text-left px-4 py-2.5 text-[12px] flex items-center gap-2.5 transition-all hover:bg-slate-50 ${selected.includes(inst) ? "text-blue-700 font-semibold" : "text-slate-700"}`}
          >
            <span className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selected.includes(inst) ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>
              {selected.includes(inst) && <Check className="w-2.5 h-2.5 text-white" />}
            </span>
            {inst}
          </button>
        ))}
        <div className="px-4 py-2.5 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold">Done</button>
        </div>
      </div>
    </>,
    document.body
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────
export const QuestionBank = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [selectedInstitutes, setSelectedInstitutes] = useState<string[]>(["UPSC Official"]);
  const [isPyqOnly, setIsPyqOnly] = useState(false);
  const [hierarchySelection, setHierarchySelection] = useState<HierarchySelection>({});

  const [activePanel, setActivePanel] = useState<"topic" | "source" | null>(null);

  const topicBtnRef = useRef<HTMLButtonElement>(null);
  const sourceBtnRef = useRef<HTMLButtonElement>(null);

  const hasTopicFilter = Object.keys(hierarchySelection).some(k => hierarchySelection[k as keyof HierarchySelection]);
  const topicLabel = hierarchySelection.subTopic || hierarchySelection.section || hierarchySelection.sectionGroup || hierarchySelection.subject || hierarchySelection.paper || "Topics";

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (searchQuery && !q.title.toLowerCase().includes(searchQuery.toLowerCase()) && !q.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedPapers.length > 0 && !selectedPapers.includes(q.paper)) return false;
      if (selectedInstitutes.length > 0 && !selectedInstitutes.includes(q.institute)) return false;
      if (isPyqOnly && !q.isPyq) return false;
      if (hierarchySelection.paper && q.paper !== hierarchySelection.paper) return false;
      if (hierarchySelection.subject && q.subject !== hierarchySelection.subject) return false;
      if (hierarchySelection.sectionGroup && q.sectionGroup !== hierarchySelection.sectionGroup) return false;
      if (hierarchySelection.section && q.section !== hierarchySelection.section) return false;
      if (hierarchySelection.subTopic && q.subTopic !== hierarchySelection.subTopic) return false;
      return true;
    });
  }, [searchQuery, selectedPapers, selectedInstitutes, isPyqOnly, hierarchySelection]);

  const sourceLabel = selectedInstitutes.length === 0 ? "Sources" : selectedInstitutes.length === 1 ? selectedInstitutes[0] : `${selectedInstitutes.length} Sources`;

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/30 px-6 pt-4 pb-3 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Question Bank</h1>
            <p className="text-xs text-slate-500 mt-0.5">{filteredQuestions.length} questions</p>
          </div>
          {(hasTopicFilter || selectedPapers.length > 0 || isPyqOnly || selectedInstitutes.length !== 1) && (
            <button
              onClick={() => { setHierarchySelection({}); setSelectedPapers([]); setIsPyqOnly(false); setSelectedInstitutes(["UPSC Official"]); }}
              className="text-xs text-red-500 font-semibold hover:text-red-600 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>

        {/* Search */}
        <Input
          icon={<Search className="w-4 h-4" />}
          placeholder="Search questions, topics, keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 rounded-xl bg-white/80 shadow-sm text-sm"
        />

        {/* Filter Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* Topic/Hierarchy filter */}
          <button
            ref={topicBtnRef}
            onClick={() => setActivePanel(activePanel === "topic" ? null : "topic")}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap border ${
              hasTopicFilter || activePanel === "topic"
                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                : "bg-white/60 text-slate-600 border-white/60 hover:bg-white/80 backdrop-blur-sm"
            }`}
          >
            {hasTopicFilter ? topicLabel : "Browse Topics"}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          <div className="w-px h-4 bg-slate-200 shrink-0" />

          {/* Paper pills */}
          {PAPERS.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPapers(selectedPapers.includes(p) ? selectedPapers.filter(x => x !== p) : [...selectedPapers, p])}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all border ${
                selectedPapers.includes(p)
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white/60 text-slate-600 border-white/60 hover:bg-white/80"
              }`}
            >
              {p}
            </button>
          ))}

          <div className="w-px h-4 bg-slate-200 shrink-0" />

          {/* Source */}
          <button
            ref={sourceBtnRef}
            onClick={() => setActivePanel(activePanel === "source" ? null : "source")}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap border ${
              selectedInstitutes.length > 0 || activePanel === "source"
                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                : "bg-white/60 text-slate-600 border-white/60 hover:bg-white/80 backdrop-blur-sm"
            }`}
          >
            {sourceLabel}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {/* PYQ Toggle */}
          <button
            onClick={() => setIsPyqOnly(!isPyqOnly)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all border ${
              isPyqOnly
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200"
                : "bg-white/60 text-slate-600 border-white/60 hover:bg-white/80"
            }`}
          >
            PYQ Only
          </button>
        </div>

        {/* Portaled panels */}
        {activePanel === "topic" && (
          <HierarchyPanel
            selection={hierarchySelection}
            onChange={(sel) => setHierarchySelection(sel)}
            onClose={() => setActivePanel(null)}
            anchorRef={topicBtnRef}
          />
        )}
        {activePanel === "source" && (
          <SourcePanel
            selected={selectedInstitutes}
            onChange={setSelectedInstitutes}
            onClose={() => setActivePanel(null)}
            anchorRef={sourceBtnRef}
          />
        )}

        {/* Active breadcrumb chips */}
        {hasTopicFilter && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {(["paper", "subject", "sectionGroup", "section", "subTopic"] as (keyof HierarchySelection)[]).map((key) => {
              const val = hierarchySelection[key];
              if (!val) return null;
              const colors: Record<string, string> = {
                paper: "bg-blue-50 text-blue-700 border-blue-200",
                subject: "bg-purple-50 text-purple-700 border-purple-200",
                sectionGroup: "bg-amber-50 text-amber-700 border-amber-200",
                section: "bg-emerald-50 text-emerald-700 border-emerald-200",
                subTopic: "bg-rose-50 text-rose-700 border-rose-200",
              };
              return (
                <span key={key} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${colors[key]}`}>
                  {val}
                  <button
                    onClick={() => {
                      const keys = ["paper", "subject", "sectionGroup", "section", "subTopic"] as (keyof HierarchySelection)[];
                      const idx = keys.indexOf(key);
                      const next = { ...hierarchySelection };
                      keys.slice(idx).forEach(k => delete next[k]);
                      setHierarchySelection(next);
                    }}
                    className="hover:opacity-70 ml-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Questions Grid - 2 columns */}
      <div className="px-6 py-5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="group rounded-xl backdrop-blur-xl bg-white/70 border border-white/60 hover:border-slate-200/80 hover:bg-white/90 shadow-sm hover:shadow-md transition-all duration-200 p-3.5 flex flex-col"
            >
              {/* Metadata row */}
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">{q.paper}</span>
                <span className="text-slate-400 text-[10px]">·</span>
                <span className="text-slate-500 text-[10px] font-medium truncate">{q.subject}</span>
                <span className="ml-auto text-slate-400 text-[10px] font-medium shrink-0">{q.wordLimit}w</span>
              </div>

              {/* Question text */}
              <p className="text-slate-800 text-[13px] leading-snug mb-2.5 flex-1">{q.title}</p>

              {/* Compact metadata footer */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-2.5">
                <FileText className="w-2.5 h-2.5" />
                <span>{q.institute} {q.year}</span>
                {q.isPyq && (
                  <>
                    <span>·</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">PYQ</span>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100/80">
                <button className="flex-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1">
                  View Answer <ChevronRight className="w-3 h-3" />
                </button>
                <button className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
                  <Bookmark className="w-3 h-3" />
                </button>
                <button className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
                  <Clock className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {filteredQuestions.length === 0 && (
            <div className="text-center py-24">
              <FilterIcon className="w-10 h-10 mx-auto mb-3 text-slate-200" />
              <p className="text-slate-500 font-semibold text-sm">No questions match your filters</p>
              <p className="text-slate-400 text-xs mt-1">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
