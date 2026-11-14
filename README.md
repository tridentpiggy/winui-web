# winui-web

A zero-dependency WinUI 3-inspired UI kit built with HTML, CSS, and JavaScript. No XAML, C#, React, Vue, TypeScript, or build step is required. This is a browser simulation, not an official Microsoft implementation; rendering varies by browser, OS, fonts, and scaling.

## Quick start

```html
<link rel="stylesheet" href="winui.css">
<script src="winui.js" defer></script>
<div winui-prev="Button" winui-content="Hello WinUI"></div>
```

All components use the same `winui-prev` attribute on regular HTML elements (`div`, `button`, `section`, etc.).

## Implemented components

- **Buttons/menus:** `Button`, `AccentButton`, `ToggleButton`, `HyperlinkButton`, `DropDownButton`, `SplitButton`, `MenuFlyout`, `ComboBox`
- **Text and input:** `TextBlock`, `TextBox`, `PasswordBox`, `NumberBox`, `SearchBox`, `DatePicker`, `TimePicker`, `ColorPicker`
- **Choice/value:** `CheckBox`, `RadioButton`, `ToggleSwitch`, `Slider`, `ProgressBar`, `LoadingRing`, `ProgressRing`
- **Layout/navigation:** `AppLayout`, `Sidebar`, `SidebarItem`, `SidebarToggle`, `Content`, `StackPanel`, `GridPanel`, `TabView`, `ListView`, `TreeView`, `Expander`
- **Information/dialog:** `Card`, `Separator`, `InfoBadge`, `InfoBar`, `MessageDialog`

## Usage examples

```html
<div winui-prev="TextBox" winui-placeholder="Enter a name"></div>
<label winui-prev="CheckBox" winui-content="Enable feature" winui-checked="true"></label>
<div winui-prev="ToggleSwitch" winui-content="Wi-Fi" winui-checked="true"></div>
<div winui-prev="Slider" winui-min="0" winui-max="100" winui-value="45"></div>
<div winui-prev="TabView" winui-items='["Home","Settings","About"]'></div>
<div winui-prev="ListView" winui-items='["First item","Second item"]'></div>
<div winui-prev="ProgressRing" winui-indeterminate="true"></div>
<div winui-prev="MessageDialog" winui-content="Show dialog" winui-title="Hello" winui-message="Example dialog"></div>
```

`winui-items` accepts a JSON array, `winui-disabled="true"` disables supported controls, `winui-checked="true"` initializes checkable controls, and `winui-value` sets initial slider/progress values. The demo gallery has live samples and code snippets. Controls use native browser primitives where appropriate and honor reduced-motion preferences.
