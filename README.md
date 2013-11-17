SantanderJS
============

Esta pequeña librería de [CasperJS](http://casperjs.org/) sirve para obtener tus
transacciones de la página de Santander Chile en formato JSON.

Quick Start
-----------

1. Instalar [CasperJS](http://casperjs.org/).

2. En el directorio donde descargaste SantanderJS, creá un archivo `app.js` y
   colocá el siguiente código:

   ```
   var santander = require('santander');

   var transactions = {};

   // Reemplazar con tu RUT y contraseña
   santander.login('99.111.222-3', '5555')

     // Para obtener las transacciones nacionales de una tarjeta de crédito, debés
     // utilizar el tipo 'credit_card' y pasar los últimos 4 números de la tarjeta.
     .get('credit_card', '0123', function(data) {
       transactions['credit_card_0123'] = data;
     })
  
     // Para las transacciones internacionales de una tarjeta de crédito, debés
     // utilizar el tipo 'credit_card_intl' y pasar los últimos 4 números de la
     // tarjeta.
     .get('credit_card_intl', '0123', function(data) {
       transactions['credit_card_intl_0123'] = data;
     })
  
     // Para una cuenta corriente o cuenta vista, debés utilizar el tipo
     // 'bank_account' y pasar el número completo de la cuenta.
     .get('bank_account', '000000000001', function(data) {
       transactions['bank_account_000000000001'] = data;
     })
  
     // Esta última llamada es obligatoria.
     .run(function() {
       console.log(JSON.stringify(transactions, undefined, 2));
     })
   ;
   ```

3. Ejecutá `app.js` de la siguiente forma:

   ```
   casperjs --ignore-ssl-errors=yes app.js
   ```

   El switch `--ignore-ssl-errors=yes` **es obligatorio**, si no lo colocás la
   librería no va a funcionar.
   
4. Cuando la script se termine de ejecutar, deberías ver un JSON parecido a:


   ```
   {
      "credit_card_0123": [
        {
          "amount": -10000,
          "date": "18/11/2013",
          "description": "Traspaso Chequera a Cta. Cte."
        },
        {
          "amount": 2100,
          "date": "07/11/2013",
          "description": "Transf de ALEJANDRO G"
        },
        {
          "amount": 100000,
          "date": "07/11/2013",
          "description": "SALDO INICIAL"
        }
      ],
      "credit_card_intl_0123": [
        /* ... */
      ],
      "bank_account_000000000001": [
        /* ... */
      ]
   }
   ```
