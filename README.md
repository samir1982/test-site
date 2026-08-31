# Projet Cypress Gherkin - Test du switch FR/EN (NBC)

Ce projet permet de tester automatiquement le switch de langue FR/EN avec Gherkin (BDD) sur l'environnement `prod`.

## URLs testees

- Prod FR: https://www.nbc.ca/fr/entreprises.html
- Prod EN: https://www.nbc.ca/en/business.html

## Installation

```bash
npm install
```

## Lancer les tests

Le scenario Gherkin est dans:

- cypress/e2e/language-switch.feature
- cypress/e2e/search.feature

- Ouvrir Cypress UI:

```bash
npm run cy:open
```

- Lancer tous les tests en `prod`:

```bash
npm run test:prod
```

- Lancer uniquement le test de switch en `prod`:

```bash
npm run test:switch:prod
```

- Lancer uniquement le switch depuis FR (navigateur visible):

```bash
npm run test:switch:prod:fr
```

- Lancer uniquement le switch depuis EN (navigateur visible):

```bash
npm run test:switch:prod:en
```

- Lancer FR sur Desktop:

```bash
npm run test:switch:prod:fr:desktop
```

- Lancer FR sur Mobile:

```bash
npm run test:switch:prod:fr:mobile
```

- Lancer EN sur Desktop:

```bash
npm run test:switch:prod:en:desktop
```

- Lancer EN sur Mobile:

```bash
npm run test:switch:prod:en:mobile
```

- Lancer la recherche (tous les cas):

```bash
npm run test:search:prod
```

- Lancer la recherche FR Desktop:

```bash
npm run test:search:prod:fr:desktop
```

- Lancer la recherche FR Mobile:

```bash
npm run test:search:prod:fr:mobile
```

- Lancer la recherche EN Desktop:

```bash
npm run test:search:prod:en:desktop
```

- Lancer la recherche EN Mobile:

```bash
npm run test:search:prod:en:mobile
```

- Commande directe avec le parametre de langue:

```bash
npx cypress run --headed --browser chrome --spec cypress/e2e/language-switch.feature --env targetEnv=prod,lang=fr
```

Valeurs supportees pour `lang`: `fr`, `en`.
Valeurs supportees pour `device`: `desktop`, `mobile`.

## Ce qui est valide

Le test verifie:

- La page de depart FR ou EN est bien chargee.
- Un lien de switch de langue est present.
- Le clic bascule bien sur l'autre langue.
- Le host et la route de destination correspondent a l'environnement prod.

## Configuration globale

- Le consentement cookies est gere globalement dans cypress/support/e2e.js.
- OneTrust et Didomi sont acceptes automatiquement si la banniere apparait.
- Si la banniere n'est pas affichee, le test continue sans erreur.
- Les selecteurs sont decoupes par domaine:
	- cypress/support/selectors/consent.selectors.js
	- cypress/support/selectors/navigation.selectors.js
	- cypress/support/selectors/search.selectors.js

Pour un futur test recherche (exemple mot-cle "quebec"), ajoute les selecteurs et la donnee de test dans:
- cypress/support/selectors/search.selectors.js

## GitHub Actions (manuel)

- Workflow: .github/workflows/cypress-manual.yml
- Ouvre GitHub > Actions > Cypress Manual Run > Run workflow
- Parametres disponibles:
- environment: prod
- language: all, fr, en
- device: all, desktop, mobile
- tags: filtre Gherkin (ex: @switch, @search, @search and not @wip)
- keyword: mot recherche optionnel (ex: entreprises, business)
- email_to: destinataire du resultat (defaut: salounici@gmail.com)

Tags Gherkin disponibles:

- @switch pour le scenario de switch de langue
- @search pour le scenario de recherche
- Si tags=@switch, l action lance language-switch.feature
- Si tags=@search, l action lance search.feature
- Si tags est vide, l action lance tous les fichiers .feature

Notification email apres execution:

- Le workflow envoie un email avec le statut et le lien du run.
- Configure ces secrets GitHub dans Settings > Secrets and variables > Actions:
- SMTP_SERVER (ex: smtp.gmail.com)
- SMTP_PORT (ex: 465)
- SMTP_USERNAME (adresse d envoi)
- SMTP_PASSWORD (mot de passe applicatif)
- MAIL_FROM (adresse expediteur, souvent la meme que SMTP_USERNAME)
