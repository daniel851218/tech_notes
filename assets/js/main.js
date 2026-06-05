(function () {
  var root = document.documentElement;
  var toggle = document.querySelector("[data-theme-toggle]");
  var icon = document.querySelector("[data-theme-icon]");
  var topButton = document.querySelector("[data-back-to-top]");
  var searchPage = document.querySelector("[data-search-page]");

  function setTheme(theme) {
    root.setAttribute("data-bs-theme", theme);
    localStorage.setItem("blog-theme", theme);
    if (icon) {
      icon.textContent = theme === "dark" ? "\u2600" : "\u25d0";
    }
  }

  setTheme(root.getAttribute("data-bs-theme") || "light");

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
      setTheme(next);
    });
  }

  if (topButton) {
    window.addEventListener("scroll", function () {
      topButton.classList.toggle("is-visible", window.scrollY > 420);
    });

    topButton.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function uniqueTerms(query) {
    var seen = {};
    return query
      .toLowerCase()
      .split(/\s+/)
      .map(function (term) {
        return term.trim();
      })
      .filter(function (term) {
        if (!term || seen[term]) {
          return false;
        }
        seen[term] = true;
        return true;
      });
  }

  function searchableText(value) {
    if (Array.isArray(value)) {
      return value.join(" ").toLowerCase();
    }
    return String(value || "").toLowerCase();
  }

  function scoreArticle(article, terms) {
    var title = searchableText(article.title);
    var summary = searchableText(article.summary);
    var tags = searchableText(article.tags);
    var series = searchableText(article.series);
    var body = searchableText(article.body);
    var combined = [title, summary, tags, series, body].join(" ");
    var score = 0;

    for (var index = 0; index < terms.length; index += 1) {
      var term = terms[index];
      if (combined.indexOf(term) === -1) {
        return 0;
      }
      if (title.indexOf(term) !== -1) {
        score += 60;
      }
      if (summary.indexOf(term) !== -1 || tags.indexOf(term) !== -1 || series.indexOf(term) !== -1) {
        score += 25;
      }
      if (body.indexOf(term) !== -1) {
        score += 5;
      }
    }

    return score;
  }

  function resultExcerpt(article, terms) {
    var summary = String(article.summary || "").trim();
    if (summary) {
      return summary;
    }

    var body = String(article.body || "").trim();
    var lowerBody = body.toLowerCase();
    var firstIndex = -1;

    terms.forEach(function (term) {
      var termIndex = lowerBody.indexOf(term);
      if (termIndex !== -1 && (firstIndex === -1 || termIndex < firstIndex)) {
        firstIndex = termIndex;
      }
    });

    if (firstIndex === -1) {
      return body.slice(0, 180);
    }

    var start = Math.max(0, firstIndex - 70);
    var end = Math.min(body.length, firstIndex + 150);
    var prefix = start > 0 ? "... " : "";
    var suffix = end < body.length ? " ..." : "";
    return prefix + body.slice(start, end).trim() + suffix;
  }

  function appendText(parent, tagName, className, text) {
    var element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  function renderSearchResults(resultsElement, basePath, results, terms) {
    resultsElement.textContent = "";

    results.forEach(function (result) {
      var article = result.article;
      var card = document.createElement("article");
      card.className = "search-result-card";

      var meta = document.createElement("div");
      meta.className = "article-meta";
      if (article.date) {
        appendText(meta, "time", "", article.date).setAttribute("datetime", article.date);
      }
      if (article.series) {
        appendText(meta, "span", "", article.series);
      }
      card.appendChild(meta);

      var heading = document.createElement("h2");
      var link = document.createElement("a");
      link.href = basePath + article.url;
      link.textContent = article.title || "Untitled";
      heading.appendChild(link);
      card.appendChild(heading);

      appendText(card, "p", "", resultExcerpt(article, terms));

      if (article.tags && article.tags.length) {
        var tags = document.createElement("div");
        tags.className = "tag-row";
        article.tags.forEach(function (tag) {
          appendText(tags, "span", "tag-pill", tag);
        });
        card.appendChild(tags);
      }

      resultsElement.appendChild(card);
    });
  }

  function runSearch(index, query) {
    var terms = uniqueTerms(query);
    if (!terms.length) {
      return [];
    }

    return index
      .map(function (article) {
        return {
          article: article,
          score: scoreArticle(article, terms)
        };
      })
      .filter(function (result) {
        return result.score > 0;
      })
      .sort(function (a, b) {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return String(b.article.date || "").localeCompare(String(a.article.date || ""));
      });
  }

  function initializeSearchPage() {
    if (!searchPage) {
      return;
    }

    var input = searchPage.querySelector("[data-search-input]");
    var status = searchPage.querySelector("[data-search-status]");
    var resultsElement = searchPage.querySelector("[data-search-results]");
    var inlineIndex = searchPage.querySelector("[data-search-inline-index]");
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var basePath = searchPage.getAttribute("data-base-path") || "";
    var indexUrl = searchPage.getAttribute("data-search-index");

    if (input) {
      input.value = query;
      input.focus();
    }

    document.querySelectorAll('input[type="search"][name="q"]').forEach(function (searchInput) {
      searchInput.value = query;
    });

    if (!query) {
      status.textContent = "Enter a search term to find articles.";
      return;
    }

    status.textContent = "Searching...";

    Promise.resolve()
      .then(function () {
        if (inlineIndex && inlineIndex.textContent.trim()) {
          return JSON.parse(inlineIndex.textContent);
        }

        return fetch(indexUrl).then(function (response) {
          if (!response.ok) {
            throw new Error("Unable to load search index.");
          }
          return response.json();
        });
      })
      .then(function (index) {
        var terms = uniqueTerms(query);
        var results = runSearch(index, query);
        if (!results.length) {
          status.textContent = 'No articles found for "' + query + '".';
          resultsElement.textContent = "";
          return;
        }

        status.textContent = results.length + " result" + (results.length === 1 ? "" : "s") + ' for "' + query + '".';
        renderSearchResults(resultsElement, basePath, results, terms);
      })
      .catch(function () {
        status.textContent = "Search is unavailable right now.";
        resultsElement.textContent = "";
      });
  }

  function prepareCodeBlocks() {
    document.querySelectorAll(".prose pre").forEach(function (pre) {
      var code = pre.querySelector("code");
      if (!code) {
        return;
      }

      var languageClass = Array.from(code.classList).find(function (className) {
        return className.indexOf("language-") === 0;
      });

      if (languageClass) {
        pre.classList.add(languageClass);
      }

      pre.classList.add("line-numbers");
    });
  }

  function registerLinkerScriptLanguage() {
    if (!window.Prism || !window.Prism.languages || window.Prism.languages["linker-script"]) {
      return;
    }

    window.Prism.languages["linker-script"] = {
      comment: [
        /\/\*[\s\S]*?\*\//,
        /#.*/,
      ],
      string: {
        pattern: /"(?:\\.|[^"\\])*"/,
        greedy: true
      },
      keyword: /\b(?:ABSOLUTE|ADDR|ALIGN|ASSERT|AT|DEFINED|ENTRY|GROUP|INCLUDE|KEEP|LENGTH|LOADADDR|MEMORY|ORIGIN|OUTPUT|OUTPUT_ARCH|OUTPUT_FORMAT|PHDRS|PROVIDE|PROVIDE_HIDDEN|SEARCH_DIR|SECTIONS|SIZEOF|SIZEOF_HEADERS|SORT|SORT_BY_ALIGNMENT|SORT_BY_NAME|STARTUP)\b/,
      boolean: /\b(?:COPY|DSECT|INFO|NOLOAD|OVERLAY|READONLY)\b/,
      section: /\.[A-Za-z0-9_.$-]+/,
      number: /\b(?:0x[\dA-Fa-f]+|\d+)(?:[KMG])?\b/,
      function: /\b[A-Za-z_.$][A-Za-z0-9_.$-]*(?=\s*\()/,
      operator: />>?|<<|[-+*/%=!|&:]+/,
      punctuation: /[{}()[\],.;]/,
      symbol: /\b[A-Za-z_.$][A-Za-z0-9_.$-]*\b/
    };
    window.Prism.languages.ld = window.Prism.languages["linker-script"];
    window.Prism.languages.lds = window.Prism.languages["linker-script"];
    window.Prism.languages.linkerscript = window.Prism.languages["linker-script"];
  }

  window.addEventListener("load", function () {
    initializeSearchPage();
    prepareCodeBlocks();
    if (window.Prism) {
      registerLinkerScriptLanguage();
      window.Prism.highlightAll();
    }
  });
})();
