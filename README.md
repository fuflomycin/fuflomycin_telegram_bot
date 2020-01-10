# Fuflomycin Telegram bot

- [t.me/FuflomycinBot](https://t.me/FuflomycinBot)

## Install

Setup node modules

```bash
npm i
```

Setup Firebase CLI:

```bash
npm i -g firebase-tools
```

To start this bot you need "Blaze" Firebase plan.

Login to Firebase:

```bash
firebase login
```

## Configure

Setup bot token

```bash
firebase functions:config:set service.bot_token=""
```

Save token to local file for development:

```bash
firebase functions:config:get > env.json
```

## Start

Start local bot

```bash
firebase serve
```

## Deploy

Deploy bot to Firebase:

```bash
firebase deploy --only functions
```
