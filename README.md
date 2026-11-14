# winui-web

A zero-dependency WinUI 3-inspired HTML/CSS/JavaScript control library. No XAML, C#, React, Vue, TypeScript, or build step. This is a browser simulation, not an official Microsoft implementation; exact pixels vary by browser, operating system, fonts, and display scaling.

## Quick start

```html
<link rel="stylesheet" href="winui.css">
<script src="winui.js" defer></script>
<div winui-prev="Button" winui-content="Hello WinUI"></div>
```

All components use `winui-prev` on ordinary HTML elements (`div`, `button`, `label`, etc.).

## Components

- **Buttons/menus:** `Button`, `AccentButton`, `ToggleButton`, `HyperlinkButton`, `DropDownButton`, `SplitButton`, `MenuFlyout`, `ComboBox`
- **Text/input:** `TextBlock`, `TextBox`, `PasswordBox`, `NumberBox`, `SearchBox`, `DatePicker`, `TimePicker`, `ColorPicker`
- **Choice/value:** `CheckBox`, `RadioButton`, `ToggleSwitch`, `Slider`, `ProgressBar`, `LoadingRing`, `ProgressRing`
- **Views/layout:** `TabView`, `ListView`, `TreeView`, `Expander`, `AppLayout`, `Sidebar`, `SidebarItem`, `SidebarToggle`, `Content`, `StackPanel`, `GridPanel`, `Card`
- **Feedback:** `InfoBar`, `InfoBadge`, `Separator`, `MessageDialog`

The `index.html` demo includes live component previews and HTML snippets. Sidebar entries navigate between categories.

## Examples

```html
<div winui-prev="TextBox" winui-placeholder="Enter a name"></div>
<label winui-prev="CheckBox" winui-content="Enable feature" winui-checked="true"></label>
<div winui-prev="RadioButton" winui-content="Option A" winui-group="options"></div>
<div winui-prev="ToggleSwitch" winui-content="Wi-Fi" winui-checked="true"></div>
<div winui-prev="Slider" winui-min="0" winui-max="100" winui-value="45"></div>
<div winui-prev="TabView" winui-items='["Home","Settings","About"]'></div>
<div winui-prev="ProgressRing" winui-indeterminate="true"></div>
<div winui-prev="MessageDialog" winui-content="Show dialog" winui-title="Hello" winui-message="Example dialog"></div>
```

Common attributes: `winui-content`, `winui-placeholder`, `winui-items` (JSON array), `winui-value`, `winui-checked`, `winui-disabled="true"`, `winui-min`, `winui-max`, `winui-step`, `winui-group`, and `winui-target`. Controls use native browser primitives where appropriate and respect `prefers-reduced-motion`.
