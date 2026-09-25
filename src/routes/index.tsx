import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowLeft, ArrowRight, Heart, Music2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FINAL_MESSAGE, FINAL_PHOTO, HER_NICKNAME, LETTER_CONTENT, MUSIC_URL, PHOTOS } from "@/lib/story-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Our Little Love Story | For Nanna" },
      { name: "description", content: "A personal story of our photos, memories, and words from my heart." },
      { property: "og:title", content: "Our Little Love Story | For Nanna" },
      { property: "og:description", content: "A personal story of our photos, memories, and words from my heart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoveStory,
});

type Chapter = "opening" | "question" | "story" | "letter" | "final";
const escapade = ["Ayyo 😭", "No option ledu 😌", "Try again 😂", "Adi click avvadu ❤️", "Nice try 😏"];
const hearts = Array.from({ length: 14 }, (_, index) => index);

function Ambient({ pale = false }: { pale?: boolean }) {
  return <div className={`ambient ${pale ? "ambient-pale" : ""}`} aria-hidden="true">
    {hearts.map((item) => <span key={item} className="ambient-heart" style={{ left: `${(item * 37 + 11) % 94}%`, animationDelay: `${(item * 1.7) % 12}s`, animationDuration: `${11 + item % 7}s` }}>{item % 3 === 0 ? "✦" : "♥"}</span>)}
  </div>;
}

function DodgeQuestion({ onYes }: { onYes: () => void }) {
  const arena = useRef<HTMLDivElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 68, y: 54 });
  const [attempts, setAttempts] = useState(0);
  const lastEscape = useRef(0);

  const escape = useCallback((clientX?: number, clientY?: number) => {
    const bounds = arena.current?.getBoundingClientRect();
    const no = noRef.current;
    if (!bounds || !no || Date.now() - lastEscape.current < 180) return;
    lastEscape.current = Date.now();
    const width = no.offsetWidth || 100;
    const height = no.offsetHeight || 50;
    const pad = 12;
    const maxX = Math.max(pad, bounds.width - width - pad);
    const maxY = Math.max(pad, bounds.height - height - pad);
    const yesBounds = yesRef.current?.getBoundingClientRect();
    let picked = { x: pad, y: pad };
    for (let i = 0; i < 25; i++) {
      const x = pad + Math.random() * Math.max(0, maxX - pad);
      const y = pad + Math.random() * Math.max(0, maxY - pad);
      const cx = bounds.left + x + width / 2;
      const cy = bounds.top + y + height / 2;
      if (clientX !== undefined && Math.hypot(cx - clientX, cy - (clientY ?? 0)) < 135) continue;
      if (yesBounds && cx > yesBounds.left - 30 && cx < yesBounds.right + 30 && cy > yesBounds.top - 30 && cy < yesBounds.bottom + 30) continue;
      picked = { x, y };
      break;
    }
    setPosition(picked);
    setAttempts(value => value + 1);
  }, []);

  const checkPointer = (clientX: number, clientY: number) => {
    const rect = noRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = Math.max(rect.left - clientX, 0, clientX - rect.right);
    const dy = Math.max(rect.top - clientY, 0, clientY - rect.bottom);
    if (Math.hypot(dx, dy) < 100) escape(clientX, clientY);
  };

  return <motion.section key="question" className="chapter question-chapter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: "blur(12px)" }} transition={{ duration: .7 }}>
    <Ambient />
    <div className="question-inner">
      <p className="eyebrow light-eyebrow">Before anything else, one little question</p>
      <h1 className="display question-title">Are you loving me<span className="question-mark">?</span> <span className="emoji">🥺❤️</span></h1>
      <p className="question-subtitle">Be honest… 😌</p>
      <div className="question-arena" ref={arena} onPointerMove={event => { if (event.pointerType === "mouse") checkPointer(event.clientX, event.clientY); }} onTouchMove={event => { const touch = event.touches[0]; if (touch) checkPointer(touch.clientX, touch.clientY); }}>
        <Button ref={yesRef} variant="story" className="yes-button" onClick={onYes}>YES <Heart size={17} fill="currentColor" /></Button>
        <Button ref={noRef} type="button" variant="storyOutline" className="no-button" style={{ left: typeof position.x === "number" && attempts ? position.x : `${position.x}%`, top: typeof position.y === "number" && attempts ? position.y : `${position.y}%` }} onPointerEnter={event => escape(event.clientX, event.clientY)} onTouchStart={event => { event.preventDefault(); const touch = event.touches[0]; escape(touch?.clientX, touch?.clientY); }} onClick={event => { event.preventDefault(); escape(); }} onFocus={() => escape()} aria-label="No, the playful button moves away">NO 😏</Button>
      </div>
      <div className="tease" aria-live="polite">{attempts > 0 ? escapade[(attempts - 1) % escapade.length] : ""}</div>
    </div>
  </motion.section>;
}

function MemoryAlbum({ onNext }: { onNext: () => void }) {
  const [active, setActive] = useState<number | null>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (active === null) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") setActive(value => value === null ? null : (value + 1) % PHOTOS.length);
      if (event.key === "ArrowLeft") setActive(value => value === null ? null : (value - 1 + PHOTOS.length) % PHOTOS.length);
    };
    document.addEventListener("keydown", keydown);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", keydown); document.body.style.overflow = ""; };
  }, [active]);

  return <>
    <section className="album-section" id="memories">
      <div className="album-heading">
        <p className="eyebrow">Chapter 01 / the moments</p>
        <h2 className="display">Our little <em>photo album.</em></h2>
        <p>Some moments are too lovely to leave in a camera roll.</p>
        <div className="album-rule"><Heart size={14} fill="currentColor" /></div>
      </div>
      <div className="memory-layout">
        {PHOTOS.map((photo, index) => <motion.button
          type="button" key={photo.src} className={`memory-photo memory-photo-${index + 1}`}
          initial={reduced ? false : { opacity: 0, y: 70, rotate: index % 2 ? 4 : -4 }}
          whileInView={{ opacity: 1, y: 0, rotate: index % 2 ? 2 : -2 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .8, ease: "easeOut" }}
          onClick={() => setActive(index)} aria-label={`View photo: ${photo.title}`}>
          <span className="photo-mat"><img src={photo.src} alt={photo.alt} loading="lazy" /></span>
          <span className="photo-meta"><span className="photo-title">{photo.title}</span><span className="photo-index">0{index + 1} / 0{PHOTOS.length}</span></span>
          <span className="photo-caption">{photo.caption}</span>
          {photo.date && <span className="photo-date">{photo.date}</span>}
        </motion.button>)}
      </div>
      <div className="album-end"><span className="little-heart">♥</span><p>And my favorite part of every memory is you.</p><Button variant="story" onClick={onNext}>There’s something I want to tell you… <span aria-hidden="true">💌</span></Button></div>
    </section>
    <AnimatePresence>
      {active !== null && PHOTOS[active] && <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo album" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}>
        <Button variant="ghost" size="icon" className="lightbox-close" aria-label="Close photo" onClick={() => setActive(null)}><X /></Button>
        <Button variant="ghost" size="icon" className="lightbox-prev" aria-label="Previous photo" onClick={event => { event.stopPropagation(); setActive((active - 1 + PHOTOS.length) % PHOTOS.length); }}><ArrowLeft /></Button>
        <motion.div key={active} className="lightbox-content" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .35 }} onClick={event => event.stopPropagation()}>
          <img src={PHOTOS[active]?.src} alt={PHOTOS[active]?.alt} />
          <div><span>{PHOTOS[active]?.title}</span><p>{PHOTOS[active]?.caption}</p></div>
          <small>{active + 1} / {PHOTOS.length}</small>
        </motion.div>
        <Button variant="ghost" size="icon" className="lightbox-next" aria-label="Next photo" onClick={event => { event.stopPropagation(); setActive((active + 1) % PHOTOS.length); }}><ArrowRight /></Button>
      </motion.div>}
    </AnimatePresence>
  </>;
}

function LetterScene({ onNext }: { onNext: () => void }) {
  const [opened, setOpened] = useState(false);
  const paragraphs = LETTER_CONTENT.split("\n\n");
  return <motion.section key="letter" className="letter-chapter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .7 }}>
    <div className="letter-scene">
      <p className="eyebrow light-eyebrow">Chapter 02 / words from my heart</p>
      <h2 className="display scene-heading">For you, <em>always.</em></h2>
      <div className="illustration" aria-hidden="true">
        <div className="scene-moon" />
        <div className="scene-ground" />
        <motion.div className="person person-boy" initial={{ x: -160, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 2, delay: .35, ease: "easeInOut" }}><span className="person-head" /><span className="person-body" /><span className="person-arm" /></motion.div>
        <motion.div className="scene-letter" initial={{ opacity: 0, x: -35 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.2, duration: .8 }}>♥</motion.div>
        <motion.div className="person person-girl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .6, duration: 1 }}><span className="person-head" /><span className="person-hair" /><span className="person-body" /><span className="person-arm" /></motion.div>
      </div>
      <motion.p className="scene-caption" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>Some things are easier to say when they come from the heart.</motion.p>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3 }}><Button variant="story" onClick={() => setOpened(true)}>{opened ? "Your letter is open ❤️" : "Open my letter 💌"}</Button></motion.div>
    </div>
    <AnimatePresence>
      {opened && <motion.div className="letter-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Ambient pale />
        <motion.div className="envelope-wrap" initial={{ y: 80, scale: .7, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ duration: .8 }}>
          <div className="envelope-back" aria-hidden="true"><span>♥</span></div>
          <motion.article className="paper-letter" initial={{ y: 110, opacity: 0, rotateX: 15 }} animate={{ y: 0, opacity: 1, rotateX: 0 }} transition={{ delay: .65, duration: 1 }}>
            <p className="eyebrow">A letter, just for you</p>
            {paragraphs.map((paragraph, i) => <motion.p key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.35 + i * .8, duration: .7 }}>{paragraph}</motion.p>)}
            <motion.div className="letter-next" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 + paragraphs.length * .8 }}><Button variant="story" onClick={onNext}>One last thing… ❤️</Button></motion.div>
          </motion.article>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  </motion.section>;
}

function FinalScene() {
  const reduced = useReducedMotion();
  const delay = reduced ? 0 : 1;
  return <motion.section key="final" className="final-chapter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .8 }}>
    <Ambient />
    <div className="final-intro">
      <motion.p className="final-sorry" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 1 }}>Sorry…</motion.p>
      <motion.h1 className="display" initial={{ opacity: 0, y: 25, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: delay + 1.1, duration: 1.1 }}>Sorry Bujjoda <span className="emoji">🥺❤️</span></motion.h1>
      <div className="final-words">{FINAL_MESSAGE.map((line, index) => <motion.p key={index} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay + 2.1 + index * .7, duration: .8 }}>{line}</motion.p>)}</div>
      <motion.div className="scroll-invite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 5.5 }}>Keep scrolling <ArrowDown size={15} /></motion.div>
    </div>
    <div className="final-image-section">
      <motion.div className="final-photo-wrap" initial={{ opacity: 0, scale: .92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: .2 }} transition={{ duration: 1.3 }}><img src={FINAL_PHOTO} alt="A special moment together" /></motion.div>
      <p className="eyebrow light-eyebrow">My favorite story is ours</p>
      <h2 className="display final-quote">I don’t want a perfect story.<br /><em>I just want ours.</em> <span className="heartbeat">❤️</span></h2>
      <p className="final-signoff">Love you, bangaram.</p>
    </div>
  </motion.section>;
}

function LoveStory() {
  const [chapter, setChapter] = useState<Chapter>("opening");
  const [musicOn, setMusicOn] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const reduced = useReducedMotion();
  const moveTo = (next: Chapter) => { setChapter(next); window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" }); };
  const toggleMusic = async () => {
    if (!audio.current) return;
    if (musicOn) { audio.current.pause(); setMusicOn(false); }
    else { try { await audio.current.play(); setMusicOn(true); } catch { setMusicOn(false); } }
  };
  return <main className="story-app">
    {MUSIC_URL && <><audio ref={audio} src={MUSIC_URL} loop preload="none" /><Button variant="ghost" size="icon" className="music-control" aria-label={musicOn ? "Turn music off" : "Turn music on"} title={musicOn ? "Music off" : "Music on"} onClick={toggleMusic}>{musicOn ? <Music2 /> : <VolumeX />}</Button></>}
    {chapter !== "opening" && <div className="chapter-progress" aria-label="Story progress"><span style={{ width: `${({ question: 20, story: 52, letter: 76, final: 100 } as Record<string, number>)[chapter]}%` }} /></div>}
    <AnimatePresence mode="wait">
      {chapter === "opening" && <motion.section key="opening" className="chapter opening-chapter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }} transition={{ duration: .8 }}>
        <div className="opening-photo" /><div className="opening-shade" /><Ambient />
        <div className="opening-content">
          <motion.p className="eyebrow light-eyebrow" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .5 }}>A little something, just for you</motion.p>
          <motion.h1 className="display" initial={{ opacity: 0, scale: .92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: .8, duration: 1.1 }}>Hi {HER_NICKNAME}<span className="opening-heart">💕</span></motion.h1>
          <motion.p className="opening-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>This is our little love story.</motion.p>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.9 }}><Button variant="story" onClick={() => moveTo("question")}>Enter Our Story <Heart size={16} fill="currentColor" /></Button></motion.div>
        </div>
        <span className="opening-bottom">Made for you, with all my heart <span>✦</span></span>
      </motion.section>}
      {chapter === "question" && <DodgeQuestion onYes={() => moveTo("story")} />}
      {chapter === "story" && <motion.div key="story" initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
        <section className="reveal-chapter"><Ambient /><div className="reveal-inner"><p className="eyebrow light-eyebrow">I knew it ♡</p><h1 className="display"><motion.span initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .45, duration: .8 }}>Love you…</motion.span><motion.em initial={{ opacity: 0, scale: .8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1.25, duration: 1 }}>bangaram ❤️</motion.em></h1><motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1 }}>More than these words can ever say.</motion.p><motion.a href="#memories" className="reveal-scroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.7 }}>Our memories <ArrowDown size={16} /></motion.a></div><div className="burst" aria-hidden="true">{hearts.map(i => <span key={i} style={{ transform: `rotate(${i * 25.7}deg) translateY(-130px)`, animationDelay: `${.8 + i * .03}s` }}>♥</span>)}</div></section>
        <MemoryAlbum onNext={() => moveTo("letter")} />
      </motion.div>}
      {chapter === "letter" && <LetterScene onNext={() => moveTo("final")} />}
      {chapter === "final" && <FinalScene />}
    </AnimatePresence>
  </main>;
}
