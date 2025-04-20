
# Projet Centrale 3A : Application Web pour la Frappologie

Ce projet est une application web développée avec **SvelteKit** et exécutée à l'aide de **Bun**. L'application permet :  
- La création et l'enregistrement de comptes utilisateurs.  
- La saisie et l'enregistrement de données par les utilisateurs.  
- La visualisation des données dans une page dédiée.  
- La gestion des utilisateurs dans une interface d'administration.  

## Fonctionnalités

1. **Page Sign Up** :  
    Permet aux nouveaux utilisateurs de créer un compte.

2. **Page Login** :  
    Permet aux utilisateurs d'accéder à leur espace personnel et de se faire reconnaître par notre IA.  

3. **Autres pages** :  
    Permettent d'administrer le site, mais elles ne sont pas pertinentes si l'on souhaite uniquement tester notre IA de reconnaissance de frappe.

## Installation et Exécution

1. **Prérequis** :  
    - Bun

2. **Installation** :  
    Clonez le dépôt, puis installez les dépendances :  
    ```bash
    bun install
    ```

3. **Lancement en développement** :  
    ```bash
    bun dev --open
    ```

4. **Construction pour la production** :  
    Pour construire l'application pour un déploiement en production :  
    ```bash
    bun build
    ```

5. **Exécution en production** :  
    Une fois l'application construite, exécutez-la avec :  
    ```bash
    bun start
    ```