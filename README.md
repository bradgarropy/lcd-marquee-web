# LCD Marquee Web

A web application that simulates an LCD1602 display with scrolling marquee messages, powered by React Router and MQTT.

## LCD Display

This application simulates an [LCD1602 display module](https://www.sunfounder.com/products/i2c-lcd1602-module) - a 16x2 character LCD with blue backlight commonly used in electronics projects.

### Font

The display uses the **LCD Dot Matrix** font which replicates the 5x8 dot matrix character set of the [Hitachi HD44780](https://en.wikipedia.org/wiki/Hitachi_HD44780_LCD_controller) LCD controller.

| Font           | Format | Source                                                                         | License      |
| -------------- | ------ | ------------------------------------------------------------------------------ | ------------ |
| LCD Dot Matrix | OTF    | [FontStruct](https://fontstruct.com/fontstructions/show/933512/lcd_dot_matrix) | CC BY-SA 3.0 |

The `©` character (U+00A9 COPYRIGHT SIGN) renders as a filled dot matrix block, used to display inactive LCD pixels.

### Components

#### `<LCD>`

Container component that renders the LCD display with two rows of dot matrix characters.

```tsx
import {LCD} from "~/components/LCD"
;<LCD>{/* Content goes here */}</LCD>
```

#### `<Marquee>`

Scrolling text component for LCD display content. Text scrolls from right to left, one character at a time.

```tsx
import {Marquee} from "~/components/Marquee"
;<Marquee
    line1="Hello World"
    line2="@username"
    onComplete={() => console.log("Animation finished")}
/>
```

| Prop         | Type         | Description                                |
| ------------ | ------------ | ------------------------------------------ |
| `line1`      | `string`     | Text for the first line                    |
| `line2`      | `string`     | Text for the second line                   |
| `onComplete` | `() => void` | Callback fired when marquee animation ends |

### Hooks

#### `useCharWidth`

Returns the pixel width of a single character in the LCD font. Used internally by `<LCD>` and `<Marquee>` for layout calculations.

```tsx
import {useCharWidth} from "~/hooks/useCharWidth"

const charWidth = useCharWidth() // e.g., 27
```

### CSS Custom Properties

The LCD font can be referenced via the `--font-lcd` CSS variable defined in `@theme`, or using the Tailwind class `font-lcd`.

---

Built with React Router.
