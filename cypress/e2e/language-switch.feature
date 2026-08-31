Feature: Switch de langue NBC
  En tant qu'utilisateur
  Je veux basculer entre les pages FR et EN
  Afin de verifier le switch de langue sur prod

  Scenario Outline: Basculer de langue sur prod
    Given je teste l'environnement "prod"
    And j'utilise le device "<device>"
    And j'ouvre la page "<fromLang>"
    When je clique sur le switch vers "<toLang>"
    Then je suis redirige vers la page "<toLang>"

    Examples:
      | device  | fromLang | toLang |
      | desktop | fr       | en     |
      | desktop | en       | fr     |
      | mobile  | fr       | en     |
      | mobile  | en       | fr     |
