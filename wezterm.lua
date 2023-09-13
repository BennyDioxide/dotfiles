local wezterm = require 'wezterm';
return {
	default_prog = {"/usr/bin/nu"},
	font = wezterm.font_with_fallback({
		"Fira Code Nerd Font",
		"Noto Sans CJK JP",
		"Noto Sans CJK TC",
		"PowerlineExtraSymbols",
	}),
	color_scheme = "Tomorrow Night",
}
