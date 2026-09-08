# BusinessPilot AI

Операционка барои соҳибкорони Тоҷикистон: CRM, анбор, нархгузорӣ, симулятор ва қарорҳои AI. Забонҳо: тоҷикӣ, русӣ, англисӣ.

Прогноз аст, на кафолати фоида. Маълумоти зинда = вуруди шумо + CSV + webhook-и POS. Бозори Somon/OLX зинда скрейп намешавад.

## Оғоз

```bash
npm install
copy .env.example .env
```

Дар `.env` гузоред:

- `JWT_SECRET` — сатри дароз ва тасодуфӣ
- `ANTHROPIC_API_KEY` — калиди Claude (`sk-ant-...`), агар AI-ро хоҳед

```bash
npm run build
npx next start -p 3000
```

Ё барои кор: `npm run dev`.

Кушоед: [http://localhost:3000/tg](http://localhost:3000/tg)

## Чӣ кор мекунад ҳозир

- Бақайдгирӣ / ворид → онбординг (бизнес ҳаст / мехоҳам оғоз кунам)
- Панел, нарх, анбор, симулятор, амалҳо, агентҳо
- CSV ва `POST /api/ingest/sale` бо калиди API
- Маълумот дар `data/app.json` (MVP). PostgreSQL/Prisma барои марҳилаи баъдӣ аст

## Stack

Next.js 16 · TypeScript · next-intl · Tailwind 4 · Claude API
