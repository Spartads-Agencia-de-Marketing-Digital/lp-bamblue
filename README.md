# BAMBLUE — Landing Page de Campanhas Meta

LP única para campanhas de Automação Industrial, Robótica e Retrofit. Build em HTML + CSS + JS puro, sem dependências de build, pronta a deploy estático (Netlify, Vercel, Cloudways, hosting próprio).

## Estrutura

```
lp/
  index.html          Markup completo (1 LP, 3 serviços)
  styles.css          Design system (cores extraídas de bamblue.pt)
  script.js           Form, FAQ, scroll reveal, cookies, modal
  assets/
    logo.svg
    logo-footer.svg
    servico-automacao.jpg
    servico-robotica.jpg
    servico-controlo.jpg
    foto-equipa.jpg
    foto-maquinas.jpg
    foto-engenheiro.png
```

## Secções da LP

1. **Topbar** com logo, telefone e CTA primário
2. **Hero** com headline + formulário lateral (lead capture imediato)
3. **Sectores** atendidos (faixa de confiança)
4. **Serviços** (3 cards: Automação, Robótica, Retrofit)
5. **Benefícios** (5 itens com ícones + imagem)
6. **Como Funciona** (3 passos)
7. **Prova Social** (stats, 2 testemunhos, 3 selos)
8. **Oferta + Escassez** com 2.º formulário (CTA principal de conversão)
9. **FAQ** (6 perguntas em acordeão)
10. **CTA Final** + Footer
11. **Sticky CTA** mobile + banner de cookies + modal de obrigado

## Antes de pôr no ar

### 1. Tracking
- **Meta Pixel** (linha 30 do `index.html`): substituir `PIXEL_ID` pelo ID real do pixel da BAMBLUE.
- **Google Ads / GA4** (linhas 43 a 50): descomentar e substituir `AW-XXXXXXXXX` pelo ID.
- O `script.js` já dispara:
  - `fbq('track', 'Lead', { content_name, value, currency })`
  - `gtag('event', 'generate_lead', { form_id, service })`

### 2. Backend do formulário
No `script.js`, no topo da função do formulário, definir a `ENDPOINT`:

```js
const ENDPOINT = 'https://formspree.io/f/xxxxxxxx'; // ou webhook Make/Zapier/n8n/Sheets
```

Sem `ENDPOINT`, o form abre `mailto:geral@bamblue.pt` como fallback.

Campos enviados: `nome, empresa, telefone, email, servico, localidade, desafio, rgpd, source, page, utm, timestamp`.

### 3. Telefone real
Substituir `+351000000000` (linhas 56 e 526 do `index.html`, e em `footer__col`) pelo número real da BAMBLUE.

### 4. Email real
Substituir `geral@bamblue.pt` se o email comercial for outro.

### 5. Política de privacidade
Os links `<a href="#" class="link">Política de privacidade</a>` (consent e footer) devem apontar para a página real (provavelmente `https://bamblue.pt/politica-privacidade/`).

### 6. Imagens
As 6 imagens em `assets/` foram puxadas do site bamblue.pt. Se houver fotos profissionais melhores (linha de produção real, cobots em acção, retrofit antes/depois), substituir mantendo os nomes para zero alterações no HTML.

## Paleta extraída de bamblue.pt

| Token | Hex | Uso |
|---|---|---|
| `--c-primary` | `#001AB3` | Azul BAMBLUE principal, CTAs, links |
| `--c-accent` | `#204ce5` | Hover, gradientes |
| `--c-navy` | `#112337` | Texto, footer, hero gradiente |
| `--c-blue-soft` | `#527EFF` | Acentos suaves |
| `--c-blue-pale` | `#E8EEFF` | Backgrounds de ícones, selos |
| `--c-bg-alt` | `#F5F7FB` | Backgrounds alternados |
| `--c-success` | `#00875a` | Checks da oferta |
| `--c-alert` | `#d63a3a` | Badge de escassez |

Fonte: **Sora** (Google Fonts, mesma do site).

## Deploy

Qualquer host estático funciona. Mais rápido:

```bash
# Local preview
cd lp
python3 -m http.server 5500
# abrir http://localhost:5500
```

Para produção, fazer upload da pasta `lp/` para a raiz do hosting (ex: `bamblue.pt/lp/`) ou criar projecto Netlify/Vercel a apontar para esta pasta.

## URL recomendado para Meta Ads

```
https://bamblue.pt/lp/?utm_source=meta&utm_medium=paid&utm_campaign=tofu_automacao
https://bamblue.pt/lp/?utm_source=meta&utm_medium=paid&utm_campaign=tofu_robotica
https://bamblue.pt/lp/?utm_source=meta&utm_medium=paid&utm_campaign=tofu_retrofit
```

Os parâmetros UTM são capturados e enviados com o lead via campo `utm`.
