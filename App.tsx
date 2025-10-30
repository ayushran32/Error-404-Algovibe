import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { DefenseResult } from './types';

// --- Helper Components & Icons (re-styled for "Danger Mode") ---

const WallIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 3a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 3 21h18a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 21 3H3Zm10.5 6a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75Zm0 3.75a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75ZM9 9.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm.75 3a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75ZM6.75 9a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5A.75.75 0 0 0 6.75 9Zm0 3.75a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75ZM15 13.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm.75-3a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75Z" clipRule="evenodd" />
    </svg>
);

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const SpeakerWaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
);

const SpeakerXMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
);

interface WallSegmentProps {
  strength: number;
  isFallen: boolean;
  isScanning: boolean;
  isInBestWindow: boolean;
}

const WallSegment: React.FC<WallSegmentProps> = ({ strength, isFallen, isScanning, isInBestWindow }) => {
  let segmentClasses = "w-16 h-16 flex-shrink-0 flex items-center justify-center border-2 transition-all duration-150 relative";
  let content;
  let textColor = 'text-transparent';

  if (isFallen) {
    segmentClasses += ' bg-gray-800/90 border-gray-600/50 animate-fall-and-fade pointer-events-none';
    textColor = 'text-slate-300';
    content = <div className="w-full h-full bg-gray-600/30"></div>;
  } else if (isInBestWindow) {
    segmentClasses += ' bg-amber-800/80 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.7)] animate-pulse';
    textColor = 'text-amber-200';
    content = <div className="w-full h-full bg-amber-600/30"></div>;
  } else {
    segmentClasses += ' bg-gray-800/90 border-gray-600/50';
    textColor = 'text-slate-300';
    content = <div className="w-full h-full bg-gray-600/30"></div>;
  }
  
  if (isScanning && !isFallen) {
    segmentClasses += ' ring-4 ring-offset-4 ring-offset-black/50 ring-white scale-110 z-10';
  }

  return (
    <div className={segmentClasses}>
      {content}
      <span 
        className={`absolute font-heading text-2xl ${textColor} transition-colors`} 
        style={{textShadow: '0 0 5px black, 0 0 2px black'}}
      >
        {strength}
      </span>
    </div>
  );
};


// --- Main App Component ---

const App: React.FC = () => {
  const [strengthsInput, setStrengthsInput] = useState('10, 20, 5, 30, 40, 50, 15, 60, 70, 80, 5, 90, 100, 95');
  const [wallStrengths, setWallStrengths] = useState<number[]>([]);
  const [kValue, setKValue] = useState(25);
  const [result, setResult] = useState<DefenseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fallenSegments, setFallenSegments] = useState<boolean[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [scanIndex, setScanIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'readme'>('analysis');

  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const successSoundRef = useRef<HTMLAudioElement | null>(null);
  const failureSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    clickSoundRef.current = document.getElementById('click-sound') as HTMLAudioElement;
    successSoundRef.current = document.getElementById('success-sound') as HTMLAudioElement;
    failureSoundRef.current = document.getElementById('failure-sound') as HTMLAudioElement;
  }, []);
  
  const playSound = (sound: HTMLAudioElement | null) => {
    if (!isMuted && sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  const maxStrength = useMemo(() => {
    if (wallStrengths.length === 0) return 100;
    return Math.max(100, ...wallStrengths);
  }, [wallStrengths]);

  const handleBuildWall = useCallback((playSoundEffect = true) => {
    if (playSoundEffect) {
        playSound(clickSoundRef.current);
    }
    const parsed = strengthsInput
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n >= 0);
    setWallStrengths(parsed);
    setFallenSegments(new Array(parsed.length).fill(false));
    setResult(null);
    setScanIndex(null);
  }, [strengthsInput, isMuted]); // Removed playSound from dependencies

  useEffect(() => {
    handleBuildWall(false);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visualizeAndFindLongestSegment = async () => {
    playSound(clickSoundRef.current);
    setIsLoading(true);
    setResult(null);
    setFallenSegments(new Array(wallStrengths.length).fill(false));
    
    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

    let maxLength = 0;
    let maxStart = -1;
    let currentWindowStart = 0;

    for (let i = 0; i < wallStrengths.length; i++) {
        setScanIndex(i);

        if (wallStrengths[i] < kValue) {
            setFallenSegments(prev => {
                const newFallen = [...prev];
                newFallen[i] = true;
                return newFallen;
            });
            const currentLength = i - currentWindowStart;
            if (currentLength > maxLength) {
                maxLength = currentLength;
                maxStart = currentWindowStart;
                setResult({ length: maxLength, start: maxStart });
            }
            currentWindowStart = i + 1;
        }
        await sleep(200);
    }
    
    setScanIndex(wallStrengths.length); // Move scanner past the end
    await sleep(200);


    const lastSegmentLength = wallStrengths.length - currentWindowStart;
    if (lastSegmentLength > maxLength) {
        maxLength = lastSegmentLength;
        maxStart = currentWindowStart;
    }
    
    const finalResult = { length: maxLength, start: maxStart };
    setResult(finalResult);
    
    if(finalResult.length > 0) {
        playSound(successSoundRef.current);
    } else {
        playSound(failureSoundRef.current);
    }

    setIsLoading(false);
    setScanIndex(null); // Hide scanner
  };


  return (
    <div className="min-h-screen bg-black/50 backdrop-blur-sm p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 relative">
            <div className="flex items-center justify-center gap-4">
                <WallIcon className="w-10 h-10 text-red-700 danger-text-shadow"/>
                <h1 className="text-4xl sm:text-5xl text-slate-100 tracking-wider font-heading danger-text-shadow">WALL MARIA DEFENSE</h1>
            </div>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto uppercase tracking-widest text-sm">
                Identify the longest breach-proof wall segment. Humanity's survival depends on it.
            </p>
             <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-0 right-0 p-2 text-slate-500 hover:text-red-500 transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <SpeakerXMarkIcon className="w-6 h-6" /> : <SpeakerWaveIcon className="w-6 h-6" />}
              </button>
        </header>

        <main className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3 bg-black/60 p-6 shadow-lg border-2 border-red-800/50">
            <h2 className="text-3xl font-heading mb-6 text-red-500 danger-text-shadow tracking-wider">THREAT PARAMETERS</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="strengths" className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-widest">
                  Wall Integrity Scan (Strengths)
                </label>
                <textarea
                  id="strengths"
                  rows={3}
                  className="w-full bg-gray-900/80 border-2 border-gray-700 p-3 text-slate-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 rounded-none"
                  value={strengthsInput}
                  onChange={(e) => setStrengthsInput(e.target.value)}
                  placeholder="e.g., 10, 20, 30, 40, 50"
                  disabled={isLoading}
                />
                <button
                    onClick={() => handleBuildWall(true)}
                    disabled={isLoading}
                    className="mt-3 w-full bg-gray-800 hover:bg-gray-700 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400 text-slate-300 font-bold py-2 px-4 border border-gray-600 rounded-none transition duration-200 uppercase tracking-widest"
                >
                    Construct Defenses
                </button>
              </div>

              <div>
                <label htmlFor="kValue" className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-widest">
                  Titan Threat Level (K): <span className="font-bold text-red-500 text-lg danger-text-shadow">{kValue}</span>
                </label>
                <input
                  id="kValue"
                  type="range"
                  min="0"
                  max={maxStrength}
                  value={kValue}
                  onChange={(e) => setKValue(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 appearance-none cursor-pointer accent-red-600 rounded-none"
                  disabled={isLoading || wallStrengths.length === 0}
                />
              </div>

              <button
                onClick={visualizeAndFindLongestSegment}
                disabled={isLoading || wallStrengths.length === 0}
                className="w-full flex items-center justify-center bg-red-800 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400 text-white py-3 px-4 transition duration-300 text-lg font-heading tracking-widest rounded-none border border-red-500 shadow-[0_0_15px_var(--danger-red-glow)]"
              >
                {isLoading ? (
                    <>
                        <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                        ANALYZING...
                    </>
                ) : (
                    "INITIATE ANALYSIS"
                )}
              </button>
            </div>
          </div>

          <div className="lg:w-2/3 bg-black/60 p-6 shadow-lg border-2 border-gray-800/50">
            <div className="flex border-b border-gray-700">
                <button
                    onClick={() => setActiveTab('analysis')}
                    className={`py-2 px-6 font-heading tracking-wider transition-colors duration-200 rounded-t-sm ${activeTab === 'analysis' ? 'bg-black/50 border-x border-t border-gray-700 text-amber-400' : 'text-slate-400 hover:bg-gray-800/50'}`}
                >
                    Analysis
                </button>
                <button
                    onClick={() => setActiveTab('readme')}
                    className={`py-2 px-6 font-heading tracking-wider transition-colors duration-200 rounded-t-sm ${activeTab === 'readme' ? 'bg-black/50 border-x border-t border-gray-700 text-amber-400' : 'text-slate-400 hover:bg-gray-800/50'}`}
                >
                    Read Me
                </button>
            </div>
            <div className="pt-6">
                {activeTab === 'analysis' && (
                    <div className="animate-fade-in-scale">
                        <h2 className="text-3xl font-heading mb-2 text-slate-300 accent-text-shadow tracking-wider">VISUALIZATION</h2>
                        <div className="h-64 bg-black/50 p-4 flex items-center justify-start gap-2 border-2 border-gray-700 overflow-x-auto">
                        {wallStrengths.length > 0 ? (
                            wallStrengths.map((strength, index) => {
                            const isInBest = result
                                ? index >= result.start && index < result.start + result.length
                                : false;
                            const isFallen = fallenSegments[index];
                            return (
                                <WallSegment
                                key={index}
                                strength={strength}
                                isFallen={isFallen}
                                isScanning={scanIndex === index}
                                isInBestWindow={isInBest}
                                />
                            );
                            })
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 uppercase tracking-widest">
                                <p>Awaiting Wall Construction Orders</p>
                            </div>
                        )}
                        </div>
                        
                        <div className="mt-6">
                            <h3 className="text-2xl font-heading text-slate-300 accent-text-shadow tracking-wider">After-Action Report</h3>
                            <div className="mt-2 text-lg bg-black/50 p-4 border-2 border-gray-700 min-h-[80px] flex items-center justify-center">
                                {result ? (
                                    <div className="animate-fade-in-scale w-full">
                                    {result.length > 0 ? (
                                        <div className="text-center sm:text-left sm:flex sm:items-baseline sm:justify-around sm:gap-6">
                                            <p className="text-slate-300 uppercase tracking-wider">
                                                Longest Defensible Segment: <span className="font-heading text-amber-400 text-4xl accent-text-shadow block sm:inline-block">{result.length}</span>
                                            </p>
                                            <p className="text-slate-300 mt-2 sm:mt-0 uppercase tracking-wider">
                                                Starting Position: <span className="font-heading text-amber-400 text-4xl accent-text-shadow block sm:inline-block">{result.start > -1 ? result.start + 1 : 'N/A'}</span>
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-red-500 font-heading text-2xl tracking-wider danger-text-shadow">NO DEFENSIBLE SEGMENT FOUND. WALL BREACH IMMINENT.</p>
                                    )}
                                    </div>
                                ) : (
                                    <p className="text-slate-600 uppercase tracking-widest">{isLoading ? 'Analysis in Progress...' : 'Awaiting Analysis...'}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-2xl font-heading text-slate-300 accent-text-shadow tracking-wider">Algorithm Analysis</h3>
                            <div className="mt-2 text-lg bg-black/50 p-4 border-2 border-gray-700 flex items-center justify-around text-center">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase tracking-widest">Time Complexity</p>
                                    <p className="font-heading text-3xl text-slate-100 accent-text-shadow">O(n)</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 uppercase tracking-widest">Space Complexity</p>
                                    <p className="font-heading text-3xl text-slate-100 accent-text-shadow">O(1)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'readme' && (
                     <div className="animate-fade-in-scale space-y-6 text-slate-300 leading-relaxed">
                        <h2 className="text-3xl font-heading text-slate-300 accent-text-shadow tracking-wider">Problem-Solving Approach</h2>
                        <div>
                            <h3 className="text-xl font-bold text-amber-400 mb-2 uppercase tracking-wider">The Challenge</h3>
                            <p>Given an array of integers representing the structural strength of wall segments and a minimum strength threshold `K` (the Titan Threat Level), the objective is to find the longest contiguous segment of the wall where every segment's strength is greater than or equal to `K`.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-amber-400 mb-2 uppercase tracking-wider">Algorithm: Sliding Window</h3>
                            <p>This problem is a perfect candidate for the <strong className="text-white">Sliding Window</strong> algorithm. This technique allows us to solve the problem in a single pass through the data, making it highly efficient with a linear time complexity of O(n) and constant space complexity of O(1).</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-amber-400 mb-2 uppercase tracking-wider">How It Works</h3>
                            <ol className="list-decimal list-inside space-y-2 pl-4">
                                <li>We initialize variables to track the longest segment found so far (<code className="bg-black/50 px-1 rounded">maxLength</code>, <code className="bg-black/50 px-1 rounded">maxStart</code>).</li>
                                <li>We use a pointer, <code className="bg-black/50 px-1 rounded">currentWindowStart</code>, to mark the beginning of the current defensible segment we're evaluating.</li>
                                <li>We iterate through the wall strengths one by one. If a segment's strength is above or equal to `K`, our window expands.</li>
                                <li>When we encounter a segment with strength less than `K`, the wall is breached. This is the end of the current defensible window.</li>
                                <li>We calculate the length of the just-ended window (<code className="bg-black/50 px-1 rounded">i - currentWindowStart</code>) and update our `maxLength` if this window was the longest yet.</li>
                                <li>We then "slide" the window forward by resetting <code className="bg-black/50 px-1 rounded">currentWindowStart</code> to the position right after the breach (<code className="bg-black/50 px-1 rounded">i + 1</code>).</li>
                                <li>After the loop finishes, one final check is needed to account for the last segment of the wall, in case it was never breached.</li>
                            </ol>
                        </div>
                         <div>
                            <h3 className="text-xl font-bold text-amber-400 mb-2 uppercase tracking-wider">Core Logic Snippet</h3>
                            <pre className="bg-black/80 border-2 border-gray-700 p-4 overflow-x-auto text-sm">
                                <code className="font-mono text-cyan-300">
{`let maxLength = 0;
let maxStart = -1;
let currentWindowStart = 0;

for (let i = 0; i < wallStrengths.length; i++) {
    // Check for a breach
    if (wallStrengths[i] < kValue) {
        // Current window ends here. Calculate its length.
        const currentLength = i - currentWindowStart;

        // If it's the new longest, record it.
        if (currentLength > maxLength) {
            maxLength = currentLength;
            maxStart = currentWindowStart;
        }

        // Start a new window after the breach.
        currentWindowStart = i + 1;
    }
}

// Final check for the last window (in case the wall ends without a breach).
const lastSegmentLength = wallStrengths.length - currentWindowStart;
if (lastSegmentLength > maxLength) {
    maxLength = lastSegmentLength;
    maxStart = currentWindowStart;
}`}
                                </code>
                            </pre>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
