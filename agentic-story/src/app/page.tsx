"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./page.module.css";

type StoryResponse = {
  ok: boolean;
  generatedAt: string;
  inputs: {
    genre: string;
    setting: string;
    protagonist: string;
    vibe: string;
  };
  story: {
    story: string;
    wordCount: number;
    beats: { label: string; description: string }[];
    tone: string;
    pace: string;
    capcut: {
      scenes: {
        index: number;
        start: string;
        end: string;
        durationSeconds: number;
        visualDirection: string;
        cameraMovement: string;
        voiceOver: string;
        textOverlay: string;
        soundDesign: string;
      }[];
      voiceOverScript: string;
      editingNotes: string[];
      musicDirection: string;
      exportTips: string[];
    };
  };
};

const genres = [
  { label: "Adventure Pulse", value: "adventure" },
  { label: "Mystery Noir", value: "mystery" },
  { label: "Romance Glow", value: "romance" },
  { label: "Sci-Fi Fuse", value: "scifi" },
  { label: "Fantasy Heart", value: "fantasy" },
  { label: "Drama Surge", value: "drama" },
];

export default function Home() {
  const [story, setStory] = useState<StoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    genre: "adventure",
    setting: "a neon soaked city hovering above the tide",
    protagonist: "Jules",
    vibe: "electric hope",
  });

  const storyWordTarget = 170;
  const storyDurationText = "60 seconds";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error("Failed to generate story");
      }

      const data = (await response.json()) as StoryResponse;
      setStory(data);
    } catch (err) {
      console.error(err);
      setError("We hit a snag while building the story. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setError(null);
    } catch (copyError) {
      console.error(copyError);
      setError("Clipboard unavailable. Select and copy manually.");
    }
  };

  const handleDownload = (filename: string, text: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const formattedScenes = useMemo(() => {
    if (!story?.story) return "";

    const header = "# CapCut Scene Breakdown\n";
    const rows = story.story.capcut.scenes
      .map((scene) => {
        return [
          `Scene ${scene.index}`,
          `Time: ${scene.start} → ${scene.end} (${scene.durationSeconds}s)`,
          `Visual: ${scene.visualDirection}`,
          `Camera: ${scene.cameraMovement}`,
          `Voice Over: ${scene.voiceOver}`,
          `On-screen Text: ${scene.textOverlay}`,
          `Sound Design: ${scene.soundDesign}`,
        ].join("\n");
      })
      .join("\n\n");

    return [header, rows].join("\n");
  }, [story]);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div>
          <h1>One-Minute Story Crafter</h1>
          <p>
            Generate an AI-crafted one minute narrative, paired with an
            edit-ready CapCut script that keeps pacing, visuals, and voice-over
            in sync.
          </p>
        </div>
        <div className={styles.heroMeta}>
          <div>
            <span className={styles.heroMetric}>{storyWordTarget}</span>
            <span className={styles.heroLabel}>Target Words</span>
          </div>
          <div>
            <span className={styles.heroMetric}>{storyDurationText}</span>
            <span className={styles.heroLabel}>Timeline Length</span>
          </div>
          <div>
            <span className={styles.heroMetric}>12</span>
            <span className={styles.heroLabel}>CapCut Scenes</span>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2>Prompt the Journey</h2>
          <div className={styles.inputGrid}>
            <label className={styles.field}>
              <span>Genre Mode</span>
              <select
                value={formState.genre}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, genre: event.target.value }))
                }
              >
                {genres.map((genre) => (
                  <option key={genre.value} value={genre.value}>
                    {genre.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Setting</span>
              <input
                type="text"
                value={formState.setting}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, setting: event.target.value }))
                }
                placeholder="a neon soaked city hovering above the tide"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Protagonist</span>
              <input
                type="text"
                value={formState.protagonist}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, protagonist: event.target.value }))
                }
                placeholder="Jules"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Emotional Vibe</span>
              <input
                type="text"
                value={formState.vibe}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, vibe: event.target.value }))
                }
                placeholder="electric hope"
                required
              />
            </label>
          </div>

          <button className={styles.primaryButton} type="submit" disabled={isLoading}>
            {isLoading ? "Building Story..." : "Generate Story + CapCut Script"}
          </button>
          {error ? <p className={styles.error}>{error}</p> : null}
        </form>
      </section>

      {story ? (
        <section className={styles.results}>
          <div className={styles.storyCard}>
            <div className={styles.storyHeader}>
              <div>
                <h2>Story Narrative</h2>
                <p>
                  {story.story.wordCount} words · tone set to {story.story.tone} · pace{" "}
                  {story.story.pace}
                </p>
              </div>
              <div className={styles.actionGroup}>
                <button onClick={() => handleCopy(story.story.story)}>Copy Story</button>
                <button
                  onClick={() =>
                    handleDownload(
                      "one-minute-story.txt",
                      `${story.story.story}\n\n---\nGenerated at ${story.generatedAt}`
                    )
                  }
                >
                  Download
                </button>
              </div>
            </div>
            <p className={styles.storyBody}>{story.story.story}</p>
          </div>

          <div className={styles.splitGrid}>
            <article className={styles.card}>
              <header>
                <h3>Story Beats</h3>
                <p>Use these anchor points to time your transitions and callouts.</p>
              </header>
              <ul className={styles.beatList}>
                {story.story.beats.map((beat) => (
                  <li key={beat.label}>
                    <strong>{beat.label}</strong>
                    <span>{beat.description}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className={styles.card}>
              <header>
                <h3>Voice Over Script</h3>
                <p>Paste into CapCut voice studio or your TTS workflow.</p>
              </header>
              <div className={styles.actionGroup}>
                <button onClick={() => handleCopy(story.story.capcut.voiceOverScript)}>
                  Copy VO
                </button>
                <button
                  onClick={() =>
                    handleDownload(
                      "capcut-voiceover.txt",
                      story.story.capcut.voiceOverScript
                    )
                  }
                >
                  Download
                </button>
              </div>
              <p className={styles.storyBody}>{story.story.capcut.voiceOverScript}</p>
            </article>
          </div>

          <article className={styles.card}>
            <header>
              <h3>CapCut Timeline Blueprint</h3>
              <p>
                Drop these into your CapCut script editor. Each beat is calibrated for
                ~5 second pacing.
              </p>
              <div className={styles.actionGroup}>
                <button onClick={() => handleCopy(formattedScenes)}>Copy Breakdown</button>
                <button
                  onClick={() => handleDownload("capcut-scenes.txt", formattedScenes)}
                >
                  Download
                </button>
              </div>
            </header>
            <div className={styles.sceneTable}>
              <div className={styles.sceneHeader}>
                <span>#</span>
                <span>Time</span>
                <span>Visual Direction</span>
                <span>Camera Move</span>
                <span>Overlay</span>
              </div>
              {story.story.capcut.scenes.map((scene) => (
                <div className={styles.sceneRow} key={scene.index}>
                  <span>{scene.index}</span>
                  <span>
                    {scene.start} → {scene.end}
                  </span>
                  <span>{scene.visualDirection}</span>
                  <span>{scene.cameraMovement}</span>
                  <span>{scene.textOverlay}</span>
                </div>
              ))}
            </div>
            <div className={styles.sceneDetails}>
              <h4>Sound Design Notes</h4>
              <p>{story.story.capcut.musicDirection}</p>
              <ul>
                {story.story.capcut.editingNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
              <h4>Export Checklist</h4>
              <ul>
                {story.story.capcut.exportTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          </article>
        </section>
      ) : null}
    </main>
  );
}
