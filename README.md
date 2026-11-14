# winui-web

A zero-dependency WinUI 3-inspired UI kit built with HTML, CSS, and JavaScript. No XAML, C#, React, Vue, TypeScript, or build step is required. This is a browser simulation, not an official Microsoft implementation; rendering varies by browser, OS, fonts, and display scaling.

## Demo gallery

Open `index.html` or visit the GitHub Pages site. Use the left sidebar to switch between the component pages. Each page contains a live control preview and the corresponding copyable HTML invocation. The current gallery documents all components implemented by this library: buttons, dropdown/selection controls, layout/navigation, and loading/progress.

## Quick start

Include the CSS and JavaScript, and put `winui-prev` on an ordinary HTML element (`div`, `button`, etc.):

```html
<link rel="stylesheet" href="winui.css">
<script src="winui.js" defer></script>

<div winui-prev="Button" winui-content="Button"></div>
<div winui-prev="AccentButton" winui-content="Accent"></div>
<div winui-prev="DropDownButton" winui-content="Actions" winui-items='["New","Open","Save"]'></div>
```

## Components

- Buttons: `Button`, `AccentButton`, `ToggleButton`, `HyperlinkButton`
- Menus/selection: `DropDownButton`, `SplitButton`, `ComboBox`
- Layout/navigation: `AppLayout`, `Sidebar`, `SidebarItem`, `SidebarToggle`, `Content`, `StackPanel`, `GridPanel`
- Loading: `LoadingRing`, `ProgressBar`

## Layout example

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

`winui-prev` is the unified component selector. Common optional attributes include `winui-content`, `winui-items` (JSON array), `winui-disabled`, `winui-checked`, `winui-placeholder`, `winui-target`, `winui-collapsed`, `winui-value`, and `winui-indeterminate`. Controls support keyboard navigation where appropriate, light/dark system themes, and reduced-motion preferences. No return values or application data binding are provided.
