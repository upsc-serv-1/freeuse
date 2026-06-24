import { createBrowserRouter, Outlet, useLocation, useNavigate, Link } from "react-router";
import { Home } from "./screens/Home";
import { QuestionBank } from "./screens/QuestionBank";
import { ValueAddition } from "./screens/ValueAddition";
import { Syllabus } from "./screens/Syllabus";
import { PYQAnalysis } from "./screens/PYQAnalysis";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft } from "lucide-react";

const RootLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden flex flex-col">
      {/* Liquid Glass Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-300/30 blur-[100px]" />
        <div className="absolute top-[30%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-300/30 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-emerald-300/30 blur-[140px]" />
        <div className="absolute top-[10%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-rose-200/30 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col flex-1 h-screen overflow-hidden">
        {/* Fixed Dashboard Button */}
        {location.pathname !== "/" && (
          <div className="absolute top-6 left-8 z-[100]">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[1.25rem] bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_4px_16px_rgb(0,0,0,0.04)] hover:bg-white/70 transition-all font-semibold text-slate-700 hover:text-slate-950"
            >
              <ChevronLeft className="w-5 h-5" />
              Dashboard
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "question-bank", Component: QuestionBank },
      { path: "value-addition", Component: ValueAddition },
      { path: "syllabus", Component: Syllabus },
      { path: "pyq-analysis", Component: PYQAnalysis },
    ],
  },
]);
