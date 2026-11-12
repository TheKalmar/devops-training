# Zadatak 1 — Pokretanje prve aplikacije

Dobio si gotovu aplikaciju za upravljanje zadacima. Tvoj posao nije da programiraš njene funkcije, nego da pripremiš okruženje i pokreneš je na svom računaru.

Aplikacija prima HTTP zahtjeve i čuva zadatke u MySQL bazi. Next.js aplikacija radi lokalno preko Node.js-a, a MySQL treba da radi u Dockeru. Za početak pročitaj README i pogledaj strukturu projekta.

## Šta treba da uradiš

1. Instaliraj Git i provjeri da radi.
2. Instaliraj Node.js 24 LTS i provjeri da su Node.js i npm dostupni.
3. Instaliraj i pokreni Docker Desktop.
4. Kloniraj repozitorij projekta na svoj računar.
5. Pokreni MySQL 8 bazu unutar Dockera. Razmisli kako će joj aplikacija pristupiti i gdje će se čuvati podaci.
6. Kreiraj bazu i korisnika za aplikaciju, pa inicijalizuj tabelu i primjere pomoću `database/init.sql`.
7. Podesi varijable okruženja aplikacije. Kao polaznu tačku koristi `.env.example`, a svoje vrijednosti sačuvaj u `.env.local`.
8. Instaliraj npm zavisnosti.
9. Pokreni Next.js aplikaciju lokalno.
10. Testiraj REST API koristeći Postman ili curl: provjeri zdravlje aplikacije, pregledaj zadatke, dodaj novi, promijeni ga i obriši ga.

Koristi dokumentaciju alata, pretragu i bilješke. Ovdje namjerno nema gotovih Docker komandi ni infrastrukturnog rješenja. Cilj je da razumiješ šta pokrećeš i kako se dijelovi povezuju.

## Kako znaš da si završio

- Aplikacija se pokreće na tvom računaru, a MySQL radi u Dockeru.
- `/api/health` vraća status `ok` i potvrđuje vezu s bazom.
- Vidiš tri početna zadatka i možeš dodavati, čitati, mijenjati i brisati zadatke.
- Pogrešan zahtjev vraća razumljivu JSON grešku, a ne ruši aplikaciju.
- Nakon ponovnog pokretanja aplikacije tvoji podaci su i dalje dostupni.
- Znaš objasniti šta se dešava s podacima kada zaustaviš, ukloniš ili ponovo kreiraš kontejner, te kako to zavisi od načina čuvanja podataka.
- `npm run typecheck`, `npm run build` i `npm test` prolaze. Za dodatnu provjeru pripremi zasebnu test bazu i pokreni API testove opisane u README-u.
- Lozinke i lokalne konfiguracije nisu dodane u Git.

Pripremi kratak prikaz rezultata: uspješan health odgovor, primjer CRUD operacija i objašnjenje kako su aplikacija i baza povezane. Ne šalji lozinke.

## Pet pitanja za kraj

1. Šta je Docker i zašto smo ga koristili za MySQL?
2. Koja je razlika između Node.js-a i Next.js-a?
3. Šta je varijabla okruženja?
4. Kako se aplikacija povezuje s MySQL bazom?
5. Šta se dešava s podacima u bazi kada se Docker kontejner zaustavi, ukloni ili ponovo kreira?
