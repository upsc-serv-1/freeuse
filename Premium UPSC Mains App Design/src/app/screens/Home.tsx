import { Search, Library, Sparkles, Map, BarChart3, ArrowRight } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Link } from "react-router";

const primaryCards = [
  {
    title: "Question Bank",
    icon: Library,
    description: "12,000+ UPSC-style questions",
    color: "bg-blue-500",
    link: "/question-bank"
  },
  {
    title: "Value Addition",
    icon: Sparkles,
    description: "Ready-made answer enhancement tools",
    color: "bg-amber-500",
    link: "/value-addition"
  },
  {
    title: "Syllabus",
    icon: Map,
    description: "Interactive UPSC syllabus explorer",
    color: "bg-emerald-500",
    link: "/syllabus"
  },
  {
    title: "PYQ Analysis",
    icon: BarChart3,
    description: "Trend analysis of previous year questions",
    color: "bg-purple-500",
    link: "/pyq-analysis"
  }
];

const recentTopics = [
  "Federalism",
  "Parliament",
  "Pressure Groups",
  "Judiciary",
  "Local Government"
];

export const Home = () => {
  return (
    <div className="max-w-5xl mx-auto p-8 lg:p-12 pb-24">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center mt-12 mb-20 space-y-6">
        <div className="space-y-4">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 drop-shadow-sm">
            Master UPSC Mains
          </h1>
          <p className="text-xl sm:text-2xl text-slate-600 max-w-2xl mx-auto font-medium">
            Everything required for answer writing in one place.
          </p>
        </div>
        
        <div className="w-full max-w-3xl mt-12">
          <Input 
            icon={<Search className="w-6 h-6 text-slate-400" />}
            placeholder="Search questions, topics, quotes, introductions, conclusions..."
            className="h-20 text-lg rounded-[2rem] pl-16"
          />
        </div>
      </div>

      {/* Primary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-20">
        {primaryCards.map((card) => (
          <Link key={card.title} to={card.link} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-[2rem]">
            <Card className="h-full transition-all duration-300 hover:shadow-2xl hover:border-white/80 hover:-translate-y-2 bg-white/40 group-hover:bg-white/60">
              <CardContent className="p-10 flex flex-col items-center text-center h-full gap-5">
                <div className={`w-20 h-20 rounded-[1.5rem] ${card.color} text-white flex flex-col items-center justify-center shrink-0 shadow-lg`}>
                  <card.icon className="w-10 h-10" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">
                    {card.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Topics */}
      <div className="space-y-6 max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Recent Topics</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {recentTopics.map((topic) => (
            <button 
              key={topic}
              className="px-6 py-3 rounded-2xl bg-white/50 backdrop-blur-md border border-white/60 text-slate-700 text-base font-semibold hover:bg-white/80 hover:scale-105 transition-all shadow-sm"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
