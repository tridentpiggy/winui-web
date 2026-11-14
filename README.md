# winui-web

A zero-dependency WinUI 3-inspired HTML/CSS/JavaScript control library. No XAML, C#, framework, or build step. This is a browser simulation, not an official Microsoft implementation; details vary by browser, operating system, font, and scaling.

## Quick start

```html
<link rel="stylesheet" href="winui.css">
<script src="winui.js" defer></script>
<div winui-prev="Button" winui-content="Hello WinUI"></div>
```

All components use the same `winui-prev` attribute on normal HTML elements (`div`, `button`, `label`, etc.). Open `index.html` for a gallery with working navigation, component previews, and usage snippets.

## Components

- **Buttons/menus:** `Button`, `AccentButton`, `ToggleButton`, `HyperlinkButton`, `DropDownButton`, `SplitButton`, `MenuFlyout`, `ComboBox`
- **Text/input:** `TextBox`, `PasswordBox`, `NumberBox`, `SearchBox`, `DatePicker`, `TimePicker`, `ColorPicker`
- **Choice/value:** `CheckBox`, `RadioButton`, `ToggleSwitch`, `Slider`, `ProgressBar`, `LoadingRing`, `ProgressRing`
- **Views/layout:** `TabView`, `ListView`, `TreeView`, `Expander`, `AppLayout`, `Sidebar`, `SidebarItem`, `SidebarToggle`, `Content`, `StackPanel`, `GridPanel`, `Card`
- **Feedback:** `InfoBar`, `InfoBadge`, `Separator`, `MessageDialog`

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

Supported common attributes: `winui-content`, `winui-placeholder`, `winui-items` (JSON array), `winui-value`, `winui-checked`, `winui-disabled="true"`, `winui-min`, `winui-max`, `winui-step`, and `winui-group`. The library uses native browser controls where practical and respects `prefers-reduced-motion`.
