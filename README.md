# Maxime-Quiz \uD83D\uDE9C

Eine kleine Lern-App f\u00fcr Maxime (7 Jahre, 2. Klasse) f\u00fcr die Sommerferien. Geht spielerisch um **Rechnen, Schreiben, Lesen** und Aufgaben aus den **Schulunterlagen** \u2013 mit Punkten, Leveln und Bagger-/Fahrzeug-Abzeichen.

## Was kann der Prototyp?

- **Rechnen** (automatisch bewertet): Plus, Minus bis 100, kleine Mal-Aufgaben
- **Schreiben** (automatisch bewertet): Diktat \u2013 Wort anh\u00f6ren und richtig tippen
- **Lesen** (Eltern-PIN): Text vorlesen, Eltern geben Punkte frei
- **Schulunterlagen** (Eltern-PIN): eigene Aufgaben, Eltern bewerten
- **Punkte & Level**: 10 Punkte pro Aufgabe, 10 Level mit Emoji-Abzeichen
- **Countdown**: bis zum letzten Schultag (17.07.2026), danach bis zum ersten Schultag (02.09.2026)
- **Eltern-PIN**: Standard `1234`

## Technik

- Reines **HTML/CSS/JavaScript (ES5)** \u2013 kein Build-Schritt n\u00f6tig
- L\u00e4uft auf einem **iPhone 5 (iOS 10.3.4)** im Safari
- Spielstand wird **offline** im `localStorage` gespeichert
- Supabase-Anbindung ist f\u00fcr sp\u00e4ter geplant (Backup/\u00dcbersicht f\u00fcr Eltern)

## Ausprobieren

1. **Lokal:** `index.html` im Browser \u00f6ffnen.
2. **Auf dem iPhone (empfohlen):** \u00fcber **GitHub Pages** ver\u00f6ffentlichen:
   - Repo \u2192 Settings \u2192 Pages \u2192 Branch `main`, Ordner `/root` \u2192 Save
   - Nach kurzer Zeit erscheint eine URL, diese im Safari \u00f6ffnen
   - \u00dcber "Zum Home-Bildschirm hinzuf\u00fcgen" wie eine App starten

## N\u00e4chste Schritte

- PIN \u00e4nderbar machen (Einstellungen)
- Mehr Aufgaben & Lese-Texte
- Supabase-Sync (Tabellen `maxime_profile`, `maxime_activities`, `maxime_badges`)
- Eigene Abzeichen-Grafiken statt Emojis
