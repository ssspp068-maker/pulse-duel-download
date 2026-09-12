# Перенос на локальный ПК

Есть **три способа**. Бери любой.

## Способ A — ZIP (самый простой)

1. Скачай артефакт `pulse-duel-source.zip` из этого агента (Artifacts).
2. Распакуй, например в `%USERPROFILE%\Projects\pulse-duel`.
3. Дальше команды ниже.

## Способ B — Git bundle (с историей коммитов)

1. Скачай `pulse-duel-full-history.bundle`.
2. В PowerShell:

```powershell
cd $env:USERPROFILE\Projects
git clone pulse-duel-full-history.bundle pulse-duel
cd pulse-duel
```

## Способ C — GitHub (private)

Репозиторий: **https://github.com/ssspp068-maker/pulse-duel**

```powershell
cd $env:USERPROFILE\Projects
git clone https://github.com/ssspp068-maker/pulse-duel.git
cd pulse-duel
```

Если clone просит логин — войди в GitHub / Git Credential Manager под аккаунтом `ssspp068-maker`.

---

## Что нужно установить

- [Node.js LTS 22+](https://nodejs.org/) (`node -v`)
- [Git](https://git-scm.com/download/win) (для bundle/GitHub)
- [Cursor](https://cursor.com/)

## Запуск после распаковки/клона

**Самый простой путь на Windows:** дважды кликни `setup-windows.bat`  
(или `setup-windows.ps1` правой кнопкой → «Выполнить с PowerShell»).

Скрипт сам:
1. поставит Node.js через winget, если его нет;
2. сделает `npm install`;
3. откроет игру в браузере и запустит сервер.

Вручную:

```powershell
cd $env:USERPROFILE\Projects\pulse-duel
npm install
npm run dev
```

Открой:

- Компас: http://127.0.0.1:4721
- Игра: http://127.0.0.1:4721/?play=1

В Cursor: `File → Open Folder` → `pulse-duel`.

## Что уже сделано

| Часть | Статус |
|-------|--------|
| Опросник «Компас Ниши» | готово |
| Выбор механики после «игра победила» | готово |
| Прототип **Пульс-дуэль** (timing + вызов по ссылке) | готово |
| Секреты / бэкенд / Telegram Mini App | ещё нет — не нужны для локального прототипа |

## Структура

```
src/
  components/   # UI опроса и игры
  data/         # вопросы и механики
  game/         # логика timing + challenge-ссылки
  lib/          # скоринг опроса
```

## Дальше по плану (когда будешь готов)

1. Поиграть и поправить feel (скорость / зона / очки)
2. Упаковать в Telegram Mini App
3. Добавить простой бэкенд лидерборда (по желанию)

## Команды

```powershell
npm run dev       # разработка :4721
npm run build     # проверка сборки
npm run preview   # превью dist
npm run lint      # lint
```

Секретов и `.env` в проекте нет — копировать ключи не нужно.
