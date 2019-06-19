
if (localStorage.getItem("savedFrameworks") === null) {
  localStorage.setItem("savedFrameworks", JSON.stringify([]));
}
if (localStorage.getItem("savedFrameworksv2") === null) {
  localStorage.setItem("savedFrameworksv2", JSON.stringify({"frameworks":{} } ));
}

$(function() {

  fat.basket.init()

  var pageId = $('body').prop('id');

  if (pageId === 'page-fat-search-results') {
    fat.search.init();
  }

  if (pageId === 'page-fat-details') {
    fat.details.init();
    fat.search.setUpCheckboxes();
  }

  if (pageId === 'page-fat-basket') {
    fat.basketDetails.init();
  }

  if (pageId === 'page-fat-training-provider') {
    fat.details.init();
    fat.provider.init();
  }

});

var fat = fat || {};

fat.provider = {
  init: function () {
    this.setUpCheckboxes();
  },
  setUpCheckboxes: function () {
    var that = this;
    var frameworkId = $('body').data('id');
    var data = JSON.parse(localStorage.getItem("savedFrameworksv2"));

    $('.checkbox-save-provider').on('change', function() {
      var checked = $(this).prop('checked');
      var frameworkId = $('body').data('id');
      var providerId = $(this).closest('li.search-result').data('provider-id');
      var providerName = $(this).closest('li.search-result').find('h2 > a').text()

      if (checked) {
           that.addConfirmMessageTP(providerName);
        that.saveTrainingProvider(frameworkId, providerId, providerName);
        $(this).next().text('Remove');
      } else {
           that.removeConfirmMessageTP(providerName);
        that.removeTrainingProvider(frameworkId, providerId);
        $(this).next().text('Add to the apprenticeship');
      }
    }).each(function () {
      var providerId = $(this).closest('li.search-result').data('provider-id');
      var alreadySaved = frameworkId in data.frameworks;
      if (alreadySaved) {
        if (providerId in data.frameworks[frameworkId].providers) {
          $(this).click();
        }
      }
    });
  },
  saveTrainingProvider: function (frameworkId, providerId, providerName) {

    var savedFrameworks = JSON.parse(localStorage.getItem("savedFrameworksv2"));

    // Does framework exist
    var alreadySaved = frameworkId in savedFrameworks.frameworks;

    if (alreadySaved) {
      var providers = savedFrameworks.frameworks[frameworkId].providers;
      if (providers == undefined) {
        var newProvider = {"providers":{}}
        newProvider.providers[providerId] = providerName;
        savedFrameworks.frameworks[frameworkId] = newProvider;
        localStorage.setItem('savedFrameworksv2', JSON.stringify(savedFrameworks))
      } else {
        savedFrameworks.frameworks[frameworkId].providers[providerId] = providerName;
        localStorage.setItem('savedFrameworksv2', JSON.stringify(savedFrameworks));
      }
    } else {
      var newProvider = {"providers":{}}
      newProvider.providers[providerId] = providerName;
      savedFrameworks.frameworks[frameworkId] = newProvider;
      localStorage.setItem('savedFrameworksv2', JSON.stringify(savedFrameworks))
      fat.basket.updateBasketCount(Object.keys(savedFrameworks.frameworks).length)
    }

  },
  addConfirmMessageTP: function (providerName) {
   $('.confirmation-message-panel').remove();
   html = '<div class="confirmation-message-panel"><span></span><div class="content"><h1><div class="apprenticeship-title">' + providerName + '</div> has now been added to your favourites</h1></div> </div>';
   $('main').before(html);
  },
  removeConfirmMessageTP: function(providerName) {
   $('.confirmation-message-panel').remove();
   html = '<div class="confirmation-message-panel delete-panel"><span></span><div class="content"><h1><div class="apprenticeship-title">' + providerName + '</div> has now been removed from your favourites</h1></div> </div>';
   $('main').before(html);
  },

  removeTrainingProvider: function (frameworkId, providerId) {
    var data = JSON.parse(localStorage.getItem("savedFrameworksv2"));
    delete data.frameworks[frameworkId].providers[providerId];
    localStorage.setItem('savedFrameworksv2', JSON.stringify(data))
  }
}

fat.basketDetails = {
  init: function () {
    var saved = JSON.parse(localStorage.getItem("savedFrameworksv2"));
    var savedFrameworks = saved.frameworks;
    if (Object.keys(savedFrameworks).length) {
      this.readBasket(savedFrameworks)
    }
  },
  readBasket: function (basketIds) {
    var that = this;
    $('.wrap').removeClass('FAT-basket-empty');
    $.ajax({
      url: "frameworks-trimmed.json",
      dataType: "json"
    }).done(function (data) {
      that.processBasket(basketIds, data)
    })
  },
  processBasket: function (basketIds, data) {
    var frmWrks = [];
    $.each(basketIds, function(index, frameworkId) {
      var id = index;
        $.each(data, function(index, framework) {
          if (framework.Id === id) {
            var fw = {};
            fw.id = framework.Id;
            fw.title = framework.Title;
            fw.level = framework.Level;
            fw.length = framework.Duration;
            fw.providers = basketIds[id].providers
            frmWrks.push(fw)
          }
        });
    });
    this.showBasket(frmWrks)
  },

  showBasket: function (frameworks) {
    var html = '<ol class="search-results-list" id="your-selected-items">';
    var that = this;
    var providerCount = 0;

    $.each(frameworks, function(index, framework) {
      html = html + that.basketListHtml(framework)
    });

    $('.apprenticeship-number').html(frameworks.length);

    html = html + '</ol>';

    $('#populated-basket').html(html);
    this.basketEvents();

  },
  basketListHtml: function (framework) {
   // console.log(framework)
    var template = "<li class=\"basket-item\" data-id=\"{{ id }}\">\n" +
      "               <h2 class=\"heading-l\">\n" +
      "                    <a href=\"/campaign/FAT/3-FAT-apprenticeship?id={{ id }}\" class=\"apprenticeship-title\">{{ title }}</a>\n" +
      "                    <a href=\"#\" class=\"remove\">Remove from basket</a>\n" +
      "                    <div class=\"form-group radios\">\n" +
      "                         <div class=\"checkboxes__item compare-label\">\n" +
      "                              <input class=\"checkboxes__input compare-item compare-apprenticeship-feature\" type=\"checkbox\" value=\"true\" id=\"compare-apprenticeship-1\" name=\"compare-apprenticeship-feature\">\n" +
      "                              <label class=\"label checkboxes__label\" for=\"compare-apprenticeship-1\">Compare</label>\n" +
      "                         </div>\n" +
      "                    </div>\n" +
      "               </h2>\n" +
      "               <div class=\"left-content\">\n" +
      "                    <div class=\"warning\"><span>warning</span>This apprenticeship is closed to new starters from 1 August 2020</div>\n" +
      "                    <p><strong>Level:</strong> {{ level }} (equivalent to A levels at grades A to E)</p>\n" +
      "                    <p><strong>Typical length:</strong> {{ length }} months</p>\n" +
      "               </div>\n" +
      "               <div class=\"right-content\">\n" +
      "               {{ providers }} </div>\n" +
      "          </li>";

    var providersHtml = '';

    var porivdersActions = `
         <div class="form-group radios">
              <div class="checkboxes__item compare-label">
                   <input class="checkboxes__input compare-item" type="checkbox" value="true" id="compare" name="compare-feature">
                   <label class="label checkboxes__label" for="compare">Compare</label>
              </div>
              <a href="#" class="remove">Remove from basket</a>
         </div>
    `;

    if (framework.providers !== undefined && Object.keys(framework.providers).length > 0) {
      providersHtml = '<h3>Training providers</h3><ul class="training-providers-list">';

      $.each(framework.providers, function (a, b) {
        providersHtml = providersHtml + '<li>' + b + porivdersActions + '</li>';
      });
      providersHtml = providersHtml + '</ul>'
    }

    return template
          .replace(/{{ id }}/g, framework.id)
          .replace('{{ level }}', framework.level)
          .replace('{{ length }}', framework.length)
          .replace('{{ title }}', framework.title)
          .replace('{{ providers }}', providersHtml);
  },
  basketEvents: function () {
    var deleteButtons = $('.basket-item .remove');
    deleteButtons.on('click', function (e) {

      var that = $(this);

      mscConfirm("Delete", "Do you want to delete this item from your basket?",

        function() {
          fat.basketDetails.deleteBasketItem(that)
        }
      );

      e.preventDefault()
    });

  },
  deleteBasketItem: function (item) {

    var basketItem = item.closest('.basket-item');
    var fId = basketItem.data('id');

    basketItem.remove();

    var data = JSON.parse(localStorage.getItem('savedFrameworksv2'));
    var savedFrameworks = data["frameworks"];

    var alreadySaved = fId in savedFrameworks;

    if (alreadySaved) {
      delete savedFrameworks[fId];
      localStorage.setItem('savedFrameworksv2', JSON.stringify(data))
      fat.basket.updateBasketCount(Object.keys(savedFrameworks).length)
    }

    if (Object.keys(savedFrameworks).length === 0) {
      $('.wrap').addClass('FAT-basket-empty');
    }
  }
}

fat.details = {
  init: function () {
    this.doSearch()
  },
  doSearch: function () {
    var that = this;
    $.ajax({
      url: "frameworks.json",
      dataType: "json"
    }).done(function(data) {
      that.findFramework(data)
    });
  },
  findFramework: function (data) {
    var id = $('body').data('id');
    var title, length;
    $.each(data, function(index, framework) {
      if (id == framework.Id) {
        title = framework.Title;
        length = framework.Length;
      }
    });

    $('.fat-apprenticeship-title').text(title);
    this.checkIfSaved(id)
  },
  checkIfSaved: function (id) {
    var id = id.toString();
    var getBasketData = JSON.parse(localStorage.getItem("savedFrameworksv2"));
    var basketData = getBasketData.frameworks;
    var isSavedinBasket = id in basketData;
    if (isSavedinBasket) {
      $('.checkbox-save').prop('checked', 'checked').next().text('Remove');;
    }
  }
}

fat.basket = {
  init: function () {
    var saved = JSON.parse(localStorage.getItem("savedFrameworksv2"));
    this.updateBasketCount(Object.keys(saved.frameworks).length);
  },
  updateBasketCount: function (basketCount) {
      var basket = $('.basket');
      if (basketCount > 0) {
        basket.addClass('full');
      } else {
        basket.removeClass('full');
      }
      $('.basket .number').html(basketCount);
  }
}

fat.search = {
  init: function () {
    $('#fat-search-results').hide();
    this.doSearch();
  },
  doSearch: function () {
    var that = this;

    $.ajax({
      url: "frameworks-trimmed.json",
      dataType: "json"
    }).done(function(data) {
      that.processSearch(data)
    });
  },
  printResults: function (data) {
    var html = '';
    var getBasketData = JSON.parse(localStorage.getItem("savedFrameworksv2"));
    var basketData = getBasketData.frameworks;
    var template = "<li class=\"search-result\" data-id=\"{{ id }}\">\n" +
                    "<h2 class=\"heading-m\">\n" +
                    "     <a href=\"3-FAT-apprenticeship?id={{ id }}\" class=\"apprenticeship-title\">{{ title }}</a>{{ warning }}\n" +
                    "</h2>\n" +
                    "<div class=\"content-row\">\n" +
                    "     <p><strong>Level:</strong> {{ level }} {{ levelCaption }}</p>\n" +
                    "     <p><strong>Typical length:</strong> {{ length }} months</p>\n" +
                    "</div>\n" +
                    "<div class=\"cta-row\">\n" +
                    "     <div class=\"form-group radios\">\n" +
                    "          <div class=\"checkboxes__item save-label\">\n" +
                    "               <input class=\"checkboxes__input checkbox-save\" type=\"checkbox\" value=\"true\" id=\"save-{{ id }}\" name=\"save-{{ id }}\" {{ isSaved }} >\n" +
                    "               <label class=\"label checkboxes__label\" for=\"save-{{ id }}\">{{ savedLabel }}</label>\n" +
                    "          </div>\n" +
                    "          <div class=\"checkboxes__item compare-label\">\n" +
                    "               <input class=\"checkboxes__input compare-item checkbox-compare\" type=\"checkbox\" value=\"true\" id=\"compare-{{ id }}\" name=\"compare-feature\">\n" +
                    "               <label class=\"label checkboxes__label\" for=\"compare-{{ id }}\">Compare</label>\n" +
                    "          </div>\n" +
                    "     </div>\n" +
                    "</div>\n" +
                    "</li>";


    $.each(data, function(index, framework) {

      var isSavedinBasket = framework.framework.Id in basketData;

      html = html + template.replace(/{{ id }}/g, framework.framework.Id)
          .replace('{{ title }}', framework.framework.Title)
          .replace('{{ warning }}', function () {
              return framework.framework.EffectiveTo ? '<div class="warning"><span>warning</span>This apprenticeship is closed to new starters from 1 August 2020</div>' : '';
          })
          .replace('{{ savedLabel }}', function () {
              return !isSavedinBasket ? 'Favourite' : 'Remove'
          })
          .replace('{{ isSaved }}', function () {
            return !isSavedinBasket ? '' : 'checked'
          })
        .replace('{{ levelCaption }}', function () {

          var levelCaption = '';

            if (framework.framework.Level == 2)
              levelCaption = '(equivalent to GCSEs at grades A* to C)';

            if (framework.framework.Level == 3)
              levelCaption = '(equivalent to A levels at grades A to E)';

            if (framework.framework.Level == 4)
              levelCaption = '(equivalent to certificate of higher education)';

            if (framework.framework.Level == 5)
              levelCaption = '(equivalent to foundation degree)';

            if (framework.framework.Level == 6)
              levelCaption = '(equivalent to bachelor\'s degree)';

            if (framework.framework.Level == 2)
              levelCaption = '(equivalent to master’s degree)';

            return levelCaption;

        })
          .replace('{{ level }}', framework.framework.Level)
          .replace('{{ length }}', framework.framework.Duration);
    });

    $('.fat-value').html(data.length);
    $('#fat-search-results').html(html).fadeIn();
    this.setUpCheckboxes();
  },
  setUpCheckboxes: function() {
    var that = this;

    $('.checkbox-save').on('change', function() {

      var checked = $(this).prop('checked');
      var id = $(this).closest('li.search-result').data('id') || $('body').data('id');
      var title = $(this).closest('li.search-result').find('h2 > a').text() || $('h1.fat-apprenticeship-title').text();

      if (checked) {
        that.addConfirmMessage(title);
        that.add(id, 'savedFrameworks');
        $(this).next().text('Remove');
      } else {
        // console.log('trying to remove');
        that.removeConfirmMessage(title);
        that.remove(id, 'savedFrameworks');
        $(this).next().text('Favourite');
      }
    });

    function countChecked() {
      return $("input[name='compare-feature']:checked").length;
    }

    function getCheckedTitles() {
      var chckdTitles = [];
      var chckdComp = $("input[name='compare-feature']:checked");
      chckdComp.each(function() {
        var itemTitle = $(this).closest('.search-result').find('.heading-m a').text();
        chckdTitles.push(itemTitle);
      })
      return(chckdTitles);
    }

    $("input[name='compare-feature']").on('change', function () {
      var compareMessage = getCheckedTitles().toString();

      var countChckd = countChecked();

      $('#compare-selected-items').html('compare ' + countChckd + ' items');

      if (countChckd <= 1 ) {
        $('#compare-message-panel').slideUp();
      } else if (countChckd >= 2) {
        $('#compare-message-panel').slideDown();

      }
      //var itemTitle = $(this).closest('.search-result').find('.heading-m a').text();
      $('#compare-message-panel .comparison-item-title').html('<span>' + compareMessage +'</span>');


    });
  },
  add: function(id, localStorageName) {
    var data = JSON.parse(localStorage.getItem('savedFrameworksv2'));
    var savedFrameworks = data["frameworks"];

    var alreadySaved = id in savedFrameworks

    if (!alreadySaved) {
      savedFrameworks[id] = {}
      localStorage.setItem('savedFrameworksv2', JSON.stringify(data))
      fat.basket.updateBasketCount(Object.keys(savedFrameworks).length)
    }
  },
  remove: function(id, localStorageName) {

    var data = JSON.parse(localStorage.getItem('savedFrameworksv2'));
    var savedFrameworks = data["frameworks"];

    var alreadySaved = id in savedFrameworks;

    if (alreadySaved) {
      delete savedFrameworks[id];
      localStorage.setItem('savedFrameworksv2', JSON.stringify(data))
      fat.basket.updateBasketCount(Object.keys(savedFrameworks).length)
    }
  },
  addConfirmMessage: function (title) {
    $('.confirmation-message-panel').remove();
    html = '<div class="confirmation-message-panel"><span></span><div class="content"><h1><div class="apprenticeship-title">' + title + '</div> has now been added to your favourites</h1></div> </div>';
    $('main').before(html);
  },
  removeConfirmMessage: function(title) {
    $('.confirmation-message-panel').remove();
    html = '<div class="confirmation-message-panel delete-panel"><span></span><div class="content"><h1><div class="apprenticeship-title">' + title + '</div> has now been removed from your favourites</h1></div> </div>';
    $('main').before(html);
  },
  processSearch: function (data) {

    let filteredData = [];
    $.each(data, function(index, framework) {
      var title = framework.Title;

        var newRecord = { title: framework.Title, count: 0, framework: framework }
        filteredData.push(newRecord);

    });
    this.printResults(filteredData);

  }
}
