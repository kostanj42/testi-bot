# Opis

Discord bot za pošiljanje obvestil o testih in naročanju malice. V delujočem stanju, samo za 1 server. Avtomatski restart ob polnoči(samo na začetku preverja in pošilja).

# Delovanje
Bot uporablja 3 kanale: seznam testov, obvestila za teste, obvestila za malico.

Na seznamu so vsi vnešeni testi, za teste v 14 dneh pa tudi opisi. Seznam se sam posodobi ob vnosu novega testa / izbrisu.

Bot ob polnoči pošlje obvestila za prihajajoče teste v naslednjih 14 dneh: čez 1, 2, 3, 4, 5, 7, 10, 14 dni. Zraven so tudi opisi. Enako pošlje obvestila za malico 1, 2, 3 dni prej.

Če manka kak id kanala, rola, zbrisan kanal,... ne dela, bo krešu.

Za dodatna vprašanja: Kostanj42#5526

# Komande
at: dodajanje testa. Možno dodajanje več testov za isti predmet na isti dan. Opis ni nujen. Primer: +at mat 15.4.2023 "4. test"

rt: izbris testa. Če je več istih testov v enem dnevu, nevem kako briše, gl. Primer: +rt mat 15.4.2023

am: doda moderatorja. Primer: +am 291620103387348994  (user id)

rm: odstrani moderatorja. Primer: +rm 291620103387348994  (user id)


## Nastavitve
1. kanal za seznam testov: nastavljen v \reminders\channels\E4C.txt v obliki 
```
channelid:messageid
```

2. kanal za pošiljanje obvestil za teste: nastavljen v \reminders\channels\static.json v obliki 
```json
{
	"obvestila":"channel id za pošiljanje obvestil",
	
	"guildid":"server id"
}
```

3. kanal za pošiljanje obvestil za malico: nastavitve v \kroky.json
```json
{
    "danvtednu":"3",
    "channelid":"kanal za pošiljanje obvestil",
    "roles": {
        "kroky1":"id role-a za 1 dan",
        "kroky2":"-||- 2 dni",
        "kroky3":"-||- 3"
    }
}
```

4. roles za obvestila za teste: \reminders\roles.json
```json
{
	"endan":"",
	"dvadni":"",
	"tridni":"",
	"stiridni":"",
	"petdni":"",
	"sedemdni":"",
	"desetdni":"",
	"stirinajstdni":"",
	"vsakdan":""
}
```

5. \settings.json: prefix in token

6. .txt datoteka s seznamom testov
```
predmet:timestamp:opis
```

7. datoteki \reminders\sent\E4C.txt in \reminders\sent-kroky\E4C.txt samo beležita če je bilo obvestilo že poslano.

8. .bat datoteka: za zagon in ponoven restart.

9. random nastavitve in podobno v \tindex.js
- glavni user(lahko dodaja moderatorje in uporablja vse komande(nekatere so samo testne)): funkcija aJeToKostan(vrstica 950): za spremenit user id 
- velikrat je v () "E4C", mišlen kot razred (če bi blo nrjen za več razredov). Najbol da se povsod zamena, med drugim za seznam(909), vse .txt datoteke.
- določene stvari zgledajo kot da se jih lahko spremeni, ampak tega ne priporočam.
- zakomentirane stvari: še sam nevem ampak tako kot je dela in se ne dotikam.
- "Napaka: 123": nima določenega imena, samo za lažje iskanje.
- spreminjanje trenutnega leta: vrstice 835, 897, 900 (doublecheck)