# winui-web

A zero-dependency WinUI 3-inspired UI kit built with HTML, CSS, and JavaScript. No XAML, C#, React, Vue, TypeScript, or build step is required. This is a browser simulation, not an official Microsoft implementation; exact pixels vary by browser, OS, fonts, and display scaling.

## Quick start

Include the CSS and JavaScript, and put `winui-prev` on an ordinary HTML element (`div`, `button`, etc.). No custom `<elements>` tag is required.

```html
<link rel="stylesheet" href="winui.css">
<script src="winui.js" defer></script>

<div winui-prev="Button" winui-content="Button"></div>
<div winui-prev="AccentButton" winui-content="Accent"></div>
<div winui-prev="DropDownButton" winui-content="Actions" winui-items='["New","Open","Save"]'></div>
<div winui-prev="SidebarToggle"></div>
<div winui-prev="LoadingRing" winui-indeterminate="true"></div>
```

## Controls

### Buttons and menus

`Button`, `AccentButton`, `ToggleButton`, `HyperlinkButton`, `DropDownButton`, `SplitButton`, and `ComboBox`.

- `winui-content`: button text.
- `winui-items`: JSON array of menu/ComboBox items (or direct child `<option>` labels).
- `winui-placeholder`: ComboBox placeholder.
- `winui-disabled="true"`: disable a control.
- `winui-checked="true"`: initial ToggleButton state.

### Layout

```html
<div winui-prev="AppLayout">
  <div winui-prev="Sidebar" id="nav" winui-collapsed="false">
    <div winui-prev="SidebarItem">Home</div>
    <div winui-prev="SidebarItem">Settings</div>
  </div>
  <div winui-prev="Content">
    <button winui-prev="SidebarToggle" winui-target="#nav"></button>
    Main content
  </div>
</div>
```

- `AppLayout`: responsive two-column shell.
- `Sidebar`: animated navigation pane; `winui-collapsed="true"` starts collapsed.
- `SidebarToggle`: animated hamburger control, toggles the nearest sidebar or `winui-target="#sidebar-id"`.
- `SidebarItem`: keyboard-operable navigation item.
- `Content`: main content area.
- `StackPanel`: flex layout; `winui-orientation="horizontal"` or `vertical`.
- `GridPanel`: CSS grid; `winui-columns="1fr 2fr"` sets columns.

### Loading and progress

- `<div winui-prev="LoadingRing" winui-indeterminate="true"></div>`
- `<div winui-prev="ProgressBar" winui-indeterminate="true"></div>`
- `<div winui-prev="ProgressBar" winui-value="64"></div>` (0–100)

The library respects `prefers-reduced-motion`, supports light/dark system themes, and initializes controls added later to the DOM. Layout containers preserve their child markup. Controls are visual simulations; no application values or return values are exposed.
