# LCD Marquee Web

A web application that simulates an LCD1602 display with scrolling marquee messages, powered by React Router and MQTT.

## LCD Display

This application simulates an [LCD1602 display module](https://www.sunfounder.com/products/i2c-lcd1602-module) - a 16x2 character LCD with blue backlight commonly used in electronics projects.

### Font

The display uses the **LCD Dot Matrix** font which replicates the 5x8 dot matrix character set of the [Hitachi HD44780](https://en.wikipedia.org/wiki/Hitachi_HD44780_LCD_controller) LCD controller.

| Font           | Format | Source                                                                         | License      |
| -------------- | ------ | ------------------------------------------------------------------------------ | ------------ |
| LCD Dot Matrix | OTF    | [FontStruct](https://fontstruct.com/fontstructions/show/933512/lcd_dot_matrix) | CC BY-SA 3.0 |

A dedicated solid block glyph from the LCD Dot Matrix font is used to represent inactive LCD pixels.

### Components

#### `<LCD>`

Renders the LCD display with two rows of dot matrix characters. Accepts a queue of messages and scrolls them one at a time as a marquee (right to left, one character per tick).

```tsx
import {LCD} from "~/components/LCD"

const [messages, setMessages] = useState<Message[]>([])

const handleMessageComplete = () => {
    setMessages(prev => prev.slice(1))
}

;<LCD messages={messages} onMessageComplete={handleMessageComplete} />
```

| Prop                | Type         | Description                                               |
| ------------------- | ------------ | --------------------------------------------------------- |
| `messages`          | `Message[]`  | Queue of messages to display                              |
| `onMessageComplete` | `() => void` | Optional callback fired when a message finishes scrolling |

Each `Message` has the shape `{ message: string, twitter: string }` (see `~/schemas/message`).

### Hooks

#### `useCharWidth`

Returns the pixel width of a single character in the LCD font. Used internally by `<LCD>` for layout calculations.

```tsx
import {useCharWidth} from "~/hooks/useCharWidth"

const charWidth = useCharWidth() // e.g., 27
```

### CSS Custom Properties

The LCD font can be referenced via the `--font-lcd` CSS variable defined in `@theme`, or using the Tailwind class `font-lcd`.

---

Built with React Router.
