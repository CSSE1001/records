const $ = require('jquery');

require('materialize-css/dist/js/materialize.js');

require('materialize-css/dist/css/materialize.css');
require('./ghpages-materialize.css');
require('./index.css');


const hljs = require('highlightjs');
hljs.initHighlightingOnLoad();
require('highlightjs/styles/github.css');

const Cookies = require('js-cookie');

//const tablesort = require('tablesort');
//require('tablesort/tablesort.css');

$(function () {

    // https://stackoverflow.com/a/3855394
    function parseQueryString(a) {
        if (a === "") return {};
        a = a.split('&');
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split('=', 2);
            if (p.length === 1)
                b[p[0]] = "";
            else
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    }


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
        elem.prepend(text);
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
    }

    // enables <a href="#sec_..."></a>
    // and <a href="#sec_...">Section <span data-ref=""/></a>
    $('a[href]').not('.permalink').each(function () {
        var $elem = $(this);
        var tag = $elem.attr('href').replace('#', '');

        if ($elem.hasClass('star')) {
            return;
        }

        if (!(tag.startsWith('sec_'))) {// || tag.startsWith('fig_'))) {
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
            var text = refData.text;
            if (typeof $elem.attr('data-no-ref') === 'undefined') {
                text = refData.id + '. ' + text;

            }
            $elem.html(text);
        }
    });

    // enables <span data-ref="sec_..."/>
    $('[data-ref]').each(function () {
        var elem = $(this);
        var tag = elem.data('ref').replace('#', '');

        if (!(tag.startsWith('sec_'))) {// || tag.startsWith('fig_'))) {
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

    // change highlighting
    query = parseQueryString(window.location.search.substr(1));

    var $highlighter = $('#change_highlighter');
    var $body = $('body');
    var highlight_class = 'highlight-changes';
    var changes_on = typeof query['changes'] !== 'undefined';

    $body.toggleClass(highlight_class, changes_on);
    if (changes_on) {
        $highlighter.prop('checked', 'checked');
    } else {
        $highlighter.removeProp('checked');
    }

    $highlighter.on('change', function (ev) {
        var query = parseQueryString(window.location.search.substr(1));

        var changes_on = !(typeof query['changes'] !== 'undefined');

        if (changes_on) {
            query['changes'] = "true";
        } else {
            delete query['changes'];
        }

        var query_string = "?" + $.param(query) + window.location.hash;

        window.history.replaceState(null, document.title, query_string);

        $body.toggleClass(highlight_class, changes_on);
    });

//        $highlighter.on('change', function (ev) {
//            ev.preventDefault();
//
//            $body.toggleClass(highlight_class)
//        });
//
//        if ($body.hasClass(highlight_class)) {
//            $highlighter.prop('checked', true);
//        } else {
//            $highlighter.removeProp('checked');
//        }

    $('ul, ol').not('.tabs, .collapsible').addClass("browser-default");

    const cookieId = 'dismiss-update-to-1-0-1';
    const dismiss = function () {
        $update.removeClass('pulse');
    };

    const $update = $('#update-to-1-0-1');
    if (Cookies.get(cookieId)) {
        dismiss();
    } else {
        $update.on('click', function () {
            dismiss();
            Cookies.set(cookieId, 'true');
        });
    }

    const keys = [];
    const shortcuts = [
        [[50, 187, 50, 187], 'https://www.youtube.com/watch?v=3M_5oYU-IsU'],
        [[83, 69, 76, 70], 'https://www.youtube.com/watch?v=rNu8XDBSn10'],
        [[66, 73, 78, 68], 'https://www.youtube.com/watch?v=sazPEkee3Dg'],
        [[72, 69, 76, 80], 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
        [[72, 65], 'https://www.youtube.com/watch?v=KXlkmPXDvqU'],
        [[80, 65, 82, 75, 79, 85, 82], 'https://www.youtube.com/watch?v=0Kvw2BPKjz0'],
        [[68, 69, 70], 'https://www.youtube.com/watch?v=OFr74zI1LBM'],
        [[52, 50, 48], 'https://www.youtube.com/watch?v=q9YjxKgrZ5w&t=39s']
    ];


    document.addEventListener('keyup', function (e) {
        // ignored keys
        if (e.keyCode === 16) {
            return
        }
        keys.push(e.keyCode);

        for (var j = 0; j < shortcuts.length; j++){
            const row = shortcuts[j];
            const shortcut = row[0];
            const action = row[1];

            // console.log(shortcut, keys)

            if (shortcut.length > keys.length) {
                continue;
            }

            var equal = shortcut.length !== 0;
            for (var i = 0; i < shortcut.length; i++) {
                //console.log('cmp', shortcut[shortcut.length - i - 1], keys[keys.length - i - 1])
                if (shortcut[shortcut.length - i - 1] !== keys[keys.length - i - 1]) {
                    equal = false;
                    break;
                }
            }

            //console.log(equal)

            if (equal) {
                window.open(action);
                break;
            }

        }

    }, false);


    // const el = document.getElementById('support_code_overview');
    // tablesort(el, {});

    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems);

    window.status = 'ready_to_print'
});

window.$ = $;

