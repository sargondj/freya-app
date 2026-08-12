from __future__ import annotations

import math
import os
import struct
import wave


SAMPLE_RATE = 44100
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "audio")


def envelope(index: int, total: int) -> float:
    attack = int(0.04 * SAMPLE_RATE)
    release = int(0.35 * SAMPLE_RATE)
    if index < attack:
        return index / attack
    if index > total - release:
        return max(0.0, (total - index) / release)
    return 1.0


def write_wav(filename: str, seconds: float, sample_func) -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, filename)
    total = int(seconds * SAMPLE_RATE)

    with wave.open(path, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)

        frames = bytearray()
        for index in range(total):
            value = sample_func(index / SAMPLE_RATE, index, total) * envelope(index, total)
            value = max(-0.92, min(0.92, value))
            frames.extend(struct.pack("<h", int(value * 32767)))

        wav.writeframes(frames)


def sine(freq: float, t: float) -> float:
    return math.sin(2 * math.pi * freq * t)


def blue_chime(t: float, _index: int, _total: int) -> float:
    notes = [392.0, 523.25, 659.25, 783.99]
    note = notes[int((t * 2.2) % len(notes))]
    return 0.44 * sine(note, t) + 0.18 * sine(note * 2, t)


def green_wind_chimes(t: float, _index: int, _total: int) -> float:
    strikes = [
        (0.10, 523.25, 0.36, 3.3),
        (0.55, 659.25, 0.31, 3.8),
        (1.05, 783.99, 0.27, 4.1),
        (1.55, 587.33, 0.30, 3.5),
        (2.15, 698.46, 0.29, 4.4),
        (2.95, 880.00, 0.22, 4.7),
        (3.85, 493.88, 0.25, 3.9),
        (4.55, 739.99, 0.21, 4.5),
        (5.45, 622.25, 0.23, 4.0),
        (6.30, 830.61, 0.18, 4.8),
    ]

    value = 0.0
    for start, freq, amp, decay in strikes:
        elapsed = t - start
        if elapsed < 0:
            continue

        ring = math.exp(-elapsed / decay)
        sway = 0.98 + 0.02 * sine(0.18, t)
        value += amp * ring * (
            0.70 * sine(freq * sway, t)
            + 0.20 * sine(freq * 2.01, t)
            + 0.10 * sine(freq * 3.02, t)
        )

    wind = 0.018 * sine(0.09, t) + 0.012 * math.sin(2 * math.pi * 0.13 * t + 1.3)
    return value + wind


def yellow_warm(t: float, _index: int, _total: int) -> float:
    return 0.28 * sine(220.0, t) + 0.25 * sine(277.18, t) + 0.22 * sine(329.63, t)


def pink_sparkle(t: float, _index: int, _total: int) -> float:
    notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25]
    note = notes[int((t * 3.4) % len(notes))]
    shimmer = 0.5 + 0.5 * sine(7.0, t)
    return shimmer * (0.38 * sine(note, t) + 0.12 * sine(note * 3, t))


def main() -> None:
    write_wav("blue-chime.wav", 6.0, blue_chime)
    write_wav("green-wind-chimes.wav", 9.5, green_wind_chimes)
    write_wav("yellow-warm.wav", 6.0, yellow_warm)
    write_wav("pink-sparkle.wav", 6.0, pink_sparkle)


if __name__ == "__main__":
    main()
