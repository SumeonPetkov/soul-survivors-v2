// Background music: a looping dungeon-crawler track for every level, and one for boss fights.
// It plays all the time, underneath the sound effects.
//
// Each level picks its song in its constructor (`this.song = SONG_FOREST`).
// Boss fights switch to SONG_BOSS; once the boss is dead the level's song comes back.
//
// Songs are written in MakeCode's melody format, one string per bar:
//   "A4:2"  = note A, octave 4, lasting 2 sixteenths (4 = a quarter note, 8 = half, 16 = whole)
//   "F#4" / "A#4" = sharps (A# is the same as Bb), "R:4" = a rest
// Every bar of a song must add up to the same length (12 for 3/4 or 6/8, 16 for 4/4).
// Only one note plays at a time, so chords are played as arpeggios (broken chords).
// _song() adds the instrument (waveform + envelope) and the tempo.
//
// All tracks are original compositions written for this game.

/** 0-255. The music is kept quieter than the sound effects. */
const MUSIC_VOLUME = 70

/**
 * Builds a melody string. wave: 1 triangle, 2 sawtooth, 3 sine, 11-15 square (10%-50%).
 * tempo: quarter notes per minute.
 */
function _song(wave: number, tempo: number, bars: string[]): string {
    // envelope: attack, decay, sustain level (0-255), release - short and plucky
    let s = "~" + wave + " @5,80,150,40 "
    const notes = bars.join(" ").split(" ").filter(n => !!n)
    notes[0] += "-" + tempo
    return s + notes.join(" ")
}

// ---------------- DUNGEON: "Crypt Crawl" (A minor, slow and creeping) ----------------
// Broken chords Am - F - G - E, then a melody that climbs and falls back down.
const SONG_DUNGEON = _song(12, 96, [
    "A3:2 C4:2 E4:2 A4:2 G4:2 E4:2 C4:2 E4:2",
    "F3:2 A3:2 C4:2 F4:2 E4:2 C4:2 A3:2 C4:2",
    "G3:2 B3:2 D4:2 G4:2 F4:2 D4:2 B3:2 D4:2",
    "E3:2 G#3:2 B3:2 E4:2 D4:2 B3:2 G#3:2 B3:2",
    "A3:2 C4:2 E4:2 A4:2 B4:2 C5:4 B4:2",
    "A4:4 G4:2 F4:2 E4:4 D4:4",
    "C4:2 D4:2 E4:2 F4:2 E4:2 D4:2 C4:2 B3:2",
    "A3:8 E3:4 G#3:4",
])

// ---------------- FOREST: "Overgrown Halls" (D dorian, flowing 6/8) ----------------
// Rolling arpeggios Dm - C - Bb - C, then a wandering melody.
const SONG_FOREST = _song(13, 110, [
    "D4:2 A4:2 F4:2 D5:2 A4:2 F4:2",
    "C4:2 G4:2 E4:2 C5:2 G4:2 E4:2",
    "A#3:2 F4:2 D4:2 A#4:2 F4:2 D4:2",
    "C4:2 G4:2 E4:2 B4:2 A4:2 G4:2",
    "F4:4 G4:2 A4:4 C5:2",
    "D5:4 C5:2 A4:4 G4:2",
    "F4:2 E4:2 D4:2 E4:2 F4:2 G4:2",
    "A4:8 R:4",
])

// ---------------- GLACIER: "Frozen Depths" (E minor, slow music box) ----------------
// High, sparse sine notes that ring out like ice.
const SONG_GLACIER = _song(3, 72, [
    "E5:4 B4:4 G4:4 B4:4",
    "F#5:4 B4:4 A4:4 B4:4",
    "G5:4 E5:4 B4:4 E5:4",
    "F#5:8 D#5:8",
    "E5:4 B4:4 G4:4 E4:4",
    "C5:4 G4:4 E4:4 G4:4",
    "A4:4 B4:4 C5:4 D#5:4",
    "E5:12 R:4",
])

// ---------------- VOLCANO: "Magma Forge" (E phrygian, fast and heavy) ----------------
// A pounding low E with the dark F half-step on top, like hammering in a forge.
const SONG_VOLCANO = _song(15, 150, [
    "E3:2 E3:2 E4:2 E3:2 F4:2 E3:2 E4:2 E3:2",
    "E3:2 E3:2 E4:2 E3:2 G4:2 F4:2 E4:2 D4:2",
    "E3:2 E3:2 E4:2 E3:2 F4:2 E3:2 E4:2 E3:2",
    "C4:2 C4:2 C5:2 C4:2 B4:2 A4:2 G4:2 F4:2",
    "E4:4 F4:4 G4:4 A4:2 G4:2",
    "F4:4 E4:2 F4:2 E4:8",
    "B4:2 C5:2 B4:2 A4:2 G4:2 F4:2 G4:2 A4:2",
    "E4:4 F4:2 E4:2 D4:4 E4:4",
])

// ---------------- BOSS: "Demon's Gate" (D harmonic minor, galloping) ----------------
// A galloping low riff, then a frantic climb through the C# (harmonic minor) for tension.
const SONG_BOSS = _song(15, 165, [
    "D4:2 D4:1 D4:1 A4:2 D4:2 A#4:2 A4:2 G4:2 A4:2",
    "D4:2 D4:1 D4:1 A4:2 D4:2 C#5:2 A#4:2 A4:2 G4:2",
    "A#3:2 A#3:1 A#3:1 F4:2 A#3:2 G4:2 F4:2 E4:2 F4:2",
    "A3:2 A3:1 A3:1 E4:2 A3:2 C#4:2 E4:2 G4:2 A4:2",
    "D5:4 C#5:2 A#4:2 A4:4 G4:4",
    "F4:2 G4:2 A4:2 A#4:2 C#5:4 A4:4",
    "D5:2 A4:2 F4:2 D4:2 C#5:2 A4:2 E4:2 C#4:2",
    "D4:4 A3:4 D4:8",
])

// ---------------- PLAYER ----------------
let _music: music.Melody = null
let _musicText = ""

/** Loops `song` in the background. Does nothing if that song is already playing. */
function playSong(song: string) {
    if (!song || song == _musicText) return
    stopSong()
    _musicText = song
    _music = new music.Melody(song)
    _music.loop(MUSIC_VOLUME)
}

function stopSong() {
    if (_music) _music.stop()
    _music = null
    _musicText = ""
}
