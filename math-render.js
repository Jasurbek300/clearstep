/* ClearStep math rendering.
   Converts keyboard-style math notation (x^2, a/b, sqrt-like radicals,
   !=, ->, *) inside already-HTML-escaped text into styled HTML:
   radicals with a vinculum, superscripts, subscripts, stacked fractions.
   Exposed as window.CS_MATH. Input must be HTML-escaped; the function
   only inserts spans/sup/sub tags, so the output stays safe. */
(function () {
  "use strict";

  /* Operators: only between math-ish characters so prose is untouched.
     "->" arrives as "-&gt;" because the input is HTML-escaped. */
  function symbols(s) {
    return s
      .replace(/(?<=[\d)])\s*\*\s*(?=[\d(])/g, " × ")
      .replace(/(?<=[\w)\d])\s*!=\s*(?=[\w(\d])/g, " ≠ ")
      .replace(/(?<=[\d)])\s+-\s*&gt;\s+(?=[a-zA-Z\d(+-])/g, " → ");
  }

  /* a1 -> a₁ (coefficients like a1x + b1y = c1). */
  function subscripts(s) {
    return s.replace(/([a-zA-Z])(\d)/g, "$1<sub>$2</sub>");
  }

  /* x^2, x^(2), x^{2} -> superscript. */
  function powers(s) {
    return s.replace(/\^\{([^}]{1,12})\}|\^\(([^()]{1,12})\)|\^([-−]?\d{1,4}[a-zA-Z]?|[-−]?[a-zA-Z](?![a-zA-Z]))/g,
      function (m, a, b, c) {
        var t = a != null ? a : b != null ? b : c;
        return "<sup>" + t.replace(/^-/, "−") + "</sup>";
      });
  }

  /* √(expr) or √2 -> radical with a vinculum over the radicand. */
  function radicals(s) {
    var out = "", i = 0, n = s.length;
    while (i < n) {
      if (s[i] === "√") {
        if (s[i + 1] === "(") {
          var d = 1, j = i + 2;
          while (j < n && d > 0) {
            if (s[j] === "(") d++;
            else if (s[j] === ")") d--;
            j++;
          }
          out += '<span class="cs-rad"><span class="cs-rad-v">√</span><span class="cs-rad-c">' + s.slice(i + 2, j - 1) + "</span></span>";
          i = j;
          continue;
        }
        var m = /^[0-9]+(?:\.[0-9]+)?[a-zA-Z]?/.exec(s.slice(i + 1));
        if (!m) m = /^[a-zA-Z]/.exec(s.slice(i + 1));
        if (m) {
          out += '<span class="cs-rad"><span class="cs-rad-v">√</span><span class="cs-rad-c">' + m[0] + "</span></span>";
          i += 1 + m[0].length;
          continue;
        }
      }
      out += s[i];
      i++;
    }
    return out;
  }

  /* Stacked fractions. Conservative on purpose: tokens are numbers, single
     letters or short products (2x), so prose like and/or, was/were,
     Geometry/Trigonometry is never touched. */
  var SUPSUB = '(?:<su[bp][^>]*>[^<]{0,12}</su[bp]>|<span class="cs-rad">[\\s\\S]*?<\\/span><\\/span>)?';
  var USUP = '\\u00B2\\u00B3\\u00B9\\u2070-\\u2079\\u2080-\\u2089';
  var TOK = '[+\\u2212\\-]?(?:\\d+(?:\\.\\d+)?[a-zA-Z]{0,2}(?![a-zA-Z])|[a-zA-Z](?![a-zA-Z]))[' + USUP + ']*' + SUPSUB;
  var FR = new RegExp(
    "\\(([^()]{1,25})\\)/\\(([^()]{1,25})\\)" +
    "|(" + TOK + ")/\\(([^()]{1,25})\\)" +
    "|\\(([^()]{1,25})\\)/(" + TOK + ")" +
    "|(" + TOK + ")/(" + TOK + ")",
    "g"
  );
  function frac(num, den) {
    return '<span class="cs-frac"><span class="cs-num">' + num + '</span><span class="cs-den">' + den + "</span></span>";
  }
  /* Split a binary "+" (as in 3/4+1/6) away from the numerator: when the
     character before the fraction is part of an expression, a leading "+"
     on the numerator is the operator between the two fractions. */
  function fractions(s) {
    return s.replace(FR, function (m, a1, a2, b1, b2, c1, c2, d1, d2, offset, str) {
      /* A "+" leading a numerator is a binary operator when the character
         before the fraction is part of an expression (digit, letter or ")"). */
      var before = offset > 0 ? str[offset - 1] : "";
      var bin = /[0-9a-zA-Z)]/.test(before) || before === ">" || before === ";";
      if (a1 != null) return bin && a1.charAt(0) === "+" ? "+ " + frac(a1.slice(1), a2) : frac(a1, a2);
      if (b1 != null) return bin && b1.charAt(0) === "+" ? "+ " + frac(b1.slice(1), b2) : frac(b1, b2);
      if (c1 != null) return bin && c1.charAt(0) === "+" ? "+ " + frac(c1.slice(1), c2) : frac(c1, c2);
      return bin && d1.charAt(0) === "+" ? "+ " + frac(d1.slice(1), d2) : frac(d1, d2);
    });
  }

  window.CS_MATH = function (s) {
    if (s == null || s === "") return s;
    return fractions(radicals(powers(subscripts(symbols(s)))));
  };
})();
