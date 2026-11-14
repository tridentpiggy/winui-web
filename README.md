# winui-web

A zero-dependency WinUI 3-inspired UI kit in plain HTML, CSS, and JavaScript. No XAML, C#, React, Vue, TypeScript, or build step is required. This is a browser simulation, not an official Microsoft implementation; rendering varies by browser, OS, fonts, and scaling.

## Quick start

```html
<link rel="stylesheet" href="winui.css">
<script src="winui.js" defer></script>
<div winui-prev="TextBox" winui-placeholder="Type here"></div>
```

All components use `winui-prev` on ordinary HTML elements (`div`, `button`, `label`, and so on).

## Components

- **Buttons/menus:** `Button`, `AccentButton`, `ToggleButton`, `HyperlinkButton`, `DropDownButton`, `SplitButton`, `MenuFlyout`, `ComboBox`
- **Text/input:** `TextBlock`, `TextBox`, `PasswordBox`, `NumberBox`, `SearchBox`, `DatePicker`, `TimePicker`, `ColorPicker`
- **Choice/value:** `CheckBox`, `RadioButton`, `ToggleSwitch`, `Slider`, `ProgressBar`, `LoadingRing`, `ProgressRing`
- **Views/layout:** `TabView`, `ListView`, `TreeView`, `Expander`, `AppLayout`, `Sidebar`, `StackPanel`, `GridPanel`, `Card`
- **Feedback:** `InfoBar`, `InfoBadge`, `Separator`, `MessageDialog`

The `index.html` demo has a sidebar page for each category, live previews, and corresponding HTML usage snippets.

## Examples

```html
<div winui-prev="TextBox" winui-placeholder="Enter a name"></div>
<label winui-prev="CheckBox" winui-content="Enable feature" winui-checked="true"></label>
<div winui-prev="RadioButton" winui-content="Option A" winui-group="options"></div>
<div winui-prev="ToggleSwitch" winui-content="Wi-Fi" winui-checked="true"></div>
<div winui-prev="Slider" winui-min="0" winui-max="100" winui-value="45"></div>
<div winui-prev="TabView" winui-items='["Home","Settings","About"]'></div>
<div winui-prev="ProgressRing" winui-indeterminate="true"></div>
```

Common attributes include `winui-content`, `winui-placeholder`, `winui-items` (JSON array), `winui-value`, `winui-checked`, `winui-disabled`, `winui-min`, `winui-max`, `winui-step`, and `winui-group`. The library respects light/dark system themes and reduced-motion preferences. These are visual/interaction simulations; no application data binding or return values are provided.
