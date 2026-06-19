# Background music

**Active track:** `public/audio/ambient.mp3` (wired + playing under the Sound toggle).

It plays through the WebAudio graph (not raw) so its tone suits the site. Tune it
in `src/lib/feedback.ts` (the `AMBIENT_*` constants):

- `AMBIENT_LEVEL`     — background volume (0..1). Lower = more subtle.
- `AMBIENT_LOWPASS_HZ`— rolls off harsh highs for warmth.
- `AMBIENT_PITCH`     — playbackRate; `< 1` = deeper/calmer, `> 1` = brighter/faster.
- `AMBIENT_FADE_IN_S` / `AMBIENT_FADE_OUT_S` — fade timings.
- `AMBIENT_ENABLED`   — set `false` to silence the music (UI sounds stay).

Autoplay-safe: it only starts after the first real gesture, and the Sound toggle
mutes everything.

## To swap the track
Replace `public/audio/ambient.mp3` with a new loop (seamless, 30–120s, small MP3
~128 kbps). Sources: Pixabay Music, Uppbeat, Free Music Archive, YouTube Audio
Library (free); Epidemic Sound / Artlist / Soundstripe (premium). Check the
license allows commercial website use. Keep the same filename, or update
`AMBIENT_SRC` in feedback.ts.
</content>
