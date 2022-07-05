$(function () {
  // TODO: abstract & clean up
  // TODO: change data-number to data-id/data-ref
  var HEADER_TAGS = 'h2, h3, h4, h5, h6';
  var hasContents = false; // WIP
  headers = $('.container').find(HEADER_TAGS).not('.star');
  $('.container').find(HEADER_TAGS).addClass('header');
  if (hasContents) {
    // dynamically create the contents section
    var contents = $('<section>');
    var contentsHeader = $('<h2>').addClass('star').text('Contents');
    contentsHeader.append($('<a>').attr('name', 'sec_contents'));
    var contentsTable = $('<table class="contents"><thead><tr><th>Section</th><th>Topic</th></tr></thead></table>');
    // add the contents to the page
    contents.append(contentsHeader, contentsTable);
    $('.container section').first().parent().prepend(contents);
  }
  // section i = counts[i-2]
  counts = [0, 0, 0, 0, 0];
  var i_prev = -1;
  headers.each(function () {
    var elem = $(this);
    elem.data('label', elem.text());
    var num = parseInt(elem[0].tagName.charAt(1), 10);
    var i = num - 2;
    if (i >= i_prev) {
      counts[i] += 1;
    } else {
      for (var j = i_prev; j > i; j--) {
        counts[j] = 0;
      }
      counts[i] += 1;
    }
    header_number = counts.slice(0, i + 1);
    number = header_number.join(".");
    if (hasContents) {
      // extract the identifier of the section
      var identifier = elem.next('a').attr('name');
      // add some indentation to the contents
      var indentation = '&emsp;&emsp;&emsp;'.repeat(header_number.length - 1);
      // create the table row
      var section = $('<td class="section">' + indentation + header_number[header_number.length - 1] + '</td>');
      var topic = $('<td>' + indentation + elem.text() + '</td>');
      var itemIndex = $('<tr class="section-layer-' + header_number.length + '"></tr>');
      // add the contents table row to the table
      itemIndex.data('ref', identifier);
      itemIndex.append(section, topic);
      $('.container section').first().find('table').append(itemIndex);
      // attach a click event to link to the section in the contents page
      itemIndex.click(function () {
        location.hash = $(this).data('ref');
      });
    }
    // TODO: move this to header & auto generate
    var name = elem.nextAll('a[name^="sec_"]').attr('name');
    // add permalink to this section
    elem.append('<a href="#' + name + '" class="permalink">&para;</a>');
    text = "<span class=\"header_number\">" + number + ".&nbsp;</span>";
    // elem.prepend(text);
    elem.data('number', number);
    i_prev = i;
  });

  function getRef(id) {
    var label = $('a[name="' + id + '"]');
    var header = label.prev(HEADER_TAGS);
    if (label.length === 0) {
      throw new ReferenceError("Undefined label " + id);
    } else if (label.length > 1) {
      throw new ReferenceError("Multiple labels defined for " + id);
    } else {
      return {
        id: header.data('number'),
        text: header.data('label')
      };
    }
  };
  // enables <a href="#sec_..."></a>
  // and <a href="#sec_...">Section <span data-ref=""/></a>
  $('a[href]').not('.permalink').each(function () {
    var $elem = $(this);
    var tag = $elem.attr('href').replace('#', '');
    if (!tag.startsWith('sec_') || $elem.hasClass('star')) {
      return;
    }
    try {
      var refData = getRef(tag);
    } catch (e) {
      return console.error(e.toString())
    }
    var $ref = $elem.find('[data-ref]');
    if ($ref.length) {
      $ref.text(refData.id);
    } else {
      $elem.html(refData.id + '. ' + refData.text);
    }
  });
  // enables <span data-ref="sec_..."/>
  $('[data-ref]').each(function () {
    var elem = $(this);
    var tag = elem.data('ref').replace('#', '');
    if (!tag.startsWith('sec_')) {
      return;
    }
    try {
      var refData = getRef(tag);
    } catch (e) {
      return console.error(e.toString())
    }
    elem.text(refData.id);
  });
  $('[data-version]').each(function () {
    var $elem = $(this);
    var version = $elem.data('version');
    $elem.attr('title', 'Changed in ' + version)
  });
  const $highlighter = $('#change_highlighter');
  const $body = $('body');
  const highlight_class = 'highlight-changes';
  $highlighter.on('change', function (ev) {
    ev.preventDefault();
    $body.toggleClass(highlight_class)
  });
  if ($body.hasClass(highlight_class)) {
    $highlighter.prop('checked', true);
  } else {
    $highlighter.removeProp('checked');
  }
});
