site.randomColor = ['#cb4949', '#618770', '#a149cb', '#4c49cb', '#477690', '#0079c0', '#64655f']

// create fixed random color
site.renderTagColor = function (name) {
  let seed = name.length
  for (let i = 0; i < name.length; i++) {
    seed += name.charCodeAt(i) + (i % 2)
  }
  seed *= 37
  return site.randomColor[seed % site.randomColor.length]
}

site.hex2rgba = (hex, alpha = 0.15) => {
  const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16))
  return `rgba(${r},${g},${b},${alpha})`
}

$(function () {
  // init tag color
  $('.article__tag').each(function () {
    const color = site.renderTagColor($(this).text().trim())
    $(this).css({ color, backgroundColor: site.hex2rgba(color), opacity: 1 })
  })

  // scroll top
  $('.footer__info .top').click(function () {
    document.documentElement.scrollTop = 0
  })

  // stick footer
  const freeHeight = parseInt($(window).height() - $('.footer__info').outerHeight())
  if (freeHeight && freeHeight > 0) {
    $('body>.page').css({ minHeight: freeHeight })
  }

  // toggle theme
  $('.toggle-theme .moon,.toggle-theme .sun').click(function () {
    if ($(this).hasClass('moon')) {
      $(document.documentElement).addClass('dark-mode')
      localStorage.setItem('theme', 'dark')
    } else {
      $(document.documentElement).removeClass('dark-mode')
      localStorage.removeItem('theme')
    }
  })

  // toggle menu
  $('.hamburger').click(function () {
    $('.site-nav').toggleClass('open')
  })

  // search
  $('.toggle-search').click(function () {
    window.SearchBox.open()
  })

  $(window).click(function (e) {
    if (e.target != $('.hamburger').get(0) && !$.contains($('.hamburger').get(0), e.target)) {
      $('.site-nav').removeClass('open')
    }
  })

  // searchable
  $('a[link-search]').each(function () {
    const name = $(this).parent().find('.partners__name').text().trim()
    $(this).attr('href', 'partner-post.html?author=' + encodeURIComponent(name))
  })
  if (location.pathname.endsWith('partner-post.html')) {
    const query = {}
    location.search.split('&').forEach(function (item) {
      const arr = item.split('=')
      const key = arr[0].replace(/^\?/, '')
      if (typeof arr[1] === 'string') {
        query[key] = decodeURIComponent(arr[1])
      } else {
        query[key] = null
      }
    })
    $.ajax({
      url: 'partners.html',
      dataType: 'text',
      success(text) {
        $(text)
          .find('.partners__info')
          .each(function () {
            const author = $(this).find('.partners__name').text().trim()
            const description = $(this).find('.partners__description').html()
            if (author === query.author) {
              $('.hero__title').text(author)
              $('.hero__description').html(description)
              return false
            }
          })
      }
    })
    $('.partner-post-list .article').each(function () {
      const author = $(this).find('.author').text().trim()
      if (author !== query.author) $(this).remove()
    })
    $('.partner-post-list').show()
  }

  // wrap image
  $('.article-post img').each(function (img) {
    $(this).replaceWith('<div class="img-wrap">' + this.outerHTML + '</p>')
  })
  $('.gallery-box').each(function () {
    $(this).prepend('<div class="gallery-items"></div>')
    $(this).find('.img-wrap').appendTo($(this).find('.gallery-items'))
  })

  /* =======================
  // LazyLoad Images
  ======================= */
  const lazyLoadInstance = new LazyLoad({
    elements_selector: '.lazy'
  })

  /* =======================
  // Zoom Image
  ======================= */
  if (document.querySelector('.article-post img')) {
    Lightense('.article-post img', {
      padding: 60,
      offset: 30
    })
  }

  /* =======================
  // Responsive Videos
  ======================= */
  reframe('.page-post iframe:not(.reframe-off), .page-post iframe:not(.reframe-off)')

  /* =======================
  // Pagination
  ======================= */
  if ($('#pagination').length) {
    const pageSize = Number($('#pagination').data('pagesize'))
    const articleList = $('.article-list').eq(0).find('li.article')

    if (articleList.length <= pageSize) {
      $('#pagination').remove()
      $('li.article').removeClass('none')
    } else {
      const dataSource = new Array(articleList.length).fill(0).map((_, idx) => idx)
      $('#pagination').pagination({
        dataSource,
        pageSize,
        pageRange: 1,
        showPrevious: false,
        showNext: false,
        callback: function (data, pagination) {
          articleList.each(function (idx) {
            if (data.includes(idx)) {
              $(this).removeClass('none')
            } else {
              $(this).addClass('none')
            }
          })
          document.documentElement.scrollTop = 0
        }
      })
    }
  }
})

// 显示原文
window.restoreLang = function () {
  var iframe = document.querySelector('.skiptranslate iframe')
  if (!iframe) return

  var innerDoc = iframe.contentDocument || iframe.contentWindow.document
  var restore_el = innerDoc.getElementsByTagName('button')

  for (var i = 0; i < restore_el.length; i++) {
    if (restore_el[i].id.indexOf('restore') >= 0) {
      restore_el[i].click()
      return
    }
  }
}

window.initLang = function () {
  $('.toggle-lang').show()

  // toggle lang
  $('.toggle-lang .language').click(function (ev) {
    ev.stopPropagation()
    $('.toggle-lang-dropdown').toggleClass('open')
  })

  // click outside
  $(window).click(function (e) {
    const isOpen = $('.toggle-lang-dropdown').hasClass('open')
    if (!isOpen) return
    $('.toggle-lang-dropdown').removeClass('open')
  })

  const currentLang = (Cookies.get('googtrans') || '').replace('/auto/', '')
  if (currentLang) {
    $('.lang-select').each(function () {
      if ($(this).data('lang') === currentLang) {
        $(this).addClass('active')
      }
    })
  }
  $('.lang-select').click(function () {
    const lang = $(this).data('lang')
    const isActive = $(this).hasClass('active')
    if (isActive) {
      $(this).removeClass('active')
      window.restoreLang()
    } else {
      const input = document.querySelector('select.goog-te-combo')
      if (!input) return
      input.value = lang
      input.dispatchEvent(new Event('change'))
      $('.lang-select').removeClass('active')
      $(this).addClass('active')
    }
  })

  const $el = document.createElement('div')
  $el.id = 'google_translate_element'
  document.body.appendChild($el)

  new google.translate.TranslateElement(
    {
      pageLanguage: '',
      autoDisplay: false,
      layout: google.translate.TranslateElement.InlineLayout.VERTICAL
    },
    'google_translate_element'
  )
}
