"use client";

import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Check, Clock3, Compass, Lightbulb, ShieldCheck, Sparkles } from "lucide-react";
import { recommend, type LearnerInput } from "@/lib/recommend";
import type { Resource } from "@/lib/catalog";

const topics: Resource["topic"][] = ["Python", "Statistics", "Machine Learning", "Data Visualization"];
const formats: Array<LearnerInput["preferredFormat"]> = ["No preference", "Interactive", "Video", "Reading", "Practice"];

export default function Home() {
  const [input, setInput] = useState<LearnerInput>({ topic: "Statistics", confidence: 2, minutes: 30, preferredFormat: "No preference" });
  const [saved, setSaved] = useState<string[]>([]);
  const recommendations = useMemo(() => recommend(input), [input]);
  const update = <K extends keyof LearnerInput>(key: K, value: LearnerInput[K]) => setInput((current) => ({ ...current, [key]: value }));

  return <main>
    <nav aria-label="Primary navigation"><a className="brand" href="#top"><span>SR</span> StudyRoute</a><a className="nav-link" href="#how">How it works</a></nav>
    <section className="hero" id="top">
      <div className="eyebrow"><Compass size={15} /> Learning plans with room to explore</div>
      <h1>Find the next resource<br />that actually helps.</h1>
      <p>StudyRoute ranks practical learning resources by your goal, confidence, and available time. It also reserves one spot for a useful stretch, because the best plan is not always the most familiar one.</p>
      <a className="primary-link" href="#planner">Build my plan <ArrowRight size={17} /></a>
      <div className="principles"><span><ShieldCheck size={16} /> No engagement score</span><span><Sparkles size={16} /> Built-in exploration</span><span><BookOpen size={16} /> Clear reasons</span></div>
    </section>
    <section className="planner" id="planner">
      <aside className="setup">
        <p className="section-label">Your starting point</p><h2>Set the next study session.</h2>
        <label>What do you want to work on?</label><div className="chip-row">{topics.map((topic) => <button key={topic} aria-pressed={input.topic === topic} className={input.topic === topic ? "chip active" : "chip"} onClick={() => update("topic", topic)}>{topic}</button>)}</div>
        <label htmlFor="confidence">How confident do you feel?</label><div className="range-header"><span>Just starting</span><strong>{input.confidence} / 5</strong><span>Very confident</span></div><input id="confidence" type="range" min="1" max="5" value={input.confidence} onChange={(event) => update("confidence", Number(event.target.value))} />
        <label htmlFor="minutes">Time available</label><select id="minutes" value={input.minutes} onChange={(event) => update("minutes", Number(event.target.value))}>{[15, 20, 30, 45, 60].map((minutes) => <option value={minutes} key={minutes}>{minutes} minutes</option>)}</select>
        <label>Format you enjoy</label><div className="format-list">{formats.map((format) => <button key={format} aria-pressed={input.preferredFormat === format} className={input.preferredFormat === format ? "format active" : "format"} onClick={() => update("preferredFormat", format)}>{format}</button>)}</div>
      </aside>
      <div className="results"><div className="result-heading"><div><p className="section-label">Your three-part plan</p><h2>Start here, then branch out.</h2></div><span className="live"><span /> Updates live</span></div>
        <div className="resource-list" aria-live="polite">{recommendations.map((resource, index) => <article className={resource.exploration ? "resource exploration" : "resource"} key={resource.id}><div className="number">0{index + 1}</div><div className="resource-copy"><div className="resource-topline"><span className="tag">{resource.format}</span>{resource.exploration && <span className="explore-tag"><Compass size={13} /> Exploration pick</span>}</div><h3>{resource.title}</h3><p>{resource.description}</p><div className="metadata"><span><Clock3 size={14} /> {resource.minutes} min</span><span>{resource.provider}</span><span>{resource.topic}</span></div><div className="reason"><Lightbulb size={15} /> {resource.reason}</div></div><div className="resource-action"><div className="score"><strong>{resource.relevance}</strong><span>trained fit</span></div><button aria-label={`Save ${resource.title}`} className={saved.includes(resource.id) ? "save saved" : "save"} onClick={() => setSaved((items) => items.includes(resource.id) ? items.filter((id) => id !== resource.id) : [...items, resource.id])}>{saved.includes(resource.id) ? <Check size={17} /> : "Save"}</button></div></article>)}</div>
      </div>
    </section>
    <section className="how" id="how"><div><p className="section-label">Why this is different</p><h2>Relevance is only part of a good recommendation.</h2></div><div className="how-grid"><article><strong>01</strong><h3>Start from the learner</h3><p>The ranking uses topic, confidence, time, and format preference. It can still help a new learner with no click history.</p></article><article><strong>02</strong><h3>Protect against a narrow feed</h3><p>Two resources fit the stated goal. One intentional exploration pick adds a related skill in a different format.</p></article><article><strong>03</strong><h3>Show the tradeoff</h3><p>Every recommendation explains why it appears. The fit score is visible, and it never represents predicted attention.</p></article></div></section>
    <footer>StudyRoute <span>•</span> A local prototype for responsible learning recommendations</footer>
  </main>;
}
