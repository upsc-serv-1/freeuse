import { useState, useMemo } from "react";
import { Search, ChevronDown, Quote, AlignLeft, Lightbulb, AlignRight, Share2, Copy, Filter, X, Menu } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { cn } from "../components/ui/Card";

const topics = [
  {
    id: "federalism",
    title: "Federalism",
    paper: "GS2",
    theme: "bg-blue-50/50",
    iconColor: "text-blue-600",
    content: {
      quote: {
        text: "Federalism is a dynamic principle of governance embedded in the basic structure of the Indian Constitution, balancing regional aspirations with national unity.",
        author: "S.R. Bommai Judgement context"
      },
      introduction: "In the era of 'cooperative and competitive federalism', the dynamics between the Centre and States have evolved from a patron-client relationship to one of equal partnership, despite emerging fiscal and administrative frictions.",
      example: "The collaborative framework of the GST Council, where decisions are made collectively by the Centre and states, exemplifies cooperative federalism in action.",
      conclusion: "Thus, realizing the true essence of federalism requires moving beyond structural reforms towards building institutional trust, ensuring that regional autonomy fuels national integration.",
      diagram: "Flowchart: Cooperative vs Competitive vs Confrontational Federalism"
    }
  },
  {
    id: "agriculture",
    title: "Agriculture & Food Security",
    paper: "GS3",
    theme: "bg-emerald-50/50",
    iconColor: "text-emerald-600",
    content: {
      quote: {
        text: "Everything else can wait, but not agriculture.",
        author: "Jawaharlal Nehru"
      },
      introduction: "Despite employing nearly 45% of the workforce, Indian agriculture contributes only about 18% to the GVA, highlighting a profound structural dualism and the urgent need for a transition from 'food security' to 'nutritional and income security'.",
      example: "Precision farming in Andhra Pradesh using AI-driven soil health monitoring to reduce fertilizer usage by 30%.",
      conclusion: "A paradigm shift from yield-centric agriculture to income-centric sustainable farming is imperative to secure both the farmer's livelihood and the nation's ecological future.",
      diagram: "Cycle: Vicious loop of agrarian distress vs Virtuous cycle of value-addition"
    }
  },
  {
    id: "ethics",
    title: "Public Service Ethics",
    paper: "GS4",
    theme: "bg-purple-50/50",
    iconColor: "text-purple-600",
    content: {
      quote: {
        text: "The best way to find yourself is to lose yourself in the service of others.",
        author: "Mahatma Gandhi"
      },
      introduction: "Public service is not merely a profession but a public trust. In a complex administrative environment, ethics serve as the internal compass guiding civil servants to align administrative legality with moral legitimacy.",
      example: "Armstrong Pame's crowd-funded 'People's Road' in Manipur demonstrates the power of emotional intelligence and social capital in public administration.",
      conclusion: "Ultimately, institutional mechanisms like RTIs and CVCs must be complemented by the moral character of the administrator, fostering an ecosystem of 'Nishkama Karma' (selfless action).",
      diagram: "Venn Diagram: Legality, Morality, and Ethics in Decision Making"
    }
  }
];

const GlassPanel = ({ 
  icon: Icon, 
  title, 
  content, 
  subtitle 
}: { 
  icon: any, 
  title: string, 
  content: string, 
  subtitle?: string 
}) => (
  <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-[0_2px_12px_rgb(0,0,0,0.03)] flex flex-col gap-3 group relative">
    <button className="absolute top-4 right-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-slate-700">
      <Copy className="w-4 h-4" />
    </button>
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white/60 rounded-xl shadow-sm">
        <Icon className="w-5 h-5 text-slate-700" />
      </div>
      <h4 className="font-bold text-slate-800 tracking-tight">{title}</h4>
    </div>
    <div className="pt-2 flex-1">
      {subtitle ? (
        <figure className="space-y-3 border-l-4 border-slate-300 pl-4 py-1">
          <blockquote className="text-lg text-slate-700 italic font-medium">"{content}"</blockquote>
          <figcaption className="text-sm font-semibold text-slate-500">— {subtitle}</figcaption>
        </figure>
      ) : (
        <p className="text-slate-700 leading-relaxed text-base">{content}</p>
      )}
    </div>
  </div>
);

export const ValueAddition = () => {
  const [expandedId, setExpandedId] = useState<string | null>("federalism");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const togglePaper = (paper: string) => {
    setSelectedPapers(prev =>
      prev.includes(paper) ? prev.filter(p => p !== paper) : [...prev, paper]
    );
  };

  const clearAllFilters = () => {
    setSelectedPapers([]);
    setSearchQuery("");
  };

  const filteredTopics = useMemo(() => {
    return topics.filter(topic => {
      if (selectedPapers.length > 0 && !selectedPapers.includes(topic.paper)) return false;
      if (searchQuery && !topic.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [searchQuery, selectedPapers]);

  const activeFilterCount = selectedPapers.length;
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Filter Sidebar */}
      <div
        className={cn(
          "fixed lg:relative top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-80" : "w-0"
        )}
      >
        <div
          className={cn(
            "h-full backdrop-blur-xl bg-white/60 border-r border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-y-auto transition-opacity duration-300",
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="p-6 space-y-6">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/60 rounded-xl shadow-sm">
                  <Filter className="w-5 h-5 text-slate-700" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Filters</h2>
                {activeFilterCount > 0 && (
                  <Badge className="bg-blue-500/20 text-blue-700 border-blue-200/50">
                    {activeFilterCount}
                  </Badge>
                )}
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-white/40 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* GS Papers Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">GS Papers</h3>
              <div className="space-y-2">
                {["GS1", "GS2", "GS3", "GS4", "Essay"].map((paper) => (
                  <label
                    key={paper}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/40 cursor-pointer transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPapers.includes(paper)}
                      onChange={() => togglePaper(paper)}
                      className="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className="text-slate-700 font-medium group-hover:text-slate-900">{paper}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear All Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-700 font-semibold rounded-xl transition-colors border border-red-200/50"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 overflow-y-auto transition-all duration-300",
        sidebarOpen ? "lg:ml-0" : "ml-0"
      )}>
        <div className="max-w-6xl mx-auto p-8 lg:p-12 pb-24 space-y-12">
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 items-center bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm">
              <span className="text-sm font-semibold text-slate-600">Active Filters:</span>
              {selectedPapers.map((paper) => (
                <Badge
                  key={paper}
                  className="bg-blue-500/20 text-blue-700 border-blue-200/50 pl-3 pr-2 py-1.5 flex items-center gap-2"
                >
                  {paper}
                  <button
                    onClick={() => togglePaper(paper)}
                    className="hover:bg-blue-500/30 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-700 font-semibold ml-auto"
              >
                Clear All
              </button>
            </div>
          )}

          <div className="space-y-6 text-center max-w-3xl mx-auto pt-8">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 drop-shadow-sm">
              Value Addition Hub
            </h1>
            <p className="text-xl text-slate-600 font-medium">
              Comprehensive toolkits for every syllabus topic. Everything you need to elevate an answer, unified in one place.
            </p>
            <div className="mt-8">
              <Input
                icon={<Search className="w-6 h-6 text-slate-400" />}
                placeholder="Search for a topic, keyword, or thinker..."
                className="h-16 text-lg rounded-[2rem]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="text-sm text-slate-500 font-semibold">
              {filteredTopics.length} {filteredTopics.length === 1 ? "topic" : "topics"} found
            </div>
          </div>

          <div className="space-y-8">
            {filteredTopics.map((topic) => (
              <Card
                key={topic.id}
                className="overflow-hidden transition-all duration-500"
              >
                <button
                  onClick={() => toggleExpand(topic.id)}
                  className="w-full px-8 py-8 flex items-center justify-between text-left hover:bg-white/40 transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl ${topic.theme} flex items-center justify-center shadow-inner border border-white/60`}>
                      <div className={`w-6 h-6 rounded-full ${topic.iconColor} bg-current opacity-20 absolute`} />
                      <span className={`font-bold text-xl ${topic.iconColor} relative z-10`}>
                        {topic.paper}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{topic.title}</h3>
                      <p className="text-slate-500 font-medium mt-1">GS Paper {topic.paper.replace("GS", "")} Syllabus</p>
                    </div>
                  </div>
                  <div className={`p-3 rounded-2xl bg-white/50 border border-white/60 shadow-sm transition-transform duration-500 ${expandedId === topic.id ? "rotate-180" : ""}`}>
                    <ChevronDown className="w-6 h-6 text-slate-600" />
                  </div>
                </button>

                <div
                  className={cn(
                    "grid transition-all duration-500 ease-in-out",
                    expandedId === topic.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-8 pb-10">
                      <div className="border-t border-white/60 pt-8 mt-2">
                        {/* Unified Card Layout inside Topic */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <GlassPanel
                              icon={Quote}
                              title="High-Impact Quote"
                              content={topic.content.quote.text}
                              subtitle={topic.content.quote.author}
                            />
                          </div>

                          <GlassPanel
                            icon={AlignLeft}
                            title="Ready-Made Introduction"
                            content={topic.content.introduction}
                          />

                          <GlassPanel
                            icon={AlignRight}
                            title="Forward-Looking Conclusion"
                            content={topic.content.conclusion}
                          />

                          <GlassPanel
                            icon={Lightbulb}
                            title="Micro-Example / Case Study"
                            content={topic.content.example}
                          />

                          <GlassPanel
                            icon={Share2}
                            title="Visual Representation"
                            content={topic.content.diagram}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile FAB to open sidebar */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-8 left-8 z-50 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-[0_8px_24px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
