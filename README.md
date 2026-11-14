# winui-web

A dependency-free HTML, CSS, and JavaScript library for WinUI 3-inspired controls. It does not use XAML, C#, a framework, or a build step.

> This project recreates the WinUI 3 visual language in the browser; it is not an official Microsoft implementation and cannot guarantee pixel-identical rendering across browsers, operating systems, fonts, or display scaling.

## Quick start

Include the stylesheet and script, then declare controls with the `elements` tag and `winui-prev` attribute:

```html
<link rel="stylesheet" href="winui.css">
<script src="winui.js" defer></script>

<elements winui-prev="Button" winui-content="Button"></elements>
<elements winui-prev="AccentButton" winui-content="Accent button"></elements>
<elements winui-prev="DropDownButton" winui-content="Actions"
  winui-items='["New","Open","Save"]'></elements>
<elements winui-prev="ComboBox" winui-placeholder="Choose a fruit"
  winui-items='["Apple","Orange","Pear"]'></elements>
```

Open `index.html` to see the controls in a demo. No server or compilation is required.

## Controls

- `Button` and `AccentButton`
- `ToggleButton` (`winui-checked="true"` initially)
- `HyperlinkButton`
- `DropDownButton` (button that opens a menu)
- `SplitButton` (primary action plus a menu arrow)
- `ComboBox` (editable text input with suggestions)

### Attributes

- `winui-content`: button label (or initial split-button action label)
- `winui-items`: JSON array of menu/suggestion labels
- `winui-placeholder`: ComboBox placeholder
- `winui-disabled`: disable the control (`true`)
- `winui-checked`: initial ToggleButton checked state (`true`)
- `winui-theme`: `light` or `dark` (defaults to system preference)

Dropdown items can also be supplied as child `<option>` elements. Components are progressively enhanced, and dynamically-added `<elements>` tags are initialized automatically.

## Scope

Controls are visual/interaction simulations only: no return values or application data binding are provided. Native browser focus, keyboard, and accessibility behavior is used where practical.
