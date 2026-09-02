# thinking-orbs — Jetpack Compose / Android

Kotlin transcription of the thinking-orbs geometry (same approach as the
Swift plan in `PORT_PLAN.md`): math from `spec/orbs-spec.json`, Compose
`Canvas` filled circles plus strokes for the `connecting` web.

**Not** a vendor of Zero-Assist / Andy / DictateKeyboard copies.

## Layout

```
ports/android/
  src/main/kotlin/thinking/orbs/   JVM engine (all 9 states)
  src/test/kotlin/…/GoldenVectorTest.kt
  compose/…/ThinkingOrb.kt         Jetpack Compose renderer
```

## API

```kotlin
ThinkingOrb(
    state = "searching",  // working, searching, solving, listening,
                          // connecting, weaving, composing, breathing, shaping
    sizePx = 64,          // 64 or 20 — presets, not a scale factor
    theme = OrbTheme.Auto,
    speed = 1f,
    paused = false,
)
```

Theme `Auto` follows `isSystemInDarkTheme()`. Reduced motion (animator
duration scale = 0) freezes at `t = 0.6`, matching the web spec.

## Golden-vector tests

Geometry is checked against `spec/orbs-golden.json` (9 states × sizes 64/20
× 4 timestamps; ε = 1e-4). Theme is ink-mirroring at paint time
(`grey = round((dark ? 1 - white : white) * 255)`). Tests are JVM unit
tests — no emulator.

```bash
cd ports/android
./gradlew test
```

If the wrapper is missing, any Gradle 8.x with Kotlin 2.0 will do:
`gradle test`.
