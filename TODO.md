# Lift TODO list

## Filter meetings

Add a tab selector in the bottom of the Meetings list to filter:
- LIVE: Meetings that are active
- SOON: Meetings that are not yet active
- PAST: Meetings that are finished but not removed
- ALL: All meetings

Order: ALL - LIVE (default) - SOON - PAST

--> Question: How to manage when the conference state change ? (the only to obtain this new state is to request this conference list to the server)

## Display error area

When there is an error connecting the server, the default message is displayed: "No Meeting...". 

Add a grey area, with a text: "Not connected, check your parameters!", 
This message is not visible when connection is ok and there is no meeting yet

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