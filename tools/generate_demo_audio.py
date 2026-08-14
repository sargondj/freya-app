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


def blue_whale(t: float, _index: int, _total: int) -> float:
    phrases = [
        (0.15, 120.0, 58.0, 2.5, 0.46),
        (2.75, 96.0, 48.0, 2.8, 0.40),
        (5.70, 132.0, 64.0, 2.4, 0.34),
    ]

    value = 0.0
    for start, high, low, length, amp in phrases:
        elapsed = t - start
        if elapsed < 0 or elapsed > length:
            continue

        progress = elapsed / length
        freq = high + (low - high) * progress
        pulse = 0.72 + 0.28 * sine(4.2, elapsed)
        phrase_env = math.sin(math.pi * progress)
        value += amp * phrase_env * pulse * (
            0.78 * sine(freq, t)
            + 0.16 * sine(freq * 0.5, t)
            + 0.06 * sine(freq * 1.5, t)
        )

    ocean = 0.025 * sine(0.19, t) + 0.018 * sine(0.31, t + 0.4)
    return value + ocean


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


def yellow_owl(t: float, _index: int, _total: int) -> float:
    calls = [
        (0.25, 0.60),
        (1.05, 0.72),
        (2.70, 0.60),
        (3.55, 0.72),
        (5.40, 0.62),
        (6.25, 0.78),
    ]

    value = 0.0
    for start, length in calls:
        elapsed = t - start
        if elapsed < 0 or elapsed > length:
            continue

        progress = elapsed / length
        hoot_env = math.sin(math.pi * progress)
        bend = 1.0 - 0.13 * progress
        base = 238.0 * bend
        wobble = 1.0 + 0.018 * sine(5.0, elapsed)
        value += 0.43 * hoot_env * (
            0.72 * sine(base * wobble, t)
            + 0.22 * sine(base * 0.5, t)
            + 0.06 * sine(base * 1.5, t)
        )

    return value


def pink_sparkle(t: float, _index: int, _total: int) -> float:
    notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25]
    note = notes[int((t * 3.4) % len(notes))]
    shimmer = 0.5 + 0.5 * sine(7.0, t)
    return shimmer * (0.38 * sine(note, t) + 0.12 * sine(note * 3, t))


def main() -> None:
    write_wav("blue-whale.wav", 8.8, blue_whale)
    write_wav("green-wind-chimes.wav", 9.5, green_wind_chimes)
    write_wav("yellow-owl.wav", 7.8, yellow_owl)
    write_wav("pink-sparkle.wav", 6.0, pink_sparkle)


if __name__ == "__main__":
    main()
