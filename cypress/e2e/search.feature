Feature: Recherche NBC
  En tant qu'utilisateur
  Je veux rechercher un mot depuis le menu
  Afin de verifier que la recherche fonctionne en desktop et mobile

  @search @prod
  Scenario Outline: Rechercher un mot-cle sur prod
    Given je prepare le test de recherche sur "prod"
    And je choisis le device de recherche "<device>"
    And je suis sur la page de recherche "<lang>"
    When j'ouvre la recherche depuis le menu si necessaire
    And je recherche le mot "<keyword>"
    Then je vois des resultats de recherche
    And je vois le mot "<keyword>" dans la page de resultats

    Examples:
      | device  | lang | keyword  |
      | desktop | fr   | quebec   |
      | mobile  | fr   | quebec   |
      | desktop | en   | business |
      | mobile  | en   | business |
