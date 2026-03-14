# 🟦 lcd marquee - web

A web application to send real-time messages to an LCD sitting on my desk.

🔗 https://lcd.bradgarropy.com

![lcd marquee][lcd-marquee]

## Tech Stack

- [React Router][react-router]
- [Vite][vite]
- [Tailwind][tailwind]
- [Zod][zod]
- [Cloudflare Workers][cloudflare-workers]
- [HiveMQ][hivemq]
- [LCD Dot Matrix][lcd-dot-matrix]

## Development

Clone the repository.

```zsh
git clone https://github.com/bradgarropy/lcd-marquee-web.git
```

Install dependencies.

```zsh
cd lcd-marquee-web
npm install
```

Create a `.env` file based on `.env.example` and fill in your MQTT credentials.

```zsh
cp .env.example .env
```

Start the development server.

```zsh
npm run dev
```

## Hardware

If you're interested in the hardware side of things, check out the [lcd-marquee-pi][lcd-marquee-pi] repository for the Python code that runs on a [Raspberry Pi 5][raspberry-pi] that powers the [LCD][lcd].

[lcd-marquee-pi]: https://github.com/bradgarropy/lcd-marquee-pi
[raspberry-pi]: https://raspberrypi.com/products/raspberry-pi-5
[lcd]: https://sunfounder.com/products/i2c-lcd1602-module
[lcd-marquee]: images/lcd-marquee.png
[react-router]: https://reactrouter.com
[tailwind]: https://tailwindcss.com
[cloudflare-workers]: https://workers.cloudflare.com
[hivemq]: https://hivemq.com
[zod]: https://zod.dev
[vite]: https://vite.dev
[lcd-dot-matrix]: https://fontstruct.com/fontstructions/show/142810/lcd_dot_matrix
