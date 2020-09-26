# Pinturicchio

Pinturicchio è un gioco multiplayer dove i giocatori competono per indovinare ciò che gli altri giocatori disegnano.

## **Caratteristiche** :
- Gioco multiplayer in differenti lingue offerte tramite Microsoft Azure Translator API
- Disegno libero single-player e possibilità di salvare il disegno creato
- Possibilità di login automatico tramite Facebook Oauth
- **API** REST per recupero di **immagini salvate** (tramite api_key fornita) e **generazione parole** casuali in diverse lingue

Il gioco è strutturato su un **server NodeJS** che ne controlla i comportamenti e gestisce gli **eventi asincroni** dei giocatori come l'invio dei messaggio in chat, l'invio dei tratti del disegno, i timer ed altro.
Nella pratica utilizza la **libreria Socket.io** (basato sullo schema publisher/subscriber) per l'inoltro degli eventi da client a server e viceversa.

La registrazione delle utenze ed il controllo dei Login è gestito in memoria permanente utilizzando CouchDB. I cookie utente salvano i dati necessari ai controlli sull'identificazione
durante la navigazione nelle pagine del sito.

Al momento dell'iscrizione viene generato un token tramite JWT per consentire l'utilizzo delle nostre API e gli eventuali processi di identificazione.

 ### Per utilizzare la nostra app:
- Installa CouchDB in locale sulla porta 5984
    - Predisponi un file nel DB con la seguente struttura 
    ```
    {
        "_id": "xxxxxxxxx",
        "_rev": "xxxxxxxxx",
        "users": {}
    }
    ```
- Per avviare il server:
    - Creare nella root una cartella denominata "*user_images*"
    - ```npm install```
    - Creare un file .env con la seguente struttura:
    ```
    DB_USERNAME= //username di accesso a CouchDB
    DB_PASSWORD= //password di accesso a CouchDB
    DB_DATABASE_NAME= //Nome del DB creato
    DB_DOC_ID= //Id del file presente nel DB creato
    serverURI="localhost" //cambiare se necessario
    port="4000" //cambiare se necessario
    FB_CLIENT_ID= //ID dell'applicazione registrata su Facebook for Developers
    FB_REDIRECT_URI='/login/oauth/token'
    FB_STATE='{st=state123abc,ds=123456789}'
    FB_CLIENT_SECRET=//Client secret dell'applicazione registrata su Facebook for Developers
    
    TRANSLATE_KEY=//API key per l'utilizzo delle API di traduzione di Microsoft.
    ```
    [Piano gratuito offerto da RapidApi](https://rapidapi.com/microsoft-azure-org-microsoft-cognitive-services/api/microsoft-translator-text)
- Per avviare i test:
    - Aprire il file "*jest.config.js*" e modificare il campo "*testPathIgnorePatterns*" inserendo "*rootDir/cypress*" in cui rootDir rappresenta la directory del progetto
    - Aprire un terminale e andare nella directory del progetto 
    - Digitare "*npm run test*" per avviare i test di unità e integrazione
    - Digitare "*npm run e2e*" per avviare i test End to End
    
