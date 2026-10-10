# Iraklis — site portofoliu

Site static, făcut doar cu HTML, CSS și JavaScript. Nu are nevoie de build, de Node sau de vreun framework. Merge direct pe **GitHub Pages**, **Vercel** sau **Netlify** și e responsive pentru telefon, tabletă și desktop.

## Ce conține

```
index.html          Acasă
works.html          Galeria cu toate cele 14 serii (cu filtru după loc)
series.html         Pagina unei serii: series.html?s=iconostasis-moscow
contact.html        Contact + formular
404.html            Pagina „nu există” (GitHub Pages o folosește automat)
assets/
  css/style.css     Tot designul (culori, fonturi și spații sunt în :root, sus)
  js/data.js        LISTA DE LUCRĂRI. Aici editezi seriile.
  js/main.js        Meniul de pe telefon, galeria, viewer-ul de poze și formularul
  fonts/            Fonturile (Cormorant Garamond, Marcellus, Jost), găzduite local
  img/works/<serie>/01.jpg, 01-sm.jpg …   Pozele, câte 2 mărimi (1600px și 800px)
  img/site/         Portretul, timpanul „Bunavestire”, imaginea de share (og.jpg)
```

## Cum îl vezi pe calculator

Cel mai simplu e cu extensia **Live Server** din VS Code: click dreapta pe `index.html` și alegi „Open with Live Server”.

Sau din terminal, în folderul proiectului:

```bash
npx serve .
# sau
python3 -m http.server 8000
```

## Cum îl pui pe GitHub Pages

1. Creează un repository nou pe GitHub, de exemplu `iraklis`.
2. Urcă fișierele, **cu tot cu folderul `assets`**. Ai două variante:
   - din browser: „Add file” → „Upload files” și tragi tot conținutul folderului;
   - din terminal:
     ```bash
     git init
     git add .
     git commit -m "Iraklis portfolio"
     git branch -M main
     git remote add origin https://github.com/UTILIZATORUL-TAU/iraklis.git
     git push -u origin main
     ```
3. În repository mergi la **Settings → Pages**. La „Source” alegi **Deploy from a branch**, apoi branch-ul `main` și folderul `/ (root)`, și salvezi.
4. După 1–2 minute site-ul e live la `https://UTILIZATORUL-TAU.github.io/iraklis/`.

Toate link-urile sunt relative, deci site-ul merge și într-un subfolder, cum e cel de mai sus.

**Domeniu propriu** (de ex. `iraklis.art`): în Settings → Pages → „Custom domain” scrii domeniul, iar la firma de unde ai cumpărat domeniul pui înregistrările DNS indicate de GitHub.

**Vercel** (ca site-urile de până acum): „Add New → Project”, alegi repository-ul, la Framework Preset alegi **Other**, lași Build Command gol și dai Deploy.

## Cum modifici lucrările

Totul e în `assets/js/data.js`. Fiecare serie arată așa:

```js
{
  slug: "iconostasis-moscow",      // numele folderului cu poze + adresa paginii
  title: "Iconostasis",
  place: "Moscow, Russia",
  years: "",                        // ex. "2018" sau "2008–2009"
  region: "russia",                 // filtrul din galerie: athos, russia, georgia, ny, studio
  category: "Sacred art",
  materials: "",                    // ex. "Limestone, red marble"
  description: "",                  // 2–3 propoziții despre lucrare
  images: [
    { f: '01', w: 1080, h: 1418, sw: 609 },   // 01 = coperta seriei
    ...
  ]
}
```

- **An, materiale, descriere:** completează câmpurile `years`, `materials` și `description`. Ce rămâne gol nu apare pe site, deci nu se văd goluri sau texte de umplutură. Merită cerute de la Iraklis măcar pentru seriile importante.
- **Ordinea pozelor:** prima poză (`01`) e coperta și apare mare sus pe pagina seriei, a doua apare lată sub ea, iar restul intră în grilă.
- **Ordinea seriilor:** e ordinea din fișier. Numerotarea Nº 01, Nº 02 … se face automat.

### Cum adaugi o serie nouă

1. Creează folderul `assets/img/works/numele-seriei/` și pune pozele cu numele `01.jpg`, `02.jpg` și așa mai departe.
   Redimensionează-le înainte la maximum 1600px pe latura lungă, de exemplu cu [squoosh.app](https://squoosh.app).
2. Adaugă în `data.js` un obiect nou, cu `slug: "numele-seriei"` și pozele scrise simplu: `{ f: '01' }, { f: '02' }`.
   `w`, `h`, `sw` și fișierele `-sm.jpg` sunt opționale. Ajută doar la viteză pe telefon.
3. Dacă vrei ca seria să apară și pe prima pagină, editezi direct `index.html`.

## Formularul de contact

Când vizitatorul apasă „Send enquiry”, i se deschide aplicația de email cu mesajul deja completat către `narikaleli1@gmail.com`. Nu e nevoie de server sau de vreun serviciu extern.
Ca să schimbi adresa, modifici `CONTACT_EMAIL` în `assets/js/main.js` și link-urile `mailto:` din fișierele HTML.

Dacă mai târziu vrei ca mesajele să vină direct, fără să se deschidă aplicația de email, poți folosi Formspree sau Web3Forms. Pui `action` pe formular și scoți handler-ul din `initContact()`.

## După ce ai domeniul

În fiecare fișier HTML înlocuiește `content="assets/img/site/og.jpg"` cu adresa completă, de exemplu `https://iraklis.art/assets/img/site/og.jpg`. Așa apare poza când cineva trimite link-ul pe WhatsApp sau Facebook.

## Note

- Textele sunt în engleză și sunt adaptate după site-urile vechi. Merită verificate cu Iraklis.
- Pozele au fost optimizate și ușor uniformizate în culori. Fotografiile originale nu sunt incluse.
- Fonturile sunt sub licența SIL Open Font License (vezi `assets/fonts/LICENSE-*.txt`).
