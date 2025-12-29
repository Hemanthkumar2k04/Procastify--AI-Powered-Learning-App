import React, { useState, useEffect } from 'react';
import { BrainCircuit, ArrowRight, FileText, Layers, Target, Zap, Layout, Sparkles, MoveRight, Play } from 'lucide-react';

interface LandingProps {
  onLogin: () => void;
  onGuestAccess: () => void;
}

const Landing: React.FC<LandingProps> = ({ onLogin, onGuestAccess }) => {
  const [currentHeroStep, setCurrentHeroStep] = useState(0);

  
  const heroContent = [
    {
      title: "Taming the Chaos",
      sub: "Turn noise into knowledge.",
      desc: "Stop drowning in scattered content. We organize the mess so you can actually learn.",
      color: "from-red-400 to-orange-400"
    },
    {
      title: "AI That Understands",
      sub: "It reads, you master.",
      desc: "Our engine processes your materials instantly, extracting the concepts that matter.",
      color: "from-purple-400 to-blue-400"
    },
    {
      title: "Active Mastery",
      sub: "Don't just read. Practice.",
      desc: "Turn passive notes into active quizzes and adaptive study routines.",
      color: "from-green-400 to-emerald-400"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroStep((prev) => (prev + 1) % heroContent.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1114] text-gray-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes stream {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 6s ease-in-out infinite; animation-delay: 3s; }
      `}</style>

     
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">Procastify</span>
        </div>
        <div className="flex gap-4">
          <button onClick={onLogin} className="text-gray-400 hover:text-white transition-colors font-medium">
            Sign In
          </button>
          <button onClick={onGuestAccess} className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-2 rounded-full font-medium backdrop-blur-sm transition-all">
            Try Guest Mode
          </button>
        </div>
      </nav>

      
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[75vh] px-4 text-center">
        
        <div className="relative h-64 w-full max-w-4xl flex items-center justify-center mb-12">
          {heroContent.map((step, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out transform ${
                index === currentHeroStep ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
              }`}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                {step.title} <br />
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${step.color}`}>
                  {step.sub}
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-float">
          <button
            onClick={onGuestAccess}
            className="group flex-1 bg-white text-black hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl shadow-white/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            Start Learning <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        
        <div className="mt-12 text-sm text-gray-500 font-medium flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
          <Sparkles size={14} className="text-yellow-500" />
          <span>Smart summaries • Meaningful notes • Personalized routines • Intelligent tests • Unparalleled focus</span>
        </div>
      </main>

      
      <section className="relative z-10 py-32 border-t border-white/5 bg-gradient-to-b from-transparent to-[#0a0b0c]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Visualizing the Engine</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">See how we take the weight off your shoulders. From raw chaos to clear mastery in four steps.</p>
          </div>

          
          <div className="relative">
            
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent -translate-y-1/2"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              
              <div className="relative group">
                <div className="h-48 flex items-center justify-center relative mb-8">
                  
                  <div className="absolute inset-0 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-colors duration-500"></div>
                  <div className="relative w-32 h-32">
                    <div className="absolute top-0 left-0 p-3 bg-gray-800 rounded-lg border border-red-500/30 transform -rotate-12 animate-float">
                      <FileText className="text-red-400" size={20} />
                      <div className="h-1 w-8 bg-gray-700 mt-2 rounded"></div>
                    </div>
                    <div className="absolute bottom-4 right-0 p-3 bg-gray-800 rounded-lg border border-orange-500/30 transform rotate-12 animate-float-delayed">
                      <Layout className="text-orange-400" size={20} />
                      <div className="h-1 w-6 bg-gray-700 mt-2 rounded"></div>
                    </div>
                    <div className="absolute top-8 right-8 p-2 bg-gray-800 rounded border border-red-500/20 transform rotate-6 z-10">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">1. Input Chaos</h3>
                  <p className="text-gray-400 text-sm">Dump the overload. Lecture notes, raw text, and messy thoughts go here.</p>
                </div>
              </div>

              
              <div className="relative group">
                <div className="h-48 flex items-center justify-center relative mb-8">
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-500"></div>
                  
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 z-10 relative">
                      <BrainCircuit className="text-white animate-pulse" size={40} />
                    </div>
                   
                    <div className="absolute inset-0 border border-indigo-500/30 rounded-full scale-150 animate-spin opacity-50"></div>
                    <div className="absolute inset-0 border border-purple-500/30 rounded-full scale-125 animate-ping opacity-20"></div>
                   
                    <div className="absolute top-1/2 -left-12 lg:hidden">
                      <MoveRight className="text-gray-600" />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">2. Intelligent Core</h3>
                  <p className="text-gray-400 text-sm">Our AI engine connects the dots, structuring concepts and filtering noise.</p>
                </div>
              </div>

              
              <div className="relative group">
                <div className="h-48 flex items-center justify-center relative mb-8">
                  <div className="absolute inset-0 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-colors duration-500"></div>
                  <div className="relative w-32 h-32 flex flex-col items-center justify-center gap-2">
                    
                    <div className="w-24 h-8 bg-gray-800 border border-green-500/30 rounded-lg flex items-center px-3 shadow-lg transform translate-y-4 scale-95 opacity-60">
                      <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                    </div>
                    <div className="w-24 h-8 bg-gray-800 border border-green-500/50 rounded-lg flex items-center px-3 shadow-lg transform translate-y-2 scale-98 opacity-80">
                      <div className="w-2 h-2 rounded-full bg-green-500/70"></div>
                      <div className="w-12 h-1 bg-gray-600 ml-2 rounded"></div>
                    </div>
                    <div className="w-24 h-10 bg-gray-800 border border-green-500 rounded-lg flex items-center px-3 shadow-lg z-10">
                      <Layers size={16} className="text-green-400 mr-2" />
                      <div className="w-10 h-1 bg-gray-500 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">3. Crystal Clarity</h3>
                  <p className="text-gray-400 text-sm">Get clean summaries, structured visual notes, and clear takeaways.</p>
                </div>
              </div>

              
              <div className="relative group">
                <div className="h-48 flex items-center justify-center relative mb-8">
                  <div className="absolute inset-0 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-colors duration-500"></div>
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    
                    <div className="absolute inset-0 border-2 border-dashed border-yellow-500/30 rounded-full animate-spin-slow"></div>
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-yellow-500/50">
                      <Target className="text-yellow-400" size={32} />
                    </div>
                    <div className="absolute -right-2 top-0 bg-gray-800 p-1.5 rounded-full border border-yellow-500/50">
                      <Play size={12} className="text-yellow-400 fill-yellow-400" />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">4. Active Mastery</h3>
                  <p className="text-gray-400 text-sm">Close the loop. Test yourself with auto-generated quizzes and routines.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <footer className="py-12 border-t border-white/5 text-center text-gray-500 text-sm">
        <div className="flex justify-center items-center gap-2 mb-4 opacity-50 hover:opacity-100 transition-opacity">
          <BrainCircuit size={16} />
          <span className="font-semibold">Procastify</span>
        </div>
        <p>Turn Information into Understanding.</p>
      </footer>
    </div>
  );
};

export default Landing;
