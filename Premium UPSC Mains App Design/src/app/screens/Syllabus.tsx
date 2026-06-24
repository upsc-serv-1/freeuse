import { useState } from "react";
import { ChevronRight, ChevronDown, CheckCircle2, Circle } from "lucide-react";
import { cn } from "../components/ui/Card";

const syllabusData = [
  {
    id: "gs1",
    title: "General Studies I",
    progress: 45,
    topics: [
      {
        id: "gs1-1",
        title: "Indian Heritage and Culture",
        completed: true,
        subtopics: ["Art Forms", "Literature", "Architecture from ancient to modern times"]
      },
      {
        id: "gs1-2",
        title: "Modern Indian History",
        completed: false,
        subtopics: ["Significant events", "Personalities", "Issues", "The Freedom Struggle"]
      }
    ]
  },
  {
    id: "gs2",
    title: "General Studies II",
    progress: 20,
    topics: [
      {
        id: "gs2-1",
        title: "Indian Constitution",
        completed: false,
        subtopics: ["Historical underpinnings", "Evolution", "Features", "Amendments", "Basic Structure"]
      }
    ]
  },
  {
    id: "gs3",
    title: "General Studies III",
    progress: 10,
    topics: [
      {
        id: "gs3-1",
        title: "Indian Economy",
        completed: false,
        subtopics: ["Planning", "Mobilization of resources", "Growth", "Development and employment"]
      }
    ]
  },
  {
    id: "gs4",
    title: "General Studies IV",
    progress: 0,
    topics: []
  }
];

export const Syllabus = () => {
  const [expandedPapers, setExpandedPapers] = useState<Record<string, boolean>>({ gs1: true });
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const togglePaper = (id: string) => {
    setExpandedPapers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTopic = (id: string) => {
    setExpandedTopics(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-12 pb-24 space-y-10">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Syllabus Explorer</h1>
        <p className="text-slate-500 text-lg">Interactive knowledge map to track your preparation.</p>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[27px] before:w-px before:bg-slate-200">
        {syllabusData.map((paper) => (
          <div key={paper.id} className="relative z-10">
            <button 
              onClick={() => togglePaper(paper.id)}
              className="w-full flex items-center p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors group"
            >
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mr-4 group-hover:bg-slate-200 transition-colors">
                {expandedPapers[paper.id] ? (
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                )}
              </div>
              
              <div className="flex-1 flex justify-between items-center pr-4">
                <span className="text-lg font-semibold text-slate-900">{paper.title}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-500">{paper.progress}% Complete</span>
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-900 rounded-full transition-all duration-500" 
                      style={{ width: `${paper.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </button>

            <div 
              className={cn(
                "pl-14 pr-4 overflow-hidden transition-all duration-300 ease-in-out",
                expandedPapers[paper.id] ? "max-h-[1000px] opacity-100 mt-3 mb-6" : "max-h-0 opacity-0 m-0"
              )}
            >
              <div className="space-y-3">
                {paper.topics.map((topic) => (
                  <div key={topic.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                    <button 
                      onClick={() => toggleTopic(topic.id)}
                      className="w-full flex items-center p-4 hover:bg-slate-50/50 transition-colors"
                    >
                      {topic.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 mr-3 shrink-0" />
                      )}
                      <span className="text-base font-medium text-slate-800 flex-1 text-left">{topic.title}</span>
                      {expandedTopics[topic.id] ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    
                    <div 
                      className={cn(
                        "transition-all duration-300 ease-in-out",
                        expandedTopics[topic.id] ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                      )}
                    >
                      <div className="px-12 pb-4 pt-1">
                        <ul className="list-disc space-y-2 text-slate-600 text-sm marker:text-slate-300">
                          {topic.subtopics.map((sub, idx) => (
                            <li key={idx} className="pl-1 leading-relaxed">{sub}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
                {paper.topics.length === 0 && (
                  <div className="p-4 text-sm text-slate-400 italic">No topics populated yet.</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
