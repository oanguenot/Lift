# Lift TODO list

## Embedding the Middleware into an iframe

- it's possible to load sandboxed content like Middleware into an IFrame and communicate with this iframe in order to use the Middleware
--> Make a PoC to check if it's really possible to load the Middleware into an IFrame in a Chrome App (signin, search...)

--> POC RESULT: Not possible. In Google Application, LocalStorage can't be used


## Google connection

Link Lift to the Google account of the user in order to:
- Invite a google contact to a meeting
- Synchronize the meeting with the Google calendar of the user

## Conferences order

Each conferences list should be ordered. 


v1.6
Proposer un bouton "Invite" qui affiche la liste des buddies et qui permet d'ajouter un buddy (leader) ou de saisir une adresse email pour ajouter un guest (participant)
- Modificatin de la conference pour ajouter le roster
- Modification du display de la conference pour ajouter le bouton "invite" et afficher quelque chose représentant les participants invités (3 personnes invitées)
- Dans les infos de la conférence, afficher les personnes invitées

v1.7
Double URL

v1.8
Utilisation de l'API REST de login

v1.9
Classement des meetings dans la liste

v2.0
Inviter un contact Google

v2.1
Synchroniser avec l'agenda Google 