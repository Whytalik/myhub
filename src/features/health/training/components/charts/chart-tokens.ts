// Sequential ordinal ramp derived from the training space accent (#e87d88, same hue),
// validated with the dataviz skill's validate_palette.js against the app's dark
// canvas surface (#1c1c1e): light -> dark, monotone lightness, all checks pass.
export const TRAINING_SEQUENTIAL_RAMP = ["#f6cbcf", "#ea8690", "#dd4050", "#ad1f2d"] as const;

export const TRAINING_ACCENT = "#e87d88";
// Secondary accent for a parallel metric (RIR vs. RPE), validated solo with the
// dataviz skill's validate_palette.js against the dark canvas surface (#1c1c1e):
// passes lightness band, chroma floor, and contrast; CVD separation from
// TRAINING_ACCENT is well above target (deltaE 15.8 protan / 20.4 normal-vision).
export const TRAINING_ACCENT_SECONDARY = "#8b6fd1";
export const CHART_SURFACE = "#1c1c1e";
export const CHART_GRIDLINE = "rgba(255,255,255,0.08)";
export const CHART_MUTED_LINE = "rgba(161,161,170,0.45)";
