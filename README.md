# Ladenfenster

Übungsprojekt: statische Website einer erfundenen Webagentur aus Steyr.
Reines HTML, CSS und JavaScript, ohne Framework und ohne Build-Schritt.

## Ansehen

```
powershell -ExecutionPolicy Bypass -File server.ps1
```

Danach im Browser http://localhost:5500 öffnen. Mit `-Port 8000` geht auch ein anderer Port.

## Struktur

```
index.html        Startseite
leistungen.html   Leistungen und "Was wir nicht machen"
referenzen.html   drei Beispielprojekte mit Detail-Fenster
pakete.html       Pakete, Wartungs-Schalter, FAQ
kontakt.html      Formular-Attrappe mit Prüfung beim Ausfüllen
impressum.html    Platzhalter nach § 5 ECG und § 25 MedienG
css/style.css     alle Stile (Farben als Variablen ganz oben, Dark Mode gleich darunter)
js/main.js        Menü, Live-Status, Detail-Fenster, Schalter, Formular
server.ps1        kleiner lokaler Webserver für die Vorschau
```

Navigation und Footer stehen in jeder HTML-Datei gleich drin. Bei einer Änderung
müssen sie in allen sechs Dateien angepasst werden. Die aktuelle Seite ist mit
`aria-current="page"` markiert.
