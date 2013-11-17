var require = patchRequire(require);

var casper = require('casper').create({
  clientScripts: ['jquery.min.js']
});

module.exports = (function() {
  function getFromBankAccount(number, callback) {
    casper.thenOpen('https://www.santander.cl/transa/productos/um/decide.asp', function() {
      this.evaluate(function(number) {
        $('#cta' + number).click();
        $('#botoneraTable input:first').click();
      }, number);
    });

    casper.then(function() {
      var data = this.evaluate(function() {
        var cells = $.map($('td[class^=td_]:not([valign], [width])'), function(cell) {
            return $(cell).text().trim();
        });

        for (var i = 1, width = 0; i < cells.length; i++) {
            if (cells[i].match(/\d+-\d+-\d+/)) {
                width = i;
                break;
            }
        }

        var data = [];
        for (var i = 0; i < (cells.length / width); i++) {
          var row = cells.slice(i * width, (i + 1) * width);
          data.push({
            'date': row[0].replace(/-/g, '/'),
            'description': row[3],
            'amount': row[2].replace('.', '').replace(',', '.') - row[1].replace('.', '').replace(',', '.')
          });
        }

        // Obtenemos el saldo inicial y lo incluimos como una transacción.
        var amount = $('td.hdr:contains(Saldo Contable Inicial ($))')
            .text()
            .replace(/.*\(\$\)/, '')
            .trim();
        if (! amount) {
            amount = $('td.hdr:contains(Inicial)')
                .closest('table')
                .find('td.td_f:nth(0)')
                .text()
                .trim();
        }
        data.push({
          'date': data[data.length - 1].date,
          'description': 'SALDO INICIAL',
          'amount': amount.replace('.', '').replace(',', '.')
        });

        return data;
      });

      callback(data);
    });
  }

  function getFromCreditCard(number, type, callback) {
    casper.thenOpen('https://www.santander.cl/transa/productos/tc_conti/pampa/decideum2.asp', function() {
      this.evaluate(function(number, type) {
        var row = $('tr:contains(' + number + '):last');
        row.find('#numtcr').click();
        row.find('select').val(type);
        pasar();
      }, number, type);
    });

    casper.then(function() {
      var data = this.evaluate(function() {
        var cells = $.map($('td[class^=td_]:not(.td_c)'), function(cell) {
            return $(cell).text().trim();
        });

        var data = [];
        for (var i = 0; i < (cells.length / 4); i++) {
          var row = cells.slice(i * 4, (i + 1) * 4);
          data.push({
            'date': row[0],
            'description': (row[1] + ' ' + row[2]).trim(),
            'amount': -row[3].replace('.', '').replace(',', '.')
          });
        }

        return data;
      });

      callback(data);
    });
  }

  return {
    login: function(username, password) {
      casper.start('https://www.santander.cl', function() {
        this.fill('form[name=autent]', {
          'd_rut': username,
          'd_pin': password
        }, true);
      });

      return this;
    },

    get: function(type, number, callback) {
      switch (type) {
        case 'bank_account':
          getFromBankAccount(number, callback);
          break;

        case 'credit_card':
          getFromCreditCard(number, 'N', callback);
          break;

        case 'credit_card_intl':
          getFromCreditCard(number, 'I', callback);
          break;
      }

      return this;
    },

    run: function(callback) {
      casper.run(function() {
        callback();
        this.exit();
      });
    }
  }
})();
