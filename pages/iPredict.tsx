import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PerformanceLevel, User } from '../types';
import { 
  BrainCircuit, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Sparkles,
  Lock,
  History
} from 'lucide-react';
import { createPrediction, fetchPredictionHistory, type PredictionHistoryEntry, type PredictionResponse } from '../services/api';

interface IPredictProps {
  user: User | null;
}

const IPredict: React.FC<IPredictProps> = ({ user }) => {
  const [readingScore, setReadingScore] = useState(4.0);
  const [writingScore, setWritingScore] = useState(4.0);
  const [numeracyScore, setNumeracyScore] = useState(4.0);
  const [motivationScore, setMotivationScore] = useState(4.0);
  const [toolsCount, setToolsCount] = useState(3);

  const [result, setResult] = useState<{
    level: PerformanceLevel;
    probability: number;
    rationale: string;
    createdAt: string;
  } | null>(null);
  const [history, setHistory] = useState<PredictionHistoryEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFaculty = user?.role === 'faculty';
  const isAuthenticated = Boolean(user);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    if (result) {
      setResult(null);
    }
    setError(null);
  };

  const levelLabels = useMemo<Record<PerformanceLevel, string>>(() => ({
    [PerformanceLevel.High]: 'High Performance',
    [PerformanceLevel.Moderate]: 'Moderate Performance',
    [PerformanceLevel.AtRisk]: 'At-Risk',
  }), []);

  const getColor = (level: PerformanceLevel) => {
    switch (level) {
      case PerformanceLevel.High:
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
      case PerformanceLevel.Moderate:
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
      case PerformanceLevel.AtRisk:
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setHistory([]);
      return;
    }
    setHistoryLoading(true);
    try {
      const entries = await fetchPredictionHistory();
      setHistory(entries);
    } catch (err) {
      console.error('Failed to fetch prediction history', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handlePredict = async () => {
    if (!isAuthenticated) {
      setError('Sign in to generate predictions.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await createPrediction({
        readingDependency: readingScore,
        writingDependency: writingScore,
        numeracyDependency: numeracyScore,
        motivationScore,
        toolsCount,
      });

      const nextResult = {
        level: response.level as PerformanceLevel,
        probability: response.probability,
        rationale: response.rationale,
        createdAt: response.createdAt,
      };

      setResult(nextResult);
      setHistory((prev) => [
        {
          id: response.id,
          level: response.level,
          probability: response.probability,
          rationale: response.rationale,
          createdAt: response.createdAt,
        },
        ...prev,
      ].slice(0, 25));
    } catch (err) {
      console.error('Failed to create prediction', err);
      setError('Unable to generate prediction. Please try again.');
    } finally {
      setIsSubmitting(false);
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

      {!isAuthenticated && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 px-4 py-3 rounded-lg text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <Lock className="w-4 h-4" /> Sign in to access institutional predictions and data retention.
        </div>
      )}

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
          <button onClick={handlePredict} disabled={isSubmitting} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
            {isSubmitting ? <RefreshCw className="animate-spin w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
            {isSubmitting ? 'Analyzing...' : 'Generate Prediction'}
          </button>
          {error && (
            <div className="text-xs text-red-500 font-semibold">{error}</div>
          )}
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
           <div className={`h-full bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center text-center transition-all duration-500 ${result || isSubmitting ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}`}>
              {!result && !isSubmitting && (
                <div className="text-slate-400 dark:text-slate-600">
                  <BrainCircuit className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Run the model to see results</p>
                </div>
              )}
              {isSubmitting && (
                 <div className="space-y-4 w-full">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4 mx-auto animate-pulse"></div>
                    <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded w-1/2 mx-auto animate-pulse"></div>
                    <div className="h-32 bg-slate-50 dark:bg-slate-800 rounded-lg w-full animate-pulse border border-slate-100 dark:border-slate-700"></div>
                 </div>
              )}
              {result && !isSubmitting && (
                <>
                  <div className="mb-6 animate-fade-in">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-2">Predicted Outcome</p>
                    <div className={`px-6 py-3 rounded-full border-2 text-lg font-bold inline-flex items-center gap-2 ${getColor(result.level)}`}>
                       {result.level === PerformanceLevel.AtRisk ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                       {levelLabels[result.level]}
                    </div>
                  </div>
                  <div className="w-full space-y-2 mb-8 animate-fade-in">
                     <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
                        <span>Success Probability</span>
                        <span>{result.probability}%</span>
                     </div>
                     <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${result.probability > 70 ? 'bg-green-500' : result.probability > 40 ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${result.probability}%` }}></div>
                     </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-left w-full border border-slate-100 dark:border-slate-700 animate-fade-in">
                     <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <h4 className="font-semibold text-slate-800 dark:text-white">AI Analysis</h4>
                     </div>
                     <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{result.rationale}</p>
                  </div>
                </>
              )}
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <History className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Predictions</h3>
          {historyLoading && <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No predictions stored yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getColor(entry.level as PerformanceLevel)}`}>
                    {levelLabels[entry.level as PerformanceLevel]}
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{new Date(entry.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">{entry.probability}% probability</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IPredict;