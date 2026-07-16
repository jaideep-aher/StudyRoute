"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronRight, Clock3, Compass, Flame, Lightbulb, Pause, Play, RotateCcw, Sparkles, TimerReset } from "lucide-react";
import { recommend, recommendByFit, type LearnerInput, type ScoredResource } from "@/lib/recommend";
import type { Resource } from "@/lib/catalog";

const topics: Resource["topic"][] = ["Python", "Statistics", "Machine Learning", "Data Visualization"];
const formats: Array<LearnerInput["preferredFormat"]> = ["No preference", "Interactive", "Video", "Reading", "Practice"];
const storageKey = "studyroute-progress";

type Progress = { completed: number; dates: string[]; feedback: string[] };

const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

const streakFrom = (dates: string[]) => {
  const unique = new Set(dates);
  let streak = 0;
  const cursor = new Date();
  while (unique.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export default function Home() {
  const [input, setInput] = useState<LearnerInput>({ topic: "Statistics", confidence: 2, minutes: 30, preferredFormat: "No preference" });
  const [progress, setProgress] = useState<Progress>(() => {
    if (typeof window === "undefined") return { completed: 0, dates: [], feedback: [] };
    const stored = window.localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : { completed: 0, dates: [], feedback: [] };
  });
  const [active, setActive] = useState<ScoredResource | null>(null);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [finished, setFinished] = useState(false);
  const recommendations = useMemo(() => recommend(input), [input]);
  const fitOnlyRecommendations = useMemo(() => recommendByFit(input), [input]);
  const update = <K extends keyof LearnerInput>(key: K, value: LearnerInput[K]) => setInput((current) => ({ ...current, [key]: value }));
  const streak = streakFrom(progress.dates);
  const fitOnlyTopics = new Set(fitOnlyRecommendations.map((resource) => resource.topic)).size;
  const planTopics = new Set(recommendations.map((resource) => resource.topic)).size;
  const fitOnlyFormats = new Set(fitOnlyRecommendations.map((resource) => resource.format)).size;
  const planFormats = new Set(recommendations.map((resource) => resource.format)).size;

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      if (timeLeft <= 1) {
        setTimeLeft(0);
        setRunning(false);
        return;
      }
      setTimeLeft((seconds) => seconds - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, timeLeft]);

  const beginSession = (resource: ScoredResource) => {
    setActive(resource);
    setRunning(true);
    setFinished(false);
    setTimeLeft(Math.min(resource.minutes, 30) * 60);
  };

  const completeSession = () => {
    if (!active || finished) return;
    const today = new Date().toISOString().slice(0, 10);
    setProgress((current) => ({ ...current, completed: current.completed + 1, dates: [...current.dates, today] }));
    setRunning(false);
    setFinished(true);
  };

  const recordFeedback = (feedback: string) => {
    setProgress((current) => ({ ...current, feedback: [...current.feedback, feedback] }));
  };

  return <main>
    <nav aria-label="Primary navigation"><a className="brand" href="#top"><span>SR</span> StudyRoute</a><div className="nav-progress"><Flame size={15} /><span>{streak} day streak</span><span className="nav-dot" /><span>{progress.completed} blocks done</span></div></nav>
    <section className="hero" id="top">
      <div><p className="eyebrow"><Compass size={15} /> A plan for the next 30 minutes</p><h1>Stop collecting resources.<br />Finish a study block.</h1><p className="hero-copy">Pick a skill, start a focused block, and leave with one thing you can explain. StudyRoute adapts the next plan to your time and confidence, without chasing clicks.</p><a className="primary-link" href="#planner">Plan a block <ArrowRight size={17} /></a></div>
      <aside className="hero-card"><p>Today&apos;s focus</p><strong>{active ? active.title : recommendations[0]?.title}</strong><div><Clock3 size={15} /> {active ? Math.ceil(timeLeft / 60) : recommendations[0]?.minutes} minutes <span /> {active ? "In progress" : "Ready when you are"}</div><button onClick={() => active ? setRunning((value) => !value) : beginSession(recommendations[0])}>{active && running ? <><Pause size={15} /> Pause block</> : <><Play size={15} /> {active ? "Resume block" : "Start focus block"}</>}</button></aside>
    </section>
    <section className="workspace" id="planner">
      <aside className="setup"><p className="section-label">Build your block</p><h2>What can you finish today?</h2><label>Skill to practice</label><div className="chip-row">{topics.map((topic) => <button key={topic} aria-pressed={input.topic === topic} className={input.topic === topic ? "chip active" : "chip"} onClick={() => update("topic", topic)}>{topic}</button>)}</div><label htmlFor="confidence">How confident do you feel?</label><div className="range-header"><span>New to it</span><strong>{input.confidence} / 5</strong><span>Comfortable</span></div><input id="confidence" type="range" min="1" max="5" value={input.confidence} onChange={(event) => update("confidence", Number(event.target.value))} /><label htmlFor="minutes">Time you have</label><select id="minutes" value={input.minutes} onChange={(event) => update("minutes", Number(event.target.value))}>{[15, 20, 30, 45, 60].map((minutes) => <option value={minutes} key={minutes}>{minutes} minutes</option>)}</select><label>Best format right now</label><div className="format-list">{formats.map((format) => <button key={format} aria-pressed={input.preferredFormat === format} className={input.preferredFormat === format ? "format active" : "format"} onClick={() => update("preferredFormat", format)}>{format}</button>)}</div><div className="variety-note"><Sparkles size={16} /><span>Your plan includes one useful stretch outside this exact topic.</span></div></aside>
      <div className="plan"><div className="plan-heading"><div><p className="section-label">Your next study block</p><h2>{active ? "Stay with the plan." : "Pick one and begin."}</h2></div><span className="model-note"><span /> Trained fit + variety rule</span></div><section className="tradeoff" aria-label="Relevance and variety comparison"><div className="tradeoff-head"><div><p className="section-label">The recommendation tradeoff</p><h3>Relevant does not have to mean repetitive.</h3></div><p>StudyRoute keeps the strongest direct matches, then protects one slot for a useful stretch.</p></div><div className="tradeoff-columns"><div className="comparison-list"><div className="comparison-title"><span className="comparison-dot fit" /> Fit only</div>{fitOnlyRecommendations.map((resource) => <div className="comparison-row" key={resource.id}><span>{resource.format}</span><strong>{resource.title}</strong></div>)}<p>{fitOnlyTopics} topic{fitOnlyTopics === 1 ? "" : "s"} · {fitOnlyFormats} format{fitOnlyFormats === 1 ? "" : "s"}</p></div><div className="comparison-arrow"><ArrowRight size={18} /></div><div className="comparison-list responsible"><div className="comparison-title"><span className="comparison-dot plan" /> StudyRoute plan</div>{recommendations.map((resource) => <div className="comparison-row" key={resource.id}><span>{resource.exploration ? "Stretch" : resource.format}</span><strong>{resource.title}</strong></div>)}<p>{planTopics} topics · {planFormats} formats</p></div></div></section>{active && <section className={finished ? "active-block complete" : "active-block"}><div className="timer"><TimerReset size={18} /><strong>{finished ? "Done" : formatTime(timeLeft)}</strong><span>{finished ? "Block completed" : running ? "Focus time" : "Paused"}</span></div><div className="active-copy"><p className="section-label">{finished ? "Nice work" : "Do this first"}</p><h3>{active.title}</h3><p>{finished ? "Give this block a quick rating so the next plan can be adjusted." : active.firstStep}</p>{finished ? <div className="feedback"><button onClick={() => recordFeedback("too easy")}>Too easy</button><button onClick={() => recordFeedback("just right")}>Just right</button><button onClick={() => recordFeedback("too hard")}>Too hard</button></div> : <div className="active-actions"><button className="quiet-action" onClick={() => { setTimeLeft(Math.min(active.minutes, 30) * 60); setRunning(false); }}><RotateCcw size={15} /> Reset</button><button className="complete-action" onClick={completeSession}><Check size={15} /> Mark complete</button></div>}</div></section>}
        <div className="resource-list" aria-live="polite">{recommendations.map((resource, index) => <article className={resource.exploration ? "resource exploration" : "resource"} key={resource.id}><div className="number">0{index + 1}</div><div className="resource-copy"><div className="resource-topline"><span className="tag">{resource.format}</span>{resource.exploration && <span className="explore-tag"><Compass size={13} /> Useful stretch</span>}</div><h3>{resource.title}</h3><p>{resource.description}</p><div className="metadata"><span><Clock3 size={14} /> {resource.minutes} min</span><span>{resource.provider}</span><span>{resource.topic}</span></div><div className="reason"><Lightbulb size={15} /> {resource.reason}</div></div><div className="resource-action"><div className="score"><strong>{resource.relevance}</strong><span>trained fit</span></div><button className="start-action" onClick={() => beginSession(resource)}>{active?.id === resource.id ? "Open block" : "Start"}<ChevronRight size={15} /></button></div></article>)}</div>
      </div>
    </section>
    <section className="progress-strip"><div><p className="section-label">Your progress stays here</p><h2>Small blocks, visible momentum.</h2></div><div className="stat"><strong>{progress.completed}</strong><span>blocks completed</span></div><div className="stat"><strong>{streak}</strong><span>day streak</span></div><div className="stat"><strong>{progress.feedback.length}</strong><span>ratings captured</span></div></section>
    <footer>StudyRoute <span>•</span> A responsible recommender built around completion, not attention</footer>
  </main>;
}
