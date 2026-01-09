import React, { useState } from 'react';
import { PerformanceLevel, User } from '../types';
import { 
  BrainCircuit, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Sparkles,
  Lock
} from 'lucide-react';

interface IPredictProps {
  user: User | null;
}

const IPredict: React.FC<IPredictProps> = ({ user }) => {
  const [readingScore, setReadingScore] = useState(4.0);
  const [writingScore, setWritingScore] = useState(4.0);
  const [numeracyScore, setNumeracyScore] = useState(4.0);
  const [motivationScore, setMotivationScore] = useState(4.0);
  const [toolsCount, setToolsCount] = useState(3);
  
  const [prediction, setPrediction] = useState<PerformanceLevel | null>(null);
  const [probability, setProbability] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const isFaculty = user?.role === 'faculty';

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    if (prediction !== null || probability !== 0) {
      setPrediction(null);
      setProbability(0);
    }
  };

  const handlePredict = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const avgDependency = (readingScore + writingScore + numeracyScore) / 3;
      let rawScore = 50 - (avgDependency * 8) + (motivationScore * 7) - (toolsCount * 1.5);
      
      let prob = 0;
      let level = PerformanceLevel.Moderate;

      if (rawScore > 35) {
        level = PerformanceLevel.High;
        prob = Math.min(98, 70 + (rawScore - 35));
      } else if (rawScore < 10) {
        level = PerformanceLevel.AtRisk;
        prob = Math.max(5, 40 + rawScore);
      } else {
        level = PerformanceLevel.Moderate;
        prob = 50 + (rawScore - 22);
      }
      
      setPrediction(level);
      setProbability(Math.floor(prob));
      setIsAnimating(false);
    }, 1500);
  };

  const getColor = (level: PerformanceLevel) => {
    switch (level) {
      case PerformanceLevel.High: return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
      case PerformanceLevel.Moderate: return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
      case PerformanceLevel.AtRisk: return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            iPredict Module
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Enter student metrics to forecast academic performance using our Logistic Regression model.
          </p>
        </div>
        {isFaculty && (
          <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800 flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
             <Lock className="w-3 h-3" /> Restricted: {user?.college} Context
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6 transition-colors">
          <h2 className="font-semibold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Input Variables</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Reading Dependency (1-7)
                <span className="float-right text-blue-600 dark:text-blue-400 font-bold">{readingScore}</span>
              </label>
              <input type="range" min="1" max="7" step="0.1" value={readingScore} onChange={(e) => handleInputChange(setReadingScore, parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Writing Dependency (1-7)
                <span className="float-right text-blue-600 dark:text-blue-400 font-bold">{writingScore}</span>
              </label>
              <input type="range" min="1" max="7" step="0.1" value={writingScore} onChange={(e) => handleInputChange(setWritingScore, parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Numeracy Dependency (1-7)
                <span className="float-right text-blue-600 dark:text-blue-400 font-bold">{numeracyScore}</span>
              </label>
              <input type="range" min="1" max="7" step="0.1" value={numeracyScore} onChange={(e) => handleInputChange(setNumeracyScore, parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>
            <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Motivation Score (1-7)
                <span className="float-right text-indigo-600 dark:text-indigo-400 font-bold">{motivationScore}</span>
              </label>
              <input type="range" min="1" max="7" step="0.1" value={motivationScore} onChange={(e) => handleInputChange(setMotivationScore, parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                AI Tools Used (Count)
                <span className="float-right text-slate-600 dark:text-slate-400 font-bold">{toolsCount}</span>
              </label>
              <input type="number" min="0" max="15" value={toolsCount} onChange={(e) => handleInputChange(setToolsCount, parseInt(e.target.value))} className="w-full p-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button onClick={handlePredict} disabled={isAnimating} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
            {isAnimating ? <RefreshCw className="animate-spin w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
            {isAnimating ? 'Analyzing...' : 'Generate Prediction'}
          </button>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
           <div className={`h-full bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center text-center transition-all duration-500 ${prediction || isAnimating ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}`}>
              {!prediction && !isAnimating && (
                <div className="text-slate-400 dark:text-slate-600">
                  <BrainCircuit className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Run the model to see results</p>
                </div>
              )}
              {isAnimating && (
                 <div className="space-y-4 w-full">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4 mx-auto animate-pulse"></div>
                    <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded w-1/2 mx-auto animate-pulse"></div>
                    <div className="h-32 bg-slate-50 dark:bg-slate-800 rounded-lg w-full animate-pulse border border-slate-100 dark:border-slate-700"></div>
                 </div>
              )}
              {prediction && !isAnimating && (
                <>
                  <div className="mb-6 animate-fade-in">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-2">Predicted Outcome</p>
                    <div className={`px-6 py-3 rounded-full border-2 text-lg font-bold inline-flex items-center gap-2 ${getColor(prediction)}`}>
                       {prediction === PerformanceLevel.AtRisk ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                       {prediction}
                    </div>
                  </div>
                  <div className="w-full space-y-2 mb-8 animate-fade-in">
                     <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
                        <span>Success Probability</span>
                        <span>{probability}%</span>
                     </div>
                     <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${probability > 70 ? 'bg-green-500' : probability > 40 ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${probability}%` }}></div>
                     </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-left w-full border border-slate-100 dark:border-slate-700 animate-fade-in">
                     <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <h4 className="font-semibold text-slate-800 dark:text-white">AI Analysis</h4>
                     </div>
                     <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {prediction === PerformanceLevel.AtRisk 
                          ? `High risk detected. In the ${user?.college || 'current'} institutional context, students with these metrics often benefit from immediate academic coaching to reduce over-reliance on generative tools.` 
                          : prediction === PerformanceLevel.High
                          ? "Exceptional performance predicted. This pattern aligns with high-achieving students who use AI responsibly as a collaborative partner in research and numeracy tasks."
                          : "Moderate dependency levels. Monitor writing domain scores specifically, as they are approaching critical thresholds for this student profile."
                        }
                     </p>
                  </div>
                </>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default IPredict;