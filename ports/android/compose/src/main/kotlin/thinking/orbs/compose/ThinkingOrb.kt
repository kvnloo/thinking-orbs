package thinking.orbs.compose

import android.provider.Settings
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import thinking.orbs.LABELS
import thinking.orbs.OrbFrame
import thinking.orbs.REDUCED_MOTION_T
import thinking.orbs.frameFor
import thinking.orbs.inkGrey
import thinking.orbs.resolvePreset

enum class OrbTheme { Auto, Dark, Light }

/**
 * Jetpack Compose ThinkingOrb.
 *
 * Geometry is the Kotlin transcription of `spec/orbs-spec.json` (same
 * contract as the planned Swift port): filled circles for dots, strokes
 * for the `connecting` web. Golden-vector tests live in the JVM engine
 * module and do not need an emulator.
 */
@Composable
fun ThinkingOrb(
    state: String = "working",
    sizePx: Int = 64,
    theme: OrbTheme = OrbTheme.Auto,
    speed: Float = 1f,
    paused: Boolean = false,
    contentDescription: String? = null,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    val systemDark = isSystemInDarkTheme()
    val dark = when (theme) {
        OrbTheme.Auto -> systemDark
        OrbTheme.Dark -> true
        OrbTheme.Light -> false
    }
    val reduced = remember(context) {
        val scale = Settings.Global.getFloat(
            context.contentResolver,
            Settings.Global.ANIMATOR_DURATION_SCALE,
            1f,
        )
        scale == 0f
    }
    val resolved = remember(state, sizePx) { resolvePreset(state, sizePx) }
    val effSpeed = resolved.speed * speed
    var t by remember { mutableStateOf(if (reduced) REDUCED_MOTION_T else 0.0) }

    LaunchedEffect(paused, reduced, effSpeed, state, sizePx) {
        if (reduced) {
            t = REDUCED_MOTION_T
            return@LaunchedEffect
        }
        val origin = System.nanoTime()
        while (true) {
            withFrameNanos { now ->
                if (!paused) {
                    val elapsed = (now - origin) / 1_000_000_000.0
                    t = elapsed * effSpeed
                }
            }
        }
    }

    val frame: OrbFrame = remember(t, state, sizePx) { frameFor(state, sizePx, t) }
    val label = contentDescription ?: LABELS[state] ?: "Thinking…"
    val dp = sizePx.toFloat()

    Canvas(
        modifier
            .size(dp.dp)
            .semantics { this.contentDescription = label },
    ) {
        for (l in frame.lines) {
            val g = inkGrey(l.white, dark) / 255f
            drawLine(
                color = Color(g, g, g, l.a.toFloat()),
                start = Offset(l.x1.toFloat(), l.y1.toFloat()),
                end = Offset(l.x2.toFloat(), l.y2.toFloat()),
                strokeWidth = l.w.toFloat(),
                cap = StrokeCap.Butt,
            )
        }
        for (d in frame.dots) {
            val g = inkGrey(d.white, dark) / 255f
            drawCircle(
                color = Color(g, g, g, d.a.toFloat()),
                radius = d.r.toFloat(),
                center = Offset(d.x.toFloat(), d.y.toFloat()),
            )
        }
    }
}
