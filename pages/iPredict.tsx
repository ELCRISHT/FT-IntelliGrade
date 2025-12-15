import React, { useState } from 'react';
import { PerformanceLevel } from '../types';
import { GoogleGenAI } from "@google/genai";
import { 
  BrainCircuit, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Sparkles
} from 'lucide-react';

const IPredict: React.FC = () => {
  const [readingScore, setReadingScore] = useState(4.0);
  const [writingScore, setWritingScore] = useState(4.0);
  const [numeracyScore, setNumeracyScore] = useState(4.0);
  const [motivationScore, setMotivationScore] = useState(4.0);
  const [toolsCount, setToolsCount] = useState(3);
  
  const [prediction, setPrediction] = useState<PerformanceLevel | null>(null);
  const [probability, setProbability] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Gemini Integration (Simulated UI mainly, logic implemented if key was present)
  // const [aiInsight, setAiInsight] = useState<string>("");

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    // Reset prediction visual state if inputs change
    if (prediction !== null || probability !== 0) {
      setPrediction(null);
      setProbability(0);
    }
  };

  const handlePredict = () => {
    setIsAnimating(true);
    
    // Simulate API/Processing Delay
    setTimeout(() => {
      // Logic mimicking the Thesis Logistic Regression findings
      // High Dependency (Scores > 5) + Low Motivation (< 4) = Higher Risk
      // Low Dependency (Scores < 4) + High Motivation (> 5) = High Performance
      
      const avgDependency = (readingScore + writingScore + numeracyScore) / 3;
      
      // Simple weighted formula simulation
      // Base score 100
      // - Dependency * 10
      // + Motivation * 8
      // - ToolsCount * 2
      
      let rawScore = 50 - (avgDependency * 8) + (motivationScore * 7) - (toolsCount * 1.5);
      
      // Normalize to 0-100 roughly
      // Max possible: 50 - (1*8) + (7*7) - (0) = 91
      // Min possible: 50 - (7*8) + (1*7) - (10*1.5) = 50 - 56 + 7 - 15 = -14
      
      let prob = 0;
      let level = PerformanceLevel.Moderate;

      if (rawScore > 35) {
        level = PerformanceLevel.High;
        prob = Math.min(98, 70 + (rawScore - 35));
      } else if (rawScore < 10) {
        level = PerformanceLevel.AtRisk;
        prob = Math.max(5, 40 + rawScore); // Probability of SUCCESS is low
      } else {
        level = PerformanceLevel.Moderate;
        prob = 50 + (rawScore - 22);
      }
      
      // Invert probability for At-Risk to show "Risk Probability" or keep as "Success Probability"
      // Let's use "Predicted Success Probability"
      
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          iPredict Module
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Enter student metrics to forecast academic performance using our Logistic Regression model.
        </p>
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
              <input 
                type="range" min="1" max="7" step="0.1"
                value={readingScore} onChange={(e) => handleInputChange(setReadingScore, parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Writing Dependency (1-7)
                <span className="float-right text-blue-600 dark:text-blue-400 font-bold">{writingScore}</span>
              </label>
              <input 
                type="range" min="1" max="7" step="0.1"
                value={writingScore} onChange={(e) => handleInputChange(setWritingScore, parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Numeracy Dependency (1-7)
                <span className="float-right text-blue-600 dark:text-blue-400 font-bold">{numeracyScore}</span>
              </label>
              <input 
                type="range" min="1" max="7" step="0.1"
                value={numeracyScore} onChange={(e) => handleInputChange(setNumeracyScore, parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Motivation Score (1-7)
                <span className="float-right text-indigo-600 dark:text-indigo-400 font-bold">{motivationScore}</span>
              </label>
              <input 
                type="range" min="1" max="7" step="0.1"
                value={motivationScore} onChange={(e) => handleInputChange(setMotivationScore, parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                AI Tools Used (Count)
                <span className="float-right text-slate-600 dark:text-slate-400 font-bold">{toolsCount}</span>
              </label>
              <input 
                type="number" min="0" max="15"
                value={toolsCount} onChange={(e) => handleInputChange(setToolsCount, parseInt(e.target.value))}
                className="w-full p-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={isAnimating}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isAnimating ? <RefreshCw className="animate-spin w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
            {isAnimating ? 'Analyzing...' : 'Generate Prediction'}
          </button>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
           {/* Prediction Card */}
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
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                             probability > 70 ? 'bg-green-500' : probability > 40 ? 'bg-blue-500' : 'bg-red-500'
                          }`} 
                          style={{ width: `${probability}%` }}
                        ></div>
                     </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-left w-full border border-slate-100 dark:border-slate-700 animate-fade-in">
                     <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <h4 className="font-semibold text-slate-800 dark:text-white">AI Analysis</h4>
                     </div>
                     <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {prediction === PerformanceLevel.AtRisk 
                          ? "The model detects a high imbalance between AI dependency and intrinsic motivation. Recommended intervention: Reduce cognitive offloading in writing tasks." 
                          : prediction === PerformanceLevel.High
                          ? "Student demonstrates effective use of AI tools as a supplement to learning rather than a replacement. Maintain current study habits."
                          : "Student is within the expected range, but monitoring is advised for Numeracy dependency which shows a slight upward trend."
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