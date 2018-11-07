/*
* jqGrid  3.8.1 - jQuery Grid

 * Copyright (c) 2008, Tony Tomov, tony@trirand.com
 * Dual licensed under the MIT and GPL licenses
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 * Date:2010-10-24
 * Modules: grid.base.js; jquery.fmatter.js; grid.custom.js; grid.common.js; grid.formedit.js; jquery.searchFilter.js; grid.inlinedit.js; grid.celledit.js; jqDnR.js; grid.subgrid.js; grid.grouping.js; grid.treegrid.js; grid.import.js; JsonXml.js; grid.setcolumns.js; grid.postext.js; grid.tbltogrid.js; grid.jqueryui.js;
 */


(function(b) {
  b.jgrid = b.jgrid || {};
  b
      .extend(
          b.jgrid,
          {
            htmlDecode : function(f) {
              if (f == "&nbsp;" || f == "&#160;" || f.length == 1
                  && f.charCodeAt(0) == 160)
                return "";
              return !f ? f : String(f).replace(/&amp;/g, "&").replace(/&gt;/g,
                  ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"')
            },
            htmlEncode : function(f) {
              return !f ? f : String(f).replace(/&/g, "&amp;").replace(/>/g,
                  "&gt;").replace(/</g, "&lt;").replace(/\"/g, "&quot;")
            },
            format : function(f) {
              var j = b.makeArray(arguments).slice(1);
              if (f === undefined)
                f = "";
              return f.replace(/\{(\d+)\}/g, function(i, c) {
                return j[c]
              })
            },
            getCellIndex : function(f) {
              f = b(f);
              if (f.is("tr"))
                return -1;
              f = (!f.is("td") && !f.is("th") ? f.closest("td,th") : f)[0];
              if (b.browser.msie)
                return b.inArray(f, f.parentNode.cells);
              return f.cellIndex
            },
            stripHtml : function(f) {
              f += "";
              var j = /<("[^"]*"|'[^']*'|[^'">])*>/gi;
              if (f)
                return (f = f.replace(j, "")) && f !== "&nbsp;"
                    && f !== "&#160;" ? f.replace(/\"/g, "'") : "";
              else
                return f
            },
            stringToDoc : function(f) {
              var j;
              if (typeof f !== "string")
                return f;
              try {
                j = (new DOMParser).parseFromString(f, "text/xml")
              } catch (i) {
                j = new ActiveXObject("Microsoft.XMLDOM");
                j.async = false;
                j.loadXML(f)
              }
              return j && j.documentElement
                  && j.documentElement.tagName != "parsererror" ? j : null
            },
            parse : function(f) {
              f = f;
              if (f.substr(0, 9) == "while(1);")
                f = f.substr(9);
              if (f.substr(0, 2) == "/*")
                f = f.substr(2, f.length - 4);
              f || (f = "{}");
              return b.jgrid.useJSON === true && typeof JSON === "object"
                  && typeof JSON.parse === "function" ? JSON.parse(f)
                  : eval("(" + f + ")")
            },
            parseDate : function(f, j) {
              var i = {
                m : 1,
                d : 1,
                y : 1970,
                h : 0,
                i : 0,
                s : 0
              }, c, e, k;
              if (j && j !== null && j !== undefined) {
                j = b.trim(j);
                j = j.split(/[\\\/:_;.\t\T\s-]/);
                f = f.split(/[\\\/:_;.\t\T\s-]/);
                var m = b.jgrid.formatter.date.monthNames, a = b.jgrid.formatter.date.AmPm, r = function(
                    u, B) {
                  if (u === 0) {
                    if (B == 12)
                      B = 0
                  } else if (B != 12)
                    B += 12;
                  return B
                };
                c = 0;
                for (e = f.length; c < e; c++) {
                  if (f[c] == "M") {
                    k = b.inArray(j[c], m);
                    if (k !== -1 && k < 12)
                      j[c] = k + 1
                  }
                  if (f[c] == "F") {
                    k = b.inArray(j[c], m);
                    if (k !== -1 && k > 11)
                      j[c] = k + 1 - 12
                  }
                  if (f[c] == "a") {
                    k = b.inArray(j[c], a);
                    if (k !== -1 && k < 2 && j[c] == a[k]) {
                      j[c] = k;
                      i.h = r(j[c], i.h)
                    }
                  }
                  if (f[c] == "A") {
                    k = b.inArray(j[c], a);
                    if (k !== -1 && k > 1 && j[c] == a[k]) {
                      j[c] = k - 2;
                      i.h = r(j[c], i.h)
                    }
                  }
                  if (j[c] !== undefined)
                    i[f[c].toLowerCase()] = parseInt(j[c], 10)
                }
                i.m = parseInt(i.m, 10) - 1;
                f = i.y;
                if (f >= 70 && f <= 99)
                  i.y = 1900 + i.y;
                else if (f >= 0 && f <= 69)
                  i.y = 2E3 + i.y
              }
              return new Date(i.y, i.m, i.d, i.h, i.i, i.s, 0)
            },
            jqID : function(f) {
              f += "";
              return f.replace(/([\.\:\[\]])/g, "\\$1")
            },
            getAccessor : function(f, j) {
              var i, c, e, k;
              if (typeof j === "function")
                return j(f);
              i = f[j];
              if (i === undefined)
                try {
                  if (typeof j === "string")
                    e = j.split(".");
                  if (k = e.length)
                    for (i = f; i && k--;) {
                      c = e.shift();
                      i = i[c]
                    }
                } catch (m) {
                }
              return i
            },
            ajaxOptions : {},
            from : function(f) {
              return new (function(j, i) {
                if (typeof j == "string")
                  j = b.data(j);
                var c = this, e = j, k = true, m = false, a = i, r = /[\$,%]/g, u = null, B = null, G = false, Q = "", J = [], M = true;
                if (typeof j == "object" && j.push) {
                  if (j.length > 0)
                    M = typeof j[0] != "object" ? false : true
                } else
                  throw "data provides is not an array";
                this._hasData = function() {
                  return e === null ? false : e.length === 0 ? false : true
                };
                this._getStr = function(n) {
                  var l = [];
                  m && l.push("jQuery.trim(");
                  l.push("String(" + n + ")");
                  m && l.push(")");
                  k || l.push(".toLowerCase()");
                  return l.join("")
                };
                this._strComp = function(n) {
                  return typeof n == "string" ? ".toString()" : ""
                };
                this._group = function(n, l) {
                  return {
                    field : n.toString(),
                    unique : l,
                    items : []
                  }
                };
                this._toStr = function(n) {
                  if (m)
                    n = b.trim(n);
                  k || (n = n.toLowerCase());
                  return n = n.toString()
                      .replace(new RegExp('\\"', "g"), '\\"')
                };
                this._funcLoop = function(n) {
                  var l = [];
                  b.each(e, function(p, A) {
                    l.push(n(A))
                  });
                  return l
                };
                this._append = function(n) {
                  if (a === null)
                    a = "";
                  else
                    a += Q === "" ? " && " : Q;
                  if (G)
                    a += "!";
                  a += "(" + n + ")";
                  G = false;
                  Q = ""
                };
                this._setCommand = function(n, l) {
                  u = n;
                  B = l
                };
                this._resetNegate = function() {
                  G = false
                };
                this._repeatCommand = function(n, l) {
                  if (u === null)
                    return c;
                  if (n != null && l != null)
                    return u(n, l);
                  if (B === null)
                    return u(n);
                  if (!M)
                    return u(n);
                  return u(B, n)
                };
                this._equals = function(n, l) {
                  return c._compare(n, l, 1) === 0
                };
                this._compare = function(n, l, p) {
                  if (p === undefined)
                    p = 1;
                  if (n === undefined)
                    n = null;
                  if (l === undefined)
                    l = null;
                  if (n === null && l === null)
                    return 0;
                  if (n === null && l !== null)
                    return 1;
                  if (n !== null && l === null)
                    return -1;
                  if (!k && typeof n !== "number" && typeof l !== "number") {
                    n = String(n).toLowerCase();
                    l = String(l).toLowerCase()
                  }
                  if (n < l)
                    return -p;
                  if (n > l)
                    return p;
                  return 0
                };
                this._performSort = function() {
                  if (J.length !== 0)
                    e = c._doSort(e, 0)
                };
                this._doSort = function(n, l) {
                  var p = J[l].by, A = J[l].dir, t = J[l].type, H = J[l].datefmt;
                  if (l == J.length - 1)
                    return c._getOrder(n, p, A, t, H);
                  l++;
                  n = c._getGroup(n, p, A, t, H);
                  p = [];
                  for (A = 0; A < n.length; A++) {
                    t = c._doSort(n[A].items, l);
                    for (H = 0; H < t.length; H++)
                      p.push(t[H])
                  }
                  return p
                };
                this._getOrder = function(n, l, p, A, t) {
                  var H = [], T = [], Y = p == "a" ? 1 : -1, O, fa;
                  if (A === undefined)
                    A = "text";
                  fa = A == "float" || A == "number" || A == "currency"
                      || A == "numeric" ? function(P) {
                    P = parseFloat(String(P).replace(r, ""));
                    return isNaN(P) ? 0 : P
                  } : A == "int" || A == "integer" ? function(P) {
                    return P ? parseFloat(String(P).replace(r, "")) : 0
                  } : A == "date" || A == "datetime" ? function(P) {
                    return b.jgrid.parseDate(t, P).getTime()
                  } : b.isFunction(A) ? A : function(P) {
                    P || (P = "");
                    return b.trim(String(P).toUpperCase())
                  };
                  b.each(n, function(P, aa) {
                    O = l !== "" ? b.jgrid.getAccessor(aa, l) : aa;
                    if (O === undefined)
                      O = "";
                    O = fa(O, aa);
                    T.push({
                      vSort : O,
                      index : P
                    })
                  });
                  T.sort(function(P, aa) {
                    P = P.vSort;
                    aa = aa.vSort;
                    return c._compare(P, aa, Y)
                  });
                  A = 0;
                  for ( var ca = n.length; A < ca;) {
                    p = T[A].index;
                    H.push(n[p]);
                    A++
                  }
                  return H
                };
                this._getGroup = function(n, l, p, A, t) {
                  var H = [], T = null, Y = null, O;
                  b.each(c._getOrder(n, l, p, A, t), function(fa, ca) {
                    O = b.jgrid.getAccessor(ca, l);
                    if (O === undefined)
                      O = "";
                    if (!c._equals(Y, O)) {
                      Y = O;
                      T != null && H.push(T);
                      T = c._group(l, O)
                    }
                    T.items.push(ca)
                  });
                  T != null && H.push(T);
                  return H
                };
                this.ignoreCase = function() {
                  k = false;
                  return c
                };
                this.useCase = function() {
                  k = true;
                  return c
                };
                this.trim = function() {
                  m = true;
                  return c
                };
                this.noTrim = function() {
                  m = false;
                  return c
                };
                this.combine = function(n) {
                  var l = b.from(e);
                  k || l.ignoreCase();
                  m && l.trim();
                  n = n(l).showQuery();
                  c._append(n);
                  return c
                };
                this.execute = function() {
                  var n = a, l = [];
                  if (n === null)
                    return c;
                  b.each(e, function() {
                    eval(n) && l.push(this)
                  });
                  e = l;
                  return c
                };
                this.data = function() {
                  return e
                };
                this.select = function(n) {
                  c._performSort();
                  if (!c._hasData())
                    return [];
                  c.execute();
                  if (b.isFunction(n)) {
                    var l = [];
                    b.each(e, function(p, A) {
                      l.push(n(A))
                    });
                    return l
                  }
                  return e
                };
                this.hasMatch = function() {
                  if (!c._hasData())
                    return false;
                  c.execute();
                  return e.length > 0
                };
                this.showQuery = function(n) {
                  var l = a;
                  if (l === null)
                    l = "no query found";
                  if (b.isFunction(n)) {
                    n(l);
                    return c
                  }
                  return l
                };
                this.andNot = function(n, l, p) {
                  G = !G;
                  return c.and(n, l, p)
                };
                this.orNot = function(n, l, p) {
                  G = !G;
                  return c.or(n, l, p)
                };
                this.not = function(n, l, p) {
                  return c.andNot(n, l, p)
                };
                this.and = function(n, l, p) {
                  Q = " && ";
                  if (n === undefined)
                    return c;
                  return c._repeatCommand(n, l, p)
                };
                this.or = function(n, l, p) {
                  Q = " || ";
                  if (n === undefined)
                    return c;
                  return c._repeatCommand(n, l, p)
                };
                this.isNot = function(n) {
                  G = !G;
                  return c.is(n)
                };
                this.is = function(n) {
                  c._append("this." + n);
                  c._resetNegate();
                  return c
                };
                this._compareValues = function(n, l, p, A, t) {
                  var H;
                  H = M ? "this." + l : "this";
                  if (p === undefined)
                    p = null;
                  p = p === null ? l : p;
                  switch (t.stype === undefined ? "text" : t.stype) {
                  case "int":
                  case "integer":
                    p = isNaN(Number(p)) ? "0" : p;
                    H = "parseInt(" + H + ",10)";
                    p = "parseInt(" + p + ",10)";
                    break;
                  case "float":
                  case "number":
                  case "numeric":
                    p = String(p).replace(r, "");
                    p = isNaN(Number(p)) ? "0" : p;
                    H = "parseFloat(" + H + ")";
                    p = "parseFloat(" + p + ")";
                    break;
                  case "date":
                  case "datetime":
                    p = String(b.jgrid.parseDate(t.newfmt || "Y-m-d", p)
                        .getTime());
                    H = 'jQuery.jgrid.parseDate("' + t.srcfmt + '",' + H
                        + ").getTime()";
                    break;
                  default:
                    H = c._getStr(H);
                    p = c._getStr('"' + c._toStr(p) + '"')
                  }
                  c._append(H + " " + A + " " + p);
                  c._setCommand(n, l);
                  c._resetNegate();
                  return c
                };
                this.equals = function(n, l, p) {
                  return c._compareValues(c.equals, n, l, "==", p)
                };
                this.greater = function(n, l, p) {
                  return c._compareValues(c.greater, n, l, ">", p)
                };
                this.less = function(n, l, p) {
                  return c._compareValues(c.less, n, l, "<", p)
                };
                this.greaterOrEquals = function(n, l, p) {
                  return c._compareValues(c.greaterOrEquals, n, l, ">=", p)
                };
                this.lessOrEquals = function(n, l, p) {
                  return c._compareValues(c.lessOrEquals, n, l, "<=", p)
                };
                this.startsWith = function(n, l) {
                  var p = l === undefined || l === null ? n : l;
                  p = m ? b.trim(p.toString()).length : p.toString().length;
                  if (M)
                    c._append(c._getStr("this." + n) + ".substr(0," + p
                        + ") == " + c._getStr('"' + c._toStr(l) + '"'));
                  else {
                    p = m ? b.trim(l.toString()).length : l.toString().length;
                    c._append(c._getStr("this") + ".substr(0," + p + ") == "
                        + c._getStr('"' + c._toStr(n) + '"'))
                  }
                  c._setCommand(c.startsWith, n);
                  c._resetNegate();
                  return c
                };
                this.endsWith = function(n, l) {
                  var p = l === undefined || l === null ? n : l;
                  p = m ? b.trim(p.toString()).length : p.toString().length;
                  M ? c._append(c._getStr("this." + n) + ".substr("
                      + c._getStr("this." + n) + ".length-" + p + "," + p
                      + ') == "' + c._toStr(l) + '"') : c._append(c
                      ._getStr("this")
                      + ".substr("
                      + c._getStr("this")
                      + '.length-"'
                      + c._toStr(n)
                      + '".length,"'
                      + c._toStr(n)
                      + '".length) == "' + c._toStr(n) + '"');
                  c._setCommand(c.endsWith, n);
                  c._resetNegate();
                  return c
                };
                this.contains = function(n, l) {
                  M ? c._append(c._getStr("this." + n) + '.indexOf("'
                      + c._toStr(l) + '",0) > -1') : c._append(c
                      ._getStr("this")
                      + '.indexOf("' + c._toStr(n) + '",0) > -1');
                  c._setCommand(c.contains, n);
                  c._resetNegate();
                  return c
                };
                this.groupBy = function(n, l, p, A) {
                  if (!c._hasData())
                    return null;
                  return c._getGroup(e, n, l, p, A)
                };
                this.orderBy = function(n, l, p, A) {
                  l = l === undefined || l === null ? "a" : b.trim(l.toString()
                      .toLowerCase());
                  if (p === null || p === undefined)
                    p = "text";
                  if (A === null || A === undefined)
                    A = "Y-m-d";
                  if (l == "desc" || l == "descending")
                    l = "d";
                  if (l == "asc" || l == "ascending")
                    l = "a";
                  J.push({
                    by : n,
                    dir : l,
                    type : p,
                    datefmt : A
                  });
                  return c
                };
                return c
              })(f, null)
            },
            extend : function(f) {
              b.extend(b.fn.jqGrid, f);
              this.no_legacy_api || b.fn.extend(f)
            }
          });
  b.fn.jqGrid = function(f) {
    if (typeof f == "string") {
      var j = b.jgrid.getAccessor(b.fn.jqGrid, f);
      if (!j)
        throw "jqGrid - No such method: " + f;
      var i = b.makeArray(arguments).slice(1);
      return j.apply(this, i)
    }
    return this
        .each(function() {
          if (!this.grid) {
            var c = b.extend(true, {
              url : "",
              height : 150,
              page : 1,
              rowNum: 10,
              rowTotal : null,
              records : 0,
              pager : "",
              pgbuttons : true,
              pginput : true,
              colModel : [],
              rowList: [5, 10, 20,100000000],
              colNames : [],
              sortorder : "asc",
              sortname : "",
              datatype : "xml",
              mtype : "GET",
              altRows : false,
              selarrrow : [],
              savedRow : [],
              shrinkToFit : true,
              xmlReader : {},
              jsonReader : {},
              subGrid : false,
              subGridModel : [],
              reccount : 0,
              lastpage : 0,
              lastsort : 0,
              selrow : null,
              beforeSelectRow : null,
              onSelectRow : null,
              onSortCol : null,
              ondblClickRow : null,
              onRightClickRow : null,
              onPaging : null,
              onSelectAll : null,
              loadComplete : function() {
				  $("option[value=100000000]").text('ALL');
  			},
              gridComplete : function() {
				  $("option[value=100000000]").text('ALL');
  			},
              loadError : null,
              loadBeforeSend : null,
              afterInsertRow : null,
              beforeRequest : null,
              onHeaderClick : null,
              viewrecords : true,
              loadonce : false,
              multiselect : false,
              multikey : false,
              editurl : null,
              search : false,
              caption : "",
              hidegrid : true,
              hiddengrid : false,
              postData : {},
              userData : {},
              treeGrid : false,
              treeGridModel : "nested",
              treeReader : {},
              treeANode : -1,
              ExpandColumn : null,
              tree_root_level : 0,
              prmNames : {
                page : "page",
                rows : "rows",
                sort : "sidx",
                order : "sord",
                search : "_search",
                nd : "nd",
                id : "id",
                oper : "oper",
                editoper : "edit",
                addoper : "add",
                deloper : "del",
                subgridid : "id",
                npage : null,
                totalrows : "totalrows"
              },
              forceFit : false,
              gridstate : "visible",
              cellEdit : false,
              cellsubmit : "remote",
              nv : 0,
              loadui : "enable",
              toolbar : [ false, "" ],
              scroll : false,
              multiboxonly : false,
              deselectAfterSort : true,
              scrollrows : false,
              autowidth : true,
              scrollOffset : 0,
              cellLayout : 5,
              subGridWidth : 20,
              multiselectWidth : 20,
              gridview : false,
              rownumWidth : 25,
              rownumbers : false,
              pagerpos : "center",
              recordpos : "right",
              footerrow : false,
              userDataOnFooter : false,
              hoverrows : true,
              altclass : "ui-priority-secondary",
              viewsortcols : [ true, "vertical", true ],
              resizeclass : "",
              autoencode : false,
              remapColumns : [],
              ajaxGridOptions : {},
              direction : "ltr",
              toppager : false,
              headertitles : false,
              scrollTimeout : 40,
              data : [],
              _index : {},
              grouping : false,
              groupingView : {
                groupField : [],
                groupOrder : [],
                groupText : [],
                groupColumnShow : [],
                groupSummary : [],
                showSummaryOnHide : false,
                sortitems : [],
                sortnames : [],
                groupDataSorted : false,
                summary : [],
                summaryval : [],
                plusicon : "ui-icon-circlesmall-plus",
                minusicon : "ui-icon-circlesmall-minus"
              },
              ignoreCase : false
            }, b.jgrid.defaults, f || {}), e = {
              headers : [],
              cols : [],
              footers : [],
              dragStart : function(d, g, h) {
                this.resizing = {
                  idx : d,
                  startX : g.clientX,
                  sOL : h[0]
                };
                this.hDiv.style.cursor = "col-resize";
                this.curGbox = b("#rs_m" + c.id, "#gbox_" + c.id);
                this.curGbox.css({
                  display : "block",
                  left : h[0],
                  top : h[1],
                  height : h[2]
                });
                b.isFunction(c.resizeStart) && c.resizeStart.call(this, g, d);
                document.onselectstart = function() {
                  return false
                }
              },
              dragMove : function(d) {
                if (this.resizing) {
                  var g = d.clientX - this.resizing.startX;
                  d = this.headers[this.resizing.idx];
                  var h = c.direction === "ltr" ? d.width + g : d.width - g, q;
                  if (h > 33) {
                    this.curGbox.css({
                      left : this.resizing.sOL + g
                    });
                    if (c.forceFit === true) {
                      q = this.headers[this.resizing.idx + c.nv];
                      g = c.direction === "ltr" ? q.width - g : q.width + g;
                      if (g > 33) {
                        d.newWidth = h;
                        q.newWidth = g
                      }
                    } else {
                      this.newWidth = c.direction === "ltr" ? c.tblwidth + g
                          : c.tblwidth - g;
                      d.newWidth = h
                    }
                  }
                }
              },
              dragEnd : function() {
                this.hDiv.style.cursor = "default";
                if (this.resizing) {
                  var d = this.resizing.idx, g = this.headers[d].newWidth
                      || this.headers[d].width;
                  g = parseInt(g, 10);
                  this.resizing = false;
                  b("#rs_m" + c.id).css("display", "none");
                  c.colModel[d].width = g;
                  this.headers[d].width = g;
                  this.headers[d].el.style.width = g + "px";
                  this.cols[d].style.width = g + "px";
                  if (this.footers.length > 0)
                    this.footers[d].style.width = g + "px";
                  if (c.forceFit === true) {
                    g = this.headers[d + c.nv].newWidth
                        || this.headers[d + c.nv].width;
                    this.headers[d + c.nv].width = g;
                    this.headers[d + c.nv].el.style.width = g + "px";
                    this.cols[d + c.nv].style.width = g + "px";
                    if (this.footers.length > 0)
                      this.footers[d + c.nv].style.width = g + "px";
                    c.colModel[d + c.nv].width = g
                  } else {
                    c.tblwidth = this.newWidth || c.tblwidth;
                    b("table:first", this.bDiv).css("width", c.tblwidth + "px");
                    b("table:first", this.hDiv).css("width", c.tblwidth + "px");
                    this.hDiv.scrollLeft = this.bDiv.scrollLeft;
                    if (c.footerrow) {
                      b("table:first", this.sDiv).css("width",
                          c.tblwidth + "px");
                      this.sDiv.scrollLeft = this.bDiv.scrollLeft
                    }
                  }
                  b.isFunction(c.resizeStop) && c.resizeStop.call(this, g, d)
                }
                this.curGbox = null;
                document.onselectstart = function() {
                  return true
                }
              },
              populateVisible : function() {
                e.timer && clearTimeout(e.timer);
                e.timer = null;
                var d = b(e.bDiv).height();
                if (d) {
                  var g = b("table:first", e.bDiv), h = b(
                      "> tbody > tr:gt(0):visible:first", g).outerHeight()
                      || e.prevRowHeight;
                  if (h) {
                    e.prevRowHeight = h;
                    var q = c.rowNum, o = e.scrollTop = e.bDiv.scrollTop, x = Math
                        .round(g.position().top)
                        - o, w = x + g.height();
                    h = h * q;
                    var C, D, s;
                    if (w < d
                        && x <= 0
                        && (c.lastpage === undefined || parseInt(
                            (w + o + h - 1) / h, 10) <= c.lastpage)) {
                      D = parseInt((d - w + h - 1) / h, 10);
                      if (w >= 0 || D < 2 || c.scroll === true) {
                        C = Math.round((w + o) / h) + 1;
                        x = -1
                      } else
                        x = 1
                    }
                    if (x > 0) {
                      C = parseInt(o / h, 10) + 1;
                      D = parseInt((o + d) / h, 10) + 2 - C;
                      s = true
                    }
                    if (D)
                      if (!(c.lastpage && C > c.lastpage || c.lastpage == 1))
                        if (e.hDiv.loading)
                          e.timer = setTimeout(e.populateVisible,
                              c.scrollTimeout);
                        else {
                          c.page = C;
                          if (s) {
                            e.selectionPreserver(g[0]);
                            e.emptyRows(e.bDiv, false)
                          }
                          e.populate(D)
                        }
                  }
                }
              },
              scrollGrid : function() {
                if (c.scroll) {
                  var d = e.bDiv.scrollTop;
                  if (e.scrollTop === undefined)
                    e.scrollTop = 0;
                  if (d != e.scrollTop) {
                    e.scrollTop = d;
                    e.timer && clearTimeout(e.timer);
                    e.timer = setTimeout(e.populateVisible, c.scrollTimeout)
                  }
                }
                e.hDiv.scrollLeft = e.bDiv.scrollLeft;
                if (c.footerrow)
                  e.sDiv.scrollLeft = e.bDiv.scrollLeft
              },
              selectionPreserver : function(d) {
                var g = d.p, h = g.selrow, q = g.selarrrow ? b
                    .makeArray(g.selarrrow) : null, o = d.grid.bDiv.scrollLeft, x = g.gridComplete;
                g.gridComplete = function() {
                  g.selrow = null;
                  g.selarrrow = [];
                  if (g.multiselect && q && q.length > 0)
                    for ( var w = 0; w < q.length; w++)
                      q[w] != h && b(d).jqGrid("setSelection", q[w], false);
                  h && b(d).jqGrid("setSelection", h, false);
                  d.grid.bDiv.scrollLeft = o;
                  g.gridComplete = x;
                  g.gridComplete && x()
                }
              }
            };
            if (this.tagName != "TABLE")
              alert("Element is not a table");
            else {
              b(this).empty();
              this.p = c;
              var k, m, a;
              if (this.p.colNames.length === 0)
                for (k = 0; k < this.p.colModel.length; k++)
                  this.p.colNames[k] = this.p.colModel[k].label
                      || this.p.colModel[k].name;
              if (this.p.colNames.length !== this.p.colModel.length)
                alert(b.jgrid.errors.model);
              else {
                var r = b("<div class='ui-jqgrid-view'></div>"), u, B = b.browser.msie ? true
                    : false, G = b.browser.safari ? true : false;
                a = this;
                a.p.direction = b.trim(a.p.direction.toLowerCase());
                if (b.inArray(a.p.direction, [ "ltr", "rtl" ]) == -1)
                  a.p.direction = "ltr";
                m = a.p.direction;
                b(r).insertBefore(this);
                b(this).appendTo(r).removeClass("scroll");
                var Q = b("<div class='ui-jqgrid ui-widget ui-widget-content ui-corner-all'></div>");
                b(Q).insertBefore(r).attr({
                  id : "gbox_" + this.id,
                  dir : m
                });
                b(r).appendTo(Q).attr("id", "gview_" + this.id);
                u = B && b.browser.version <= 6 ? '<iframe style="display:block;position:absolute;z-index:-1;filter:Alpha(Opacity=\'0\');" src="javascript:false;"></iframe>'
                    : "";
                b(
                    "<div class='ui-widget-overlay jqgrid-overlay' id='lui_"
                        + this.id + "'></div>").append(u).insertBefore(r);
                b(
                    "<div class='loading ui-state-default ui-state-active' id='load_"
                        + this.id + "'>" + this.p.loadtext + "</div>")
                    .insertBefore(r);
                b(this).attr({
                  cellspacing : "0",
                  cellpadding : "0",
                  border : "0",
                  role : "grid",
                  "aria-multiselectable" : !!this.p.multiselect,
                  "aria-labelledby" : "gbox_" + this.id
                });
                var J = function(d, g) {
                  d = parseInt(d, 10);
                  return isNaN(d) ? g ? g : 0 : d
                }, M = function(d, g, h) {
                  var q = a.p.colModel[d], o = q.align, x = 'style="', w = q.classes, C = q.name;
                  if (o)
                    x += "text-align:" + o + ";";
                  if (q.hidden === true)
                    x += "display:none;";
                  if (g === 0)
                    x += "width: " + e.headers[d].width + "px;";
                  x += '"'
                      + (w !== undefined ? ' class="' + w + '"' : "")
                      + (q.title && h ? ' title="' + b.jgrid.stripHtml(h) + '"'
                          : "");
                  x += ' aria-describedby="' + a.p.id + "_" + C + '"';
                  return x
                }, n = function(d) {
                  return d === undefined || d === null || d === "" ? "&#160;"
                      : a.p.autoencode ? b.jgrid.htmlEncode(d) : d + ""
                }, l = function(d, g, h, q, o) {
                  h = a.p.colModel[h];
                  if (typeof h.formatter !== "undefined") {
                    d = {
                      rowId : d,
                      colModel : h,
                      gid : a.p.id
                    };
                    g = b.isFunction(h.formatter) ? h.formatter.call(a, g, d,
                        q, o) : b.fmatter ? b.fn.fmatter(h.formatter, g, d, q,
                        o) : n(g)
                  } else
                    g = n(g);
                  return g
                }, p = function(d, g, h, q, o) {
                  d = l(d, g, h, o, "add");
                  return '<td role="gridcell" ' + M(h, q, d) + ">" + d
                      + "</td>"
                }, A = function(d, g, h) {
                  d = '<input role="checkbox" type="checkbox" id="jqg_'
                      + a.p.id + "_" + d + '" class="cbox" name="jqg_' + a.p.id
                      + "_" + d + '"/>';
                  return '<td role="gridcell" ' + M(g, h, "") + ">" + d
                      + "</td>"
                }, t = function(d, g, h, q) {
                  h = (parseInt(h, 10) - 1) * parseInt(q, 10) + 1 + g;
                  return '<td role="gridcell" class="ui-state-default jqgrid-rownum" '
                      + M(d, g, "") + ">" + h + "</td>"
                }, H = function(d) {
                  var g, h = [], q = 0, o;
                  for (o = 0; o < a.p.colModel.length; o++) {
                    g = a.p.colModel[o];
                    if (g.name !== "cb" && g.name !== "subgrid"
                        && g.name !== "rn") {
                      h[q] = d == "local" ? g.name : d == "xml" ? g.xmlmap
                          || g.name : g.jsonmap || g.name;
                      q++
                    }
                  }
                  return h
                }, T = function(d) {
                  var g = a.p.remapColumns;
                  if (!g || !g.length)
                    g = b.map(a.p.colModel, function(h, q) {
                      return q
                    });
                  if (d)
                    g = b.map(g, function(h) {
                      return h < d ? null : h - d
                    });
                  return g
                }, Y = function(d, g) {
                  if (a.p.deepempty)
                    b("#" + a.p.id + " tbody:first tr:gt(0)").remove();
                  else {
                    var h = b("#" + a.p.id + " tbody:first tr:first")[0];
                    b("#" + a.p.id + " tbody:first").empty().append(h)
                  }
                  if (g && a.p.scroll) {
                    b(">div:first", d).css({
                      height : "auto"
                    }).children("div:first").css({
                      height : 0,
                      display : "none"
                    });
                    d.scrollTop = 0
                  }
                }, O = function() {
                  var d = a.p.data.length, g, h, q;
                  g = a.p.rownumbers === true ? 1 : 0;
                  h = a.p.multiselect === true ? 1 : 0;
                  q = a.p.subGrid === true ? 1 : 0;
                  g = a.p.keyIndex === false || a.p.loadonce === true ? a.p.localReader.id
                      : a.p.colModel[a.p.keyIndex + h + q + g].name;
                  for (h = 0; h < d; h++) {
                    q = b.jgrid.getAccessor(a.p.data[h], g);
                    a.p._index[q] = h
                  }
                }, fa = function(d, g, h, q, o) {
                  var x = new Date, w = a.p.datatype != "local" && a.p.loadonce
                      || a.p.datatype == "xmlstring", C, D = a.p.datatype == "local" ? "local"
                      : "xml";
                  if (w) {
                    a.p.data = [];
                    a.p._index = {};
                    a.p.localReader.id = C = "_id_"
                  }
                  a.p.reccount = 0;
                  if (b.isXMLDoc(d)) {
                    if (a.p.treeANode === -1 && !a.p.scroll) {
                      Y(g, false);
                      h = 1
                    } else
                      h = h > 1 ? h : 1;
                    var s, v = 0, y, E, I = 0, F = 0, K = 0, z, U = [], W, S = {}, N, L, X = [], oa = a.p.altRows === true ? " "
                        + a.p.altclass
                        : "";
                    a.p.xmlReader.repeatitems || (U = H(D));
                    z = a.p.keyIndex === false ? a.p.xmlReader.id
                        : a.p.keyIndex;
                    if (U.length > 0 && !isNaN(z)) {
                      if (a.p.remapColumns && a.p.remapColumns.length)
                        z = b.inArray(z, a.p.remapColumns);
                      z = U[z]
                    }
                    D = (z + "").indexOf("[") === -1 ? U.length ? function(da,
                        Z) {
                      return b(z, da).text() || Z
                    } : function(da, Z) {
                      return b(a.p.xmlReader.cell, da).eq(z).text() || Z
                    } : function(da, Z) {
                      return da.getAttribute(z.replace(/[\[\]]/g, "")) || Z
                    };
                    a.p.userData = {};
                    b(a.p.xmlReader.page, d).each(function() {
                      a.p.page = this.textContent || this.text || 0
                    });
                    b(a.p.xmlReader.total, d).each(function() {
                      a.p.lastpage = this.textContent || this.text;
                      if (a.p.lastpage === undefined)
                        a.p.lastpage = 1
                    });
                    b(a.p.xmlReader.records, d).each(function() {
                      a.p.records = this.textContent || this.text || 0
                    });
                    b(a.p.xmlReader.userdata, d)
                        .each(
                            function() {
                              a.p.userData[this.getAttribute("name")] = this.textContent
                                  || this.text
                            });
                    (d = b(a.p.xmlReader.root + " " + a.p.xmlReader.row, d))
                        || (d = []);
                    var ga = d.length, $ = 0;
                    if (d && ga) {
                      var ha = parseInt(a.p.rowNum, 10), ra = a.p.scroll ? (parseInt(
                          a.p.page, 10) - 1)
                          * ha + 1
                          : 1;
                      if (o)
                        ha *= o + 1;
                      o = b.isFunction(a.p.afterInsertRow);
                      var ia = {}, xa = "";
                      if (a.p.grouping
                          && a.p.groupingView.groupCollapse === true)
                        xa = ' style="display:none;"';
                      for (; $ < ga;) {
                        N = d[$];
                        L = D(N, ra + $);
                        s = h === 0 ? 0 : h + 1;
                        s = (s + $) % 2 == 1 ? oa : "";
                        X
                            .push("<tr"
                                + xa
                                + ' id="'
                                + L
                                + '" role="row" class ="ui-widget-content jqgrow ui-row-'
                                + a.p.direction + "" + s + '">');
                        if (a.p.rownumbers === true) {
                          X.push(t(0, $, a.p.page, a.p.rowNum));
                          K = 1
                        }
                        if (a.p.multiselect === true) {
                          X.push(A(L, K, $));
                          I = 1
                        }
                        if (a.p.subGrid === true) {
                          X.push(b(a).jqGrid("addSubGridCell", I + K, $ + h));
                          F = 1
                        }
                        if (a.p.xmlReader.repeatitems) {
                          W || (W = T(I + F + K));
                          var Ba = b(a.p.xmlReader.cell, N);
                          b.each(W, function(da) {
                            var Z = Ba[this];
                            if (!Z)
                              return false;
                            y = Z.textContent || Z.text;
                            S[a.p.colModel[da + I + F + K].name] = y;
                            X.push(p(L, y, da + I + F + K, $ + h, N))
                          })
                        } else
                          for (s = 0; s < U.length; s++) {
                            y = b(U[s], N).text();
                            S[a.p.colModel[s + I + F + K].name] = y;
                            X.push(p(L, y, s + I + F + K, $ + h, N))
                          }
                        X.push("</tr>");
                        if (a.p.grouping) {
                          s = a.p.groupingView.groupField.length;
                          E = [];
                          for ( var ya = 0; ya < s; ya++)
                            E.push(S[a.p.groupingView.groupField[ya]]);
                          ia = b(a).jqGrid("groupingPrepare", X, E, ia, S);
                          X = []
                        }
                        if (w) {
                          S[C] = L;
                          a.p.data.push(S)
                        }
                        if (a.p.gridview === false) {
                          if (a.p.treeGrid === true) {
                            s = a.p.treeANode > -1 ? a.p.treeANode : 0;
                            E = b(X.join(""))[0];
                            b(a.rows[$ + s]).after(E);
                            try {
                              b(a).jqGrid("setTreeNode", S, E)
                            } catch (Ia) {
                            }
                          } else
                            b("tbody:first", g).append(X.join(""));
                          if (a.p.subGrid === true)
                            try {
                              b(a).jqGrid("addSubGrid",
                                  a.rows[a.rows.length - 1], I + K)
                            } catch (Ja) {
                            }
                          o && a.p.afterInsertRow.call(a, L, S, N);
                          X = []
                        }
                        S = {};
                        v++;
                        $++;
                        if (v == ha)
                          break
                      }
                    }
                    if (a.p.gridview === true)
                      if (a.p.grouping) {
                        b(a).jqGrid("groupingRender", ia, a.p.colModel.length);
                        ia = null
                      } else
                        b("tbody:first", g).append(X.join(""));
                    a.p.totaltime = new Date - x;
                    if (v > 0)
                      if (a.p.records === 0)
                        a.p.records = ga;
                    X = null;
                    if (!a.p.treeGrid && !a.p.scroll)
                      a.grid.bDiv.scrollTop = 0;
                    a.p.reccount = v;
                    a.p.treeANode = -1;
                    a.p.userDataOnFooter
                        && b(a).jqGrid("footerData", "set", a.p.userData, true);
                    if (w) {
                      a.p.records = ga;
                      a.p.lastpage = Math.ceil(ga / ha)
                    }
                    q || a.updatepager(false, true);
                    if (w) {
                      for (; v < ga;) {
                        N = d[v];
                        L = D(N, v);
                        if (a.p.xmlReader.repeatitems) {
                          W || (W = T(I + F + K));
                          var Ea = b(a.p.xmlReader.cell, N);
                          b.each(W, function(da) {
                            var Z = Ea[this];
                            if (!Z)
                              return false;
                            y = Z.textContent || Z.text;
                            S[a.p.colModel[da + I + F + K].name] = y
                          })
                        } else
                          for (s = 0; s < U.length; s++) {
                            y = b(U[s], N).text();
                            S[a.p.colModel[s + I + F + K].name] = y
                          }
                        S[C] = L;
                        a.p.data.push(S);
                        S = {};
                        v++
                      }
                      O()
                    }
                  }
                }, ca = function(d, g, h, q, o) {
                  var x = new Date;
                  if (d) {
                    if (a.p.treeANode === -1 && !a.p.scroll) {
                      Y(g, false);
                      h = 1
                    } else
                      h = h > 1 ? h : 1;
                    var w, C, D = a.p.datatype != "local" && a.p.loadonce
                        || a.p.datatype == "jsonstring";
                    if (D) {
                      a.p.data = [];
                      a.p._index = {};
                      w = a.p.localReader.id = "_id_"
                    }
                    a.p.reccount = 0;
                    if (a.p.datatype == "local") {
                      g = a.p.localReader;
                      C = "local"
                    } else {
                      g = a.p.jsonReader;
                      C = "json"
                    }
                    var s = 0, v, y, E, I = [], F, K = 0, z = 0, U = 0, W, S, N = {}, L;
                    E = [];
                    var X = a.p.altRows === true ? " " + a.p.altclass : "";
                    a.p.page = b.jgrid.getAccessor(d, g.page) || 0;
                    W = b.jgrid.getAccessor(d, g.total);
                    a.p.lastpage = W === undefined ? 1 : W;
                    a.p.records = b.jgrid.getAccessor(d, g.records) || 0;
                    a.p.userData = b.jgrid.getAccessor(d, g.userdata) || {};
                    g.repeatitems || (F = I = H(C));
                    C = a.p.keyIndex === false ? g.id : a.p.keyIndex;
                    if (I.length > 0 && !isNaN(C)) {
                      if (a.p.remapColumns && a.p.remapColumns.length)
                        C = b.inArray(C, a.p.remapColumns);
                      C = I[C]
                    }
                    (S = b.jgrid.getAccessor(d, g.root)) || (S = []);
                    W = S.length;
                    d = 0;
                    var oa = parseInt(a.p.rowNum, 10), ga = a.p.scroll ? (parseInt(
                        a.p.page, 10) - 1)
                        * oa + 1
                        : 1;
                    if (o)
                      oa *= o + 1;
                    var $ = b.isFunction(a.p.afterInsertRow), ha = {}, ra = "";
                    if (a.p.grouping && a.p.groupingView.groupCollapse === true)
                      ra = ' style="display:none;"';
                    for (; d < W;) {
                      o = S[d];
                      L = b.jgrid.getAccessor(o, C);
                      if (L === undefined) {
                        L = ga + d;
                        if (I.length === 0)
                          if (g.cell)
                            L = o[g.cell][C] || L
                      }
                      v = h === 1 ? 0 : h;
                      v = (v + d) % 2 == 1 ? X : "";
                      E
                          .push("<tr"
                              + ra
                              + ' id="'
                              + L
                              + '" role="row" class= "ui-widget-content jqgrow ui-row-'
                              + a.p.direction + "" + v + '">');
                      if (a.p.rownumbers === true) {
                        E.push(t(0, d, a.p.page, a.p.rowNum));
                        U = 1
                      }
                      if (a.p.multiselect) {
                        E.push(A(L, U, d));
                        K = 1
                      }
                      if (a.p.subGrid) {
                        E.push(b(a).jqGrid("addSubGridCell", K + U, d + h));
                        z = 1
                      }
                      if (g.repeatitems) {
                        if (g.cell)
                          o = b.jgrid.getAccessor(o, g.cell);
                        F || (F = T(K + z + U))
                      }
                      for (y = 0; y < F.length; y++) {
                        v = b.jgrid.getAccessor(o, F[y]);
                        E.push(p(L, v, y + K + z + U, d + h, o));
                        N[a.p.colModel[y + K + z + U].name] = v
                      }
                      E.push("</tr>");
                      if (a.p.grouping) {
                        v = a.p.groupingView.groupField.length;
                        y = [];
                        for ( var ia = 0; ia < v; ia++)
                          y.push(N[a.p.groupingView.groupField[ia]]);
                        ha = b(a).jqGrid("groupingPrepare", E, y, ha, N);
                        E = []
                      }
                      if (D) {
                        N[w] = L;
                        a.p.data.push(N)
                      }
                      if (a.p.gridview === false) {
                        if (a.p.treeGrid === true) {
                          v = a.p.treeANode > -1 ? a.p.treeANode : 0;
                          E = b(E.join(""))[0];
                          b(a.rows[d + v]).after(E);
                          try {
                            b(a).jqGrid("setTreeNode", N, E)
                          } catch (xa) {
                          }
                        } else
                          b("#" + a.p.id + " tbody:first").append(E.join(""));
                        if (a.p.subGrid === true)
                          try {
                            b(a).jqGrid("addSubGrid",
                                a.rows[a.rows.length - 1], K + U)
                          } catch (Ba) {
                          }
                        $ && a.p.afterInsertRow.call(a, L, N, o);
                        E = []
                      }
                      N = {};
                      s++;
                      d++;
                      if (s == oa)
                        break
                    }
                    if (a.p.gridview === true)
                      a.p.grouping ? b(a).jqGrid("groupingRender", ha,
                          a.p.colModel.length) : b(
                          "#" + a.p.id + " tbody:first").append(E.join(""));
                    a.p.totaltime = new Date - x;
                    if (s > 0)
                      if (a.p.records === 0)
                        a.p.records = W;
                    if (!a.p.treeGrid && !a.p.scroll)
                      a.grid.bDiv.scrollTop = 0;
                    a.p.reccount = s;
                    a.p.treeANode = -1;
                    a.p.userDataOnFooter
                        && b(a).jqGrid("footerData", "set", a.p.userData, true);
                    if (D) {
                      a.p.records = W;
                      a.p.lastpage = Math.ceil(W / oa)
                    }
                    q || a.updatepager(false, true);
                    if (D) {
                      for (; s < W;) {
                        o = S[s];
                        L = b.jgrid.getAccessor(o, C);
                        if (L === undefined) {
                          L = ga + s;
                          if (I.length === 0)
                            if (g.cell)
                              L = o[g.cell][C] || L
                        }
                        if (o) {
                          if (g.repeatitems) {
                            if (g.cell)
                              o = b.jgrid.getAccessor(o, g.cell);
                            F || (F = T(K + z + U))
                          }
                          for (y = 0; y < F.length; y++) {
                            v = b.jgrid.getAccessor(o, F[y]);
                            N[a.p.colModel[y + K + z + U].name] = v
                          }
                          N[w] = L;
                          a.p.data.push(N);
                          N = {}
                        }
                        s++
                      }
                      O()
                    }
                  }
                }, P = function() {
                  var d, g = false, h = [], q = [], o, x, w;
                  if (b.isArray(a.p.data)) {
                    var C = a.p.grouping ? a.p.groupingView : false;
                    b
                        .each(
                            a.p.colModel,
                            function() {
                              x = this.sorttype || "text";
                              if (x == "date" || x == "datetime") {
                                if (this.formatter
                                    && typeof this.formatter === "string"
                                    && this.formatter == "date") {
                                  o = this.formatoptions
                                      && this.formatoptions.srcformat ? this.formatoptions.srcformat
                                      : b.jgrid.formatter.date.srcformat;
                                  w = this.formatoptions
                                      && this.formatoptions.newformat ? this.formatoptions.newformat
                                      : b.jgrid.formatter.date.newformat
                                } else
                                  o = w = this.datefmt || "Y-m-d";
                                h[this.name] = {
                                  stype : x,
                                  srcfmt : o,
                                  newfmt : w
                                }
                              } else
                                h[this.name] = {
                                  stype : x,
                                  srcfmt : "",
                                  newfmt : ""
                                };
                              if (a.p.grouping && this.name == C.groupField[0])
                                q[0] = h[this.name];
                              if (!g
                                  && (this.index == a.p.sortname || this.name == a.p.sortname)) {
                                d = this.name;
                                g = true
                              }
                            });
                    if (a.p.treeGrid)
                      b(a).jqGrid("SortTree", d, a.p.sortorder, h[d].stype,
                          h[d].srcfmt);
                    else {
                      var D = {
                        eq : function(z) {
                          return z.equals
                        },
                        ne : function(z) {
                          return z.not().equals
                        },
                        lt : function(z) {
                          return z.less
                        },
                        le : function(z) {
                          return z.lessOrEquals
                        },
                        gt : function(z) {
                          return z.greater
                        },
                        ge : function(z) {
                          return z.greaterOrEquals
                        },
                        cn : function(z) {
                          return z.contains
                        },
                        nc : function(z) {
                          return z.not().contains
                        },
                        bw : function(z) {
                          return z.startsWith
                        },
                        bn : function(z) {
                          return z.not().startsWith
                        },
                        en : function(z) {
                          return z.not().endsWith
                        },
                        ew : function(z) {
                          return z.endsWith
                        },
                        ni : function(z) {
                          return z.not().equals
                        },
                        "in" : function(z) {
                          return z.equals
                        }
                      }, s = b.jgrid.from(a.p.data);
                      if (a.p.ignoreCase)
                        s = s.ignoreCase();
                      if (a.p.search === true) {
                        var v = a.p.postData.filters, y;
                        if (v) {
                          if (typeof v == "string")
                            v = b.jgrid.parse(v);
                          for ( var E = 0, I = v.rules.length, F; E < I; E++) {
                            F = v.rules[E];
                            y = v.groupOp;
                            if (D[F.op] && F.field && F.data && y)
                              s = y.toUpperCase() == "OR" ? D[F.op](s)(F.field,
                                  F.data, h[F.field]).or() : D[F.op](s)(
                                  F.field, F.data, h[F.field])
                          }
                        } else
                          try {
                            s = D[a.p.postData.searchOper](s)(
                                a.p.postData.searchField,
                                a.p.postData.searchString,
                                h[a.p.postData.searchField])
                          } catch (K) {
                          }
                      }
                      if (a.p.grouping) {
                        s.orderBy(C.groupField[0], C.groupOrder[0], q[0].stype,
                            q[0].srcfmt);
                        C.groupDataSorted = true
                      }
                      if (d && a.p.sortorder && g)
                        a.p.sortorder.toUpperCase() == "DESC" ? s.orderBy(
                            a.p.sortname, "d", h[d].stype, h[d].srcfmt)
                            : s.orderBy(a.p.sortname, "a", h[d].stype,
                                h[d].srcfmt);
                      D = s.select();
                      s = parseInt(a.p.rowNum, 10);
                      v = D.length;
                      y = parseInt(a.p.page, 10);
                      E = Math.ceil(v / s);
                      I = {};
                      D = D.slice((y - 1) * s, y * s);
                      h = s = null;
                      I[a.p.localReader.total] = E;
                      I[a.p.localReader.page] = y;
                      I[a.p.localReader.records] = v;
                      I[a.p.localReader.root] = D;
                      D = null;
                      return I
                    }
                  }
                }, aa = function() {
                  a.grid.hDiv.loading = true;
                  if (!a.p.hiddengrid)
                    switch (a.p.loadui) {
                    case "disable":
                      break;
                    case "enable":
                      b("#load_" + a.p.id).show();
                      break;
                    case "block":
                      b("#lui_" + a.p.id).show();
                      b("#load_" + a.p.id).show();
                      break
                    }
                }, pa = function() {
                  a.grid.hDiv.loading = false;
                  switch (a.p.loadui) {
                  case "disable":
                    break;
                  case "enable":
                    b("#load_" + a.p.id).hide();
                    break;
                  case "block":
                    b("#lui_" + a.p.id).hide();
                    b("#load_" + a.p.id).hide();
                    break
                  }
                }, ja = function(d) {
                  if (!a.grid.hDiv.loading) {
                    var g = a.p.scroll && d === false, h = {}, q, o = a.p.prmNames;
                    if (a.p.page <= 0)
                      a.p.page = 1;
                    if (o.search !== null)
                      h[o.search] = a.p.search;
                    if (o.nd !== null)
                      h[o.nd] = (new Date).getTime();
                    if (o.rows !== null)
                      h[o.rows] = a.p.rowNum;
                    if (o.page !== null)
                      h[o.page] = a.p.page;
                    if (o.sort !== null)
                      h[o.sort] = a.p.sortname;
                    if (o.order !== null)
                      h[o.order] = a.p.sortorder;
                    if (a.p.rowTotal !== null && o.totalrows !== null)
                      h[o.totalrows] = a.p.rowTotal;
                    var x = a.p.loadComplete, w = b.isFunction(x);
                    w || (x = null);
                    var C = 0;
                    d = d || 1;
                    if (d > 1)
                      if (o.npage !== null) {
                        h[o.npage] = d;
                        C = d - 1;
                        d = 1
                      } else
                        x = function(s) {
                          a.p.page++;
                          a.grid.hDiv.loading = false;
                          w && a.p.loadComplete.call(a, s);
                          ja(d - 1)
                        };
                    else
                      o.npage !== null && delete a.p.postData[o.npage];
                    if (a.p.grouping) {
                      b(a).jqGrid("groupingSetup");
                      if (a.p.groupingView.groupDataSorted === true)
                        h[o.sort] = a.p.groupingView.groupField[0] + " "
                            + a.p.groupingView.groupOrder[0] + ", " + h[o.sort]
                    }
                    b.extend(a.p.postData, h);
                    var D = !a.p.scroll ? 1 : a.rows.length - 1;
                    if (b.isFunction(a.p.datatype))
                      a.p.datatype.call(a, a.p.postData, "load_" + a.p.id);
                    else {
                      b.isFunction(a.p.beforeRequest)
                          && a.p.beforeRequest.call(a);
                      q = a.p.datatype.toLowerCase();
                      switch (q) {
                      case "json":
                      case "jsonp":
                      case "xml":
                      case "script":
                        b
                            .ajax(b
                                .extend(
                                    {
                                      url : a.p.url,
                                      type : a.p.mtype,
                                      dataType : q,
                                      data : b
                                          .isFunction(a.p.serializeGridData) ? a.p.serializeGridData
                                          .call(a, a.p.postData)
                                          : a.p.postData,
                                      success : function(s) {
                                        q === "xml" ? fa(s, a.grid.bDiv, D,
                                            d > 1, C) : ca(s, a.grid.bDiv, D,
                                            d > 1, C);
                                        x && x.call(a, s);
                                        g && a.grid.populateVisible();
                                        if (a.p.loadonce || a.p.treeGrid)
                                          a.p.datatype = "local";
                                        pa()
                                      },
                                      error : function(s, v, y) {
                                        b.isFunction(a.p.loadError)
                                            && a.p.loadError.call(a, s, v, y);
                                        pa()
                                      },
                                      beforeSend : function(s) {
                                        aa();
                                        b.isFunction(a.p.loadBeforeSend)
                                            && a.p.loadBeforeSend.call(a, s)
                                      }
                                    }, b.jgrid.ajaxOptions, a.p.ajaxGridOptions));
                        break;
                      case "xmlstring":
                        aa();
                        h = b.jgrid.stringToDoc(a.p.datastr);
                        fa(h, a.grid.bDiv);
                        w && a.p.loadComplete.call(a, h);
                        a.p.datatype = "local";
                        a.p.datastr = null;
                        pa();
                        break;
                      case "jsonstring":
                        aa();
                        h = typeof a.p.datastr == "string" ? b.jgrid
                            .parse(a.p.datastr) : a.p.datastr;
                        ca(h, a.grid.bDiv);
                        w && a.p.loadComplete.call(a, h);
                        a.p.datatype = "local";
                        a.p.datastr = null;
                        pa();
                        break;
                      case "local":
                      case "clientside":
                        aa();
                        a.p.datatype = "local";
                        h = P();
                        ca(h, a.grid.bDiv, D, d > 1, C);
                        x && x.call(a, h);
                        g && a.grid.populateVisible();
                        pa();
                        break
                      }
                    }
                  }
                };
                u = function(d, g) {
                  var h = "", q = "<table cellspacing='0' cellpadding='0' border='0' style='table-layout:auto;' class='ui-pg-table'><tbody><tr>", o = "", x, w, C, D, s = function(
                      v) {
                    var y;
                    if (b.isFunction(a.p.onPaging))
                      y = a.p.onPaging.call(a, v);
                    a.p.selrow = null;
                    if (a.p.multiselect) {
                      a.p.selarrrow = [];
                      b("#cb_" + b.jgrid.jqID(a.p.id), a.grid.hDiv).attr(
                          "checked", false)
                    }
                    a.p.savedRow = [];
                    if (y == "stop")
                      return false;
                    return true
                  };
                  d = d.substr(1);
                  x = "pg_" + d;
                  w = d + "_left";
                  C = d + "_center";
                  D = d + "_right";
                  b("#" + d)
                      .append(
                          "<div id='"
                              + x
                              + "' class='ui-pager-control' role='group'><table cellspacing='0' cellpadding='0' border='0' class='ui-pg-table' style='width:100%;table-layout:fixed;height:100%;' role='row'><tbody><tr><td id='"
                              + w
                              + "' align='left'></td><td id='"
                              + C
                              + "' align='center' style='white-space:pre;'></td><td id='"
                              + D
                              + "' align='right'></td></tr></tbody></table></div>")
                      .attr("dir", "ltr");
                  if (a.p.rowList.length > 0) {
                    o = "<td dir='" + m + "'>";
                    o += "<select class='ui-pg-selbox' role='listbox'>";
                    for (w = 0; w < a.p.rowList.length; w++)
                      o += '<option role="option" value="'
                          + a.p.rowList[w]
                          + '"'
                          + (a.p.rowNum == a.p.rowList[w] ? ' selected="selected"'
                              : "") + ">" + a.p.rowList[w] + "</option>";
                    o += "</select></td>"
                  }
                  if (m == "rtl")
                    q += o;
                  if (a.p.pginput === true)
                    h = "<td dir='"
                        + m
                        + "'>"
                        + b.jgrid
                            .format(
                                a.p.pgtext || "",
                                "<input class='ui-pg-input' type='text' size='2' maxlength='7' value='0' role='textbox'/>",
                                "<span id='sp_1'></span>") + "</td>";
                  if (a.p.pgbuttons === true) {
                    w = [ "first" + g, "prev" + g, "next" + g, "last" + g ];
                    m == "rtl" && w.reverse();
                    q += "<td id='"
                        + w[0]
                        + "' class='ui-pg-button ui-corner-all'><span class='ui-icon ui-icon-seek-first'></span></td>";
                    q += "<td id='"
                        + w[1]
                        + "' class='ui-pg-button ui-corner-all'><span class='ui-icon ui-icon-seek-prev'></span></td>";
                    q += h !== "" ? "<td class='ui-pg-button ui-state-disabled' style='width:4px;'><span class='ui-separator'></span></td>"
                        + h
                        + "<td class='ui-pg-button ui-state-disabled' style='width:4px;'><span class='ui-separator'></span></td>"
                        : "";
                    q += "<td id='"
                        + w[2]
                        + "' class='ui-pg-button ui-corner-all'><span class='ui-icon ui-icon-seek-next'></span></td>";
                    q += "<td id='"
                        + w[3]
                        + "' class='ui-pg-button ui-corner-all'><span class='ui-icon ui-icon-seek-end'></span></td>"
                  } else if (h !== "")
                    q += h;
                  if (m == "ltr")
                    q += o;
                  q += "</tr></tbody></table>";
                  a.p.viewrecords === true
                      && b("td#" + d + "_" + a.p.recordpos, "#" + x).append(
                          "<div dir='" + m + "' style='text-align:"
                              + a.p.recordpos
                              + "' class='ui-paging-info'></div>");
                  b("td#" + d + "_" + a.p.pagerpos, "#" + x).append(q);
                  o = b(".ui-jqgrid").css("font-size") || "11px";
                  b(document.body)
                      .append(
                          "<div id='testpg' class='ui-jqgrid ui-widget ui-widget-content' style='font-size:"
                              + o + ";visibility:hidden;' ></div>");
                  q = b(q).clone().appendTo("#testpg").width();
                  b("#testpg").remove();
                  if (q > 0) {
                    if (h != "")
                      q += 50;
                    b("td#" + d + "_" + a.p.pagerpos, "#" + x).width(q)
                  }
                  a.p._nvtd = [];
                  a.p._nvtd[0] = q ? Math.floor((a.p.width - q) / 2) : Math
                      .floor(a.p.width / 3);
                  a.p._nvtd[1] = 0;
                  q = null;
                  b(".ui-pg-selbox", "#" + x).bind(
                      "change",
                      function() {
                        a.p.page = Math.round(a.p.rowNum * (a.p.page - 1)
                            / this.value - 0.5) + 1;
                        a.p.rowNum = this.value;
                        if (g)
                          b(".ui-pg-selbox", a.p.pager).val(this.value);
                        else
                          a.p.toppager
                              && b(".ui-pg-selbox", a.p.toppager).val(
                                  this.value);
                        if (!s("records"))
                          return false;
                        ja();
                        return false
                      });
                  if (a.p.pgbuttons === true) {
                    b(".ui-pg-button", "#" + x).hover(function() {
                      if (b(this).hasClass("ui-state-disabled"))
                        this.style.cursor = "default";
                      else {
                        b(this).addClass("ui-state-hover");
                        this.style.cursor = "pointer"
                      }
                    }, function() {
                      if (!b(this).hasClass("ui-state-disabled")) {
                        b(this).removeClass("ui-state-hover");
                        this.style.cursor = "default"
                      }
                    });
                    b(
                        "#first" + g + ", #prev" + g + ", #next" + g
                            + ", #last" + g, "#" + d)
                        .click(
                            function() {
                              var v = J(a.p.page, 1), y = J(a.p.lastpage, 1), E = false, I = true, F = true, K = true, z = true;
                              if (y === 0 || y === 1)
                                z = K = F = I = false;
                              else if (y > 1 && v >= 1)
                                if (v === 1)
                                  F = I = false;
                                else {
                                  if (!(v > 1 && v < y))
                                    if (v === y)
                                      z = K = false
                                }
                              else if (y > 1 && v === 0) {
                                z = K = false;
                                v = y - 1
                              }
                              if (this.id === "first" + g && I) {
                                a.p.page = 1;
                                E = true
                              }
                              if (this.id === "prev" + g && F) {
                                a.p.page = v - 1;
                                E = true
                              }
                              if (this.id === "next" + g && K) {
                                a.p.page = v + 1;
                                E = true
                              }
                              if (this.id === "last" + g && z) {
                                a.p.page = y;
                                E = true
                              }
                              if (E) {
                                if (!s(this.id))
                                  return false;
                                ja()
                              }
                              return false
                            })
                  }
                  a.p.pginput === true
                      && b("input.ui-pg-input", "#" + x).keypress(
                          function(v) {
                            if ((v.charCode ? v.charCode
                                : v.keyCode ? v.keyCode : 0) == 13) {
                              a.p.page = b(this).val() > 0 ? b(this).val()
                                  : a.p.page;
                              if (!s("user"))
                                return false;
                              ja();
                              return false
                            }
                            return this
                          })
                };
                var Ca = function(d, g, h, q) {
                  if (a.p.colModel[g].sortable)
                    if (!(a.p.savedRow.length > 0)) {
                      if (!h) {
                        if (a.p.lastsort == g)
                          if (a.p.sortorder == "asc")
                            a.p.sortorder = "desc";
                          else {
                            if (a.p.sortorder == "desc")
                              a.p.sortorder = "asc"
                          }
                        else
                          a.p.sortorder = a.p.colModel[g].firstsortorder
                              || "asc";
                        a.p.page = 1
                      }
                      if (q)
                        if (a.p.lastsort == g && a.p.sortorder == q && !h)
                          return;
                        else
                          a.p.sortorder = q;
                      h = b("thead:first", a.grid.hDiv).get(0);
                      b("tr th:eq(" + a.p.lastsort + ") span.ui-grid-ico-sort",
                          h).addClass("ui-state-disabled");
                      b("tr th:eq(" + a.p.lastsort + ")", h).attr(
                          "aria-selected", "false");
                      b("tr th:eq(" + g + ") span.ui-icon-" + a.p.sortorder, h)
                          .removeClass("ui-state-disabled");
                      b("tr th:eq(" + g + ")", h).attr("aria-selected", "true");
                      if (!a.p.viewsortcols[0])
                        if (a.p.lastsort != g) {
                          b("tr th:eq(" + a.p.lastsort + ") span.s-ico", h)
                              .hide();
                          b("tr th:eq(" + g + ") span.s-ico", h).show()
                        }
                      d = d.substring(5);
                      a.p.sortname = a.p.colModel[g].index || d;
                      h = a.p.sortorder;
                      if (b.isFunction(a.p.onSortCol))
                        if (a.p.onSortCol.call(a, d, g, h) == "stop") {
                          a.p.lastsort = g;
                          return
                        }
                      if (a.p.datatype == "local")
                        a.p.deselectAfterSort && b(a).jqGrid("resetSelection");
                      else {
                        a.p.selrow = null;
                        a.p.multiselect
                            && b("#cb_" + b.jgrid.jqID(a.p.id), a.grid.hDiv)
                                .attr("checked", false);
                        a.p.selarrrow = [];
                        a.p.savedRow = []
                      }
                      if (a.p.scroll) {
                        h = a.grid.bDiv.scrollLeft;
                        Y(a.grid.bDiv, true);
                        a.grid.hDiv.scrollLeft = h
                      }
                      a.p.subGrid && a.p.datatype == "local"
                          && b("td.sgexpanded", "#" + a.p.id).each(function() {
                            b(this).trigger("click")
                          });
                      ja();
                      a.p.lastsort = g;
                      if (a.p.sortname != d && g)
                        a.p.lastsort = g
                    }
                }, Fa = function(d) {
                  var g = d, h;
                  for (h = d + 1; h < a.p.colModel.length; h++)
                    if (a.p.colModel[h].hidden !== true) {
                      g = h;
                      break
                    }
                  return g - d
                }, Ga = function(d) {
                  var g, h = {}, q = G ? 0 : a.p.cellLayout;
                  for (g = h[0] = h[1] = h[2] = 0; g <= d; g++)
                    if (a.p.colModel[g].hidden === false)
                      h[0] += a.p.colModel[g].width + q;
                  if (a.p.direction == "rtl")
                    h[0] = a.p.width - h[0];
                  h[0] -= a.grid.bDiv.scrollLeft;
                  if (b(a.grid.cDiv).is(":visible"))
                    h[1] += b(a.grid.cDiv).height()
                        + parseInt(b(a.grid.cDiv).css("padding-top"), 10)
                        + parseInt(b(a.grid.cDiv).css("padding-bottom"), 10);
                  if (a.p.toolbar[0] === true
                      && (a.p.toolbar[1] == "top" || a.p.toolbar[1] == "both"))
                    h[1] += b(a.grid.uDiv).height()
                        + parseInt(b(a.grid.uDiv).css("border-top-width"), 10)
                        + parseInt(b(a.grid.uDiv).css("border-bottom-width"),
                            10);
                  if (a.p.toppager)
                    h[1] += b(a.grid.topDiv).height()
                        + parseInt(b(a.grid.topDiv).css("border-bottom-width"),
                            10);
                  h[2] += b(a.grid.bDiv).height() + b(a.grid.hDiv).height();
                  return h
                };
                this.p.id = this.id;
                if (b
                    .inArray(a.p.multikey, [ "shiftKey", "altKey", "ctrlKey" ]) == -1)
                  a.p.multikey = false;
                a.p.keyIndex = false;
                for (k = 0; k < a.p.colModel.length; k++)
                  if (a.p.colModel[k].key === true) {
                    a.p.keyIndex = k;
                    break
                  }
                a.p.sortorder = a.p.sortorder.toLowerCase();
                if (a.p.grouping === true) {
                  a.p.scroll = false;
                  a.p.rownumbers = false;
                  a.p.subGrid = false;
                  a.p.treeGrid = false;
                  a.p.gridview = true
                }
                if (this.p.treeGrid === true) {
                  try {
                    b(this).jqGrid("setTreeGrid")
                  } catch (Ka) {
                  }
                  if (a.p.datatype != "local")
                    a.p.localReader = {
                      id : "_id_"
                    }
                }
                if (this.p.subGrid)
                  try {
                    b(a).jqGrid("setSubGrid")
                  } catch (La) {
                  }
                if (this.p.multiselect) {
                  this.p.colNames.unshift("<input role='checkbox' id='cb_"
                      + this.p.id + "' class='cbox' type='checkbox'/>");
                  this.p.colModel.unshift({
                    name : "cb",
                    width : G ? a.p.multiselectWidth + a.p.cellLayout
                        : a.p.multiselectWidth,
                    sortable : false,
                    resizable : false,
                    hidedlg : true,
                    search : false,
                    align : "center",
                    fixed : true
                  })
                }
                if (this.p.rownumbers) {
                  this.p.colNames.unshift("");
                  this.p.colModel.unshift({
                    name : "rn",
                    width : a.p.rownumWidth,
                    sortable : false,
                    resizable : false,
                    hidedlg : true,
                    search : false,
                    align : "center",
                    fixed : true
                  })
                }
                a.p.xmlReader = b.extend(true, {
                  root : "rows",
                  row : "row",
                  page : "rows>page",
                  total : "rows>total",
                  records : "rows>records",
                  repeatitems : true,
                  cell : "cell",
                  id : "[id]",
                  userdata : "userdata",
                  subgrid : {
                    root : "rows",
                    row : "row",
                    repeatitems : true,
                    cell : "cell"
                  }
                }, a.p.xmlReader);
                a.p.jsonReader = b.extend(true, {
                  root : "rows",
                  page : "page",
                  total : "total",
                  records : "records",
                  repeatitems : true,
                  cell : "cell",
                  id : "id",
                  userdata : "userdata",
                  subgrid : {
                    root : "rows",
                    repeatitems : true,
                    cell : "cell"
                  }
                }, a.p.jsonReader);
                a.p.localReader = b.extend(true, {
                  root : "rows",
                  page : "page",
                  total : "total",
                  records : "records",
                  repeatitems : false,
                  cell : "cell",
                  id : "id",
                  userdata : "userdata",
                  subgrid : {
                    root : "rows",
                    repeatitems : true,
                    cell : "cell"
                  }
                }, a.p.localReader);
                if (a.p.scroll) {
                  a.p.pgbuttons = false;
                  a.p.pginput = false;
                  a.p.rowList = []
                }
                a.p.data.length && O();
                var ba = "<thead><tr class='ui-jqgrid-labels' role='rowheader'>", Da, ma, sa, qa, ta, V, R, na;
                ma = na = "";
                if (a.p.shrinkToFit === true && a.p.forceFit === true)
                  for (k = a.p.colModel.length - 1; k >= 0; k--)
                    if (!a.p.colModel[k].hidden) {
                      a.p.colModel[k].resizable = false;
                      break
                    }
                if (a.p.viewsortcols[1] == "horizontal") {
                  na = " ui-i-asc";
                  ma = " ui-i-desc"
                }
                Da = B ? "class='ui-th-div-ie'" : "";
                na = "<span class='s-ico' style='display:none'><span sort='asc' class='ui-grid-ico-sort ui-icon-asc"
                    + na
                    + " ui-state-disabled ui-icon ui-icon-triangle-1-n ui-sort-"
                    + m + "'></span>";
                na += "<span sort='desc' class='ui-grid-ico-sort ui-icon-desc"
                    + ma
                    + " ui-state-disabled ui-icon ui-icon-triangle-1-s ui-sort-"
                    + m + "'></span></span>";
                for (k = 0; k < this.p.colNames.length; k++) {
                  ma = a.p.headertitles ? ' title="'
                      + b.jgrid.stripHtml(a.p.colNames[k]) + '"' : "";
                  ba += "<th id='"
                      + a.p.id
                      + "_"
                      + a.p.colModel[k].name
                      + "' role='columnheader' class='ui-state-default ui-th-column ui-th-"
                      + m + "'" + ma + ">";
                  ma = a.p.colModel[k].index || a.p.colModel[k].name;
                  ba += "<div id='jqgh_" + a.p.colModel[k].name + "' " + Da
                      + ">" + a.p.colNames[k];
                  a.p.colModel[k].width = a.p.colModel[k].width ? parseInt(
                      a.p.colModel[k].width, 10) : 150;
                  if (typeof a.p.colModel[k].title !== "boolean")
                    a.p.colModel[k].title = true;
                  if (ma == a.p.sortname)
                    a.p.lastsort = k;
                  ba += na + "</div></th>"
                }
                ba += "</tr></thead>";
                na = null;
                b(this).append(ba);
                b("thead tr:first th", this).hover(function() {
                  b(this).addClass("ui-state-hover")
                }, function() {
                  b(this).removeClass("ui-state-hover")
                });
                if (this.p.multiselect) {
                  var za = [], ua;
                  b("#cb_" + b.jgrid.jqID(a.p.id), this).bind(
                      "click",
                      function() {
                        if (this.checked) {
                          b("[id^=jqg_" + a.p.id + "_]").attr("checked",
                              "checked");
                          b(a.rows).each(
                              function(d) {
                                if (d > 0)
                                  if (!b(this).hasClass("subgrid")
                                      && !b(this).hasClass("jqgroup")) {
                                    b(this).addClass("ui-state-highlight")
                                        .attr("aria-selected", "true");
                                    a.p.selarrrow[d] = a.p.selrow = this.id
                                  }
                              });
                          ua = true;
                          za = []
                        } else {
                          b("[id^=jqg_" + a.p.id + "_]").removeAttr("checked");
                          b(a.rows).each(
                              function(d) {
                                if (!b(this).hasClass("subgrid")) {
                                  b(this).removeClass("ui-state-highlight")
                                      .attr("aria-selected", "false");
                                  za[d] = this.id
                                }
                              });
                          a.p.selarrrow = [];
                          a.p.selrow = null;
                          ua = false
                        }
                        if (b.isFunction(a.p.onSelectAll))
                          a.p.onSelectAll.call(a, ua ? a.p.selarrrow : za, ua)
                      })
                }
                if (a.p.autowidth === true) {
                  ba = b(Q).innerWidth();
                  a.p.width = ba > 0 ? ba : "nw"
                }
                (function() {
                  var d = 0, g = a.p.cellLayout, h = 0, q, o = a.p.scrollOffset, x, w = false, C, D = 0, s = 0, v = 0, y;
                  if (G)
                    g = 0;
                  b.each(a.p.colModel, function() {
                    if (typeof this.hidden === "undefined")
                      this.hidden = false;
                    if (this.hidden === false) {
                      d += J(this.width, 0);
                      if (this.fixed) {
                        D += this.width;
                        s += this.width + g
                      } else
                        h++;
                      v++
                    }
                  });
                  if (isNaN(a.p.width))
                    a.p.width = e.width = d;
                  else
                    e.width = a.p.width;
                  a.p.tblwidth = d;
                  if (a.p.shrinkToFit === false && a.p.forceFit === true)
                    a.p.forceFit = false;
                  if (a.p.shrinkToFit === true && h > 0) {
                    C = e.width - g * h - s;
                    if (!isNaN(a.p.height)) {
                      C -= o;
                      w = true
                    }
                    d = 0;
                    b.each(a.p.colModel, function(E) {
                      if (this.hidden === false && !this.fixed) {
                        this.width = x = Math.round(C * this.width
                            / (a.p.tblwidth - D));
                        d += x;
                        q = E
                      }
                    });
                    y = 0;
                    if (w) {
                      if (e.width - s - (d + g * h) !== o)
                        y = e.width - s - (d + g * h) - o
                    } else if (!w && Math.abs(e.width - s - (d + g * h)) !== 1)
                      y = e.width - s - (d + g * h);
                    a.p.colModel[q].width += y;
                    a.p.tblwidth = d + y + D + v * g;
                    if (a.p.tblwidth > a.p.width) {
                      a.p.colModel[q].width -= a.p.tblwidth
                          - parseInt(a.p.width, 10);
                      a.p.tblwidth = a.p.width
                    }
                  }
                })();
                b(Q).css("width", e.width + "px").append(
                    "<div class='ui-jqgrid-resize-mark' id='rs_m" + a.p.id
                        + "'>&#160;</div>");
                b(r).css("width", e.width + "px");
                ba = b("thead:first", a).get(0);
                var va = "";
                if (a.p.footerrow)
                  va += "<table role='grid' style='width:"
                      + a.p.tblwidth
                      + "px' class='ui-jqgrid-ftable' cellspacing='0' cellpadding='0' border='0'><tbody><tr role='row' class='ui-widget-content footrow footrow-"
                      + m + "'>";
                r = b("tr:first", ba);
                var wa = "<tr class='jqgfirstrow' role='row' style='height:auto'>";
                a.p.disableClick = false;
                b("th", r)
                    .each(
                        function(d) {
                          sa = a.p.colModel[d].width;
                          if (typeof a.p.colModel[d].resizable === "undefined")
                            a.p.colModel[d].resizable = true;
                          if (a.p.colModel[d].resizable) {
                            qa = document.createElement("span");
                            b(qa).html("&#160;").addClass(
                                "ui-jqgrid-resize ui-jqgrid-resize-" + m);
                            b.browser.opera
                                || b(qa).css("cursor", "col-resize");
                            b(this).addClass(a.p.resizeclass)
                          } else
                            qa = "";
                          b(this).css("width", sa + "px").prepend(qa);
                          var g = "";
                          if (a.p.colModel[d].hidden) {
                            b(this).css("display", "none");
                            g = "display:none;"
                          }
                          wa += "<td role='gridcell' style='height:0px;width:"
                              + sa + "px;" + g + "'></td>";
                          e.headers[d] = {
                            width : sa,
                            el : this
                          };
                          ta = a.p.colModel[d].sortable;
                          if (typeof ta !== "boolean")
                            ta = a.p.colModel[d].sortable = true;
                          g = a.p.colModel[d].name;
                          g == "cb" || g == "subgrid" || g == "rn"
                              || a.p.viewsortcols[2]
                              && b("div", this).addClass("ui-jqgrid-sortable");
                          if (ta)
                            if (a.p.viewsortcols[0]) {
                              b("div span.s-ico", this).show();
                              d == a.p.lastsort
                                  && b("div span.ui-icon-" + a.p.sortorder,
                                      this).removeClass("ui-state-disabled")
                            } else if (d == a.p.lastsort) {
                              b("div span.s-ico", this).show();
                              b("div span.ui-icon-" + a.p.sortorder, this)
                                  .removeClass("ui-state-disabled")
                            }
                          if (a.p.footerrow)
                            va += "<td role='gridcell' " + M(d, 0, "")
                                + ">&#160;</td>"
                        })
                    .mousedown(
                        function(d) {
                          if (b(d.target).closest("th>span.ui-jqgrid-resize").length == 1) {
                            var g = b.jgrid.getCellIndex(this);
                            if (a.p.forceFit === true)
                              a.p.nv = Fa(g);
                            e.dragStart(g, d, Ga(g));
                            return false
                          }
                        }).click(
                        function(d) {
                          if (a.p.disableClick)
                            return a.p.disableClick = false;
                          var g = "th>div.ui-jqgrid-sortable", h, q;
                          a.p.viewsortcols[2]
                              || (g = "th>div>span>span.ui-grid-ico-sort");
                          d = b(d.target).closest(g);
                          if (d.length == 1) {
                            g = b.jgrid.getCellIndex(this);
                            if (!a.p.viewsortcols[2]) {
                              h = true;
                              q = d.attr("sort")
                            }
                            Ca(b("div", this)[0].id, g, h, q);
                            return false
                          }
                        });
                if (a.p.sortable && b.fn.sortable)
                  try {
                    b(a).jqGrid("sortableColumns", r)
                  } catch (Ma) {
                  }
                if (a.p.footerrow)
                  va += "</tr></tbody></table>";
                wa += "</tr>";
                this.appendChild(document.createElement("tbody"));
                b(this).addClass("ui-jqgrid-btable").append(wa);
                wa = null;
                r = b(
                    "<table class='ui-jqgrid-htable' style='width:"
                        + a.p.tblwidth
                        + "px' role='grid' aria-labelledby='gbox_"
                        + this.id
                        + "' cellspacing='0' cellpadding='0' border='0'></table>")
                    .append(ba);
                var ea = a.p.caption && a.p.hiddengrid === true ? true : false;
                k = b("<div class='ui-jqgrid-hbox" + (m == "rtl" ? "-rtl" : "")
                    + "'></div>");
                ba = null;
                e.hDiv = document.createElement("div");
                b(e.hDiv).css({
                  width : e.width + "px"
                }).addClass("ui-state-default ui-jqgrid-hdiv").append(k);
                b(k).append(r);
                r = null;
                ea && b(e.hDiv).hide();
                if (a.p.pager) {
                  if (typeof a.p.pager == "string") {
                    if (a.p.pager.substr(0, 1) != "#")
                      a.p.pager = "#" + a.p.pager
                  } else
                    a.p.pager = "#" + b(a.p.pager).attr("id");
                  b(a.p.pager).css({
                    width : e.width + "px"
                  }).appendTo(Q).addClass(
                      "ui-state-default ui-jqgrid-pager ui-corner-bottom");
                  ea && b(a.p.pager).hide();
                  u(a.p.pager, "")
                }
                a.p.cellEdit === false
                    && a.p.hoverrows === true
                    && b(a).bind(
                        "mouseover",
                        function(d) {
                          R = b(d.target).closest("tr.jqgrow");
                          b(R).attr("class") !== "subgrid"
                              && b(R).addClass("ui-state-hover");
                          return false
                        }).bind("mouseout", function(d) {
                      R = b(d.target).closest("tr.jqgrow");
                      b(R).removeClass("ui-state-hover");
                      return false
                    });
                var ka, la;
                b(a)
                    .before(e.hDiv)
                    .click(
                        function(d) {
                          V = d.target;
                          var g = b(V).hasClass("cbox");
                          R = b(V, a.rows).closest("tr.jqgrow");
                          if (b(R).length === 0)
                            return this;
                          var h = true;
                          if (b.isFunction(a.p.beforeSelectRow))
                            h = a.p.beforeSelectRow.call(a, R[0].id, d);
                          if (V.tagName == "A"
                              || (V.tagName == "INPUT"
                                  || V.tagName == "TEXTAREA"
                                  || V.tagName == "OPTION" || V.tagName == "SELECT")
                              && !g)
                            return this;
                          if (h === true) {
                            if (a.p.cellEdit === true)
                              if (a.p.multiselect && g)
                                b(a).jqGrid("setSelection", R[0].id, true);
                              else {
                                ka = R[0].rowIndex;
                                la = b.jgrid.getCellIndex(V);
                                try {
                                  b(a).jqGrid("editCell", ka, la, true)
                                } catch (q) {
                                }
                              }
                            else if (a.p.multikey)
                              if (d[a.p.multikey])
                                b(a).jqGrid("setSelection", R[0].id, true);
                              else {
                                if (a.p.multiselect && g) {
                                  g = b("[id^=jqg_" + a.p.id + "_]").attr(
                                      "checked");
                                  b("[id^=jqg_" + a.p.id + "_]").attr(
                                      "checked", !g)
                                }
                              }
                            else {
                              if (a.p.multiselect && a.p.multiboxonly)
                                if (!g) {
                                  b(a.p.selarrrow).each(
                                      function(o, x) {
                                        o = a.rows.namedItem(x);
                                        b(o).removeClass("ui-state-highlight");
                                        b(
                                            "#jqg_" + a.p.id + "_"
                                                + b.jgrid.jqID(x)).attr(
                                            "checked", false)
                                      });
                                  a.p.selarrrow = [];
                                  b("#cb_" + b.jgrid.jqID(a.p.id), a.grid.hDiv)
                                      .attr("checked", false)
                                }
                              b(a).jqGrid("setSelection", R[0].id, true)
                            }
                            if (b.isFunction(a.p.onCellSelect)) {
                              ka = R[0].id;
                              la = b.jgrid.getCellIndex(V);
                              a.p.onCellSelect.call(a, ka, la, b(V).html(), d)
                            }
                            d.stopPropagation()
                          } else
                            return this
                        })
                    .bind(
                        "reloadGrid",
                        function(d, g) {
                          if (a.p.treeGrid === true)
                            a.p.datatype = a.p.treedatatype;
                          g && g.current && a.grid.selectionPreserver(a);
                          if (a.p.datatype == "local") {
                            b(a).jqGrid("resetSelection");
                            a.p.data.length && O()
                          } else if (!a.p.treeGrid) {
                            a.p.selrow = null;
                            if (a.p.multiselect) {
                              a.p.selarrrow = [];
                              b("#cb_" + b.jgrid.jqID(a.p.id), a.grid.hDiv)
                                  .attr("checked", false)
                            }
                            a.p.savedRow = []
                          }
                          a.p.scroll && Y(a.grid.bDiv, true);
                          if (g && g.page) {
                            d = g.page;
                            if (d > a.p.lastpage)
                              d = a.p.lastpage;
                            if (d < 1)
                              d = 1;
                            a.p.page = d;
                            a.grid.bDiv.scrollTop = a.grid.prevRowHeight ? (d - 1)
                                * a.grid.prevRowHeight * a.p.rowNum
                                : 0
                          }
                          if (a.grid.prevRowHeight && a.p.scroll) {
                            delete a.p.lastpage;
                            a.grid.populateVisible()
                          } else
                            a.grid.populate();
                          return false
                        });
                b.isFunction(this.p.ondblClickRow)
                    && b(this).dblclick(function(d) {
                      V = d.target;
                      R = b(V, a.rows).closest("tr.jqgrow");
                      if (b(R).length === 0)
                        return false;
                      ka = R[0].rowIndex;
                      la = b.jgrid.getCellIndex(V);
                      a.p.ondblClickRow.call(a, b(R).attr("id"), ka, la, d);
                      return false
                    });
                b.isFunction(this.p.onRightClickRow)
                    && b(this).bind(
                        "contextmenu",
                        function(d) {
                          V = d.target;
                          R = b(V, a.rows).closest("tr.jqgrow");
                          if (b(R).length === 0)
                            return false;
                          a.p.multiselect
                              || b(a).jqGrid("setSelection", R[0].id, true);
                          ka = R[0].rowIndex;
                          la = b.jgrid.getCellIndex(V);
                          a.p.onRightClickRow.call(a, b(R).attr("id"), ka, la,
                              d);
                          return false
                        });
                e.bDiv = document.createElement("div");
                b(e.bDiv).append(
                    b(
                        '<div style="position:relative;'
                            + (B && b.browser.version < 8 ? "height:0.01%;"
                                : "") + '"></div>').append("<div></div>")
                        .append(this)).addClass("ui-jqgrid-bdiv").css({
                  height : a.p.height + (isNaN(a.p.height) ? "" : "px"),
                  width : e.width + "px"
                }).scroll(e.scrollGrid);
                b("table:first", e.bDiv).css({
                  width : a.p.tblwidth + "px"
                });
                if (B) {
                  b("tbody", this).size() == 2
                      && b("tbody:gt(0)", this).remove();
                  a.p.multikey && b(e.bDiv).bind("selectstart", function() {
                    return false
                  })
                } else
                  a.p.multikey && b(e.bDiv).bind("mousedown", function() {
                    return false
                  });
                ea && b(e.bDiv).hide();
                e.cDiv = document.createElement("div");
                var Aa = a.p.hidegrid === true ? b(
                    "<a role='link' href='javascript:void(0)'/>").addClass(
                    "ui-jqgrid-titlebar-close HeaderButton").hover(function() {
                  Aa.addClass("ui-state-hover")
                }, function() {
                  Aa.removeClass("ui-state-hover")
                }).append(
                    "<span class='ui-icon ui-icon-circle-triangle-n'></span>")
                    .css(m == "rtl" ? "left" : "right", "0px") : "";
                b(e.cDiv)
                    .append(Aa)
                    .append(
                        "<span class='ui-jqgrid-title"
                            + (m == "rtl" ? "-rtl" : "") + "'>" + a.p.caption
                            + "</span>")
                    .addClass(
                        "ui-jqgrid-titlebar ui-widget-header ui-corner-top ui-helper-clearfix");
                b(e.cDiv).insertBefore(e.hDiv);
                if (a.p.toolbar[0]) {
                  e.uDiv = document.createElement("div");
                  if (a.p.toolbar[1] == "top")
                    b(e.uDiv).insertBefore(e.hDiv);
                  else
                    a.p.toolbar[1] == "bottom" && b(e.uDiv).insertAfter(e.hDiv);
                  if (a.p.toolbar[1] == "both") {
                    e.ubDiv = document.createElement("div");
                    b(e.uDiv).insertBefore(e.hDiv).addClass(
                        "ui-userdata ui-state-default").attr("id",
                        "t_" + this.id);
                    b(e.ubDiv).insertAfter(e.hDiv).addClass(
                        "ui-userdata ui-state-default").attr("id",
                        "tb_" + this.id);
                    ea && b(e.ubDiv).hide()
                  } else
                    b(e.uDiv).width(e.width).addClass(
                        "ui-userdata ui-state-default").attr("id",
                        "t_" + this.id);
                  ea && b(e.uDiv).hide()
                }
                if (a.p.toppager) {
                  a.p.toppager = a.p.id + "_toppager";
                  e.topDiv = b("<div id='" + a.p.toppager + "'></div>")[0];
                  a.p.toppager = "#" + a.p.toppager;
                  b(e.topDiv).insertBefore(e.hDiv).addClass(
                      "ui-state-default ui-jqgrid-toppager").width(e.width);
                  u(a.p.toppager, "_t")
                }
                if (a.p.footerrow) {
                  e.sDiv = b("<div class='ui-jqgrid-sdiv'></div>")[0];
                  k = b("<div class='ui-jqgrid-hbox"
                      + (m == "rtl" ? "-rtl" : "") + "'></div>");
                  b(e.sDiv).append(k).insertAfter(e.hDiv).width(e.width);
                  b(k).append(va);
                  e.footers = b(".ui-jqgrid-ftable", e.sDiv)[0].rows[0].cells;
                  if (a.p.rownumbers)
                    e.footers[0].className = "ui-state-default jqgrid-rownum";
                  ea && b(e.sDiv).hide()
                }
                k = null;
                if (a.p.caption) {
                  var Ha = a.p.datatype;
                  if (a.p.hidegrid === true) {
                    b(".ui-jqgrid-titlebar-close", e.cDiv).click(
                        function(d) {
                          var g = b.isFunction(a.p.onHeaderClick);
                          if (a.p.gridstate == "visible") {
                            b(".ui-jqgrid-bdiv, .ui-jqgrid-hdiv",
                                "#gview_" + a.p.id).slideUp("fast");
                            a.p.pager && b(a.p.pager).slideUp("fast");
                            a.p.toppager && b(a.p.toppager).slideUp("fast");
                            if (a.p.toolbar[0] === true) {
                              a.p.toolbar[1] == "both"
                                  && b(e.ubDiv).slideUp("fast");
                              b(e.uDiv).slideUp("fast")
                            }
                            a.p.footerrow
                                && b(".ui-jqgrid-sdiv", "#gbox_" + a.p.id)
                                    .slideUp("fast");
                            b("span", this).removeClass(
                                "ui-icon-circle-triangle-n").addClass(
                                "ui-icon-circle-triangle-s");
                            a.p.gridstate = "hidden";
                            b("#gbox_" + a.p.id).hasClass("ui-resizable")
                                && b(".ui-resizable-handle", "#gbox_" + a.p.id)
                                    .hide();
                            if (g)
                              ea || a.p.onHeaderClick.call(a, a.p.gridstate, d)
                          } else if (a.p.gridstate == "hidden") {
                            b(".ui-jqgrid-hdiv, .ui-jqgrid-bdiv",
                                "#gview_" + a.p.id).slideDown("fast");
                            a.p.pager && b(a.p.pager).slideDown("fast");
                            a.p.toppager && b(a.p.toppager).slideDown("fast");
                            if (a.p.toolbar[0] === true) {
                              a.p.toolbar[1] == "both"
                                  && b(e.ubDiv).slideDown("fast");
                              b(e.uDiv).slideDown("fast")
                            }
                            a.p.footerrow
                                && b(".ui-jqgrid-sdiv", "#gbox_" + a.p.id)
                                    .slideDown("fast");
                            b("span", this).removeClass(
                                "ui-icon-circle-triangle-s").addClass(
                                "ui-icon-circle-triangle-n");
                            if (ea) {
                              a.p.datatype = Ha;
                              ja();
                              ea = false
                            }
                            a.p.gridstate = "visible";
                            b("#gbox_" + a.p.id).hasClass("ui-resizable")
                                && b(".ui-resizable-handle", "#gbox_" + a.p.id)
                                    .show();
                            g && a.p.onHeaderClick.call(a, a.p.gridstate, d)
                          }
                          return false
                        });
                    if (ea) {
                      a.p.datatype = "local";
                      b(".ui-jqgrid-titlebar-close", e.cDiv).trigger("click")
                    }
                  }
                } else
                  b(e.cDiv).hide();
                b(e.hDiv).after(e.bDiv).mousemove(function(d) {
                  if (e.resizing) {
                    e.dragMove(d);
                    return false
                  }
                });
                b(".ui-jqgrid-labels", e.hDiv).bind("selectstart", function() {
                  return false
                });
                b(document).mouseup(function() {
                  if (e.resizing) {
                    e.dragEnd();
                    return false
                  }
                  return true
                });
                a.formatCol = M;
                a.sortData = Ca;
                a.updatepager = function(d, g) {
                  var h, q, o, x, w, C, D, s = "";
                  o = parseInt(a.p.page, 10) - 1;
                  if (o < 0)
                    o = 0;
                  o *= parseInt(a.p.rowNum, 10);
                  w = o + a.p.reccount;
                  if (a.p.scroll) {
                    h = b("tbody:first > tr:gt(0)", a.grid.bDiv);
                    o = w - h.length;
                    a.p.reccount = h.length;
                    if (q = h.outerHeight() || a.grid.prevRowHeight) {
                      h = o * q;
                      q = parseInt(a.p.records, 10) * q;
                      b(">div:first", a.grid.bDiv).css({
                        height : q
                      }).children("div:first").css({
                        height : h,
                        display : h ? "" : "none"
                      })
                    }
                    a.grid.bDiv.scrollLeft = a.grid.hDiv.scrollLeft
                  }
                  s = a.p.pager ? a.p.pager : "";
                  s += a.p.toppager ? s ? "," + a.p.toppager : a.p.toppager
                      : "";
                  if (s) {
                    D = b.jgrid.formatter.integer || {};
                    h = J(a.p.page);
                    q = J(a.p.lastpage);
                    b(".selbox", s).attr("disabled", false);
                    if (a.p.pginput === true) {
                      b(".ui-pg-input", s).val(a.p.page);
                      b("#sp_1", s).html(
                          b.fmatter ? b.fmatter.util.NumberFormat(a.p.lastpage,
                              D) : a.p.lastpage)
                    }
                    if (a.p.viewrecords)
                      if (a.p.reccount === 0)
                        b(".ui-paging-info", s).html(a.p.emptyrecords);
                      else {
                        x = o + 1;
                        C = a.p.records;
                        if (b.fmatter) {
                          x = b.fmatter.util.NumberFormat(x, D);
                          w = b.fmatter.util.NumberFormat(w, D);
                          C = b.fmatter.util.NumberFormat(C, D)
                        }
                        b(".ui-paging-info", s).html(
                            b.jgrid.format(a.p.recordtext, x, w, C))
                      }
                    if (a.p.pgbuttons === true) {
                      if (h <= 0)
                        h = q = 0;
                      if (h == 1 || h === 0) {
                        b("#first, #prev", a.p.pager).addClass(
                            "ui-state-disabled").removeClass("ui-state-hover");
                        a.p.toppager
                            && b("#first_t, #prev_t", a.p.toppager).addClass(
                                "ui-state-disabled").removeClass(
                                "ui-state-hover")
                      } else {
                        b("#first, #prev", a.p.pager).removeClass(
                            "ui-state-disabled");
                        a.p.toppager
                            && b("#first_t, #prev_t", a.p.toppager)
                                .removeClass("ui-state-disabled")
                      }
                      if (h == q || h === 0) {
                        b("#next, #last", a.p.pager).addClass(
                            "ui-state-disabled").removeClass("ui-state-hover");
                        a.p.toppager
                            && b("#next_t, #last_t", a.p.toppager).addClass(
                                "ui-state-disabled").removeClass(
                                "ui-state-hover")
                      } else {
                        b("#next, #last", a.p.pager).removeClass(
                            "ui-state-disabled");
                        a.p.toppager
                            && b("#next_t, #last_t", a.p.toppager).removeClass(
                                "ui-state-disabled")
                      }
                    }
                  }
                  d === true && a.p.rownumbers === true
                      && b("td.jqgrid-rownum", a.rows).each(function(v) {
                        b(this).html(o + 1 + v)
                      });
                  g && a.p.jqgdnd && b(a).jqGrid("gridDnD", "updateDnD");
                  b.isFunction(a.p.gridComplete) && a.p.gridComplete.call(a)
                };
                a.refreshIndex = O;
                a.formatter = function(d, g, h, q, o) {
                  return l(d, g, h, q, o)
                };
                b.extend(e, {
                  populate : ja,
                  emptyRows : Y
                });
                this.grid = e;
                a.addXmlData = function(d) {
                  fa(d, a.grid.bDiv)
                };
                a.addJSONData = function(d) {
                  ca(d, a.grid.bDiv)
                };
                this.grid.cols = this.rows[0].cells;
                ja();
                a.p.hiddengrid = false;
                b(window).unload(function() {
                  a = null
                })
              }
            }
          }
        })
  };
  b.jgrid
      .extend({
        getGridParam : function(f) {
          var j = this[0];
          if (j && j.grid)
            return f ? typeof j.p[f] != "undefined" ? j.p[f] : null : j.p
        },
        setGridParam : function(f) {
          return this.each(function() {
            this.grid && typeof f === "object" && b.extend(true, this.p, f)
          })
        },
        getDataIDs : function() {
          var f = [], j = 0, i, c = 0;
          this.each(function() {
            if ((i = this.rows.length) && i > 0)
              for (; j < i;) {
                if (b(this.rows[j]).hasClass("jqgrow")) {
                  f[c] = this.rows[j].id;
                  c++
                }
                j++
              }
          });
          return f
        },
        setSelection : function(f, j) {
          return this
              .each(function() {
                function i(m) {
                  var a = b(c.grid.bDiv)[0].clientHeight, r = b(c.grid.bDiv)[0].scrollTop, u = c.rows[m].offsetTop;
                  m = c.rows[m].clientHeight;
                  if (u + m >= a + r)
                    b(c.grid.bDiv)[0].scrollTop = u - (a + r) + m + r;
                  else if (u < a + r)
                    if (u < r)
                      b(c.grid.bDiv)[0].scrollTop = u
                }
                var c = this, e, k;
                if (f !== undefined) {
                  j = j === false ? false : true;
                  if (e = c.rows.namedItem(f + "")) {
                    if (c.p.scrollrows === true) {
                      k = c.rows.namedItem(f).rowIndex;
                      k >= 0 && i(k)
                    }
                    if (c.p.multiselect) {
                      c.p.selrow = e.id;
                      k = b.inArray(c.p.selrow, c.p.selarrrow);
                      if (k === -1) {
                        e.className !== "ui-subgrid"
                            && b(e).addClass("ui-state-highlight").attr(
                                "aria-selected", "true");
                        e = true;
                        b("#jqg_" + c.p.id + "_" + b.jgrid.jqID(c.p.selrow))
                            .attr("checked", e);
                        c.p.selarrrow.push(c.p.selrow);
                        c.p.onSelectRow && j
                            && c.p.onSelectRow.call(c, c.p.selrow, e)
                      } else {
                        e.className !== "ui-subgrid"
                            && b(e).removeClass("ui-state-highlight").attr(
                                "aria-selected", "false");
                        e = false;
                        b("#jqg_" + c.p.id + "_" + b.jgrid.jqID(c.p.selrow))
                            .attr("checked", e);
                        c.p.selarrrow.splice(k, 1);
                        c.p.onSelectRow && j
                            && c.p.onSelectRow.call(c, c.p.selrow, e);
                        e = c.p.selarrrow[0];
                        c.p.selrow = e === undefined ? null : e
                      }
                    } else if (e.className !== "ui-subgrid") {
                      c.p.selrow
                          && b(c.rows.namedItem(c.p.selrow)).removeClass(
                              "ui-state-highlight").attr("aria-selected",
                              "false");
                      c.p.selrow = e.id;
                      b(e).addClass("ui-state-highlight").attr("aria-selected",
                          "true");
                      c.p.onSelectRow && j
                          && c.p.onSelectRow.call(c, c.p.selrow, true)
                    }
                  }
                }
              })
        },
        resetSelection : function() {
          return this.each(function() {
            var f = this, j;
            if (f.p.multiselect) {
              b(f.p.selarrrow).each(
                  function(i, c) {
                    j = f.rows.namedItem(c);
                    b(j).removeClass("ui-state-highlight").attr(
                        "aria-selected", "false");
                    b("#jqg_" + f.p.id + "_" + b.jgrid.jqID(c)).attr("checked",
                        false)
                  });
              b("#cb_" + b.jgrid.jqID(f.p.id)).attr("checked", false);
              f.p.selarrrow = []
            } else if (f.p.selrow) {
              b("#" + f.p.id + " tbody:first tr#" + b.jgrid.jqID(f.p.selrow))
                  .removeClass("ui-state-highlight").attr("aria-selected",
                      "false");
              f.p.selrow = null
            }
            f.p.savedRow = []
          })
        },
        getRowData : function(f) {
          var j = {}, i, c = false, e, k = 0;
          this.each(function() {
            var m = this, a, r;
            if (typeof f == "undefined") {
              c = true;
              i = [];
              e = m.rows.length
            } else {
              r = m.rows.namedItem(f);
              if (!r)
                return j;
              e = 2
            }
            for (; k < e;) {
              if (c)
                r = m.rows[k];
              if (b(r).hasClass("jqgrow")) {
                b("td", r).each(function(u) {
                  a = m.p.colModel[u].name;
                  if (a !== "cb" && a !== "subgrid" && a !== "rn")
                    if (m.p.treeGrid === true && a == m.p.ExpandColumn)
                      j[a] = b.jgrid.htmlDecode(b("span:first", this).html());
                    else
                      try {
                        j[a] = b.unformat(this, {
                          rowId : r.id,
                          colModel : m.p.colModel[u]
                        }, u)
                      } catch (B) {
                        j[a] = b.jgrid.htmlDecode(b(this).html())
                      }
                });
                if (c) {
                  i.push(j);
                  j = {}
                }
              }
              k++
            }
          });
          return i ? i : j
        },
        delRowData : function(f) {
          var j = false, i, c;
          this.each(function() {
            var e = this;
            if (i = e.rows.namedItem(f)) {
              b(i).remove();
              e.p.records--;
              e.p.reccount--;
              e.updatepager(true, false);
              j = true;
              if (e.p.multiselect) {
                c = b.inArray(f, e.p.selarrrow);
                c != -1 && e.p.selarrrow.splice(c, 1)
              }
              if (f == e.p.selrow)
                e.p.selrow = null
            } else
              return false;
            if (e.p.datatype == "local") {
              var k = e.p._index[f];
              if (typeof k != "undefined") {
                e.p.data.splice(k, 1);
                e.refreshIndex()
              }
            }
            if (e.p.altRows === true && j) {
              var m = e.p.altclass;
              b(e.rows).each(function(a) {
                a % 2 == 1 ? b(this).addClass(m) : b(this).removeClass(m)
              })
            }
          });
          return j
        },
        setRowData : function(f, j, i) {
          var c, e = true, k;
          this.each(function() {
            if (!this.grid)
              return false;
            var m = this, a, r, u = typeof i, B = {};
            r = m.rows.namedItem(f);
            if (!r)
              return false;
            if (j)
              try {
                b(this.p.colModel).each(
                    function(J) {
                      c = this.name;
                      if (j[c] !== undefined) {
                        B[c] = this.formatter
                            && typeof this.formatter === "string"
                            && this.formatter == "date" ? b.unformat.date(j[c],
                            this) : j[c];
                        a = m.formatter(f, j[c], J, j, "edit");
                        k = this.title ? {
                          title : b.jgrid.stripHtml(a)
                        } : {};
                        m.p.treeGrid === true && c == m.p.ExpandColumn ? b(
                            "td:eq(" + J + ") > span:first", r).html(a).attr(k)
                            : b("td:eq(" + J + ")", r).html(a).attr(k)
                      }
                    });
                if (m.p.datatype == "local") {
                  var G = m.p._index[f];
                  if (typeof G != "undefined")
                    m.p.data[G] = b.extend(true, m.p.data[G], B);
                  B = null
                }
              } catch (Q) {
                e = false
              }
            if (e)
              if (u === "string")
                b(r).addClass(i);
              else
                u === "object" && b(r).css(i)
          });
          return e
        },
        addRowData : function(f, j, i, c) {
          i || (i = "last");
          var e = false, k, m, a, r, u, B, G, Q, J = "", M, n, l, p, A;
          if (j) {
            if (b.isArray(j)) {
              M = true;
              i = "last";
              n = f
            } else {
              j = [ j ];
              M = false
            }
            this.each(function() {
              var t = this, H = j.length;
              u = t.p.rownumbers === true ? 1 : 0;
              a = t.p.multiselect === true ? 1 : 0;
              r = t.p.subGrid === true ? 1 : 0;
              if (!M)
                if (typeof f != "undefined")
                  f += "";
                else {
                  f = t.p.records + 1 + "";
                  if (t.p.keyIndex !== false) {
                    n = t.p.colModel[t.p.keyIndex + a + r + u].name;
                    if (typeof j[0][n] != "undefined")
                      f = j[0][n]
                  }
                }
              l = t.p.altclass;
              for ( var T = 0, Y = "", O = {}, fa = b
                  .isFunction(t.p.afterInsertRow) ? true : false; T < H;) {
                p = j[T];
                m = "";
                if (M) {
                  try {
                    f = p[n]
                  } catch (ca) {
                    f = t.p.records + 1 + ""
                  }
                  Y = t.p.altRows === true ? (t.rows.length - 1) % 2 === 0 ? l
                      : "" : ""
                }
                if (u) {
                  J = t.formatCol(0, 1, "");
                  m += '<td role="gridcell" aria-describedby="' + t.p.id
                      + '_rn" class="ui-state-default jqgrid-rownum" ' + J
                      + ">0</td>"
                }
                if (a) {
                  Q = '<input role="checkbox" type="checkbox" id="jqg_'
                      + t.p.id + "_" + f + '" class="cbox"/>';
                  J = t.formatCol(u, 1, "");
                  m += '<td role="gridcell" aria-describedby="' + t.p.id
                      + '_cb" ' + J + ">" + Q + "</td>"
                }
                if (r)
                  m += b(t).jqGrid("addSubGridCell", a + u, 1);
                for (G = a + r + u; G < t.p.colModel.length; G++) {
                  A = t.p.colModel[G];
                  k = A.name;
                  O[k] = A.formatter && typeof A.formatter === "string"
                      && A.formatter == "date" ? b.unformat.date(p[k], A)
                      : p[k];
                  Q = t.formatter(f, b.jgrid.getAccessor(p, k), G, p, "edit");
                  J = t.formatCol(G, 1, Q);
                  m += '<td role="gridcell" aria-describedby="' + t.p.id + "_"
                      + k + '" ' + J + ">" + Q + "</td>"
                }
                m = '<tr id="' + f
                    + '" role="row" class="ui-widget-content jqgrow ui-row-'
                    + t.p.direction + " " + Y + '">' + m + "</tr>";
                if (t.p.subGrid === true) {
                  m = b(m)[0];
                  b(t).jqGrid("addSubGrid", m, a + u)
                }
                if (t.rows.length === 0)
                  b("table:first", t.grid.bDiv).append(m);
                else
                  switch (i) {
                  case "last":
                    b(t.rows[t.rows.length - 1]).after(m);
                    break;
                  case "first":
                    b(t.rows[0]).after(m);
                    break;
                  case "after":
                    if (B = t.rows.namedItem(c))
                      b(t.rows[B.rowIndex + 1]).hasClass("ui-subgrid") ? b(
                          t.rows[B.rowIndex + 1]).after(m) : b(B).after(m);
                    break;
                  case "before":
                    if (B = t.rows.namedItem(c)) {
                      b(B).before(m);
                      B = B.rowIndex
                    }
                    break
                  }
                t.p.records++;
                t.p.reccount++;
                fa && t.p.afterInsertRow.call(t, f, p, p);
                T++;
                if (t.p.datatype == "local") {
                  t.p._index[f] = t.p.data.length;
                  t.p.data.push(O);
                  O = {}
                }
              }
              if (t.p.altRows === true && !M)
                if (i == "last")
                  (t.rows.length - 1) % 2 == 1
                      && b(t.rows[t.rows.length - 1]).addClass(l);
                else
                  b(t.rows).each(function(P) {
                    P % 2 == 1 ? b(this).addClass(l) : b(this).removeClass(l)
                  });
              t.updatepager(true, true);
              e = true
            })
          }
          return e
        },
        footerData : function(f, j, i) {
          function c(r) {
            for ( var u in r)
              if (r.hasOwnProperty(u))
                return false;
            return true
          }
          var e, k = false, m = {}, a;
          if (typeof f == "undefined")
            f = "get";
          if (typeof i != "boolean")
            i = true;
          f = f.toLowerCase();
          this.each(function() {
            var r = this, u;
            if (!r.grid || !r.p.footerrow)
              return false;
            if (f == "set")
              if (c(j))
                return false;
            k = true;
            b(this.p.colModel).each(
                function(B) {
                  e = this.name;
                  if (f == "set") {
                    if (j[e] !== undefined) {
                      u = i ? r.formatter("", j[e], B, j, "edit") : j[e];
                      a = this.title ? {
                        title : b.jgrid.stripHtml(u)
                      } : {};
                      b("tr.footrow td:eq(" + B + ")", r.grid.sDiv).html(u)
                          .attr(a);
                      k = true
                    }
                  } else if (f == "get")
                    m[e] = b("tr.footrow td:eq(" + B + ")", r.grid.sDiv).html()
                })
          });
          return f == "get" ? m : k
        },
        ShowHideCol : function(f, j) {
          return this.each(function() {
            var i = this, c = false;
            if (i.grid) {
              if (typeof f === "string")
                f = [ f ];
              j = j != "none" ? "" : "none";
              var e = j === "" ? true : false;
              b(this.p.colModel).each(
                  function(k) {
                    if (b.inArray(this.name, f) !== -1 && this.hidden === e) {
                      b("tr", i.grid.hDiv).each(function() {
                        b("th:eq(" + k + ")", this).css("display", j)
                      });
                      b(i.rows).each(function(m) {
                        b("td:eq(" + k + ")", i.rows[m]).css("display", j)
                      });
                      i.p.footerrow
                          && b("td:eq(" + k + ")", i.grid.sDiv).css("display",
                              j);
                      if (j == "none")
                        i.p.tblwidth -= this.width + i.p.cellLayout;
                      else
                        i.p.tblwidth += this.width;
                      this.hidden = !e;
                      c = true
                    }
                  });
              if (c === true) {
                b("table:first", i.grid.hDiv).width(i.p.tblwidth);
                b("table:first", i.grid.bDiv).width(i.p.tblwidth);
                i.grid.hDiv.scrollLeft = i.grid.bDiv.scrollLeft;
                if (i.p.footerrow) {
                  b("table:first", i.grid.sDiv).width(i.p.tblwidth);
                  i.grid.sDiv.scrollLeft = i.grid.bDiv.scrollLeft
                }
                i.p.shrinkToFit === true
                    && b(i).jqGrid("setGridWidth", i.grid.width - 0.001, true)
              }
            }
          })
        },
        hideCol : function(f) {
          return this.each(function() {
            b(this).jqGrid("ShowHideCol", f, "none")
          })
        },
        showCol : function(f) {
          return this.each(function() {
            b(this).jqGrid("ShowHideCol", f, "")
          })
        },
        remapColumns : function(f, j, i) {
          function c(m) {
            var a;
            a = m.length ? b.makeArray(m) : b.extend({}, m);
            b.each(f, function(r) {
              m[r] = a[this]
            })
          }
          function e(m, a) {
            b(">tr" + (a || ""), m).each(function() {
              var r = this, u = b.makeArray(r.cells);
              b.each(f, function() {
                var B = u[this];
                B && r.appendChild(B)
              })
            })
          }
          var k = this.get(0);
          c(k.p.colModel);
          c(k.p.colNames);
          c(k.grid.headers);
          e(b("thead:first", k.grid.hDiv), i && ":not(.ui-jqgrid-labels)");
          j
              && e(b("#" + k.p.id + " tbody:first"),
                  ".jqgfirstrow, tr.jqgrow, tr.jqfoot");
          k.p.footerrow && e(b("tbody:first", k.grid.sDiv));
          if (k.p.remapColumns)
            if (k.p.remapColumns.length)
              c(k.p.remapColumns);
            else
              k.p.remapColumns = b.makeArray(f);
          k.p.lastsort = b.inArray(k.p.lastsort, f);
          if (k.p.treeGrid)
            k.p.expColInd = b.inArray(k.p.expColInd, f)
        },
        setGridWidth : function(f, j) {
          return this
              .each(function() {
                if (this.grid) {
                  var i = this, c, e = 0, k = i.p.cellLayout, m, a = 0, r = false, u = i.p.scrollOffset, B, G = 0, Q = 0, J = 0, M;
                  if (typeof j != "boolean")
                    j = i.p.shrinkToFit;
                  if (!isNaN(f)) {
                    f = parseInt(f, 10);
                    i.grid.width = i.p.width = f;
                    b("#gbox_" + i.p.id).css("width", f + "px");
                    b("#gview_" + i.p.id).css("width", f + "px");
                    b(i.grid.bDiv).css("width", f + "px");
                    b(i.grid.hDiv).css("width", f + "px");
                    i.p.pager && b(i.p.pager).css("width", f + "px");
                    i.p.toppager && b(i.p.toppager).css("width", f + "px");
                    if (i.p.toolbar[0] === true) {
                      b(i.grid.uDiv).css("width", f + "px");
                      i.p.toolbar[1] == "both"
                          && b(i.grid.ubDiv).css("width", f + "px")
                    }
                    i.p.footerrow && b(i.grid.sDiv).css("width", f + "px");
                    if (j === false && i.p.forceFit === true)
                      i.p.forceFit = false;
                    if (j === true) {
                      if (b.browser.safari)
                        k = 0;
                      b.each(i.p.colModel, function() {
                        if (this.hidden === false) {
                          e += parseInt(this.width, 10);
                          if (this.fixed) {
                            Q += this.width;
                            G += this.width + k
                          } else
                            a++;
                          J++
                        }
                      });
                      if (a !== 0) {
                        i.p.tblwidth = e;
                        B = f - k * a - G;
                        if (!isNaN(i.p.height))
                          if (b(i.grid.bDiv)[0].clientHeight < b(i.grid.bDiv)[0].scrollHeight
                              || i.rows.length === 1) {
                            r = true;
                            B -= u
                          }
                        e = 0;
                        var n = i.grid.cols.length > 0;
                        b.each(i.p.colModel,
                            function(l) {
                              if (this.hidden === false && !this.fixed) {
                                c = Math.round(B * this.width
                                    / (i.p.tblwidth - Q));
                                if (!(c < 0)) {
                                  this.width = c;
                                  e += c;
                                  i.grid.headers[l].width = c;
                                  i.grid.headers[l].el.style.width = c + "px";
                                  if (i.p.footerrow)
                                    i.grid.footers[l].style.width = c + "px";
                                  if (n)
                                    i.grid.cols[l].style.width = c + "px";
                                  m = l
                                }
                              }
                            });
                        M = 0;
                        if (r) {
                          if (f - G - (e + k * a) !== u)
                            M = f - G - (e + k * a) - u
                        } else if (Math.abs(f - G - (e + k * a)) !== 1)
                          M = f - G - (e + k * a);
                        i.p.colModel[m].width += M;
                        i.p.tblwidth = e + M + Q + k * J;
                        if (i.p.tblwidth > f) {
                          r = i.p.tblwidth - parseInt(f, 10);
                          i.p.tblwidth = f;
                          c = i.p.colModel[m].width -= r
                        } else
                          c = i.p.colModel[m].width;
                        i.grid.headers[m].width = c;
                        i.grid.headers[m].el.style.width = c + "px";
                        if (n)
                          i.grid.cols[m].style.width = c + "px";
                        b("table:first", i.grid.bDiv).css("width",
                            i.p.tblwidth + "px");
                        b("table:first", i.grid.hDiv).css("width",
                            i.p.tblwidth + "px");
                        i.grid.hDiv.scrollLeft = i.grid.bDiv.scrollLeft;
                        if (i.p.footerrow) {
                          i.grid.footers[m].style.width = c + "px";
                          b("table:first", i.grid.sDiv).css("width",
                              i.p.tblwidth + "px")
                        }
                      }
                    }
                  }
                }
              })
        },
        setGridHeight : function(f) {
          return this.each(function() {
            var j = this;
            if (j.grid) {
              b(j.grid.bDiv).css({
                height : f + (isNaN(f) ? "" : "px")
              });
              j.p.height = f;
              j.p.scroll && j.grid.populateVisible()
            }
          })
        },
        setCaption : function(f) {
          return this.each(function() {
            this.p.caption = f;
            b("span.ui-jqgrid-title", this.grid.cDiv).html(f);
            b(this.grid.cDiv).show()
          })
        },
        setLabel : function(f, j, i, c) {
          return this.each(function() {
            var e = this, k = -1;
            if (e.grid) {
              if (isNaN(f))
                b(e.p.colModel).each(function(r) {
                  if (this.name == f) {
                    k = r;
                    return false
                  }
                });
              else
                k = parseInt(f, 10);
              if (k >= 0) {
                var m = b("tr.ui-jqgrid-labels th:eq(" + k + ")", e.grid.hDiv);
                if (j) {
                  var a = b(".s-ico", m);
                  b("[id^=jqgh_]", m).empty().html(j).append(a);
                  e.p.colNames[k] = j
                }
                if (i)
                  typeof i === "string" ? b(m).addClass(i) : b(m).css(i);
                typeof c === "object" && b(m).attr(c)
              }
            }
          })
        },
        setCell : function(f, j, i, c, e, k) {
          return this.each(function() {
            var m = this, a = -1, r, u;
            if (m.grid) {
              if (isNaN(j))
                b(m.p.colModel).each(function(G) {
                  if (this.name == j) {
                    a = G;
                    return false
                  }
                });
              else
                a = parseInt(j, 10);
              if (a >= 0)
                if (r = m.rows.namedItem(f)) {
                  var B = b("td:eq(" + a + ")", r);
                  if (i !== "" || k === true) {
                    r = m.formatter(f, i, a, r, "edit");
                    u = m.p.colModel[a].title ? {
                      title : b.jgrid.stripHtml(r)
                    } : {};
                    m.p.treeGrid && b(".tree-wrap", b(B)).length > 0 ? b(
                        "span", b(B)).html(r).attr(u) : b(B).html(r).attr(u);
                    if (m.p.datatype == "local") {
                      r = m.p.colModel[a];
                      i = r.formatter && typeof r.formatter === "string"
                          && r.formatter == "date" ? b.unformat.date(i, r) : i;
                      u = m.p._index[f];
                      if (typeof u != "undefined")
                        m.p.data[u][r.name] = i
                    }
                  }
                  if (typeof c === "string")
                    b(B).addClass(c);
                  else
                    c && b(B).css(c);
                  typeof e === "object" && b(B).attr(e)
                }
            }
          })
        },
        getCell : function(f, j) {
          var i = false;
          this.each(function() {
            var c = this, e = -1;
            if (c.grid) {
              if (isNaN(j))
                b(c.p.colModel).each(function(a) {
                  if (this.name === j) {
                    e = a;
                    return false
                  }
                });
              else
                e = parseInt(j, 10);
              if (e >= 0) {
                var k = c.rows.namedItem(f);
                if (k)
                  try {
                    i = b.unformat(b("td:eq(" + e + ")", k), {
                      rowId : k.id,
                      colModel : c.p.colModel[e]
                    }, e)
                  } catch (m) {
                    i = b.jgrid.htmlDecode(b("td:eq(" + e + ")", k).html())
                  }
              }
            }
          });
          return i
        },
        getCol : function(f, j, i) {
          var c = [], e, k = 0;
          j = typeof j != "boolean" ? false : j;
          if (typeof i == "undefined")
            i = false;
          this.each(function() {
            var m = this, a = -1;
            if (m.grid) {
              if (isNaN(f))
                b(m.p.colModel).each(function(G) {
                  if (this.name === f) {
                    a = G;
                    return false
                  }
                });
              else
                a = parseInt(f, 10);
              if (a >= 0) {
                var r = m.rows.length, u = 0;
                if (r && r > 0) {
                  for (; u < r;) {
                    if (b(m.rows[u]).hasClass("jqgrow")) {
                      try {
                        e = b.unformat(b(m.rows[u].cells[a]), {
                          rowId : m.rows[u].id,
                          colModel : m.p.colModel[a]
                        }, a)
                      } catch (B) {
                        e = b.jgrid.htmlDecode(m.rows[u].cells[a].innerHTML)
                      }
                      if (i)
                        k += parseFloat(e);
                      else if (j)
                        c.push({
                          id : m.rows[u].id,
                          value : e
                        });
                      else
                        c[u] = e
                    }
                    u++
                  }
                  if (i)
                    switch (i.toLowerCase()) {
                    case "sum":
                      c = k;
                      break;
                    case "avg":
                      c = k / r;
                      break;
                    case "count":
                      c = r;
                      break
                    }
                }
              }
            }
          });
          return c
        },
        clearGridData : function(f) {
          return this.each(function() {
            var j = this;
            if (j.grid) {
              if (typeof f != "boolean")
                f = false;
              if (j.p.deepempty)
                b("#" + j.p.id + " tbody:first tr:gt(0)").remove();
              else {
                var i = b("#" + j.p.id + " tbody:first tr:first")[0];
                b("#" + j.p.id + " tbody:first").empty().append(i)
              }
              j.p.footerrow && f
                  && b(".ui-jqgrid-ftable td", j.grid.sDiv).html("&#160;");
              j.p.selrow = null;
              j.p.selarrrow = [];
              j.p.savedRow = [];
              j.p.records = 0;
              j.p.page = 1;
              j.p.lastpage = 0;
              j.p.reccount = 0;
              j.p.data = [];
              j.p_index = {};
              j.updatepager(true, false)
            }
          })
        },
        getInd : function(f, j) {
          var i = false, c;
          this.each(function() {
            if (c = this.rows.namedItem(f))
              i = j === true ? c : c.rowIndex
          });
          return i
        }
      })
})(jQuery);
(function(c) {
  c.fmatter = {};
  c.extend(c.fmatter, {
    isBoolean : function(a) {
      return typeof a === "boolean"
    },
    isObject : function(a) {
      return a && (typeof a === "object" || c.isFunction(a)) || false
    },
    isString : function(a) {
      return typeof a === "string"
    },
    isNumber : function(a) {
      return typeof a === "number" && isFinite(a)
    },
    isNull : function(a) {
      return a === null
    },
    isUndefined : function(a) {
      return typeof a === "undefined"
    },
    isValue : function(a) {
      return this.isObject(a) || this.isString(a) || this.isNumber(a)
          || this.isBoolean(a)
    },
    isEmpty : function(a) {
      if (!this.isString(a) && this.isValue(a))
        return false;
      else if (!this.isValue(a))
        return true;
      a = c.trim(a).replace(/\&nbsp\;/ig, "").replace(/\&#160\;/ig, "");
      return a === ""
    }
  });
  c.fn.fmatter = function(a, b, d, e, h) {
    var g = b;
    d = c.extend({}, c.jgrid.formatter, d);
    if (c.fn.fmatter[a])
      g = c.fn.fmatter[a](b, d, e, h);
    return g
  };
  c.fmatter.util = {
    NumberFormat : function(a, b) {
      c.fmatter.isNumber(a) || (a *= 1);
      if (c.fmatter.isNumber(a)) {
        var d = a < 0, e = a + "", h = b.decimalSeparator ? b.decimalSeparator
            : ".";
        if (c.fmatter.isNumber(b.decimalPlaces)) {
          var g = b.decimalPlaces;
          e = Math.pow(10, g);
          e = Math.round(a * e) / e + "";
          a = e.lastIndexOf(".");
          if (g > 0) {
            if (a < 0) {
              e += h;
              a = e.length - 1
            } else if (h !== ".")
              e = e.replace(".", h);
            for (; e.length - 1 - a < g;)
              e += "0"
          }
        }
        if (b.thousandsSeparator) {
          g = b.thousandsSeparator;
          a = e.lastIndexOf(h);
          a = a > -1 ? a : e.length;
          h = e.substring(a);
          for ( var f = -1, i = a; i > 0; i--) {
            f++;
            if (f % 3 === 0 && i !== a && (!d || i > 1))
              h = g + h;
            h = e.charAt(i - 1) + h
          }
          e = h
        }
        e = b.prefix ? b.prefix + e : e;
        return e = b.suffix ? e + b.suffix : e
      } else
        return a
    },
    DateFormat : function(a, b, d, e) {
      var h = function(m, r) {
        m = String(m);
        for (r = parseInt(r, 10) || 2; m.length < r;)
          m = "0" + m;
        return m
      }, g = {
        m : 1,
        d : 1,
        y : 1970,
        h : 0,
        i : 0,
        s : 0,
        u : 0
      }, f = 0, i, j, k = [ "i18n" ];
      k.i18n = {
        dayNames : e.dayNames,
        monthNames : e.monthNames
      };
      if (a in e.masks)
        a = e.masks[a];
      if (b.constructor === Number)
        f = new Date(b);
      else if (b.constructor === Date)
        f = b;
      else {
        b = b.split(/[\\\/:_;.,\t\T\s-]/);
        a = a.split(/[\\\/:_;.,\t\T\s-]/);
        i = 0;
        for (j = a.length; i < j; i++) {
          if (a[i] == "M") {
            f = c.inArray(b[i], k.i18n.monthNames);
            if (f !== -1 && f < 12)
              b[i] = f + 1
          }
          if (a[i] == "F") {
            f = c.inArray(b[i], k.i18n.monthNames);
            if (f !== -1 && f > 11)
              b[i] = f + 1 - 12
          }
          if (b[i])
            g[a[i].toLowerCase()] = parseInt(b[i], 10)
        }
        if (g.f)
          g.m = g.f;
        if (g.m === 0 && g.y === 0 && g.d === 0)
          return "&#160;";
        g.m = parseInt(g.m, 10) - 1;
        f = g.y;
        if (f >= 70 && f <= 99)
          g.y = 1900 + g.y;
        else if (f >= 0 && f <= 69)
          g.y = 2E3 + g.y;
        f = new Date(g.y, g.m, g.d, g.h, g.i, g.s, g.u)
      }
      if (d in e.masks)
        d = e.masks[d];
      else
        d || (d = "Y-m-d");
      g = f.getHours();
      a = f.getMinutes();
      b = f.getDate();
      i = f.getMonth() + 1;
      j = f.getTimezoneOffset();
      var l = f.getSeconds(), o = f.getMilliseconds(), n = f.getDay(), p = f
          .getFullYear(), q = (n + 6) % 7 + 1, s = (new Date(p, i - 1, b) - new Date(
          p, 0, 1)) / 864E5, t = {
        d : h(b),
        D : k.i18n.dayNames[n],
        j : b,
        l : k.i18n.dayNames[n + 7],
        N : q,
        S : e.S(b),
        w : n,
        z : s,
        W : q < 5 ? Math.floor((s + q - 1) / 7) + 1 : Math
            .floor((s + q - 1) / 7)
            || (((new Date(p - 1, 0, 1)).getDay() + 6) % 7 < 4 ? 53 : 52),
        F : k.i18n.monthNames[i - 1 + 12],
        m : h(i),
        M : k.i18n.monthNames[i - 1],
        n : i,
        t : "?",
        L : "?",
        o : "?",
        Y : p,
        y : String(p).substring(2),
        a : g < 12 ? e.AmPm[0] : e.AmPm[1],
        A : g < 12 ? e.AmPm[2] : e.AmPm[3],
        B : "?",
        g : g % 12 || 12,
        G : g,
        h : h(g % 12 || 12),
        H : h(g),
        i : h(a),
        s : h(l),
        u : o,
        e : "?",
        I : "?",
        O : (j > 0 ? "-" : "+")
            + h(Math.floor(Math.abs(j) / 60) * 100 + Math.abs(j) % 60, 4),
        P : "?",
        T : (String(f)
            .match(
                /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g) || [ "" ])
            .pop().replace(/[^-+\dA-Z]/g, ""),
        Z : "?",
        c : "?",
        r : "?",
        U : Math.floor(f / 1E3)
      };
      return d.replace(/\\.|[dDjlNSwzWFmMntLoYyaABgGhHisueIOPTZcrU]/g,
          function(m) {
            return m in t ? t[m] : m.substring(1)
          })
    }
  };
  c.fn.fmatter.defaultFormat = function(a, b) {
    return c.fmatter.isValue(a) && a !== "" ? a
        : b.defaultValue ? b.defaultValue : "&#160;"
  };
  c.fn.fmatter.email = function(a, b) {
    return c.fmatter.isEmpty(a) ? c.fn.fmatter.defaultFormat(a, b)
        : '<a href="mailto:' + a + '">' + a + "</a>"
  };
  c.fn.fmatter.checkbox = function(a, b) {
    var d = c.extend({}, b.checkbox);
    c.fmatter.isUndefined(b.colModel.formatoptions)
        || (d = c.extend({}, d, b.colModel.formatoptions));
    b = d.disabled === true ? 'disabled="disabled"' : "";
    if (c.fmatter.isEmpty(a) || c.fmatter.isUndefined(a))
      a = c.fn.fmatter.defaultFormat(a, d);
    a += "";
    a = a.toLowerCase();
    return '<input type="checkbox" '
        + (a.search(/(false|0|no|off)/i) < 0 ? " checked='checked' " : "")
        + ' value="' + a + '" offval="no" ' + b + "/>"
  };
  c.fn.fmatter.link = function(a, b) {
    var d = {
      target : b.target
    }, e = "";
    c.fmatter.isUndefined(b.colModel.formatoptions)
        || (d = c.extend({}, d, b.colModel.formatoptions));
    if (d.target)
      e = "target=" + d.target;
    return c.fmatter.isEmpty(a) ? c.fn.fmatter.defaultFormat(a, b) : "<a " + e
        + ' href="' + a + '">' + a + "</a>"
  };
  c.fn.fmatter.showlink = function(a, b) {
    var d = {
      baseLinkUrl : b.baseLinkUrl,
      showAction : b.showAction,
      addParam : b.addParam || "",
      target : b.target,
      idName : b.idName
    }, e = "";
    c.fmatter.isUndefined(b.colModel.formatoptions)
        || (d = c.extend({}, d, b.colModel.formatoptions));
    if (d.target)
      e = "target=" + d.target;
    d = d.baseLinkUrl + d.showAction + "?" + d.idName + "=" + b.rowId
        + d.addParam;
    return c.fmatter.isString(a) || c.fmatter.isNumber(a) ? "<a " + e
        + ' href="' + d + '">' + a + "</a>" : c.fn.fmatter.defaultFormat(a, b)
  };
  c.fn.fmatter.integer = function(a, b) {
    var d = c.extend({}, b.integer);
    c.fmatter.isUndefined(b.colModel.formatoptions)
        || (d = c.extend({}, d, b.colModel.formatoptions));
    if (c.fmatter.isEmpty(a))
      return d.defaultValue;
    return c.fmatter.util.NumberFormat(a, d)
  };
  c.fn.fmatter.number = function(a, b) {
    var d = c.extend({}, b.number);
    c.fmatter.isUndefined(b.colModel.formatoptions)
        || (d = c.extend({}, d, b.colModel.formatoptions));
    if (c.fmatter.isEmpty(a))
      return d.defaultValue;
    return c.fmatter.util.NumberFormat(a, d)
  };
  c.fn.fmatter.currency = function(a, b) {
    var d = c.extend({}, b.currency);
    c.fmatter.isUndefined(b.colModel.formatoptions)
        || (d = c.extend({}, d, b.colModel.formatoptions));
    if (c.fmatter.isEmpty(a))
      return d.defaultValue;
    return c.fmatter.util.NumberFormat(a, d)
  };
  c.fn.fmatter.date = function(a, b, d, e) {
    d = c.extend({}, b.date);
    c.fmatter.isUndefined(b.colModel.formatoptions)
        || (d = c.extend({}, d, b.colModel.formatoptions));
    return !d.reformatAfterEdit && e == "edit" ? c.fn.fmatter.defaultFormat(a,
        b) : c.fmatter.isEmpty(a) ? c.fn.fmatter.defaultFormat(a, b)
        : c.fmatter.util.DateFormat(d.srcformat, a, d.newformat, d)
  };
  c.fn.fmatter.select = function(a, b) {
    a += "";
    var d = false, e = [];
    if (c.fmatter.isUndefined(b.colModel.formatoptions)) {
      if (!c.fmatter.isUndefined(b.colModel.editoptions))
        d = b.colModel.editoptions.value
    } else
      d = b.colModel.formatoptions.value;
    if (d) {
      var h = b.colModel.editoptions.multiple === true ? true : false, g = [], f;
      if (h) {
        g = a.split(",");
        g = c.map(g, function(l) {
          return c.trim(l)
        })
      }
      if (c.fmatter.isString(d))
        for ( var i = d.split(";"), j = 0, k = 0; k < i.length; k++) {
          f = i[k].split(":");
          if (f.length > 2)
            f[1] = jQuery.map(f, function(l, o) {
              if (o > 0)
                return l
            }).join(":");
          if (h) {
            if (jQuery.inArray(f[0], g) > -1) {
              e[j] = f[1];
              j++
            }
          } else if (c.trim(f[0]) == c.trim(a)) {
            e[0] = f[1];
            break
          }
        }
      else if (c.fmatter.isObject(d))
        if (h)
          e = jQuery.map(g, function(l) {
            return d[l]
          });
        else
          e[0] = d[a] || ""
    }
    a = e.join(", ");
    return a === "" ? c.fn.fmatter.defaultFormat(a, b) : a
  };
  c.fn.fmatter.rowactions = function(a, b, d, e) {
    switch (d) {
    case "edit":
      d = function() {
        c("tr#" + a + " div.ui-inline-edit, tr#" + a + " div.ui-inline-del",
            "#" + b).show();
        c("tr#" + a + " div.ui-inline-save, tr#" + a + " div.ui-inline-cancel",
            "#" + b).hide()
      };
      c("#" + b).jqGrid("editRow", a, e, null, null, null, {
        oper : "edit"
      }, d, null, d);
      c("tr#" + a + " div.ui-inline-edit, tr#" + a + " div.ui-inline-del",
          "#" + b).hide();
      c("tr#" + a + " div.ui-inline-save, tr#" + a + " div.ui-inline-cancel",
          "#" + b).show();
      break;
    case "save":
      c("#" + b).jqGrid("saveRow", a, null, null);
      c("tr#" + a + " div.ui-inline-edit, tr#" + a + " div.ui-inline-del",
          "#" + b).show();
      c("tr#" + a + " div.ui-inline-save, tr#" + a + " div.ui-inline-cancel",
          "#" + b).hide();
      break;
    case "cancel":
      c("#" + b).jqGrid("restoreRow", a);
      c("tr#" + a + " div.ui-inline-edit, tr#" + a + " div.ui-inline-del",
          "#" + b).show();
      c("tr#" + a + " div.ui-inline-save, tr#" + a + " div.ui-inline-cancel",
          "#" + b).hide();
      break
    }
  };
  c.fn.fmatter.actions = function(a, b) {
    a = {
      keys : false,
      editbutton : true,
      delbutton : true
    };
    c.fmatter.isUndefined(b.colModel.formatoptions)
        || (a = c.extend(a, b.colModel.formatoptions));
    var d = b.rowId, e = "", h;
    if (typeof d == "undefined" || c.fmatter.isEmpty(d))
      return "";
    if (a.editbutton) {
      h = "onclick=$.fn.fmatter.rowactions('" + d + "','" + b.gid + "','edit',"
          + a.keys + ");";
      e = e
          + "<div style='margin-left:8px;'><div title='"
          + c.jgrid.nav.edittitle
          + "' style='float:left;cursor:pointer;' class='ui-pg-div ui-inline-edit' "
          + h + "><span class='ui-icon ui-icon-pencil'></span></div>"
    }
    if (a.delbutton) {
      h = "onclick=jQuery('#" + b.gid + "').jqGrid('delGridRow','" + d + "');";
      e = e
          + "<div title='"
          + c.jgrid.nav.deltitle
          + "' style='float:left;margin-left:5px;' class='ui-pg-div ui-inline-del' "
          + h + "><span class='ui-icon ui-icon-trash'></span></div>"
    }
    h = "onclick=$.fn.fmatter.rowactions('" + d + "','" + b.gid
        + "','save',false);";
    e = e
        + "<div title='"
        + c.jgrid.edit.bSubmit
        + "' style='float:left;display:none' class='ui-pg-div ui-inline-save'><span class='ui-icon ui-icon-disk' "
        + h + "></span></div>";
    h = "onclick=$.fn.fmatter.rowactions('" + d + "','" + b.gid
        + "','cancel',false);";
    return e = e
        + "<div title='"
        + c.jgrid.edit.bCancel
        + "' style='float:left;display:none;margin-left:5px;' class='ui-pg-div ui-inline-cancel'><span class='ui-icon ui-icon-cancel' "
        + h + "></span></div></div>"
  };
  c.unformat = function(a, b, d, e) {
    var h, g = b.colModel.formatter, f = b.colModel.formatoptions || {}, i = /([\.\*\_\'\(\)\{\}\+\?\\])/g, j = b.colModel.unformat
        || c.fn.fmatter[g] && c.fn.fmatter[g].unformat;
    if (typeof j !== "undefined" && c.isFunction(j))
      h = j(c(a).text(), b, a);
    else if (!c.fmatter.isUndefined(g) && c.fmatter.isString(g)) {
      h = c.jgrid.formatter || {};
      switch (g) {
      case "integer":
        f = c.extend({}, h.integer, f);
        b = f.thousandsSeparator.replace(i, "\\$1");
        b = new RegExp(b, "g");
        h = c(a).text().replace(b, "");
        break;
      case "number":
        f = c.extend({}, h.number, f);
        b = f.thousandsSeparator.replace(i, "\\$1");
        b = new RegExp(b, "g");
        h = c(a).text().replace(b, "").replace(f.decimalSeparator, ".");
        break;
      case "currency":
        f = c.extend({}, h.currency, f);
        b = f.thousandsSeparator.replace(i, "\\$1");
        b = new RegExp(b, "g");
        h = c(a).text().replace(b, "").replace(f.decimalSeparator, ".")
            .replace(f.prefix, "").replace(f.suffix, "");
        break;
      case "checkbox":
        f = b.colModel.editoptions ? b.colModel.editoptions.value.split(":")
            : [ "Yes", "No" ];
        h = c("input", a).attr("checked") ? f[0] : f[1];
        break;
      case "select":
        h = c.unformat.select(a, b, d, e);
        break;
      case "actions":
        return "";
      default:
        h = c(a).text()
      }
    }
    return h ? h : e === true ? c(a).text() : c.jgrid.htmlDecode(c(a).html())
  };
  c.unformat.select = function(a, b, d, e) {
    d = [];
    a = c(a).text();
    if (e === true)
      return a;
    b = c.extend({}, b.colModel.editoptions);
    if (b.value) {
      var h = b.value;
      b = b.multiple === true ? true : false;
      e = [];
      var g;
      if (b) {
        e = a.split(",");
        e = c.map(e, function(k) {
          return c.trim(k)
        })
      }
      if (c.fmatter.isString(h))
        for ( var f = h.split(";"), i = 0, j = 0; j < f.length; j++) {
          g = f[j].split(":");
          if (g.length > 2)
            g[1] = jQuery.map(g, function(k, l) {
              if (l > 0)
                return k
            }).join(":");
          if (b) {
            if (jQuery.inArray(g[1], e) > -1) {
              d[i] = g[0];
              i++
            }
          } else if (c.trim(g[1]) == c.trim(a)) {
            d[0] = g[0];
            break
          }
        }
      else if (c.fmatter.isObject(h) || c.isArray(h)) {
        b || (e[0] = a);
        d = jQuery.map(e, function(k) {
          var l;
          c.each(h, function(o, n) {
            if (n == k) {
              l = o;
              return false
            }
          });
          if (typeof l != "undefined")
            return l
        })
      }
      return d.join(", ")
    } else
      return a || ""
  };
  c.unformat.date = function(a, b) {
    var d = c.jgrid.formatter.date || {};
    c.fmatter.isUndefined(b.formatoptions)
        || (d = c.extend({}, d, b.formatoptions));
    return c.fmatter.isEmpty(a) ? c.fn.fmatter.defaultFormat(a, b)
        : c.fmatter.util.DateFormat(d.newformat, a, d.srcformat, d)
  }
})(jQuery);
(function(a) {
  a.jgrid
      .extend({
        getColProp : function(f) {
          var d = {}, b = this[0];
          if (b.grid) {
            b = b.p.colModel;
            for ( var m = 0; m < b.length; m++)
              if (b[m].name == f) {
                d = b[m];
                break
              }
            return d
          }
        },
        setColProp : function(f, d) {
          return this.each(function() {
            if (this.grid)
              if (d)
                for ( var b = this.p.colModel, m = 0; m < b.length; m++)
                  if (b[m].name == f) {
                    a.extend(this.p.colModel[m], d);
                    break
                  }
          })
        },
        sortGrid : function(f, d, b) {
          return this.each(function() {
            var m = this, t = -1;
            if (m.grid) {
              if (!f)
                f = m.p.sortname;
              for ( var q = 0; q < m.p.colModel.length; q++)
                if (m.p.colModel[q].index == f || m.p.colModel[q].name == f) {
                  t = q;
                  break
                }
              if (t != -1) {
                q = m.p.colModel[t].sortable;
                if (typeof q !== "boolean")
                  q = true;
                if (typeof d !== "boolean")
                  d = false;
                q && m.sortData("jqgh_" + f, t, d, b)
              }
            }
          })
        },
        GridDestroy : function() {
          return this.each(function() {
            if (this.grid) {
              this.p.pager && a(this.p.pager).remove();
              var f = this.id;
              try {
                a("#gbox_" + f).remove()
              } catch (d) {
              }
            }
          })
        },
        GridUnload : function() {
          return this.each(function() {
            if (this.grid) {
              var f = {
                id : a(this).attr("id"),
                cl : a(this).attr("class")
              };
              this.p.pager
                  && a(this.p.pager).empty().removeClass(
                      "ui-state-default ui-jqgrid-pager corner-bottom");
              var d = document.createElement("table");
              a(d).attr({
                id : f.id
              });
              d.className = f.cl;
              f = this.id;
              a(d).removeClass("ui-jqgrid-btable");
              if (a(this.p.pager).parents("#gbox_" + f).length === 1) {
                a(d).insertBefore("#gbox_" + f).show();
                a(this.p.pager).insertBefore("#gbox_" + f)
              } else
                a(d).insertBefore("#gbox_" + f).show();
              a("#gbox_" + f).remove()
            }
          })
        },
        setGridState : function(f) {
          return this
              .each(function() {
                if (this.grid) {
                  var d = this;
                  if (f == "hidden") {
                    a(".ui-jqgrid-bdiv, .ui-jqgrid-hdiv", "#gview_" + d.p.id)
                        .slideUp("fast");
                    d.p.pager && a(d.p.pager).slideUp("fast");
                    d.p.toppager && a(d.p.toppager).slideUp("fast");
                    if (d.p.toolbar[0] === true) {
                      d.p.toolbar[1] == "both"
                          && a(d.grid.ubDiv).slideUp("fast");
                      a(d.grid.uDiv).slideUp("fast")
                    }
                    d.p.footerrow
                        && a(".ui-jqgrid-sdiv", "#gbox_" + d.p.id).slideUp(
                            "fast");
                    a(".ui-jqgrid-titlebar-close span", d.grid.cDiv)
                        .removeClass("ui-icon-circle-triangle-n").addClass(
                            "ui-icon-circle-triangle-s");
                    d.p.gridstate = "hidden"
                  } else if (f == "visible") {
                    a(".ui-jqgrid-hdiv, .ui-jqgrid-bdiv", "#gview_" + d.p.id)
                        .slideDown("fast");
                    d.p.pager && a(d.p.pager).slideDown("fast");
                    d.p.toppager && a(d.p.toppager).slideDown("fast");
                    if (d.p.toolbar[0] === true) {
                      d.p.toolbar[1] == "both"
                          && a(d.grid.ubDiv).slideDown("fast");
                      a(d.grid.uDiv).slideDown("fast")
                    }
                    d.p.footerrow
                        && a(".ui-jqgrid-sdiv", "#gbox_" + d.p.id).slideDown(
                            "fast");
                    a(".ui-jqgrid-titlebar-close span", d.grid.cDiv)
                        .removeClass("ui-icon-circle-triangle-s").addClass(
                            "ui-icon-circle-triangle-n");
                    d.p.gridstate = "visible"
                  }
                }
              })
        },
        updateGridRows : function(f, d, b) {
          var m, t = false, q;
          this.each(function() {
            var h = this, k, o, c, g;
            if (!h.grid)
              return false;
            d || (d = "id");
            f
                && f.length > 0
                && a(f)
                    .each(
                        function() {
                          c = this;
                          if (o = h.rows.namedItem(c[d])) {
                            g = c[d];
                            if (b === true)
                              if (h.p.jsonReader.repeatitems === true) {
                                if (h.p.jsonReader.cell)
                                  c = c[h.p.jsonReader.cell];
                                for ( var e = 0; e < c.length; e++) {
                                  k = h.formatter(g, c[e], e, c, "edit");
                                  q = h.p.colModel[e].title ? {
                                    title : a.jgrid.stripHtml(k)
                                  } : {};
                                  h.p.treeGrid === true
                                      && m == h.p.ExpandColumn ? a(
                                      "td:eq(" + e + ") > span:first", o).html(
                                      k).attr(q) : a("td:eq(" + e + ")", o)
                                      .html(k).attr(q)
                                }
                                return t = true
                              }
                            a(h.p.colModel).each(
                                function(n) {
                                  m = b === true ? this.jsonmap || this.name
                                      : this.name;
                                  if (c[m] !== undefined) {
                                    k = h.formatter(g, c[m], n, c, "edit");
                                    q = this.title ? {
                                      title : a.jgrid.stripHtml(k)
                                    } : {};
                                    h.p.treeGrid === true
                                        && m == h.p.ExpandColumn ? a(
                                        "td:eq(" + n + ") > span:first", o)
                                        .html(k).attr(q) : a(
                                        "td:eq(" + n + ")", o).html(k).attr(q);
                                    t = true
                                  }
                                })
                          }
                        })
          });
          return t
        },
        filterGrid : function(f, d) {
          d = a.extend({
            gridModel : false,
            gridNames : false,
            gridToolbar : false,
            filterModel : [],
            formtype : "horizontal",
            autosearch : true,
            formclass : "filterform",
            tableclass : "filtertable",
            buttonclass : "filterbutton",
            searchButton : "Search",
            clearButton : "Clear",
            enableSearch : false,
            enableClear : false,
            beforeSearch : null,
            afterSearch : null,
            beforeClear : null,
            afterClear : null,
            url : "",
            marksearched : true
          }, d || {});
          return this
              .each(function() {
                var b = this;
                this.p = d;
                if (this.p.filterModel.length === 0
                    && this.p.gridModel === false)
                  alert("No filter is set");
                else if (f) {
                  this.p.gridid = f.indexOf("#") != -1 ? f : "#" + f;
                  var m = a(this.p.gridid).jqGrid("getGridParam", "colModel");
                  if (m) {
                    if (this.p.gridModel === true) {
                      var t = a(this.p.gridid)[0], q;
                      a.each(m, function(g) {
                        var e = [];
                        this.search = this.search === false ? false : true;
                        q = this.editrules
                            && this.editrules.searchhidden === true ? true
                            : this.hidden === true ? false : true;
                        if (this.search === true && q === true) {
                          e.label = b.p.gridNames === true ? t.p.colNames[g]
                              : "";
                          e.name = this.name;
                          e.index = this.index || this.name;
                          e.stype = this.edittype || "text";
                          if (e.stype != "select")
                            e.stype = "text";
                          e.defval = this.defval || "";
                          e.surl = this.surl || "";
                          e.sopt = this.editoptions || {};
                          e.width = this.width;
                          b.p.filterModel.push(e)
                        }
                      })
                    } else
                      a.each(b.p.filterModel, function() {
                        for ( var g = 0; g < m.length; g++)
                          if (this.name == m[g].name) {
                            this.index = m[g].index || this.name;
                            break
                          }
                        if (!this.index)
                          this.index = this.name
                      });
                    var h = function() {
                      var g = {}, e = 0, n, i = a(b.p.gridid)[0], j;
                      i.p.searchdata = {};
                      a.isFunction(b.p.beforeSearch) && b.p.beforeSearch();
                      a.each(b.p.filterModel, function() {
                        j = this.index;
                        switch (this.stype) {
                        case "select":
                          if (n = a("select[name=" + j + "]", b).val()) {
                            g[j] = n;
                            b.p.marksearched
                                && a("#jqgh_" + this.name, i.grid.hDiv)
                                    .addClass("dirty-cell");
                            e++
                          } else {
                            b.p.marksearched
                                && a("#jqgh_" + this.name, i.grid.hDiv)
                                    .removeClass("dirty-cell");
                            try {
                              delete i.p.postData[this.index]
                            } catch (r) {
                            }
                          }
                          break;
                        default:
                          if (n = a("input[name=" + j + "]", b).val()) {
                            g[j] = n;
                            b.p.marksearched
                                && a("#jqgh_" + this.name, i.grid.hDiv)
                                    .addClass("dirty-cell");
                            e++
                          } else {
                            b.p.marksearched
                                && a("#jqgh_" + this.name, i.grid.hDiv)
                                    .removeClass("dirty-cell");
                            try {
                              delete i.p.postData[this.index]
                            } catch (s) {
                            }
                          }
                        }
                      });
                      var p = e > 0 ? true : false;
                      a.extend(i.p.postData, g);
                      var l;
                      if (b.p.url) {
                        l = a(i).jqGrid("getGridParam", "url");
                        a(i).jqGrid("setGridParam", {
                          url : b.p.url
                        })
                      }
                      a(i).jqGrid("setGridParam", {
                        search : p
                      }).trigger("reloadGrid", [ {
                        page : 1
                      } ]);
                      l && a(i).jqGrid("setGridParam", {
                        url : l
                      });
                      a.isFunction(b.p.afterSearch) && b.p.afterSearch()
                    }, k = function() {
                      var g = {}, e, n = 0, i = a(b.p.gridid)[0], j;
                      a.isFunction(b.p.beforeClear) && b.p.beforeClear();
                      a.each(b.p.filterModel, function() {
                        j = this.index;
                        e = this.defval ? this.defval : "";
                        if (!this.stype)
                          this.stype = "text";
                        switch (this.stype) {
                        case "select":
                          var r;
                          a("select[name=" + j + "] option", b).each(
                              function(v) {
                                if (v === 0)
                                  this.selected = true;
                                if (a(this).text() == e) {
                                  this.selected = true;
                                  r = a(this).val();
                                  return false
                                }
                              });
                          if (r) {
                            g[j] = r;
                            b.p.marksearched
                                && a("#jqgh_" + this.name, i.grid.hDiv)
                                    .addClass("dirty-cell");
                            n++
                          } else {
                            b.p.marksearched
                                && a("#jqgh_" + this.name, i.grid.hDiv)
                                    .removeClass("dirty-cell");
                            try {
                              delete i.p.postData[this.index]
                            } catch (s) {
                            }
                          }
                          break;
                        case "text":
                          a("input[name=" + j + "]", b).val(e);
                          if (e) {
                            g[j] = e;
                            b.p.marksearched
                                && a("#jqgh_" + this.name, i.grid.hDiv)
                                    .addClass("dirty-cell");
                            n++
                          } else {
                            b.p.marksearched
                                && a("#jqgh_" + this.name, i.grid.hDiv)
                                    .removeClass("dirty-cell");
                            try {
                              delete i.p.postData[this.index]
                            } catch (u) {
                            }
                          }
                          break
                        }
                      });
                      var p = n > 0 ? true : false;
                      a.extend(i.p.postData, g);
                      var l;
                      if (b.p.url) {
                        l = a(i).jqGrid("getGridParam", "url");
                        a(i).jqGrid("setGridParam", {
                          url : b.p.url
                        })
                      }
                      a(i).jqGrid("setGridParam", {
                        search : p
                      }).trigger("reloadGrid", [ {
                        page : 1
                      } ]);
                      l && a(i).jqGrid("setGridParam", {
                        url : l
                      });
                      a.isFunction(b.p.afterClear) && b.p.afterClear()
                    }, o, c = a("<form name='SearchForm' style=display:inline;' class='"
                        + this.p.formclass + "'></form>");
                    o = a("<table class='"
                        + this.p.tableclass
                        + "' cellspacing='0' cellpading='0' border='0'><tbody></tbody></table>");
                    a(c).append(o);
                    (function() {
                      var g = document.createElement("tr"), e, n, i, j;
                      b.p.formtype == "horizontal" && a(o).append(g);
                      a
                          .each(
                              b.p.filterModel,
                              function(p) {
                                i = document.createElement("td");
                                a(i).append(
                                    "<label for='" + this.name + "'>"
                                        + this.label + "</label>");
                                j = document.createElement("td");
                                var l = this;
                                if (!this.stype)
                                  this.stype = "text";
                                switch (this.stype) {
                                case "select":
                                  if (this.surl)
                                    a(j)
                                        .load(
                                            this.surl,
                                            function() {
                                              l.defval
                                                  && a("select", this).val(
                                                      l.defval);
                                              a("select", this).attr({
                                                name : l.index || l.name,
                                                id : "sg_" + l.name
                                              });
                                              l.sopt
                                                  && a("select", this).attr(
                                                      l.sopt);
                                              b.p.gridToolbar === true
                                                  && l.width
                                                  && a("select", this).width(
                                                      l.width);
                                              b.p.autosearch === true
                                                  && a("select", this).change(
                                                      function() {
                                                        h();
                                                        return false
                                                      })
                                            });
                                  else if (l.sopt.value) {
                                    var r = l.sopt.value, s = document
                                        .createElement("select");
                                    a(s).attr({
                                      name : l.index || l.name,
                                      id : "sg_" + l.name
                                    }).attr(l.sopt);
                                    var u;
                                    if (typeof r === "string") {
                                      p = r.split(";");
                                      for ( var v = 0; v < p.length; v++) {
                                        r = p[v].split(":");
                                        u = document.createElement("option");
                                        u.value = r[0];
                                        u.innerHTML = r[1];
                                        if (r[1] == l.defval)
                                          u.selected = "selected";
                                        s.appendChild(u)
                                      }
                                    } else if (typeof r === "object")
                                      for (v in r)
                                        if (r.hasOwnProperty(v)) {
                                          p++;
                                          u = document.createElement("option");
                                          u.value = v;
                                          u.innerHTML = r[v];
                                          if (r[v] == l.defval)
                                            u.selected = "selected";
                                          s.appendChild(u)
                                        }
                                    b.p.gridToolbar === true && l.width
                                        && a(s).width(l.width);
                                    a(j).append(s);
                                    b.p.autosearch === true
                                        && a(s).change(function() {
                                          h();
                                          return false
                                        })
                                  }
                                  break;
                                case "text":
                                  s = this.defval ? this.defval : "";
                                  a(j).append(
                                      "<input type='text' name='"
                                          + (this.index || this.name)
                                          + "' id='sg_" + this.name
                                          + "' value='" + s + "'/>");
                                  l.sopt && a("input", j).attr(l.sopt);
                                  if (b.p.gridToolbar === true && l.width)
                                    a.browser.msie ? a("input", j).width(
                                        l.width - 4) : a("input", j).width(
                                        l.width - 2);
                                  b.p.autosearch === true
                                      && a("input", j)
                                          .keypress(
                                              function(w) {
                                                if ((w.charCode ? w.charCode
                                                    : w.keyCode ? w.keyCode : 0) == 13) {
                                                  h();
                                                  return false
                                                }
                                                return this
                                              });
                                  break
                                }
                                if (b.p.formtype == "horizontal") {
                                  b.p.gridToolbar === true
                                      && b.p.gridNames === false ? a(g).append(
                                      j) : a(g).append(i).append(j);
                                  a(g).append(j)
                                } else {
                                  e = document.createElement("tr");
                                  a(e).append(i).append(j);
                                  a(o).append(e)
                                }
                              });
                      j = document.createElement("td");
                      if (b.p.enableSearch === true) {
                        n = "<input type='button' id='sButton' class='"
                            + b.p.buttonclass + "' value='" + b.p.searchButton
                            + "'/>";
                        a(j).append(n);
                        a("input#sButton", j).click(function() {
                          h();
                          return false
                        })
                      }
                      if (b.p.enableClear === true) {
                        n = "<input type='button' id='cButton' class='"
                            + b.p.buttonclass + "' value='" + b.p.clearButton
                            + "'/>";
                        a(j).append(n);
                        a("input#cButton", j).click(function() {
                          k();
                          return false
                        })
                      }
                      if (b.p.enableClear === true || b.p.enableSearch === true)
                        if (b.p.formtype == "horizontal")
                          a(g).append(j);
                        else {
                          e = document.createElement("tr");
                          a(e).append("<td>&#160;</td>").append(j);
                          a(o).append(e)
                        }
                    })();
                    a(this).append(c);
                    this.triggerSearch = h;
                    this.clearSearch = k
                  } else
                    alert("Could not get grid colModel")
                } else
                  alert("No target grid is set!")
              })
        },
        filterToolbar : function(f) {
          f = a.extend({
            autosearch : true,
            searchOnEnter : true,
            beforeSearch : null,
            afterSearch : null,
            beforeClear : null,
            afterClear : null,
            searchurl : "",
            stringResult : false,
            groupOp : "AND",
            defaultSearch : "bw"
          }, f || {});
          return this
              .each(function() {
                function d(h, k) {
                  var o = a(h);
                  o[0]
                      && jQuery.each(k, function() {
                        this.data !== undefined ? o.bind(this.type, this.data,
                            this.fn) : o.bind(this.type, this.fn)
                      })
                }
                var b = this, m = function() {
                  var h = {}, k = 0, o, c, g = {}, e;
                  a
                      .each(
                          b.p.colModel,
                          function() {
                            c = this.index || this.name;
                            switch (this.stype) {
                            case "select":
                              e = this.searchoptions && this.searchoptions.sopt ? this.searchoptions.sopt[0]
                                  : "eq";
                              if (o = a("select[name=" + c + "]", b.grid.hDiv)
                                  .val()) {
                                h[c] = o;
                                g[c] = e;
                                k++
                              } else
                                try {
                                  delete b.p.postData[c]
                                } catch (r) {
                                }
                              break;
                            case "text":
                              e = this.searchoptions && this.searchoptions.sopt ? this.searchoptions.sopt[0]
                                  : f.defaultSearch;
                              if (o = a("input[name=" + c + "]", b.grid.hDiv)
                                  .val()) {
                                h[c] = o;
                                g[c] = e;
                                k++
                              } else
                                try {
                                  delete b.p.postData[c]
                                } catch (s) {
                                }
                              break
                            }
                          });
                  var n = k > 0 ? true : false;
                  if (f.stringResult === true || b.p.datatype == "local") {
                    var i = '{"groupOp":"' + f.groupOp + '","rules":[', j = 0;
                    a.each(h, function(r, s) {
                      if (j > 0)
                        i += ",";
                      i += '{"field":"' + r + '",';
                      i += '"op":"' + g[r] + '",';
                      i += '"data":"' + s + '"}';
                      j++
                    });
                    i += "]}";
                    a.extend(b.p.postData, {
                      filters : i
                    })
                  } else
                    a.extend(b.p.postData, h);
                  var p;
                  if (b.p.searchurl) {
                    p = b.p.url;
                    a(b).jqGrid("setGridParam", {
                      url : b.p.searchurl
                    })
                  }
                  var l = false;
                  if (a.isFunction(f.beforeSearch))
                    l = f.beforeSearch.call(b);
                  l || a(b).jqGrid("setGridParam", {
                    search : n
                  }).trigger("reloadGrid", [ {
                    page : 1
                  } ]);
                  p && a(b).jqGrid("setGridParam", {
                    url : p
                  });
                  a.isFunction(f.afterSearch) && f.afterSearch()
                }, t = a("<tr class='ui-search-toolbar' role='rowheader'></tr>"), q;
                a
                    .each(
                        b.p.colModel,
                        function() {
                          var h = this, k, o, c, g;
                          o = a("<th role='columnheader' class='ui-state-default ui-th-column ui-th-"
                              + b.p.direction + "'></th>");
                          k = a("<div style='width:100%;position:relative;height:100%;padding-right:0.3em;'></div>");
                          this.hidden === true && a(o).css("display", "none");
                          this.search = this.search === false ? false : true;
                          if (typeof this.stype == "undefined")
                            this.stype = "text";
                          c = a.extend({}, this.searchoptions || {});
                          if (this.search)
                            switch (this.stype) {
                            case "select":
                              if (g = this.surl || c.dataUrl)
                                a.ajax(a.extend({
                                  url : g,
                                  dataType : "html",
                                  complete : function(p) {
                                    if (c.buildSelect !== undefined)
                                      (p = c.buildSelect(p)) && a(k).append(p);
                                    else
                                      a(k).append(p.responseText);
                                    c.defaultValue
                                        && a("select", k).val(c.defaultValue);
                                    a("select", k).attr({
                                      name : h.index || h.name,
                                      id : "gs_" + h.name
                                    });
                                    c.attr && a("select", k).attr(c.attr);
                                    a("select", k).css({
                                      width : "100%"
                                    });
                                    c.dataInit !== undefined
                                        && c.dataInit(a("select", k)[0]);
                                    c.dataEvents !== undefined
                                        && d(a("select", k)[0], c.dataEvents);
                                    f.autosearch === true
                                        && a("select", k).change(function() {
                                          m();
                                          return false
                                        });
                                    p = null
                                  }
                                }, a.jgrid.ajaxOptions, b.p.ajaxSelectOptions
                                    || {}));
                              else {
                                var e;
                                if (h.searchoptions && h.searchoptions.value)
                                  e = h.searchoptions.value;
                                else if (h.editoptions && h.editoptions.value)
                                  e = h.editoptions.value;
                                if (e) {
                                  g = document.createElement("select");
                                  g.style.width = "100%";
                                  a(g).attr({
                                    name : h.index || h.name,
                                    id : "gs_" + h.name
                                  });
                                  var n, i;
                                  if (typeof e === "string") {
                                    e = e.split(";");
                                    for ( var j = 0; j < e.length; j++) {
                                      n = e[j].split(":");
                                      i = document.createElement("option");
                                      i.value = n[0];
                                      i.innerHTML = n[1];
                                      g.appendChild(i)
                                    }
                                  } else if (typeof e === "object")
                                    for (n in e)
                                      if (e.hasOwnProperty(n)) {
                                        i = document.createElement("option");
                                        i.value = n;
                                        i.innerHTML = e[n];
                                        g.appendChild(i)
                                      }
                                  c.defaultValue && a(g).val(c.defaultValue);
                                  c.attr && a(g).attr(c.attr);
                                  c.dataInit !== undefined && c.dataInit(g);
                                  c.dataEvents !== undefined
                                      && d(g, c.dataEvents);
                                  a(k).append(g);
                                  f.autosearch === true
                                      && a(g).change(function() {
                                        m();
                                        return false
                                      })
                                }
                              }
                              break;
                            case "text":
                              g = c.defaultValue ? c.defaultValue : "";
                              a(k).append(
                                  "<input type='text' style='width:95%;padding:0px;' name='"
                                      + (h.index || h.name) + "' id='gs_"
                                      + h.name + "' value='" + g + "'/>");
                              c.attr && a("input", k).attr(c.attr);
                              c.dataInit !== undefined
                                  && c.dataInit(a("input", k)[0]);
                              c.dataEvents !== undefined
                                  && d(a("input", k)[0], c.dataEvents);
                              if (f.autosearch === true)
                                f.searchOnEnter ? a("input", k).keypress(
                                    function(p) {
                                      if ((p.charCode ? p.charCode
                                          : p.keyCode ? p.keyCode : 0) == 13) {
                                        m();
                                        return false
                                      }
                                      return this
                                    }) : a("input", k).keydown(function(p) {
                                  switch (p.which) {
                                  case 13:
                                    return false;
                                  case 9:
                                  case 16:
                                  case 37:
                                  case 38:
                                  case 39:
                                  case 40:
                                  case 27:
                                    break;
                                  default:
                                    q && clearTimeout(q);
                                    q = setTimeout(function() {
                                      m()
                                    }, 500)
                                  }
                                });
                              break
                            }
                          a(o).append(k);
                          a(t).append(o)
                        });
                a("table thead", b.grid.hDiv).append(t);
                this.triggerToolbar = m;
                this.clearToolbar = function(h) {
                  var k = {}, o, c = 0, g;
                  h = typeof h != "boolean" ? true : h;
                  a
                      .each(
                          b.p.colModel,
                          function() {
                            o = this.searchoptions
                                && this.searchoptions.defaultValue ? this.searchoptions.defaultValue
                                : "";
                            g = this.index || this.name;
                            switch (this.stype) {
                            case "select":
                              var l;
                              a("select[name=" + g + "] option", b.grid.hDiv)
                                  .each(function(u) {
                                    if (u === 0)
                                      this.selected = true;
                                    if (a(this).text() == o) {
                                      this.selected = true;
                                      l = a(this).val();
                                      return false
                                    }
                                  });
                              if (l) {
                                k[g] = l;
                                c++
                              } else
                                try {
                                  delete b.p.postData[g]
                                } catch (r) {
                                }
                              break;
                            case "text":
                              a("input[name=" + g + "]", b.grid.hDiv).val(o);
                              if (o) {
                                k[g] = o;
                                c++
                              } else
                                try {
                                  delete b.p.postData[g]
                                } catch (s) {
                                }
                              break
                            }
                          });
                  var e = c > 0 ? true : false;
                  if (f.stringResult === true || b.p.datatype == "local") {
                    var n = '{"groupOp":"' + f.groupOp + '","rules":[', i = 0;
                    a.each(k, function(l, r) {
                      if (i > 0)
                        n += ",";
                      n += '{"field":"' + l + '",';
                      n += '"op":"eq",';
                      n += '"data":"' + r + '"}';
                      i++
                    });
                    n += "]}";
                    a.extend(b.p.postData, {
                      filters : n
                    })
                  } else
                    a.extend(b.p.postData, k);
                  var j;
                  if (b.p.searchurl) {
                    j = b.p.url;
                    a(b).jqGrid("setGridParam", {
                      url : b.p.searchurl
                    })
                  }
                  var p = false;
                  if (a.isFunction(f.beforeClear))
                    p = f.beforeClear.call(b);
                  p || h && a(b).jqGrid("setGridParam", {
                    search : e
                  }).trigger("reloadGrid", [ {
                    page : 1
                  } ]);
                  j && a(b).jqGrid("setGridParam", {
                    url : j
                  });
                  a.isFunction(f.afterClear) && f.afterClear()
                };
                this.toggleToolbar = function() {
                  var h = a("tr.ui-search-toolbar", b.grid.hDiv);
                  h.css("display") == "none" ? h.show() : h.hide()
                }
              })
        }
      })
})(jQuery);
var showModal = function(a) {
  a.w.show()
}, closeModal = function(a) {
  a.w.hide().attr("aria-hidden", "true");
  a.o && a.o.remove()
}, hideModal = function(a, b) {
  b = jQuery.extend({
    jqm : true,
    gb : ""
  }, b || {});
  if (b.onClose) {
    var c = b.onClose(a);
    if (typeof c == "boolean" && !c)
      return
  }
  if (jQuery.fn.jqm && b.jqm === true)
    jQuery(a).attr("aria-hidden", "true").jqmHide();
  else {
    if (b.gb !== "")
      try {
        jQuery(".jqgrid-overlay:first", b.gb).hide()
      } catch (e) {
      }
    jQuery(a).hide().attr("aria-hidden", "true")
  }
};
function findPos(a) {
  var b = 0, c = 0;
  if (a.offsetParent) {
    do {
      b += a.offsetLeft;
      c += a.offsetTop
    } while (a = a.offsetParent)
  }
  return [ b, c ]
}
var createModal = function(a, b, c, e, f, g) {
  var d = document.createElement("div"), h;
  h = jQuery(c.gbox).attr("dir") == "rtl" ? true : false;
  d.className = "ui-widget ui-widget-content ui-corner-all ui-jqdialog";
  d.id = a.themodal;
  var i = document.createElement("div");
  i.className = "ui-jqdialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix";
  i.id = a.modalhead;
  jQuery(i).append("<span class='ui-jqdialog-title'>" + c.caption + "</span>");
  var j = jQuery(
      "<a href='javascript:void(0)' class='ui-jqdialog-titlebar-close ui-corner-all'></a>")
      .hover(function() {
        j.addClass("ui-state-hover")
      }, function() {
        j.removeClass("ui-state-hover")
      }).append("<span class='ui-icon ui-icon-closethick'></span>");
  jQuery(i).append(j);
  if (h) {
    d.dir = "rtl";
    jQuery(".ui-jqdialog-title", i).css("float", "right");
    jQuery(".ui-jqdialog-titlebar-close", i).css("left", "0.3em")
  } else {
    d.dir = "ltr";
    jQuery(".ui-jqdialog-title", i).css("float", "left");
    jQuery(".ui-jqdialog-titlebar-close", i).css("right", "0.3em")
  }
  var l = document.createElement("div");
  jQuery(l).addClass("ui-jqdialog-content ui-widget-content").attr("id",
      a.modalcontent);
  jQuery(l).append(b);
  d.appendChild(l);
  jQuery(d).prepend(i);
  g === true ? jQuery("body").append(d) : jQuery(d).insertBefore(e);
  if (typeof c.jqModal === "undefined")
    c.jqModal = true;
  b = {};
  if (jQuery.fn.jqm && c.jqModal === true) {
    if (c.left === 0 && c.top === 0) {
      e = [];
      e = findPos(f);
      c.left = e[0] + 4;
      c.top = e[1] + 4
    }
    b.top = c.top + "px";
    b.left = c.left
  } else if (c.left !== 0 || c.top !== 0) {
    b.left = c.left;
    b.top = c.top + "px"
  }
  jQuery("a.ui-jqdialog-titlebar-close", i)
      .click(
          function() {
            var n = jQuery("#" + a.themodal).data("onClose") || c.onClose, k = jQuery(
                "#" + a.themodal).data("gbox")
                || c.gbox;
            hideModal("#" + a.themodal, {
              gb : k,
              jqm : c.jqModal,
              onClose : n
            });
            return false
          });
  if (c.width === 0 || !c.width)
    c.width = 300;
  if (c.height === 0 || !c.height)
    c.height = 200;
  if (!c.zIndex)
    c.zIndex = 950;
  f = 0;
  if (h && b.left && !g) {
    f = jQuery(c.gbox).width() - (!isNaN(c.width) ? parseInt(c.width, 10) : 0)
        - 8;
    b.left = parseInt(b.left, 10) + parseInt(f, 10)
  }
  if (b.left)
    b.left += "px";
  jQuery(d).css(jQuery.extend({
    width : isNaN(c.width) ? "auto" : c.width + "px",
    height : isNaN(c.height) ? "auto" : c.height + "px",
    zIndex : c.zIndex,
    overflow : "hidden"
  }, b)).attr({
    tabIndex : "-1",
    role : "dialog",
    "aria-labelledby" : a.modalhead,
    "aria-hidden" : "true"
  });
  if (typeof c.drag == "undefined")
    c.drag = true;
  if (typeof c.resize == "undefined")
    c.resize = true;
  if (c.drag) {
    jQuery(i).css("cursor", "move");
    if (jQuery.fn.jqDrag)
      jQuery(d).jqDrag(i);
    else
      try {
        jQuery(d).draggable({
          handle : jQuery("#" + i.id)
        })
      } catch (q) {
      }
  }
  if (c.resize)
    if (jQuery.fn.jqResize) {
      jQuery(d)
          .append(
              "<div class='jqResize ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se ui-icon-grip-diagonal-se'></div>");
      jQuery("#" + a.themodal).jqResize(".jqResize",
          a.scrollelm ? "#" + a.scrollelm : false)
    } else
      try {
        jQuery(d).resizable({
          handles : "se, sw",
          alsoResize : a.scrollelm ? "#" + a.scrollelm : false
        })
      } catch (o) {
      }
  c.closeOnEscape === true && jQuery(d).keydown(function(n) {
    if (n.which == 27) {
      n = jQuery("#" + a.themodal).data("onClose") || c.onClose;
      hideModal(this, {
        gb : c.gbox,
        jqm : c.jqModal,
        onClose : n
      })
    }
  })
}, viewModal = function(a, b) {
  b = jQuery.extend({
    toTop : true,
    overlay : 10,
    modal : false,
    onShow : showModal,
    onHide : closeModal,
    gbox : "",
    jqm : true,
    jqM : true
  }, b || {});
  if (jQuery.fn.jqm && b.jqm === true)
    b.jqM ? jQuery(a).attr("aria-hidden", "false").jqm(b).jqmShow() : jQuery(a)
        .attr("aria-hidden", "false").jqmShow();
  else {
    if (b.gbox !== "") {
      jQuery(".jqgrid-overlay:first", b.gbox).show();
      jQuery(a).data("gbox", b.gbox)
    }
    jQuery(a).show().attr("aria-hidden", "false");
    try {
      jQuery(":input:visible", a)[0].focus()
    } catch (c) {
    }
  }
};
function info_dialog(a, b, c, e) {
  var f = {
    width : 290,
    height : "auto",
    dataheight : "auto",
    drag : true,
    resize : false,
    caption : "<b>" + a + "</b>",
    left : 250,
    top : 170,
    zIndex : 1E3,
    jqModal : true,
    modal : false,
    closeOnEscape : true,
    align : "center",
    buttonalign : "center",
    buttons : []
  };
  jQuery.extend(f, e || {});
  var g = f.jqModal;
  if (jQuery.fn.jqm && !g)
    g = false;
  a = "";
  if (f.buttons.length > 0)
    for (e = 0; e < f.buttons.length; e++) {
      if (typeof f.buttons[e].id == "undefined")
        f.buttons[e].id = "info_button_" + e;
      a += "<a href='javascript:void(0)' id='" + f.buttons[e].id
          + "' class='fm-button ui-state-default ui-corner-all'>"
          + f.buttons[e].text + "</a>"
    }
  e = isNaN(f.dataheight) ? f.dataheight : f.dataheight + "px";
  var d = "<div id='info_id'>";
  d += "<div id='infocnt' style='margin:0px;padding-bottom:1em;width:100%;overflow:auto;position:relative;height:"
      + e + ";" + ("text-align:" + f.align + ";") + "'>" + b + "</div>";
  d += c ? "<div class='ui-widget-content ui-helper-clearfix' style='text-align:"
      + f.buttonalign
      + ";padding-bottom:0.8em;padding-top:0.5em;background-image: none;border-width: 1px 0 0 0;'><a href='javascript:void(0)' id='closedialog' class='fm-button ui-state-default ui-corner-all'>"
      + c + "</a>" + a + "</div>"
      : a !== "" ? "<div class='ui-widget-content ui-helper-clearfix' style='text-align:"
          + f.buttonalign
          + ";padding-bottom:0.8em;padding-top:0.5em;background-image: none;border-width: 1px 0 0 0;'>"
          + a + "</div>"
          : "";
  d += "</div>";
  try {
    jQuery("#info_dialog").attr("aria-hidden") == "false"
        && hideModal("#info_dialog", {
          jqm : g
        });
    jQuery("#info_dialog").remove()
  } catch (h) {
  }
  createModal({
    themodal : "info_dialog",
    modalhead : "info_head",
    modalcontent : "info_content",
    scrollelm : "infocnt"
  }, d, f, "", "", true);
  a && jQuery.each(f.buttons, function(j) {
    jQuery("#" + this.id, "#info_id").bind("click", function() {
      f.buttons[j].onClick.call(jQuery("#info_dialog"));
      return false
    })
  });
  jQuery("#closedialog", "#info_id").click(function(j) {
    hideModal("#info_dialog", {
      jqm : g
    });
    return false
  });
  jQuery(".fm-button", "#info_dialog").hover(function() {
    jQuery(this).addClass("ui-state-hover")
  }, function() {
    jQuery(this).removeClass("ui-state-hover")
  });
  jQuery.isFunction(f.beforeOpen) && f.beforeOpen();
  viewModal("#info_dialog", {
    onHide : function(j) {
      j.w.hide().remove();
      j.o && j.o.remove()
    },
    modal : f.modal,
    jqm : g
  });
  jQuery.isFunction(f.afterOpen) && f.afterOpen();
  try {
    jQuery("#info_dialog").focus()
  } catch (i) {
  }
}
function createEl(a, b, c, e, f) {
  function g(k, m) {
    if (jQuery.isFunction(m.dataInit)) {
      k.id = m.id;
      m.dataInit(k);
      delete m.id;
      delete m.dataInit
    }
    if (m.dataEvents) {
      jQuery.each(m.dataEvents, function() {
        this.data !== undefined ? jQuery(k).bind(this.type, this.data, this.fn)
            : jQuery(k).bind(this.type, this.fn)
      });
      delete m.dataEvents
    }
    return m
  }
  var d = "";
  b.defaultValue && delete b.defaultValue;
  switch (a) {
  case "textarea":
    d = document.createElement("textarea");
    if (e)
      b.cols || jQuery(d).css({
        width : "98%"
      });
    else if (!b.cols)
      b.cols = 20;
    if (!b.rows)
      b.rows = 2;
    if (c == "&nbsp;" || c == "&#160;" || c.length == 1
        && c.charCodeAt(0) == 160)
      c = "";
    d.value = c;
    b = g(d, b);
    jQuery(d).attr(b).attr({
      role : "textbox",
      multiline : "true"
    });
    break;
  case "checkbox":
    d = document.createElement("input");
    d.type = "checkbox";
    if (b.value) {
      var h = b.value.split(":");
      if (c === h[0]) {
        d.checked = true;
        d.defaultChecked = true
      }
      d.value = h[0];
      jQuery(d).attr("offval", h[1]);
      try {
        delete b.value
      } catch (i) {
      }
    } else {
      h = c.toLowerCase();
      if (h.search(/(false|0|no|off|undefined)/i) < 0 && h !== "") {
        d.checked = true;
        d.defaultChecked = true;
        d.value = c
      } else
        d.value = "on";
      jQuery(d).attr("offval", "off")
    }
    b = g(d, b);
    jQuery(d).attr(b).attr("role", "checkbox");
    break;
  case "select":
    d = document.createElement("select");
    d.setAttribute("role", "select");
    var j, l = [];
    if (b.multiple === true) {
      j = true;
      d.multiple = "multiple";
      jQuery(d).attr("aria-multiselectable", "true")
    } else
      j = false;
    if (typeof b.dataUrl != "undefined")
      jQuery.ajax(jQuery.extend({
        url : b.dataUrl,
        type : "GET",
        dataType : "html",
        success : function(k, m) {
          try {
            delete b.dataUrl;
            delete b.value
          } catch (r) {
          }
          if (typeof b.buildSelect != "undefined") {
            k = b.buildSelect(k);
            k = jQuery(k).html();
            delete b.buildSelect
          } else
            k = jQuery(k).html();
          if (k) {
            jQuery(d).append(k);
            b = g(d, b);
            if (typeof b.size === "undefined")
              b.size = j ? 3 : 1;
            if (j) {
              l = c.split(",");
              l = jQuery.map(l, function(p) {
                return jQuery.trim(p)
              })
            } else
              l[0] = jQuery.trim(c);
            jQuery(d).attr(b);
            setTimeout(
                function() {
                  jQuery("option", d)
                      .each(
                          function(p) {
                            if (p === 0)
                              this.selected = "";
                            jQuery(this).attr("role", "option");
                            if (jQuery.inArray(
                                jQuery.trim(jQuery(this).text()), l) > -1
                                || jQuery.inArray(jQuery.trim(jQuery(this)
                                    .val()), l) > -1) {
                              this.selected = "selected";
                              if (!j)
                                return false
                            }
                          })
                }, 0)
          }
        }
      }, f || {}));
    else if (b.value) {
      if (j) {
        l = c.split(",");
        l = jQuery.map(l, function(k) {
          return jQuery.trim(k)
        });
        if (typeof b.size === "undefined")
          b.size = 3
      } else
        b.size = 1;
      if (typeof b.value === "function")
        b.value = b.value();
      if (typeof b.value === "string") {
        e = b.value.split(";");
        for (h = 0; h < e.length; h++) {
          f = e[h].split(":");
          if (f.length > 2)
            f[1] = jQuery.map(f, function(k, m) {
              if (m > 0)
                return k
            }).join(":");
          a = document.createElement("option");
          a.setAttribute("role", "option");
          a.value = f[0];
          a.innerHTML = f[1];
          if (!j
              && (jQuery.trim(f[0]) == jQuery.trim(c) || jQuery.trim(f[1]) == jQuery
                  .trim(c)))
            a.selected = "selected";
          if (j
              && (jQuery.inArray(jQuery.trim(f[1]), l) > -1 || jQuery.inArray(
                  jQuery.trim(f[0]), l) > -1))
            a.selected = "selected";
          d.appendChild(a)
        }
      } else if (typeof b.value === "object") {
        e = b.value;
        for (h in e)
          if (e.hasOwnProperty(h)) {
            a = document.createElement("option");
            a.setAttribute("role", "option");
            a.value = h;
            a.innerHTML = e[h];
            if (!j
                && (jQuery.trim(h) == jQuery.trim(c) || jQuery.trim(e[h]) == jQuery
                    .trim(c)))
              a.selected = "selected";
            if (j
                && (jQuery.inArray(jQuery.trim(e[h]), l) > -1 || jQuery
                    .inArray(jQuery.trim(h), l) > -1))
              a.selected = "selected";
            d.appendChild(a)
          }
      }
      b = g(d, b);
      try {
        delete b.value
      } catch (q) {
      }
      jQuery(d).attr(b)
    }
    break;
  case "text":
  case "password":
  case "button":
    h = a == "button" ? "button" : "textbox";
    d = document.createElement("input");
    d.type = a;
    d.value = c;
    b = g(d, b);
    if (a != "button")
      if (e)
        b.size || jQuery(d).css({
          width : "98%"
        });
      else if (!b.size)
        b.size = 20;
    jQuery(d).attr(b).attr("role", h);
    break;
  case "image":
  case "file":
    d = document.createElement("input");
    d.type = a;
    b = g(d, b);
    jQuery(d).attr(b);
    break;
  case "custom":
    d = document.createElement("span");
    try {
      if (jQuery.isFunction(b.custom_element)) {
        var o = b.custom_element.call(this, c, b);
        if (o) {
          o = jQuery(o).addClass("customelement").attr({
            id : b.id,
            name : b.name
          });
          jQuery(d).empty().append(o)
        } else
          throw "e2";
      } else
        throw "e1";
    } catch (n) {
      n == "e1"
          && info_dialog(jQuery.jgrid.errors.errcap,
              "function 'custom_element' " + jQuery.jgrid.edit.msg.nodefined,
              jQuery.jgrid.edit.bClose);
      n == "e2" ? info_dialog(jQuery.jgrid.errors.errcap,
          "function 'custom_element' " + jQuery.jgrid.edit.msg.novalue,
          jQuery.jgrid.edit.bClose) : info_dialog(jQuery.jgrid.errors.errcap,
          typeof n === "string" ? n : n.message, jQuery.jgrid.edit.bClose)
    }
    break
  }
  return d
}
function daysInFebruary(a) {
  return a % 4 === 0 && (a % 100 !== 0 || a % 400 === 0) ? 29 : 28
}
function DaysArray(a) {
  for ( var b = 1; b <= a; b++) {
    this[b] = 31;
    if (b == 4 || b == 6 || b == 9 || b == 11)
      this[b] = 30;
    if (b == 2)
      this[b] = 29
  }
  return this
}
function checkDate(a, b) {
  var c = {}, e;
  a = a.toLowerCase();
  e = a.indexOf("/") != -1 ? "/" : a.indexOf("-") != -1 ? "-"
      : a.indexOf(".") != -1 ? "." : "/";
  a = a.split(e);
  b = b.split(e);
  if (b.length != 3)
    return false;
  e = -1;
  for ( var f, g = -1, d = -1, h = 0; h < a.length; h++) {
    f = isNaN(b[h]) ? 0 : parseInt(b[h], 10);
    c[a[h]] = f;
    f = a[h];
    if (f.indexOf("y") != -1)
      e = h;
    if (f.indexOf("m") != -1)
      d = h;
    if (f.indexOf("d") != -1)
      g = h
  }
  f = a[e] == "y" || a[e] == "yyyy" ? 4 : a[e] == "yy" ? 2 : -1;
  h = DaysArray(12);
  var i;
  if (e === -1)
    return false;
  else {
    i = c[a[e]].toString();
    if (f == 2 && i.length == 1)
      f = 1;
    if (i.length != f || c[a[e]] === 0 && b[e] != "00")
      return false
  }
  if (d === -1)
    return false;
  else {
    i = c[a[d]].toString();
    if (i.length < 1 || c[a[d]] < 1 || c[a[d]] > 12)
      return false
  }
  if (g === -1)
    return false;
  else {
    i = c[a[g]].toString();
    if (i.length < 1 || c[a[g]] < 1 || c[a[g]] > 31 || c[a[d]] == 2
        && c[a[g]] > daysInFebruary(c[a[e]]) || c[a[g]] > h[c[a[d]]])
      return false
  }
  return true
}
function isEmpty(a) {
  return a.match(/^\s+$/) || a === "" ? true : false
}
function checkTime(a) {
  var b = /^(\d{1,2}):(\d{2})([ap]m)?$/;
  if (!isEmpty(a))
    if (a = a.match(b)) {
      if (a[3]) {
        if (a[1] < 1 || a[1] > 12)
          return false
      } else if (a[1] > 23)
        return false;
      if (a[2] > 59)
        return false
    } else
      return false;
  return true
}
function checkValues(a, b, c) {
  var e, f, g, d;
  if (typeof b == "string") {
    f = 0;
    for (d = c.p.colModel.length; f < d; f++)
      if (c.p.colModel[f].name == b) {
        e = c.p.colModel[f].editrules;
        b = f;
        try {
          g = c.p.colModel[f].formoptions.label
        } catch (h) {
        }
        break
      }
  } else if (b >= 0)
    e = c.p.colModel[b].editrules;
  if (e) {
    g || (g = c.p.colNames[b]);
    if (e.required === true)
      if (isEmpty(a))
        return [ false, g + ": " + jQuery.jgrid.edit.msg.required, "" ];
    f = e.required === false ? false : true;
    if (e.number === true)
      if (!(f === false && isEmpty(a)))
        if (isNaN(a))
          return [ false, g + ": " + jQuery.jgrid.edit.msg.number, "" ];
    if (typeof e.minValue != "undefined" && !isNaN(e.minValue))
      if (parseFloat(a) < parseFloat(e.minValue))
        return [ false,
            g + ": " + jQuery.jgrid.edit.msg.minValue + " " + e.minValue, "" ];
    if (typeof e.maxValue != "undefined" && !isNaN(e.maxValue))
      if (parseFloat(a) > parseFloat(e.maxValue))
        return [ false,
            g + ": " + jQuery.jgrid.edit.msg.maxValue + " " + e.maxValue, "" ];
    if (e.email === true)
      if (!(f === false && isEmpty(a))) {
        d = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
        if (!d.test(a))
          return [ false, g + ": " + jQuery.jgrid.edit.msg.email, "" ]
      }
    if (e.integer === true)
      if (!(f === false && isEmpty(a))) {
        if (isNaN(a))
          return [ false, g + ": " + jQuery.jgrid.edit.msg.integer, "" ];
        if (a % 1 !== 0 || a.indexOf(".") != -1)
          return [ false, g + ": " + jQuery.jgrid.edit.msg.integer, "" ]
      }
    if (e.date === true)
      if (!(f === false && isEmpty(a))) {
        b = c.p.colModel[b].formatoptions
            && c.p.colModel[b].formatoptions.newformat ? c.p.colModel[b].formatoptions.newformat
            : c.p.colModel[b].datefmt || "Y-m-d";
        if (!checkDate(b, a))
          return [ false, g + ": " + jQuery.jgrid.edit.msg.date + " - " + b, "" ]
      }
    if (e.time === true)
      if (!(f === false && isEmpty(a)))
        if (!checkTime(a))
          return [ false,
              g + ": " + jQuery.jgrid.edit.msg.date + " - hh:mm (am/pm)", "" ];
    if (e.url === true)
      if (!(f === false && isEmpty(a))) {
        d = /^(((https?)|(ftp)):\/\/([\-\w]+\.)+\w{2,3}(\/[%\-\w]+(\.\w{2,})?)*(([\w\-\.\?\\\/+@&#;`~=%!]*)(\.\w{2,})?)*\/?)/i;
        if (!d.test(a))
          return [ false, g + ": " + jQuery.jgrid.edit.msg.url, "" ]
      }
    if (e.custom === true)
      if (!(f === false && isEmpty(a)))
        if (jQuery.isFunction(e.custom_func)) {
          a = e.custom_func.call(c, a, g);
          return jQuery.isArray(a) ? a : [ false,
              jQuery.jgrid.edit.msg.customarray, "" ]
        } else
          return [ false, jQuery.jgrid.edit.msg.customfcheck, "" ]
  }
  return [ true, "", "" ]
};
(function(a) {
  var d = null;
  a.jgrid
      .extend({
        searchGrid : function(f) {
          f = a.extend({
            recreateFilter : false,
            drag : true,
            sField : "searchField",
            sValue : "searchString",
            sOper : "searchOper",
            sFilter : "filters",
            loadDefaults : true,
            beforeShowSearch : null,
            afterShowSearch : null,
            onInitializeSearch : null,
            closeAfterSearch : false,
            closeAfterReset : false,
            closeOnEscape : false,
            multipleSearch : false,
            cloneSearchRowOnAdd : true,
            sopt : null,
            stringResult : undefined,
            onClose : null,
            useDataProxy : false,
            overlay : true
          }, a.jgrid.search, f || {});
          return this
              .each(function() {
                function b(m, q) {
                  q = m.p.postData[q.sFilter];
                  if (typeof q == "string")
                    q = a.jgrid.parse(q);
                  if (q) {
                    q.groupOp && m.SearchFilter.setGroupOp(q.groupOp);
                    if (q.rules) {
                      var A, F = 0, K = q.rules.length;
                      for (A = false; F < K; F++) {
                        A = q.rules[F];
                        if (A.field !== undefined && A.op !== undefined
                            && A.data !== undefined)
                          (A = m.SearchFilter.setFilter({
                            sfref : m.SearchFilter.$.find(".sf:last"),
                            filter : a.extend({}, A)
                          })) && m.SearchFilter.add()
                      }
                    }
                  }
                }
                function o(m) {
                  if (f.onClose) {
                    var q = f.onClose(m);
                    if (typeof q == "boolean" && !q)
                      return
                  }
                  m.hide();
                  f.overlay === true
                      && a(".jqgrid-overlay:first", "#gbox_" + w.p.id).hide()
                }
                function C() {
                  var m = a(".ui-searchFilter").length;
                  if (m > 1) {
                    var q = a("#" + i).css("zIndex");
                    a("#" + i).css({
                      zIndex : parseInt(q, 10) + m
                    })
                  }
                  a("#" + i).show();
                  f.overlay === true
                      && a(".jqgrid-overlay:first", "#gbox_" + w.p.id).show();
                  try {
                    a(":input:visible", "#" + i)[0].focus()
                  } catch (A) {
                  }
                }
                function v(m) {
                  var q = m !== undefined, A = a("#" + w.p.id), F = {};
                  if (f.multipleSearch === false) {
                    F[f.sField] = m.rules[0].field;
                    F[f.sValue] = m.rules[0].data;
                    F[f.sOper] = m.rules[0].op
                  } else
                    F[f.sFilter] = m;
                  A[0].p.search = q;
                  a.extend(A[0].p.postData, F);
                  A.trigger("reloadGrid", [ {
                    page : 1
                  } ]);
                  f.closeAfterSearch && o(a("#" + i))
                }
                function B(m) {
                  m = m && m.hasOwnProperty("reload") ? m.reload : true;
                  var q = a("#" + w.p.id), A = {};
                  q[0].p.search = false;
                  if (f.multipleSearch === false)
                    A[f.sField] = A[f.sValue] = A[f.sOper] = "";
                  else
                    A[f.sFilter] = "";
                  a.extend(q[0].p.postData, A);
                  m && q.trigger("reloadGrid", [ {
                    page : 1
                  } ]);
                  f.closeAfterReset && o(a("#" + i))
                }
                var w = this;
                if (w.grid) {
                  var i = "fbox_" + w.p.id;
                  if (a.fn.searchFilter) {
                    f.recreateFilter === true && a("#" + i).remove();
                    if (a("#" + i).html() != null) {
                      a.isFunction(f.beforeShowSearch)
                          && f.beforeShowSearch(a("#" + i));
                      C();
                      a.isFunction(f.afterShowSearch)
                          && f.afterShowSearch(a("#" + i))
                    } else {
                      var n = [], E = a("#" + w.p.id).jqGrid("getGridParam",
                          "colNames"), g = a("#" + w.p.id).jqGrid(
                          "getGridParam", "colModel"), k = [ "eq", "ne", "lt",
                          "le", "gt", "ge", "bw", "bn", "in", "ni", "ew", "en",
                          "cn", "nc" ], h, j, l, s = [];
                      if (f.sopt !== null)
                        for (h = l = 0; h < f.sopt.length; h++) {
                          if ((j = a.inArray(f.sopt[h], k)) != -1) {
                            s[l] = {
                              op : f.sopt[h],
                              text : f.odata[j]
                            };
                            l++
                          }
                        }
                      else
                        for (h = 0; h < k.length; h++)
                          s[h] = {
                            op : k[h],
                            text : f.odata[h]
                          };
                      a.each(g, function(m, q) {
                        var A = typeof q.search === "undefined" ? true
                            : q.search, F = q.hidden === true;
                        m = a.extend({}, {
                          text : E[m],
                          itemval : q.index || q.name
                        }, this.searchoptions);
                        q = m.searchhidden === true;
                        if (typeof m.sopt !== "undefined") {
                          l = 0;
                          m.ops = [];
                          if (m.sopt.length > 0)
                            for (h = 0; h < m.sopt.length; h++)
                              if ((j = a.inArray(m.sopt[h], k)) != -1) {
                                m.ops[l] = {
                                  op : m.sopt[h],
                                  text : f.odata[j]
                                };
                                l++
                              }
                        }
                        if (typeof this.stype === "undefined")
                          this.stype = "text";
                        if (this.stype == "select")
                          if (m.dataUrl === undefined) {
                            var K;
                            if (m.value)
                              K = m.value;
                            else if (this.editoptions)
                              K = this.editoptions.value;
                            if (K) {
                              m.dataValues = [];
                              if (typeof K === "string") {
                                K = K.split(";");
                                var c;
                                for (h = 0; h < K.length; h++) {
                                  c = K[h].split(":");
                                  m.dataValues[h] = {
                                    value : c[0],
                                    text : c[1]
                                  }
                                }
                              } else if (typeof K === "object") {
                                h = 0;
                                for (c in K)
                                  if (K.hasOwnProperty(c)) {
                                    m.dataValues[h] = {
                                      value : c,
                                      text : K[c]
                                    };
                                    h++
                                  }
                              }
                            }
                          }
                        if (q && A || A && !F)
                          n.push(m)
                      });
                      if (n.length > 0) {
                        a(
                            "<div id='" + i
                                + "' role='dialog' tabindex='-1'></div>")
                            .insertBefore("#gview_" + w.p.id);
                        if (f.stringResult === undefined)
                          f.stringResult = f.multipleSearch;
                        w.SearchFilter = a("#" + i).searchFilter(
                            n,
                            {
                              groupOps : f.groupOps,
                              operators : s,
                              onClose : o,
                              resetText : f.Reset,
                              searchText : f.Find,
                              windowTitle : f.caption,
                              rulesText : f.rulesText,
                              matchText : f.matchText,
                              onSearch : v,
                              onReset : B,
                              stringResult : f.stringResult,
                              ajaxSelectOptions : a.extend({},
                                  a.jgrid.ajaxOptions, w.p.ajaxSelectOptions
                                      || {}),
                              clone : f.cloneSearchRowOnAdd
                            });
                        a(".ui-widget-overlay", "#" + i).remove();
                        w.p.direction == "rtl"
                            && a(".ui-closer", "#" + i).css("float", "left");
                        if (f.drag === true) {
                          a("#" + i + " table thead tr:first td:first").css(
                              "cursor", "move");
                          if (jQuery.fn.jqDrag)
                            a("#" + i).jqDrag(
                                a("#" + i + " table thead tr:first td:first"));
                          else
                            try {
                              a("#" + i).draggable(
                                  {
                                    handle : a("#" + i
                                        + " table thead tr:first td:first")
                                  })
                            } catch (Q) {
                            }
                        }
                        if (f.multipleSearch === false) {
                          a(
                              ".ui-del, .ui-add, .ui-del, .ui-add-last, .matchText, .rulesText",
                              "#" + i).hide();
                          a("select[name='groupOp']", "#" + i).hide()
                        }
                        f.multipleSearch === true && f.loadDefaults === true
                            && b(w, f);
                        a.isFunction(f.onInitializeSearch)
                            && f.onInitializeSearch(a("#" + i));
                        a.isFunction(f.beforeShowSearch)
                            && f.beforeShowSearch(a("#" + i));
                        C();
                        a.isFunction(f.afterShowSearch)
                            && f.afterShowSearch(a("#" + i));
                        f.closeOnEscape === true
                            && a("#" + i).keydown(function(m) {
                              m.which == 27 && o(a("#" + i))
                            })
                      }
                    }
                  }
                }
              })
        },
        editGridRow : function(f, b) {
          d = b = a.extend({
            top : 0,
            left : 0,
            width : 300,
            height : "auto",
            dataheight : "auto",
            modal : false,
            drag : true,
            resize : true,
            url : null,
            mtype : "POST",
            clearAfterAdd : true,
            closeAfterEdit : false,
            reloadAfterSubmit : true,
            onInitializeForm : null,
            beforeInitData : null,
            beforeShowForm : null,
            afterShowForm : null,
            beforeSubmit : null,
            afterSubmit : null,
            onclickSubmit : null,
            afterComplete : null,
            onclickPgButtons : null,
            afterclickPgButtons : null,
            editData : {},
            recreateForm : false,
            jqModal : true,
            closeOnEscape : false,
            addedrow : "first",
            topinfo : "",
            bottominfo : "",
            saveicon : [],
            closeicon : [],
            savekey : [ false, 13 ],
            navkeys : [ false, 38, 40 ],
            checkOnSubmit : false,
            checkOnUpdate : false,
            _savedData : {},
            processing : false,
            onClose : null,
            ajaxEditOptions : {},
            serializeEditData : null,
            viewPagerButtons : true
          }, a.jgrid.edit, b || {});
          return this
              .each(function() {
                function o() {
                  a(".FormElement", "#" + j)
                      .each(
                          function() {
                            var e = a(".customelement", this);
                            if (e.length) {
                              var r = a(e[0]).attr("name");
                              a
                                  .each(
                                      g.p.colModel,
                                      function() {
                                        if (this.name == r
                                            && this.editoptions
                                            && a
                                                .isFunction(this.editoptions.custom_value)) {
                                          try {
                                            c[r] = this.editoptions
                                                .custom_value(a("#" + r, "#"
                                                    + j), "get");
                                            if (c[r] === undefined)
                                              throw "e1";
                                          } catch (p) {
                                            p == "e1" ? info_dialog(
                                                jQuery.jgrid.errors.errcap,
                                                "function 'custom_value' "
                                                    + a.jgrid.edit.msg.novalue,
                                                jQuery.jgrid.edit.bClose)
                                                : info_dialog(
                                                    jQuery.jgrid.errors.errcap,
                                                    p.message,
                                                    jQuery.jgrid.edit.bClose)
                                          }
                                          return true
                                        }
                                      })
                            } else {
                              switch (a(this).get(0).type) {
                              case "checkbox":
                                if (a(this).attr("checked"))
                                  c[this.name] = a(this).val();
                                else {
                                  e = a(this).attr("offval");
                                  c[this.name] = e
                                }
                                break;
                              case "select-one":
                                c[this.name] = a("option:selected", this).val();
                                u[this.name] = a("option:selected", this)
                                    .text();
                                break;
                              case "select-multiple":
                                c[this.name] = a(this).val();
                                c[this.name] = c[this.name] ? c[this.name]
                                    .join(",") : "";
                                var t = [];
                                a("option:selected", this).each(function(p, I) {
                                  t[p] = a(I).text()
                                });
                                u[this.name] = t.join(",");
                                break;
                              case "password":
                              case "text":
                              case "textarea":
                              case "button":
                                c[this.name] = a(this).val();
                                break
                              }
                              if (g.p.autoencode)
                                c[this.name] = a.jgrid.htmlEncode(c[this.name])
                            }
                          });
                  return true
                }
                function C(e, r, t, p) {
                  for ( var I, z, x, J = 0, y, L, G, R = [], H = false, ca = "", S = 1; S <= p; S++)
                    ca += "<td class='CaptionTD ui-widget-content'>&#160;</td><td class='DataTD ui-widget-content' style='white-space:pre'>&#160;</td>";
                  if (e != "_empty")
                    H = a(r).jqGrid("getInd", e);
                  a(r.p.colModel)
                      .each(
                          function(T) {
                            I = this.name;
                            L = (z = this.editrules
                                && this.editrules.edithidden === true ? false
                                : this.hidden === true ? true : false) ? "style='display:none'"
                                : "";
                            if (I !== "cb" && I !== "subgrid"
                                && this.editable === true && I !== "rn") {
                              if (H === false)
                                y = "";
                              else if (I == r.p.ExpandColumn
                                  && r.p.treeGrid === true)
                                y = a("td:eq(" + T + ")", r.rows[H]).text();
                              else
                                try {
                                  y = a.unformat(a("td:eq(" + T + ")",
                                      r.rows[H]), {
                                    rowId : e,
                                    colModel : this
                                  }, T)
                                } catch (da) {
                                  y = a("td:eq(" + T + ")", r.rows[H]).html()
                                }
                              var W = a.extend({}, this.editoptions || {}, {
                                id : I,
                                name : I
                              }), X = a.extend({}, {
                                elmprefix : "",
                                elmsuffix : "",
                                rowabove : false,
                                rowcontent : ""
                              }, this.formoptions || {}), aa = parseInt(
                                  X.rowpos, 10)
                                  || J + 1, ea = parseInt((parseInt(X.colpos,
                                  10) || 1) * 2, 10);
                              if (e == "_empty" && W.defaultValue)
                                y = a.isFunction(W.defaultValue) ? W
                                    .defaultValue() : W.defaultValue;
                              if (!this.edittype)
                                this.edittype = "text";
                              if (g.p.autoencode)
                                y = a.jgrid.htmlDecode(y);
                              G = createEl(this.edittype, W, y, false, a
                                  .extend({}, a.jgrid.ajaxOptions,
                                      r.p.ajaxSelectOptions || {}));
                              if (y === "" && this.edittype == "checkbox")
                                y = a(G).attr("offval");
                              if (y === "" && this.edittype == "select")
                                y = a("option:eq(0)", G).text();
                              if (d.checkOnSubmit || d.checkOnUpdate)
                                d._savedData[I] = y;
                              a(G).addClass("FormElement");
                              x = a(t).find("tr[rowpos=" + aa + "]");
                              if (X.rowabove) {
                                W = a("<tr><td class='contentinfo' colspan='"
                                    + p * 2 + "'>" + X.rowcontent
                                    + "</td></tr>");
                                a(t).append(W);
                                W[0].rp = aa
                              }
                              if (x.length === 0) {
                                x = a("<tr " + L + " rowpos='" + aa + "'></tr>")
                                    .addClass("FormData").attr("id", "tr_" + I);
                                a(x).append(ca);
                                a(t).append(x);
                                x[0].rp = aa
                              }
                              a("td:eq(" + (ea - 2) + ")", x[0])
                                  .html(
                                      typeof X.label === "undefined" ? r.p.colNames[T]
                                          : X.label);
                              a("td:eq(" + (ea - 1) + ")", x[0]).append(
                                  X.elmprefix).append(G).append(X.elmsuffix);
                              R[J] = T;
                              J++
                            }
                          });
                  if (J > 0) {
                    S = a("<tr class='FormData' style='display:none'><td class='CaptionTD'></td><td colspan='"
                        + (p * 2 - 1)
                        + "' class='DataTD'><input class='FormElement' id='id_g' type='text' name='"
                        + r.p.id + "_id' value='" + e + "'/></td></tr>");
                    S[0].rp = J + 999;
                    a(t).append(S);
                    if (d.checkOnSubmit || d.checkOnUpdate)
                      d._savedData[r.p.id + "_id"] = e
                  }
                  return R
                }
                function v(e, r, t) {
                  var p, I = 0, z, x, J, y, L;
                  if (d.checkOnSubmit || d.checkOnUpdate) {
                    d._savedData = {};
                    d._savedData[r.p.id + "_id"] = e
                  }
                  var G = r.p.colModel;
                  if (e == "_empty") {
                    a(G).each(
                        function() {
                          p = this.name;
                          J = a.extend({}, this.editoptions || {});
                          x = a("#" + a.jgrid.jqID(p), "#" + t);
                          if (x[0] != null) {
                            y = "";
                            if (J.defaultValue) {
                              y = a.isFunction(J.defaultValue) ? J
                                  .defaultValue() : J.defaultValue;
                              if (x[0].type == "checkbox") {
                                L = y.toLowerCase();
                                if (L.search(/(false|0|no|off|undefined)/i) < 0
                                    && L !== "") {
                                  x[0].checked = true;
                                  x[0].defaultChecked = true;
                                  x[0].value = y
                                } else
                                  x.attr({
                                    checked : "",
                                    defaultChecked : ""
                                  })
                              } else
                                x.val(y)
                            } else if (x[0].type == "checkbox") {
                              x[0].checked = false;
                              x[0].defaultChecked = false;
                              y = a(x).attr("offval")
                            } else if (x[0].type
                                && x[0].type.substr(0, 6) == "select")
                              x[0].selectedIndex = 0;
                            else
                              x.val(y);
                            if (d.checkOnSubmit === true || d.checkOnUpdate)
                              d._savedData[p] = y
                          }
                        });
                    a("#id_g", "#" + t).val(e)
                  } else {
                    var R = a(r).jqGrid("getInd", e, true);
                    if (R) {
                      a("td", R)
                          .each(
                              function(H) {
                                p = G[H].name;
                                if (p !== "cb" && p !== "subgrid" && p !== "rn"
                                    && G[H].editable === true) {
                                  if (p == r.p.ExpandColumn
                                      && r.p.treeGrid === true)
                                    z = a(this).text();
                                  else
                                    try {
                                      z = a.unformat(a(this), {
                                        rowId : e,
                                        colModel : G[H]
                                      }, H)
                                    } catch (ca) {
                                      z = a(this).html()
                                    }
                                  if (g.p.autoencode)
                                    z = a.jgrid.htmlDecode(z);
                                  if (d.checkOnSubmit === true
                                      || d.checkOnUpdate)
                                    d._savedData[p] = z;
                                  p = a.jgrid.jqID(p);
                                  switch (G[H].edittype) {
                                  case "password":
                                  case "text":
                                  case "button":
                                  case "image":
                                    a("#" + p, "#" + t).val(z);
                                    break;
                                  case "textarea":
                                    if (z == "&nbsp;" || z == "&#160;"
                                        || z.length == 1
                                        && z.charCodeAt(0) == 160)
                                      z = "";
                                    a("#" + p, "#" + t).val(z);
                                    break;
                                  case "select":
                                    var S = z.split(",");
                                    S = a.map(S, function(da) {
                                      return a.trim(da)
                                    });
                                    a("#" + p + " option", "#" + t)
                                        .each(
                                            function() {
                                              this.selected = !G[H].editoptions.multiple
                                                  && (S[0] == a.trim(a(this)
                                                      .text()) || S[0] == a
                                                      .trim(a(this).val())) ? true
                                                  : G[H].editoptions.multiple ? a
                                                      .inArray(a.trim(a(this)
                                                          .text()), S) > -1
                                                      || a.inArray(a.trim(a(
                                                          this).val()), S) > -1 ? true
                                                      : false
                                                      : false
                                            });
                                    break;
                                  case "checkbox":
                                    z += "";
                                    if (G[H].editoptions
                                        && G[H].editoptions.value)
                                      if (G[H].editoptions.value.split(":")[0] == z) {
                                        a("#" + p, "#" + t).attr("checked",
                                            true);
                                        a("#" + p, "#" + t).attr(
                                            "defaultChecked", true)
                                      } else {
                                        a("#" + p, "#" + t).attr("checked",
                                            false);
                                        a("#" + p, "#" + t).attr(
                                            "defaultChecked", "")
                                      }
                                    else {
                                      z = z.toLowerCase();
                                      if (z
                                          .search(/(false|0|no|off|undefined)/i) < 0
                                          && z !== "") {
                                        a("#" + p, "#" + t).attr("checked",
                                            true);
                                        a("#" + p, "#" + t).attr(
                                            "defaultChecked", true)
                                      } else {
                                        a("#" + p, "#" + t).attr("checked",
                                            false);
                                        a("#" + p, "#" + t).attr(
                                            "defaultChecked", "")
                                      }
                                    }
                                    break;
                                  case "custom":
                                    try {
                                      if (G[H].editoptions
                                          && a
                                              .isFunction(G[H].editoptions.custom_value))
                                        G[H].editoptions.custom_value(a(
                                            "#" + p, "#" + t), "set", z);
                                      else
                                        throw "e1";
                                    } catch (T) {
                                      T == "e1" ? info_dialog(
                                          jQuery.jgrid.errors.errcap,
                                          "function 'custom_value' "
                                              + a.jgrid.edit.msg.nodefined,
                                          jQuery.jgrid.edit.bClose)
                                          : info_dialog(
                                              jQuery.jgrid.errors.errcap,
                                              T.message,
                                              jQuery.jgrid.edit.bClose)
                                    }
                                    break
                                  }
                                  I++
                                }
                              });
                      I > 0 && a("#id_g", "#" + j).val(e)
                    }
                  }
                }
                function B() {
                  var e = [ true, "", "" ], r = {}, t = g.p.prmNames, p, I;
                  if (a.isFunction(d.beforeCheckValues)) {
                    var z = d.beforeCheckValues(c, a("#" + h),
                        c[g.p.id + "_id"] == "_empty" ? t.addoper : t.editoper);
                    if (z && typeof z === "object")
                      c = z
                  }
                  for ( var x in c)
                    if (c.hasOwnProperty(x)) {
                      e = checkValues(c[x], x, g);
                      if (e[0] === false)
                        break
                    }
                  if (e[0]) {
                    if (a.isFunction(d.onclickSubmit))
                      r = d.onclickSubmit(d, c) || {};
                    if (a.isFunction(d.beforeSubmit))
                      e = d.beforeSubmit(c, a("#" + h))
                  }
                  if (e[0] && !d.processing) {
                    d.processing = true;
                    a("#sData", "#" + j + "_2").addClass("ui-state-active");
                    I = t.oper;
                    p = t.id;
                    c[I] = a.trim(c[g.p.id + "_id"]) == "_empty" ? t.addoper
                        : t.editoper;
                    if (c[I] != t.addoper)
                      c[p] = c[g.p.id + "_id"];
                    else if (c[p] === undefined)
                      c[p] = c[g.p.id + "_id"];
                    delete c[g.p.id + "_id"];
                    c = a.extend(c, d.editData, r);
                    r = a.extend(
                        {
                          url : d.url ? d.url : a(g).jqGrid("getGridParam",
                              "editurl"),
                          type : d.mtype,
                          data : a.isFunction(d.serializeEditData) ? d
                              .serializeEditData(c) : c,
                          complete : function(J, y) {
                            if (y != "success") {
                              e[0] = false;
                              e[1] = a.isFunction(d.errorTextFormat) ? d
                                  .errorTextFormat(J) : y + " Status: '"
                                  + J.statusText + "'. Error code: " + J.status
                            } else if (a.isFunction(d.afterSubmit))
                              e = d.afterSubmit(J, c);
                            if (e[0] === false) {
                              a("#FormError>td", "#" + j).html(e[1]);
                              a("#FormError", "#" + j).show()
                            } else {
                              a.each(g.p.colModel, function() {
                                if (u[this.name] && this.formatter
                                    && this.formatter == "select")
                                  try {
                                    delete u[this.name]
                                  } catch (R) {
                                  }
                              });
                              c = a.extend(c, u);
                              g.p.autoencode && a.each(c, function(R, H) {
                                c[R] = a.jgrid.htmlDecode(H)
                              });
                              d.reloadAfterSubmit = d.reloadAfterSubmit
                                  && g.p.datatype != "local";
                              if (c[I] == t.addoper) {
                                e[2]
                                    || (e[2] = parseInt(g.p.records, 10) + 1
                                        + "");
                                c[p] = e[2];
                                if (d.closeAfterAdd) {
                                  if (d.reloadAfterSubmit)
                                    a(g).trigger("reloadGrid");
                                  else {
                                    a(g).jqGrid("addRowData", e[2], c,
                                        b.addedrow);
                                    a(g).jqGrid("setSelection", e[2])
                                  }
                                  hideModal("#" + l.themodal, {
                                    gb : "#gbox_" + k,
                                    jqm : b.jqModal,
                                    onClose : d.onClose
                                  })
                                } else if (d.clearAfterAdd) {
                                  d.reloadAfterSubmit ? a(g).trigger(
                                      "reloadGrid") : a(g).jqGrid("addRowData",
                                      e[2], c, b.addedrow);
                                  v("_empty", g, h)
                                } else
                                  d.reloadAfterSubmit ? a(g).trigger(
                                      "reloadGrid") : a(g).jqGrid("addRowData",
                                      e[2], c, b.addedrow)
                              } else {
                                if (d.reloadAfterSubmit) {
                                  a(g).trigger("reloadGrid");
                                  d.closeAfterEdit || setTimeout(function() {
                                    a(g).jqGrid("setSelection", c[p])
                                  }, 1E3)
                                } else
                                  g.p.treeGrid === true ? a(g).jqGrid(
                                      "setTreeRow", c[p], c) : a(g).jqGrid(
                                      "setRowData", c[p], c);
                                d.closeAfterEdit
                                    && hideModal("#" + l.themodal, {
                                      gb : "#gbox_" + k,
                                      jqm : b.jqModal,
                                      onClose : d.onClose
                                    })
                              }
                              if (a.isFunction(d.afterComplete)) {
                                A = J;
                                setTimeout(function() {
                                  d.afterComplete(A, c, a("#" + h));
                                  A = null
                                }, 500)
                              }
                            }
                            d.processing = false;
                            if (d.checkOnSubmit || d.checkOnUpdate) {
                              a("#" + h).data("disabled", false);
                              if (d._savedData[g.p.id + "_id"] != "_empty")
                                for ( var L in d._savedData)
                                  if (c[L])
                                    d._savedData[L] = c[L]
                            }
                            a("#sData", "#" + j + "_2").removeClass(
                                "ui-state-active");
                            try {
                              a(":input:visible", "#" + h)[0].focus()
                            } catch (G) {
                            }
                          },
                          error : function(J, y, L) {
                            a("#FormError>td", "#" + j).html(y + " : " + L);
                            a("#FormError", "#" + j).show();
                            d.processing = false;
                            a("#" + h).data("disabled", false);
                            a("#sData", "#" + j + "_2").removeClass(
                                "ui-state-active")
                          }
                        }, a.jgrid.ajaxOptions, d.ajaxEditOptions);
                    if (!r.url && !d.useDataProxy)
                      if (a.isFunction(g.p.dataProxy))
                        d.useDataProxy = true;
                      else {
                        e[0] = false;
                        e[1] += " " + a.jgrid.errors.nourl
                      }
                    if (e[0])
                      d.useDataProxy ? g.p.dataProxy
                          .call(g, r, "set_" + g.p.id) : a.ajax(r)
                  }
                  if (e[0] === false) {
                    a("#FormError>td", "#" + j).html(e[1]);
                    a("#FormError", "#" + j).show()
                  }
                }
                function w(e, r) {
                  var t = false, p;
                  for (p in e)
                    if (e[p] != r[p]) {
                      t = true;
                      break
                    }
                  return t
                }
                function i() {
                  var e = true;
                  a("#FormError", "#" + j).hide();
                  if (d.checkOnUpdate) {
                    c = {};
                    u = {};
                    o();
                    M = a.extend({}, c, u);
                    if (U = w(M, d._savedData)) {
                      a("#" + h).data("disabled", true);
                      a(".confirm", "#" + l.themodal).show();
                      e = false
                    }
                  }
                  return e
                }
                function n(e, r) {
                  e === 0 ? a("#pData", "#" + j + "_2").addClass(
                      "ui-state-disabled") : a("#pData", "#" + j + "_2")
                      .removeClass("ui-state-disabled");
                  e == r ? a("#nData", "#" + j + "_2").addClass(
                      "ui-state-disabled") : a("#nData", "#" + j + "_2")
                      .removeClass("ui-state-disabled")
                }
                function E() {
                  var e = a(g).jqGrid("getDataIDs"), r = a("#id_g", "#" + j)
                      .val();
                  return [ a.inArray(r, e), e ]
                }
                var g = this;
                if (g.grid && f) {
                  var k = g.p.id, h = "FrmGrid_" + k, j = "TblGrid_" + k, l = {
                    themodal : "editmod" + k,
                    modalhead : "edithd" + k,
                    modalcontent : "editcnt" + k,
                    scrollelm : h
                  }, s = a.isFunction(d.beforeShowForm) ? d.beforeShowForm
                      : false, Q = a.isFunction(d.afterShowForm) ? d.afterShowForm
                      : false, m = a.isFunction(d.beforeInitData) ? d.beforeInitData
                      : false, q = a.isFunction(d.onInitializeForm) ? d.onInitializeForm
                      : false, A = null, F = 1, K = 0, c, u, M, U;
                  if (f == "new") {
                    f = "_empty";
                    b.caption = b.addCaption
                  } else
                    b.caption = b.editCaption;
                  b.recreateForm === true && a("#" + l.themodal).html() != null
                      && a("#" + l.themodal).remove();
                  var O = true;
                  if (b.checkOnUpdate && b.jqModal && !b.modal)
                    O = false;
                  if (a("#" + l.themodal).html() != null) {
                    a(".ui-jqdialog-title", "#" + l.modalhead).html(b.caption);
                    a("#FormError", "#" + j).hide();
                    if (d.topinfo) {
                      a(".topinfo", "#" + j + "_2").html(d.topinfo);
                      a(".tinfo", "#" + j + "_2").show()
                    } else
                      a(".tinfo", "#" + j + "_2").hide();
                    if (d.bottominfo) {
                      a(".bottominfo", "#" + j + "_2").html(d.bottominfo);
                      a(".binfo", "#" + j + "_2").show()
                    } else
                      a(".binfo", "#" + j + "_2").hide();
                    m && m(a("#" + h));
                    v(f, g, h);
                    f == "_empty" || !d.viewPagerButtons ? a("#pData, #nData",
                        "#" + j + "_2").hide() : a("#pData, #nData",
                        "#" + j + "_2").show();
                    if (d.processing === true) {
                      d.processing = false;
                      a("#sData", "#" + j + "_2")
                          .removeClass("ui-state-active")
                    }
                    if (a("#" + h).data("disabled") === true) {
                      a(".confirm", "#" + l.themodal).hide();
                      a("#" + h).data("disabled", false)
                    }
                    s && s(a("#" + h));
                    a("#" + l.themodal).data("onClose", d.onClose);
                    viewModal("#" + l.themodal, {
                      gbox : "#gbox_" + k,
                      jqm : b.jqModal,
                      jqM : false,
                      closeoverlay : O,
                      modal : b.modal
                    });
                    O || a(".jqmOverlay").click(function() {
                      if (!i())
                        return false;
                      hideModal("#" + l.themodal, {
                        gb : "#gbox_" + k,
                        jqm : b.jqModal,
                        onClose : d.onClose
                      });
                      return false
                    });
                    Q && Q(a("#" + h))
                  } else {
                    a(g.p.colModel).each(function() {
                      var e = this.formoptions;
                      F = Math.max(F, e ? e.colpos || 0 : 0);
                      K = Math.max(K, e ? e.rowpos || 0 : 0)
                    });
                    var P = isNaN(b.dataheight) ? b.dataheight : b.dataheight
                        + "px";
                    P = a(
                        "<form name='FormPost' id='"
                            + h
                            + "' class='FormGrid' onSubmit='return false;' style='width:100%;overflow:auto;position:relative;height:"
                            + P + ";'></form>").data("disabled", false);
                    var N = a("<table id='"
                        + j
                        + "' class='EditTable' cellspacing='0' cellpading='0' border='0'><tbody></tbody></table>");
                    a(P).append(N);
                    var D = a("<tr id='FormError' style='display:none'><td class='ui-state-error' colspan='"
                        + F * 2 + "'></td></tr>");
                    D[0].rp = 0;
                    a(N).append(D);
                    D = a("<tr style='display:none' class='tinfo'><td class='topinfo' colspan='"
                        + F * 2 + "'>" + d.topinfo + "</td></tr>");
                    D[0].rp = 0;
                    a(N).append(D);
                    m && m(a("#" + h));
                    D = (m = g.p.direction == "rtl" ? true : false) ? "nData"
                        : "pData";
                    var V = m ? "pData" : "nData";
                    C(f, g, N, F);
                    D = "<a href='javascript:void(0)' id='"
                        + D
                        + "' class='fm-button ui-state-default ui-corner-left'><span class='ui-icon ui-icon-triangle-1-w'></span></div>";
                    V = "<a href='javascript:void(0)' id='"
                        + V
                        + "' class='fm-button ui-state-default ui-corner-right'><span class='ui-icon ui-icon-triangle-1-e'></span></div>";
                    var Z = "<a href='javascript:void(0)' id='sData' class='fm-button ui-state-default ui-corner-all'>"
                        + b.bSubmit + "</a>", $ = "<a href='javascript:void(0)' id='cData' class='fm-button ui-state-default ui-corner-all'>"
                        + b.bCancel + "</a>";
                    D = "<table border='0' class='EditTable' id='"
                        + j
                        + "_2'><tbody><tr id='Act_Buttons'><td class='navButton ui-widget-content'>"
                        + (m ? V + D : D + V)
                        + "</td><td class='EditButton ui-widget-content'>" + Z
                        + $ + "</td></tr>";
                    D += "<tr style='display:none' class='binfo'><td class='bottominfo' colspan='2'>"
                        + d.bottominfo + "</td></tr>";
                    D += "</tbody></table>";
                    if (K > 0) {
                      var Y = [];
                      a.each(a(N)[0].rows, function(e, r) {
                        Y[e] = r
                      });
                      Y.sort(function(e, r) {
                        if (e.rp > r.rp)
                          return 1;
                        if (e.rp < r.rp)
                          return -1;
                        return 0
                      });
                      a.each(Y, function(e, r) {
                        a("tbody", N).append(r)
                      })
                    }
                    b.gbox = "#gbox_" + k;
                    var ba = false;
                    if (b.closeOnEscape === true) {
                      b.closeOnEscape = false;
                      ba = true
                    }
                    P = a("<span></span>").append(P).append(D);
                    createModal(l, P, b, "#gview_" + g.p.id, a("#gbox_"
                        + g.p.id)[0]);
                    if (m) {
                      a("#pData, #nData", "#" + j + "_2").css("float", "right");
                      a(".EditButton", "#" + j + "_2")
                          .css("text-align", "left")
                    }
                    d.topinfo && a(".tinfo", "#" + j + "_2").show();
                    d.bottominfo && a(".binfo", "#" + j + "_2").show();
                    D = P = null;
                    a("#" + l.themodal).keydown(function(e) {
                      var r = e.target;
                      if (a("#" + h).data("disabled") === true)
                        return false;
                      if (d.savekey[0] === true && e.which == d.savekey[1])
                        if (r.tagName != "TEXTAREA") {
                          a("#sData", "#" + j + "_2").trigger("click");
                          return false
                        }
                      if (e.which === 27) {
                        if (!i())
                          return false;
                        ba && hideModal(this, {
                          gb : b.gbox,
                          jqm : b.jqModal,
                          onClose : d.onClose
                        });
                        return false
                      }
                      if (d.navkeys[0] === true) {
                        if (a("#id_g", "#" + j).val() == "_empty")
                          return true;
                        if (e.which == d.navkeys[1]) {
                          a("#pData", "#" + j + "_2").trigger("click");
                          return false
                        }
                        if (e.which == d.navkeys[2]) {
                          a("#nData", "#" + j + "_2").trigger("click");
                          return false
                        }
                      }
                    });
                    if (b.checkOnUpdate) {
                      a("a.ui-jqdialog-titlebar-close span", "#" + l.themodal)
                          .removeClass("jqmClose");
                      a("a.ui-jqdialog-titlebar-close", "#" + l.themodal)
                          .unbind("click").click(function() {
                            if (!i())
                              return false;
                            hideModal("#" + l.themodal, {
                              gb : "#gbox_" + k,
                              jqm : b.jqModal,
                              onClose : d.onClose
                            });
                            return false
                          })
                    }
                    b.saveicon = a.extend([ true, "left", "ui-icon-disk" ],
                        b.saveicon);
                    b.closeicon = a.extend([ true, "left", "ui-icon-close" ],
                        b.closeicon);
                    if (b.saveicon[0] === true)
                      a("#sData", "#" + j + "_2").addClass(
                          b.saveicon[1] == "right" ? "fm-button-icon-right"
                              : "fm-button-icon-left")
                          .append(
                              "<span class='ui-icon " + b.saveicon[2]
                                  + "'></span>");
                    if (b.closeicon[0] === true)
                      a("#cData", "#" + j + "_2").addClass(
                          b.closeicon[1] == "right" ? "fm-button-icon-right"
                              : "fm-button-icon-left").append(
                          "<span class='ui-icon " + b.closeicon[2]
                              + "'></span>");
                    if (d.checkOnSubmit || d.checkOnUpdate) {
                      Z = "<a href='javascript:void(0)' id='sNew' class='fm-button ui-state-default ui-corner-all' style='z-index:1002'>"
                          + b.bYes + "</a>";
                      V = "<a href='javascript:void(0)' id='nNew' class='fm-button ui-state-default ui-corner-all' style='z-index:1002'>"
                          + b.bNo + "</a>";
                      $ = "<a href='javascript:void(0)' id='cNew' class='fm-button ui-state-default ui-corner-all' style='z-index:1002'>"
                          + b.bExit + "</a>";
                      P = b.zIndex || 999;
                      P++;
                      a(
                          "<div class='ui-widget-overlay jqgrid-overlay confirm' style='z-index:"
                              + P
                              + ";display:none;'>&#160;"
                              + (a.browser.msie && a.browser.version == 6 ? '<iframe style="display:block;position:absolute;z-index:-1;filter:Alpha(Opacity=\'0\');" src="javascript:false;"></iframe>'
                                  : "")
                              + "</div><div class='confirm ui-widget-content ui-jqconfirm' style='z-index:"
                              + (P + 1) + "'>" + b.saveData + "<br/><br/>" + Z
                              + V + $ + "</div>").insertAfter("#" + h);
                      a("#sNew", "#" + l.themodal).click(function() {
                        B();
                        a("#" + h).data("disabled", false);
                        a(".confirm", "#" + l.themodal).hide();
                        return false
                      });
                      a("#nNew", "#" + l.themodal).click(function() {
                        a(".confirm", "#" + l.themodal).hide();
                        a("#" + h).data("disabled", false);
                        setTimeout(function() {
                          a(":input", "#" + h)[0].focus()
                        }, 0);
                        return false
                      });
                      a("#cNew", "#" + l.themodal).click(function() {
                        a(".confirm", "#" + l.themodal).hide();
                        a("#" + h).data("disabled", false);
                        hideModal("#" + l.themodal, {
                          gb : "#gbox_" + k,
                          jqm : b.jqModal,
                          onClose : d.onClose
                        });
                        return false
                      })
                    }
                    q && q(a("#" + h));
                    f == "_empty" || !d.viewPagerButtons ? a("#pData,#nData",
                        "#" + j + "_2").hide() : a("#pData,#nData",
                        "#" + j + "_2").show();
                    s && s(a("#" + h));
                    a("#" + l.themodal).data("onClose", d.onClose);
                    viewModal("#" + l.themodal, {
                      gbox : "#gbox_" + k,
                      jqm : b.jqModal,
                      closeoverlay : O,
                      modal : b.modal
                    });
                    O || a(".jqmOverlay").click(function() {
                      if (!i())
                        return false;
                      hideModal("#" + l.themodal, {
                        gb : "#gbox_" + k,
                        jqm : b.jqModal,
                        onClose : d.onClose
                      });
                      return false
                    });
                    Q && Q(a("#" + h));
                    a(".fm-button", "#" + l.themodal).hover(function() {
                      a(this).addClass("ui-state-hover")
                    }, function() {
                      a(this).removeClass("ui-state-hover")
                    });
                    a("#sData", "#" + j + "_2").click(function() {
                      c = {};
                      u = {};
                      a("#FormError", "#" + j).hide();
                      o();
                      if (c[g.p.id + "_id"] == "_empty")
                        B();
                      else if (b.checkOnSubmit === true) {
                        M = a.extend({}, c, u);
                        if (U = w(M, d._savedData)) {
                          a("#" + h).data("disabled", true);
                          a(".confirm", "#" + l.themodal).show()
                        } else
                          B()
                      } else
                        B();
                      return false
                    });
                    a("#cData", "#" + j + "_2").click(function() {
                      if (!i())
                        return false;
                      hideModal("#" + l.themodal, {
                        gb : "#gbox_" + k,
                        jqm : b.jqModal,
                        onClose : d.onClose
                      });
                      return false
                    });
                    a("#nData", "#" + j + "_2").click(
                        function() {
                          if (!i())
                            return false;
                          a("#FormError", "#" + j).hide();
                          var e = E();
                          e[0] = parseInt(e[0], 10);
                          if (e[0] != -1 && e[1][e[0] + 1]) {
                            a.isFunction(b.onclickPgButtons)
                                && b.onclickPgButtons("next", a("#" + h),
                                    e[1][e[0]]);
                            v(e[1][e[0] + 1], g, h);
                            a(g).jqGrid("setSelection", e[1][e[0] + 1]);
                            a.isFunction(b.afterclickPgButtons)
                                && b.afterclickPgButtons("next", a("#" + h),
                                    e[1][e[0] + 1]);
                            n(e[0] + 1, e[1].length - 1)
                          }
                          return false
                        });
                    a("#pData", "#" + j + "_2").click(
                        function() {
                          if (!i())
                            return false;
                          a("#FormError", "#" + j).hide();
                          var e = E();
                          if (e[0] != -1 && e[1][e[0] - 1]) {
                            a.isFunction(b.onclickPgButtons)
                                && b.onclickPgButtons("prev", a("#" + h),
                                    e[1][e[0]]);
                            v(e[1][e[0] - 1], g, h);
                            a(g).jqGrid("setSelection", e[1][e[0] - 1]);
                            a.isFunction(b.afterclickPgButtons)
                                && b.afterclickPgButtons("prev", a("#" + h),
                                    e[1][e[0] - 1]);
                            n(e[0] - 1, e[1].length - 1)
                          }
                          return false
                        })
                  }
                  s = E();
                  n(s[0], s[1].length - 1)
                }
              })
        },
        viewGridRow : function(f, b) {
          b = a.extend({
            top : 0,
            left : 0,
            width : 0,
            height : "auto",
            dataheight : "auto",
            modal : false,
            drag : true,
            resize : true,
            jqModal : true,
            closeOnEscape : false,
            labelswidth : "30%",
            closeicon : [],
            navkeys : [ false, 38, 40 ],
            onClose : null,
            beforeShowForm : null,
            viewPagerButtons : true
          }, a.jgrid.view, b || {});
          return this
              .each(function() {
                function o() {
                  if (b.closeOnEscape === true || b.navkeys[0] === true)
                    setTimeout(function() {
                      a(".ui-jqdialog-titlebar-close", "#" + k.modalhead)
                          .focus()
                    }, 0)
                }
                function C(c, u, M, U) {
                  for ( var O, P, N, D = 0, V, Z, $ = [], Y = false, ba = "<td class='CaptionTD form-view-label ui-widget-content' width='"
                      + b.labelswidth
                      + "'>&#160;</td><td class='DataTD form-view-data ui-helper-reset ui-widget-content'>&#160;</td>", e = "", r = [
                      "integer", "number", "currency" ], t = 0, p = 0, I, z, x, J = 1; J <= U; J++)
                    e += J == 1 ? ba
                        : "<td class='CaptionTD form-view-label ui-widget-content'>&#160;</td><td class='DataTD form-view-data ui-widget-content'>&#160;</td>";
                  a(u.p.colModel).each(
                      function() {
                        P = this.editrules
                            && this.editrules.edithidden === true ? false
                            : this.hidden === true ? true : false;
                        if (!P && this.align === "right")
                          if (this.formatter
                              && a.inArray(this.formatter, r) !== -1)
                            t = Math.max(t, parseInt(this.width, 10));
                          else
                            p = Math.max(p, parseInt(this.width, 10))
                      });
                  I = t !== 0 ? t : p !== 0 ? p : 0;
                  Y = a(u).jqGrid("getInd", c);
                  a(u.p.colModel)
                      .each(
                          function(y) {
                            O = this.name;
                            z = false;
                            Z = (P = this.editrules
                                && this.editrules.edithidden === true ? false
                                : this.hidden === true ? true : false) ? "style='display:none'"
                                : "";
                            x = typeof this.viewable != "boolean" ? true
                                : this.viewable;
                            if (O !== "cb" && O !== "subgrid" && O !== "rn"
                                && x) {
                              V = Y === false ? "" : O == u.p.ExpandColumn
                                  && u.p.treeGrid === true ? a(
                                  "td:eq(" + y + ")", u.rows[Y]).text() : a(
                                  "td:eq(" + y + ")", u.rows[Y]).html();
                              z = this.align === "right" && I !== 0 ? true
                                  : false;
                              a.extend({}, this.editoptions || {}, {
                                id : O,
                                name : O
                              });
                              var L = a.extend({}, {
                                rowabove : false,
                                rowcontent : ""
                              }, this.formoptions || {}), G = parseInt(
                                  L.rowpos, 10)
                                  || D + 1, R = parseInt(
                                  (parseInt(L.colpos, 10) || 1) * 2, 10);
                              if (L.rowabove) {
                                var H = a("<tr><td class='contentinfo' colspan='"
                                    + U
                                    * 2
                                    + "'>"
                                    + L.rowcontent
                                    + "</td></tr>");
                                a(M).append(H);
                                H[0].rp = G
                              }
                              N = a(M).find("tr[rowpos=" + G + "]");
                              if (N.length === 0) {
                                N = a("<tr " + Z + " rowpos='" + G + "'></tr>")
                                    .addClass("FormData")
                                    .attr("id", "trv_" + O);
                                a(N).append(e);
                                a(M).append(N);
                                N[0].rp = G
                              }
                              a("td:eq(" + (R - 2) + ")", N[0])
                                  .html(
                                      "<b>"
                                          + (typeof L.label === "undefined" ? u.p.colNames[y]
                                              : L.label) + "</b>");
                              a("td:eq(" + (R - 1) + ")", N[0]).append(
                                  "<span>" + V + "</span>")
                                  .attr("id", "v_" + O);
                              z && a("td:eq(" + (R - 1) + ") span", N[0]).css({
                                "text-align" : "right",
                                width : I + "px"
                              });
                              $[D] = y;
                              D++
                            }
                          });
                  if (D > 0) {
                    c = a("<tr class='FormData' style='display:none'><td class='CaptionTD'></td><td colspan='"
                        + (U * 2 - 1)
                        + "' class='DataTD'><input class='FormElement' id='id_g' type='text' name='id' value='"
                        + c + "'/></td></tr>");
                    c[0].rp = D + 99;
                    a(M).append(c)
                  }
                  return $
                }
                function v(c, u) {
                  var M, U, O = 0, P, N;
                  if (N = a(u).jqGrid("getInd", c, true)) {
                    a("td", N)
                        .each(
                            function(D) {
                              M = u.p.colModel[D].name;
                              U = u.p.colModel[D].editrules
                                  && u.p.colModel[D].editrules.edithidden === true ? false
                                  : u.p.colModel[D].hidden === true ? true
                                      : false;
                              if (M !== "cb" && M !== "subgrid" && M !== "rn") {
                                P = M == u.p.ExpandColumn
                                    && u.p.treeGrid === true ? a(this).text()
                                    : a(this).html();
                                a.extend({}, u.p.colModel[D].editoptions || {});
                                M = a.jgrid.jqID("v_" + M);
                                a("#" + M + " span", "#" + g).html(P);
                                U
                                    && a("#" + M, "#" + g).parents("tr:first")
                                        .hide();
                                O++
                              }
                            });
                    O > 0 && a("#id_g", "#" + g).val(c)
                  }
                }
                function B(c, u) {
                  c === 0 ? a("#pData", "#" + g + "_2").addClass(
                      "ui-state-disabled") : a("#pData", "#" + g + "_2")
                      .removeClass("ui-state-disabled");
                  c == u ? a("#nData", "#" + g + "_2").addClass(
                      "ui-state-disabled") : a("#nData", "#" + g + "_2")
                      .removeClass("ui-state-disabled")
                }
                function w() {
                  var c = a(i).jqGrid("getDataIDs"), u = a("#id_g", "#" + g)
                      .val();
                  return [ a.inArray(u, c), c ]
                }
                var i = this;
                if (i.grid && f) {
                  if (!b.imgpath)
                    b.imgpath = i.p.imgpath;
                  var n = i.p.id, E = "ViewGrid_" + n, g = "ViewTbl_" + n, k = {
                    themodal : "viewmod" + n,
                    modalhead : "viewhd" + n,
                    modalcontent : "viewcnt" + n,
                    scrollelm : E
                  }, h = 1, j = 0;
                  if (a("#" + k.themodal).html() != null) {
                    a(".ui-jqdialog-title", "#" + k.modalhead).html(b.caption);
                    a("#FormError", "#" + g).hide();
                    v(f, i);
                    a.isFunction(b.beforeShowForm)
                        && b.beforeShowForm(a("#" + E));
                    viewModal("#" + k.themodal, {
                      gbox : "#gbox_" + n,
                      jqm : b.jqModal,
                      jqM : false,
                      modal : b.modal
                    });
                    o()
                  } else {
                    a(i.p.colModel).each(function() {
                      var c = this.formoptions;
                      h = Math.max(h, c ? c.colpos || 0 : 0);
                      j = Math.max(j, c ? c.rowpos || 0 : 0)
                    });
                    var l = isNaN(b.dataheight) ? b.dataheight : b.dataheight
                        + "px", s = a("<form name='FormPost' id='"
                        + E
                        + "' class='FormGrid' style='width:100%;overflow:auto;position:relative;height:"
                        + l + ";'></form>"), Q = a("<table id='"
                        + g
                        + "' class='EditTable' cellspacing='1' cellpading='2' border='0' style='table-layout:fixed'><tbody></tbody></table>");
                    a(s).append(Q);
                    C(f, i, Q, h);
                    l = i.p.direction == "rtl" ? true : false;
                    var m = "<a href='javascript:void(0)' id='"
                        + (l ? "nData" : "pData")
                        + "' class='fm-button ui-state-default ui-corner-left'><span class='ui-icon ui-icon-triangle-1-w'></span></a>", q = "<a href='javascript:void(0)' id='"
                        + (l ? "pData" : "nData")
                        + "' class='fm-button ui-state-default ui-corner-right'><span class='ui-icon ui-icon-triangle-1-e'></span></a>", A = "<a href='javascript:void(0)' id='cData' class='fm-button ui-state-default ui-corner-all'>"
                        + b.bClose + "</a>";
                    if (j > 0) {
                      var F = [];
                      a.each(a(Q)[0].rows, function(c, u) {
                        F[c] = u
                      });
                      F.sort(function(c, u) {
                        if (c.rp > u.rp)
                          return 1;
                        if (c.rp < u.rp)
                          return -1;
                        return 0
                      });
                      a.each(F, function(c, u) {
                        a("tbody", Q).append(u)
                      })
                    }
                    b.gbox = "#gbox_" + n;
                    var K = false;
                    if (b.closeOnEscape === true) {
                      b.closeOnEscape = false;
                      K = true
                    }
                    s = a("<span></span>")
                        .append(s)
                        .append(
                            "<table border='0' class='EditTable' id='"
                                + g
                                + "_2'><tbody><tr id='Act_Buttons'><td class='navButton ui-widget-content' width='"
                                + b.labelswidth
                                + "'>"
                                + (l ? q + m : m + q)
                                + "</td><td class='EditButton ui-widget-content'>"
                                + A + "</td></tr></tbody></table>");
                    createModal(k, s, b, "#gview_" + i.p.id, a("#gview_"
                        + i.p.id)[0]);
                    if (l) {
                      a("#pData, #nData", "#" + g + "_2").css("float", "right");
                      a(".EditButton", "#" + g + "_2")
                          .css("text-align", "left")
                    }
                    b.viewPagerButtons
                        || a("#pData, #nData", "#" + g + "_2").hide();
                    s = null;
                    a("#" + k.themodal).keydown(function(c) {
                      if (c.which === 27) {
                        K && hideModal(this, {
                          gb : b.gbox,
                          jqm : b.jqModal,
                          onClose : b.onClose
                        });
                        return false
                      }
                      if (b.navkeys[0] === true) {
                        if (c.which === b.navkeys[1]) {
                          a("#pData", "#" + g + "_2").trigger("click");
                          return false
                        }
                        if (c.which === b.navkeys[2]) {
                          a("#nData", "#" + g + "_2").trigger("click");
                          return false
                        }
                      }
                    });
                    b.closeicon = a.extend([ true, "left", "ui-icon-close" ],
                        b.closeicon);
                    if (b.closeicon[0] === true)
                      a("#cData", "#" + g + "_2").addClass(
                          b.closeicon[1] == "right" ? "fm-button-icon-right"
                              : "fm-button-icon-left").append(
                          "<span class='ui-icon " + b.closeicon[2]
                              + "'></span>");
                    a.isFunction(b.beforeShowForm)
                        && b.beforeShowForm(a("#" + E));
                    viewModal("#" + k.themodal, {
                      gbox : "#gbox_" + n,
                      jqm : b.jqModal,
                      modal : b.modal
                    });
                    a(".fm-button:not(.ui-state-disabled)", "#" + g + "_2")
                        .hover(function() {
                          a(this).addClass("ui-state-hover")
                        }, function() {
                          a(this).removeClass("ui-state-hover")
                        });
                    o();
                    a("#cData", "#" + g + "_2").click(function() {
                      hideModal("#" + k.themodal, {
                        gb : "#gbox_" + n,
                        jqm : b.jqModal,
                        onClose : b.onClose
                      });
                      return false
                    });
                    a("#nData", "#" + g + "_2").click(
                        function() {
                          a("#FormError", "#" + g).hide();
                          var c = w();
                          c[0] = parseInt(c[0], 10);
                          if (c[0] != -1 && c[1][c[0] + 1]) {
                            a.isFunction(b.onclickPgButtons)
                                && b.onclickPgButtons("next", a("#" + E),
                                    c[1][c[0]]);
                            v(c[1][c[0] + 1], i);
                            a(i).jqGrid("setSelection", c[1][c[0] + 1]);
                            a.isFunction(b.afterclickPgButtons)
                                && b.afterclickPgButtons("next", a("#" + E),
                                    c[1][c[0] + 1]);
                            B(c[0] + 1, c[1].length - 1)
                          }
                          o();
                          return false
                        });
                    a("#pData", "#" + g + "_2").click(
                        function() {
                          a("#FormError", "#" + g).hide();
                          var c = w();
                          if (c[0] != -1 && c[1][c[0] - 1]) {
                            a.isFunction(b.onclickPgButtons)
                                && b.onclickPgButtons("prev", a("#" + E),
                                    c[1][c[0]]);
                            v(c[1][c[0] - 1], i);
                            a(i).jqGrid("setSelection", c[1][c[0] - 1]);
                            a.isFunction(b.afterclickPgButtons)
                                && b.afterclickPgButtons("prev", a("#" + E),
                                    c[1][c[0] - 1]);
                            B(c[0] - 1, c[1].length - 1)
                          }
                          o();
                          return false
                        })
                  }
                  l = w();
                  B(l[0], l[1].length - 1)
                }
              })
        },
        delGridRow : function(f, b) {
          d = b = a.extend({
            top : 0,
            left : 0,
            width : 240,
            height : "auto",
            dataheight : "auto",
            modal : false,
            drag : true,
            resize : true,
            url : "",
            mtype : "POST",
            reloadAfterSubmit : true,
            beforeShowForm : null,
            afterShowForm : null,
            beforeSubmit : null,
            onclickSubmit : null,
            afterSubmit : null,
            jqModal : true,
            closeOnEscape : false,
            delData : {},
            delicon : [],
            cancelicon : [],
            onClose : null,
            ajaxDelOptions : {},
            processing : false,
            serializeDelData : null,
            useDataProxy : false
          }, a.jgrid.del, b || {});
          return this
              .each(function() {
                var o = this;
                if (o.grid)
                  if (f) {
                    var C = typeof b.beforeShowForm === "function" ? true
                        : false, v = typeof b.afterShowForm === "function" ? true
                        : false, B = o.p.id, w = {}, i = "DelTbl_" + B, n, E, g, k, h = {
                      themodal : "delmod" + B,
                      modalhead : "delhd" + B,
                      modalcontent : "delcnt" + B,
                      scrollelm : i
                    };
                    if (jQuery.isArray(f))
                      f = f.join();
                    if (a("#" + h.themodal).html() != null) {
                      a("#DelData>td", "#" + i).text(f);
                      a("#DelError", "#" + i).hide();
                      if (d.processing === true) {
                        d.processing = false;
                        a("#dData", "#" + i).removeClass("ui-state-active")
                      }
                      C && b.beforeShowForm(a("#" + i));
                      viewModal("#" + h.themodal, {
                        gbox : "#gbox_" + B,
                        jqm : b.jqModal,
                        jqM : false,
                        modal : b.modal
                      })
                    } else {
                      var j = isNaN(b.dataheight) ? b.dataheight : b.dataheight
                          + "px";
                      j = "<div id='"
                          + i
                          + "' class='formdata' style='width:100%;overflow:auto;position:relative;height:"
                          + j + ";'>";
                      j += "<table class='DelTable'><tbody>";
                      j += "<tr id='DelError' style='display:none'><td class='ui-state-error'></td></tr>";
                      j += "<tr id='DelData' style='display:none'><td >" + f
                          + "</td></tr>";
                      j += '<tr><td class="delmsg" style="white-space:pre;">'
                          + b.msg + "</td></tr><tr><td >&#160;</td></tr>";
                      j += "</tbody></table></div>";
                      j += "<table cellspacing='0' cellpadding='0' border='0' class='EditTable' id='"
                          + i
                          + "_2'><tbody><tr><td class='DataTD ui-widget-content'></td></tr><tr style='display:block;height:3px;'><td></td></tr><tr><td class='DelButton EditButton'>"
                          + ("<a href='javascript:void(0)' id='dData' class='fm-button ui-state-default ui-corner-all'>"
                              + b.bSubmit + "</a>")
                          + "&#160;"
                          + ("<a href='javascript:void(0)' id='eData' class='fm-button ui-state-default ui-corner-all'>"
                              + b.bCancel + "</a>")
                          + "</td></tr></tbody></table>";
                      b.gbox = "#gbox_" + B;
                      createModal(h, j, b, "#gview_" + o.p.id, a("#gview_"
                          + o.p.id)[0]);
                      a(".fm-button", "#" + i + "_2").hover(function() {
                        a(this).addClass("ui-state-hover")
                      }, function() {
                        a(this).removeClass("ui-state-hover")
                      });
                      b.delicon = a.extend(
                          [ true, "left", "ui-icon-scissors" ], b.delicon);
                      b.cancelicon = a.extend(
                          [ true, "left", "ui-icon-cancel" ], b.cancelicon);
                      if (b.delicon[0] === true)
                        a("#dData", "#" + i + "_2").addClass(
                            b.delicon[1] == "right" ? "fm-button-icon-right"
                                : "fm-button-icon-left").append(
                            "<span class='ui-icon " + b.delicon[2]
                                + "'></span>");
                      if (b.cancelicon[0] === true)
                        a("#eData", "#" + i + "_2").addClass(
                            b.cancelicon[1] == "right" ? "fm-button-icon-right"
                                : "fm-button-icon-left").append(
                            "<span class='ui-icon " + b.cancelicon[2]
                                + "'></span>");
                      a("#dData", "#" + i + "_2")
                          .click(
                              function() {
                                var l = [ true, "" ];
                                w = {};
                                var s = a("#DelData>td", "#" + i).text();
                                if (typeof b.onclickSubmit === "function")
                                  w = b.onclickSubmit(d, s) || {};
                                if (typeof b.beforeSubmit === "function")
                                  l = b.beforeSubmit(s);
                                if (l[0] && !d.processing) {
                                  d.processing = true;
                                  a(this).addClass("ui-state-active");
                                  g = o.p.prmNames;
                                  n = a.extend({}, d.delData, w);
                                  k = g.oper;
                                  n[k] = g.deloper;
                                  E = g.id;
                                  n[E] = s;
                                  var Q = a
                                      .extend(
                                          {
                                            url : d.url ? d.url : a(o).jqGrid(
                                                "getGridParam", "editurl"),
                                            type : b.mtype,
                                            data : a
                                                .isFunction(b.serializeDelData) ? b
                                                .serializeDelData(n)
                                                : n,
                                            complete : function(m, q) {
                                              if (q != "success") {
                                                l[0] = false;
                                                l[1] = a
                                                    .isFunction(d.errorTextFormat) ? d
                                                    .errorTextFormat(m)
                                                    : q + " Status: '"
                                                        + m.statusText
                                                        + "'. Error code: "
                                                        + m.status
                                              } else if (typeof d.afterSubmit === "function")
                                                l = d.afterSubmit(m, n);
                                              if (l[0] === false) {
                                                a("#DelError>td", "#" + i)
                                                    .html(l[1]);
                                                a("#DelError", "#" + i).show()
                                              } else {
                                                if (d.reloadAfterSubmit
                                                    && o.p.datatype != "local")
                                                  a(o).trigger("reloadGrid");
                                                else {
                                                  q = [];
                                                  q = s.split(",");
                                                  if (o.p.treeGrid === true)
                                                    try {
                                                      a(o).jqGrid(
                                                          "delTreeNode", q[0])
                                                    } catch (A) {
                                                    }
                                                  else
                                                    for ( var F = 0; F < q.length; F++)
                                                      a(o).jqGrid("delRowData",
                                                          q[F]);
                                                  o.p.selrow = null;
                                                  o.p.selarrrow = []
                                                }
                                                a.isFunction(d.afterComplete)
                                                    && setTimeout(function() {
                                                      d.afterComplete(m, s)
                                                    }, 500)
                                              }
                                              d.processing = false;
                                              a("#dData", "#" + i + "_2")
                                                  .removeClass(
                                                      "ui-state-active");
                                              l[0]
                                                  && hideModal(
                                                      "#" + h.themodal, {
                                                        gb : "#gbox_" + B,
                                                        jqm : b.jqModal,
                                                        onClose : d.onClose
                                                      })
                                            },
                                            error : function(m, q, A) {
                                              a("#DelError>td", "#" + i).html(
                                                  q + " : " + A);
                                              a("#DelError", "#" + i).show();
                                              d.processing = false;
                                              a("#dData", "#" + i + "_2")
                                                  .removeClass(
                                                      "ui-state-active")
                                            }
                                          }, a.jgrid.ajaxOptions,
                                          b.ajaxDelOptions);
                                  if (!Q.url && !d.useDataProxy)
                                    if (a.isFunction(o.p.dataProxy))
                                      d.useDataProxy = true;
                                    else {
                                      l[0] = false;
                                      l[1] += " " + a.jgrid.errors.nourl
                                    }
                                  if (l[0])
                                    d.useDataProxy ? o.p.dataProxy.call(o, Q,
                                        "del_" + o.p.id) : a.ajax(Q)
                                }
                                if (l[0] === false) {
                                  a("#DelError>td", "#" + i).html(l[1]);
                                  a("#DelError", "#" + i).show()
                                }
                                return false
                              });
                      a("#eData", "#" + i + "_2").click(function() {
                        hideModal("#" + h.themodal, {
                          gb : "#gbox_" + B,
                          jqm : b.jqModal,
                          onClose : d.onClose
                        });
                        return false
                      });
                      C && b.beforeShowForm(a("#" + i));
                      viewModal("#" + h.themodal, {
                        gbox : "#gbox_" + B,
                        jqm : b.jqModal,
                        modal : b.modal
                      })
                    }
                    v && b.afterShowForm(a("#" + i));
                    b.closeOnEscape === true
                        && setTimeout(function() {
                          a(".ui-jqdialog-titlebar-close", "#" + h.modalhead)
                              .focus()
                        }, 0)
                  }
              })
        },
        navGrid : function(f, b, o, C, v, B, w) {
          b = a.extend({
            edit : true,
            editicon : "ui-icon-pencil",
            add : true,
            addicon : "ui-icon-plus",
            del : true,
            delicon : "ui-icon-trash",
            search : true,
            searchicon : "ui-icon-search",
            refresh : true,
            refreshicon : "ui-icon-refresh",
            refreshstate : "firstpage",
            view : false,
            viewicon : "ui-icon-document",
            position : "left",
            closeOnEscape : true,
            beforeRefresh : null,
            afterRefresh : null,
            cloneToTop : false
          }, a.jgrid.nav, b || {});
          return this
              .each(function() {
                var i = {
                  themodal : "alertmod",
                  modalhead : "alerthd",
                  modalcontent : "alertcnt"
                }, n = this, E, g, k;
                if (!(!n.grid || typeof f != "string")) {
                  if (a("#" + i.themodal).html() === null) {
                    if (typeof window.innerWidth != "undefined") {
                      E = window.innerWidth;
                      g = window.innerHeight
                    } else if (typeof document.documentElement != "undefined"
                        && typeof document.documentElement.clientWidth != "undefined"
                        && document.documentElement.clientWidth !== 0) {
                      E = document.documentElement.clientWidth;
                      g = document.documentElement.clientHeight
                    } else {
                      E = 1024;
                      g = 768
                    }
                    createModal(
                        i,
                        "<div>"
                            + b.alerttext
                            + "</div><span tabindex='0'><span tabindex='-1' id='jqg_alrt'></span></span>",
                        {
                          gbox : "#gbox_" + n.p.id,
                          jqModal : true,
                          drag : true,
                          resize : true,
                          caption : b.alertcap,
                          top : g / 2 - 25,
                          left : E / 2 - 100,
                          width : 200,
                          height : "auto",
                          closeOnEscape : b.closeOnEscape
                        }, "", "", true)
                  }
                  E = 1;
                  if (b.cloneToTop && n.p.toppager)
                    E = 2;
                  for (g = 0; g < E; g++) {
                    var h = a("<table cellspacing='0' cellpadding='0' border='0' class='ui-pg-table navtable' style='float:left;table-layout:auto;'><tbody><tr></tr></tbody></table>"), j, l;
                    if (g === 0) {
                      j = f;
                      l = n.p.id;
                      if (j == n.p.toppager) {
                        l += "_top";
                        E = 1
                      }
                    } else {
                      j = n.p.toppager;
                      l = n.p.id + "_top"
                    }
                    n.p.direction == "rtl"
                        && a(h).attr("dir", "rtl").css("float", "right");
                    if (b.add) {
                      C = C || {};
                      k = a("<td class='ui-pg-button ui-corner-all'></td>");
                      a(k).append(
                          "<div class='ui-pg-div'><span class='ui-icon "
                              + b.addicon + "'></span>" + b.addtext + "</div>");
                      a("tr", h).append(k);
                      a(k, h).attr({
                        title : b.addtitle || "",
                        id : C.id || "add_" + l
                      }).click(
                          function() {
                            a(this).hasClass("ui-state-disabled")
                                || (typeof b.addfunc == "function" ? b
                                    .addfunc() : a(n).jqGrid("editGridRow",
                                    "new", C));
                            return false
                          }).hover(
                          function() {
                            a(this).hasClass("ui-state-disabled")
                                || a(this).addClass("ui-state-hover")
                          }, function() {
                            a(this).removeClass("ui-state-hover")
                          });
                      k = null
                    }
                    if (b.edit) {
                      k = a("<td class='ui-pg-button ui-corner-all'></td>");
                      o = o || {};
                      a(k).append(
                          "<div class='ui-pg-div'><span class='ui-icon "
                              + b.editicon + "'></span>" + b.edittext
                              + "</div>");
                      a("tr", h).append(k);
                      a(k, h).attr({
                        title : b.edittitle || "",
                        id : o.id || "edit_" + l
                      }).click(
                          function() {
                            if (!a(this).hasClass("ui-state-disabled")) {
                              var s = n.p.selrow;
                              if (s)
                                typeof b.editfunc == "function" ? b.editfunc(s)
                                    : a(n).jqGrid("editGridRow", s, o);
                              else {
                                viewModal("#" + i.themodal, {
                                  gbox : "#gbox_" + n.p.id,
                                  jqm : true
                                });
                                a("#jqg_alrt").focus()
                              }
                            }
                            return false
                          }).hover(
                          function() {
                            a(this).hasClass("ui-state-disabled")
                                || a(this).addClass("ui-state-hover")
                          }, function() {
                            a(this).removeClass("ui-state-hover")
                          });
                      k = null
                    }
                    if (b.view) {
                      k = a("<td class='ui-pg-button ui-corner-all'></td>");
                      w = w || {};
                      a(k).append(
                          "<div class='ui-pg-div'><span class='ui-icon "
                              + b.viewicon + "'></span>" + b.viewtext
                              + "</div>");
                      a("tr", h).append(k);
                      a(k, h).attr({
                        title : b.viewtitle || "",
                        id : w.id || "view_" + l
                      }).click(function() {
                        if (!a(this).hasClass("ui-state-disabled")) {
                          var s = n.p.selrow;
                          if (s)
                            a(n).jqGrid("viewGridRow", s, w);
                          else {
                            viewModal("#" + i.themodal, {
                              gbox : "#gbox_" + n.p.id,
                              jqm : true
                            });
                            a("#jqg_alrt").focus()
                          }
                        }
                        return false
                      }).hover(
                          function() {
                            a(this).hasClass("ui-state-disabled")
                                || a(this).addClass("ui-state-hover")
                          }, function() {
                            a(this).removeClass("ui-state-hover")
                          });
                      k = null
                    }
                    if (b.del) {
                      k = a("<td class='ui-pg-button ui-corner-all'></td>");
                      v = v || {};
                      a(k).append(
                          "<div class='ui-pg-div'><span class='ui-icon "
                              + b.delicon + "'></span>" + b.deltext + "</div>");
                      a("tr", h).append(k);
                      a(k, h).attr({
                        title : b.deltitle || "",
                        id : v.id || "del_" + l
                      }).click(
                          function() {
                            if (!a(this).hasClass("ui-state-disabled")) {
                              var s;
                              if (n.p.multiselect) {
                                s = n.p.selarrrow;
                                if (s.length === 0)
                                  s = null
                              } else
                                s = n.p.selrow;
                              if (s)
                                "function" == typeof b.delfunc ? b.delfunc(s)
                                    : a(n).jqGrid("delGridRow", s, v);
                              else {
                                viewModal("#" + i.themodal, {
                                  gbox : "#gbox_" + n.p.id,
                                  jqm : true
                                });
                                a("#jqg_alrt").focus()
                              }
                            }
                            return false
                          }).hover(
                          function() {
                            a(this).hasClass("ui-state-disabled")
                                || a(this).addClass("ui-state-hover")
                          }, function() {
                            a(this).removeClass("ui-state-hover")
                          });
                      k = null
                    }
                    if (b.add || b.edit || b.del || b.view)
                      a("tr", h)
                          .append(
                              "<td class='ui-pg-button ui-state-disabled' style='width:4px;'><span class='ui-separator'></span></td>");
                    if (b.search) {
                      k = a("<td class='ui-pg-button ui-corner-all'></td>");
                      B = B || {};
                      a(k).append(
                          "<div class='ui-pg-div'><span class='ui-icon "
                              + b.searchicon + "'></span>" + b.searchtext
                              + "</div>");
                      a("tr", h).append(k);
                      a(k, h).attr({
                        title : b.searchtitle || "",
                        id : B.id || "search_" + l
                      }).click(
                          function() {
                            a(this).hasClass("ui-state-disabled")
                                || a(n).jqGrid("searchGrid", B);
                            return false
                          }).hover(
                          function() {
                            a(this).hasClass("ui-state-disabled")
                                || a(this).addClass("ui-state-hover")
                          }, function() {
                            a(this).removeClass("ui-state-hover")
                          });
                      k = null
                    }
                    if (b.refresh) {
                      k = a("<td class='ui-pg-button ui-corner-all'></td>");
                      a(k).append(
                          "<div class='ui-pg-div'><span class='ui-icon "
                              + b.refreshicon + "'></span>" + b.refreshtext
                              + "</div>");
                      a("tr", h).append(k);
                      a(k, h).attr({
                        title : b.refreshtitle || "",
                        id : "refresh_" + l
                      }).click(
                          function() {
                            if (!a(this).hasClass("ui-state-disabled")) {
                              a.isFunction(b.beforeRefresh)
                                  && b.beforeRefresh();
                              n.p.search = false;
                              try {
                                a("#fbox_" + n.p.id).searchFilter().reset({
                                  reload : false
                                });
                                a.isFunction(n.clearToolbar)
                                    && n.clearToolbar(false)
                              } catch (s) {
                              }
                              switch (b.refreshstate) {
                              case "firstpage":
                                a(n).trigger("reloadGrid", [ {
                                  page : 1
                                } ]);
                                break;
                              case "current":
                                a(n).trigger("reloadGrid", [ {
                                  current : true
                                } ]);
                                break
                              }
                              a.isFunction(b.afterRefresh) && b.afterRefresh()
                            }
                            return false
                          }).hover(
                          function() {
                            a(this).hasClass("ui-state-disabled")
                                || a(this).addClass("ui-state-hover")
                          }, function() {
                            a(this).removeClass("ui-state-hover")
                          });
                      k = null
                    }
                    k = a(".ui-jqgrid").css("font-size") || "11px";
                    a("body")
                        .append(
                            "<div id='testpg2' class='ui-jqgrid ui-widget ui-widget-content' style='font-size:"
                                + k + ";visibility:hidden;' ></div>");
                    k = a(h).clone().appendTo("#testpg2").width();
                    a("#testpg2").remove();
                    a(j + "_" + b.position, j).append(h);
                    if (n.p._nvtd) {
                      if (k > n.p._nvtd[0]) {
                        a(j + "_" + b.position, j).width(k);
                        n.p._nvtd[0] = k
                      }
                      n.p._nvtd[1] = k
                    }
                    h = k = k = null
                  }
                }
              })
        },
        navButtonAdd : function(f, b) {
          b = a.extend({
            caption : "newButton",
            title : "",
            buttonicon : "ui-icon-newwin",
            onClickButton : null,
            position : "last",
            cursor : "pointer"
          }, b || {});
          return this.each(function() {
            if (this.grid) {
              if (f.indexOf("#") !== 0)
                f = "#" + f;
              var o = a(".navtable", f)[0], C = this;
              if (o) {
                var v = a("<td></td>");
                b.buttonicon.toString().toUpperCase() == "NONE" ? a(v)
                    .addClass("ui-pg-button ui-corner-all").append(
                        "<div class='ui-pg-div'>" + b.caption + "</div>")
                    : a(v).addClass("ui-pg-button ui-corner-all")
                        .append(
                            "<div class='ui-pg-div'><span class='ui-icon "
                                + b.buttonicon + "'></span>" + b.caption
                                + "</div>");
                b.id && a(v).attr("id", b.id);
                if (b.position == "first")
                  o.rows[0].cells.length === 0 ? a("tr", o).append(v) : a(
                      "tr td:eq(0)", o).before(v);
                else
                  a("tr", o).append(v);
                a(v, o).attr("title", b.title || "").click(
                    function(B) {
                      a(this).hasClass("ui-state-disabled")
                          || a.isFunction(b.onClickButton)
                          && b.onClickButton.call(C, B);
                      return false
                    }).hover(
                    function() {
                      a(this).hasClass("ui-state-disabled")
                          || a(this).addClass("ui-state-hover")
                    }, function() {
                      a(this).removeClass("ui-state-hover")
                    })
              }
            }
          })
        },
        navSeparatorAdd : function(f, b) {
          b = a.extend({
            sepclass : "ui-separator",
            sepcontent : ""
          }, b || {});
          return this
              .each(function() {
                if (this.grid) {
                  if (f.indexOf("#") !== 0)
                    f = "#" + f;
                  var o = a(".navtable", f)[0];
                  if (o) {
                    var C = "<td class='ui-pg-button ui-state-disabled' style='width:4px;'><span class='"
                        + b.sepclass + "'></span>" + b.sepcontent + "</td>";
                    a("tr", o).append(C)
                  }
                }
              })
        },
        GridToForm : function(f, b) {
          return this.each(function() {
            var o = this;
            if (o.grid) {
              var C = a(o).jqGrid("getRowData", f);
              if (C)
                for ( var v in C)
                  a("[name=" + v + "]", b).is("input:radio")
                      || a("[name=" + v + "]", b).is("input:checkbox") ? a(
                      "[name=" + v + "]", b).each(
                      function() {
                        a(this).val() == C[v] ? a(this).attr("checked",
                            "checked") : a(this).attr("checked", "")
                      }) : a("[name=" + v + "]", b).val(C[v])
            }
          })
        },
        FormToGrid : function(f, b, o, C) {
          return this.each(function() {
            var v = this;
            if (v.grid) {
              o || (o = "set");
              C || (C = "first");
              var B = a(b).serializeArray(), w = {};
              a.each(B, function(i, n) {
                w[n.name] = n.value
              });
              if (o == "add")
                a(v).jqGrid("addRowData", f, w, C);
              else
                o == "set" && a(v).jqGrid("setRowData", f, w)
            }
          })
        }
      })
})(jQuery);
jQuery.fn.searchFilter = function(k, H) {
  function I(e, l, v) {
    this.$ = e;
    this.add = function(a) {
      a == null ? e.find(".ui-add-last").click() : e.find(
          ".sf:eq(" + a + ") .ui-add").click();
      return this
    };
    this.del = function(a) {
      a == null ? e.find(".sf:last .ui-del").click() : e.find(
          ".sf:eq(" + a + ") .ui-del").click();
      return this
    };
    this.search = function() {
      e.find(".ui-search").click();
      return this
    };
    this.reset = function(a) {
      if (a === undefined)
        a = false;
      e.find(".ui-reset").trigger("click", [ a ]);
      return this
    };
    this.close = function() {
      e.find(".ui-closer").click();
      return this
    };
    if (l != null) {
      function C() {
        jQuery(this).toggleClass("ui-state-hover");
        return false
      }
      function D(a) {
        jQuery(this).toggleClass("ui-state-active", a.type == "mousedown");
        return false
      }
      function m(a, b) {
        return "<option value='" + a + "'>" + b + "</option>"
      }
      function w(a, b, d) {
        return "<select class='" + a + "'"
            + (d ? " style='display:none;'" : "") + ">" + b + "</select>"
      }
      function E(a, b) {
        a = e.find("tr.sf td.data " + a);
        a[0] != null && b(a)
      }
      function F(a, b) {
        var d = e.find("tr.sf td.data " + a);
        d[0] != null
            && jQuery.each(b, function() {
              this.data != null ? d.bind(this.type, this.data, this.fn) : d
                  .bind(this.type, this.fn)
            })
      }
      var f = jQuery.extend({}, jQuery.fn.searchFilter.defaults, v), n = -1, r = "";
      jQuery.each(f.groupOps, function() {
        r += m(this.op, this.text)
      });
      r = "<select name='groupOp'>" + r + "</select>";
      e
          .html("")
          .addClass("ui-searchFilter")
          .append(
              "<div class='ui-widget-overlay' style='z-index: -1'>&#160;</div><table class='ui-widget-content ui-corner-all'><thead><tr><td colspan='5' class='ui-widget-header ui-corner-all' style='line-height: 18px;'><div class='ui-closer ui-state-default ui-corner-all ui-helper-clearfix' style='float: right;'><span class='ui-icon ui-icon-close'></span></div>"
                  + f.windowTitle
                  + "</td></tr></thead><tbody><tr class='sf'><td class='fields'></td><td class='ops'></td><td class='data'></td><td><div class='ui-del ui-state-default ui-corner-all'><span class='ui-icon ui-icon-minus'></span></div></td><td><div class='ui-add ui-state-default ui-corner-all'><span class='ui-icon ui-icon-plus'></span></div></td></tr><tr><td colspan='5' class='divider'><div>&#160;</div></td></tr></tbody><tfoot><tr><td colspan='3'><span class='ui-reset ui-state-default ui-corner-all' style='display: inline-block; float: left;'><span class='ui-icon ui-icon-arrowreturnthick-1-w' style='float: left;'></span><span style='line-height: 18px; padding: 0 7px 0 3px;'>"
                  + f.resetText
                  + "</span></span><span class='ui-search ui-state-default ui-corner-all' style='display: inline-block; float: right;'><span class='ui-icon ui-icon-search' style='float: left;'></span><span style='line-height: 18px; padding: 0 7px 0 3px;'>"
                  + f.searchText
                  + "</span></span><span class='matchText'>"
                  + f.matchText
                  + "</span> "
                  + r
                  + " <span class='rulesText'>"
                  + f.rulesText
                  + "</span></td><td>&#160;</td><td><div class='ui-add-last ui-state-default ui-corner-all'><span class='ui-icon ui-icon-plusthick'></span></div></td></tr></tfoot></table>");
      var x = e.find("tr.sf"), G = x.find("td.fields"), y = x.find("td.ops"), o = x
          .find("td.data"), s = "";
      jQuery.each(f.operators, function() {
        s += m(this.op, this.text)
      });
      s = w("default", s, true);
      y.append(s);
      o.append("<input type='text' class='default' style='display:none;' />");
      var t = "", z = false, p = false;
      jQuery.each(l, function(a) {
        t += m(this.itemval, this.text);
        if (this.ops != null) {
          z = true;
          var b = "";
          jQuery.each(this.ops, function() {
            b += m(this.op, this.text)
          });
          b = w("field" + a, b, true);
          y.append(b)
        }
        if (this.dataUrl != null) {
          if (a > n)
            n = a;
          p = true;
          var d = this.dataEvents, c = this.dataInit, g = this.buildSelect;
          jQuery.ajax(jQuery.extend({
            url : this.dataUrl,
            complete : function(h) {
              h = g != null ? jQuery("<div />").append(g(h))
                  : jQuery("<div />").append(h.responseText);
              h.find("select").addClass("field" + a).hide();
              o.append(h.html());
              c && E(".field" + a, c);
              d && F(".field" + a, d);
              a == n && e.find("tr.sf td.fields select[name='field']").change()
            }
          }, f.ajaxSelectOptions))
        } else if (this.dataValues != null) {
          p = true;
          var i = "";
          jQuery.each(this.dataValues, function() {
            i += m(this.value, this.text)
          });
          i = w("field" + a, i, true);
          o.append(i)
        } else if (this.dataEvents != null || this.dataInit != null) {
          p = true;
          i = "<input type='text' class='field" + a + "' />";
          o.append(i)
        }
        this.dataInit != null && a != n && E(".field" + a, this.dataInit);
        this.dataEvents != null && a != n && F(".field" + a, this.dataEvents)
      });
      t = "<select name='field'>" + t + "</select>";
      G.append(t);
      l = G.find("select[name='field']");
      z ? l.change(function(a) {
        var b = a.target.selectedIndex;
        a = jQuery(a.target).parents("tr.sf").find("td.ops");
        a.find("select").removeAttr("name").hide();
        b = a.find(".field" + b);
        if (b[0] == null)
          b = a.find(".default");
        b.attr("name", "op").show();
        return false
      }) : y.find(".default").attr("name", "op").show();
      p ? l.change(function(a) {
        var b = a.target.selectedIndex;
        a = jQuery(a.target).parents("tr.sf").find("td.data");
        a.find("select,input").removeClass("vdata").hide();
        b = a.find(".field" + b);
        if (b[0] == null)
          b = a.find(".default");
        b.show().addClass("vdata");
        return false
      }) : o.find(".default").show().addClass("vdata");
      if (z || p)
        l.change();
      e.find(".ui-state-default").hover(C, C).mousedown(D).mouseup(D);
      e.find(".ui-closer").click(function() {
        f.onClose(jQuery(e.selector));
        return false
      });
      e.find(".ui-del").click(
          function(a) {
            a = jQuery(a.target).parents(".sf");
            if (a.siblings(".sf").length > 0) {
              f.datepickerFix === true && jQuery.fn.datepicker !== undefined
                  && a.find(".hasDatepicker").datepicker("destroy");
              a.remove()
            } else {
              a.find("select[name='field']")[0].selectedIndex = 0;
              a.find("select[name='op']")[0].selectedIndex = 0;
              a.find(".data input").val("");
              a.find(".data select").each(function() {
                this.selectedIndex = 0
              });
              a.find("select[name='field']").change(function(b) {
                b.stopPropagation()
              })
            }
            return false
          });
      e.find(".ui-add").click(
          function(a) {
            a = jQuery(a.target).parents(".sf");
            var b = a.clone(true).insertAfter(a);
            b.find(".ui-state-default").removeClass(
                "ui-state-hover ui-state-active");
            if (f.clone) {
              b.find("select[name='field']")[0].selectedIndex = a
                  .find("select[name='field']")[0].selectedIndex;
              if (b.find("select[name='op']")[0] != null)
                b.find("select[name='op']").focus()[0].selectedIndex = a
                    .find("select[name='op']")[0].selectedIndex;
              var d = b.find("select.vdata");
              if (d[0] != null)
                d[0].selectedIndex = a.find("select.vdata")[0].selectedIndex
            } else {
              b.find(".data input").val("");
              b.find("select[name='field']").focus()
            }
            f.datepickerFix === true
                && jQuery.fn.datepicker !== undefined
                && a.find(".hasDatepicker").each(
                    function() {
                      var c = jQuery.data(this, "datepicker").settings;
                      b.find("#" + this.id).unbind().removeAttr("id")
                          .removeClass("hasDatepicker").datepicker(c)
                    });
            b.find("select[name='field']").change(function(c) {
              c.stopPropagation()
            });
            return false
          });
      e.find(".ui-search").click(
          function() {
            var a = jQuery(e.selector), b, d = a.find(
                "select[name='groupOp'] :selected").val();
            b = f.stringResult ? '{"groupOp":"' + d + '","rules":[' : {
              groupOp : d,
              rules : []
            };
            a.find(".sf").each(
                function(c) {
                  var g = jQuery(this).find("select[name='field'] :selected")
                      .val(), i = jQuery(this).find(
                      "select[name='op'] :selected").val(), h = jQuery(this)
                      .find("input.vdata,select.vdata :selected").val();
                  h += "";
                  h = h.replace(/\\/g, "\\\\").replace(/\"/g, '\\"');
                  if (f.stringResult) {
                    if (c > 0)
                      b += ",";
                    b += '{"field":"' + g + '",';
                    b += '"op":"' + i + '",';
                    b += '"data":"' + h + '"}'
                  } else
                    b.rules.push({
                      field : g,
                      op : i,
                      data : h
                    })
                });
            if (f.stringResult)
              b += "]}";
            f.onSearch(b);
            return false
          });
      e.find(".ui-reset").click(function(a, b) {
        a = jQuery(e.selector);
        a.find(".ui-del").click();
        a.find("select[name='groupOp']")[0].selectedIndex = 0;
        f.onReset(b);
        return false
      });
      e.find(".ui-add-last").click(
          function() {
            var a = jQuery(e.selector + " .sf:last"), b = a.clone(true)
                .insertAfter(a);
            b.find(".ui-state-default").removeClass(
                "ui-state-hover ui-state-active");
            b.find(".data input").val("");
            b.find("select[name='field']").focus();
            f.datepickerFix === true
                && jQuery.fn.datepicker !== undefined
                && a.find(".hasDatepicker").each(
                    function() {
                      var d = jQuery.data(this, "datepicker").settings;
                      b.find("#" + this.id).unbind().removeAttr("id")
                          .removeClass("hasDatepicker").datepicker(d)
                    });
            b.find("select[name='field']").change(function(d) {
              d.stopPropagation()
            });
            return false
          });
      this.setGroupOp = function(a) {
        selDOMobj = e.find("select[name='groupOp']")[0];
        var b = {}, d = selDOMobj.options.length, c;
        for (c = 0; c < d; c++)
          b[selDOMobj.options[c].value] = c;
        selDOMobj.selectedIndex = b[a];
        jQuery(selDOMobj).change(function(g) {
          g.stopPropagation()
        })
      };
      this.setFilter = function(a) {
        var b = a.sfref;
        a = a.filter;
        var d = [], c, g, i, h, j = {};
        selDOMobj = b.find("select[name='field']")[0];
        c = 0;
        for (i = selDOMobj.options.length; c < i; c++) {
          j[selDOMobj.options[c].value] = {
            index : c,
            ops : {}
          };
          d.push(selDOMobj.options[c].value)
        }
        c = 0;
        for (i = d.length; c < i; c++) {
          if (selDOMobj = b.find(".ops > select[class='field" + c + "']")[0]) {
            g = 0;
            for (h = selDOMobj.options.length; g < h; g++)
              j[d[c]].ops[selDOMobj.options[g].value] = g
          }
          if (selDOMobj = b.find(".data > select[class='field" + c + "']")[0]) {
            j[d[c]].data = {};
            g = 0;
            for (h = selDOMobj.options.length; g < h; g++)
              j[d[c]].data[selDOMobj.options[g].value] = g
          }
        }
        var u, q, A, B;
        d = a.field;
        if (j[d])
          u = j[d].index;
        if (u != null) {
          q = j[d].ops[a.op];
          if (q === undefined) {
            c = 0;
            for (i = v.operators.length; c < i; c++)
              if (v.operators[c].op == a.op) {
                q = c;
                break
              }
          }
          A = a.data;
          B = j[d].data == null ? -1 : j[d].data[A]
        }
        if (u != null && q != null && B != null) {
          b.find("select[name='field']")[0].selectedIndex = u;
          b.find("select[name='field']").change();
          b.find("select[name='op']")[0].selectedIndex = q;
          b.find("input.vdata").val(A);
          if (b = b.find("select.vdata")[0])
            b.selectedIndex = B;
          return true
        } else
          return false
      }
    }
  }
  return new I(this, k, H)
};
jQuery.fn.searchFilter.version = "1.2.9";
jQuery.fn.searchFilter.defaults = {
  clone : true,
  datepickerFix : true,
  onReset : function(k) {
    alert("Reset Clicked. Data Returned: " + k)
  },
  onSearch : function(k) {
    alert("Search Clicked. Data Returned: " + k)
  },
  onClose : function(k) {
    k.hide()
  },
  groupOps : [ {
    op : "AND",
    text : "all"
  }, {
    op : "OR",
    text : "any"
  } ],
  operators : [ {
    op : "eq",
    text : "is equal to"
  }, {
    op : "ne",
    text : "is not equal to"
  }, {
    op : "lt",
    text : "is less than"
  }, {
    op : "le",
    text : "is less or equal to"
  }, {
    op : "gt",
    text : "is greater than"
  }, {
    op : "ge",
    text : "is greater or equal to"
  }, {
    op : "in",
    text : "is in"
  }, {
    op : "ni",
    text : "is not in"
  }, {
    op : "bw",
    text : "begins with"
  }, {
    op : "bn",
    text : "does not begin with"
  }, {
    op : "ew",
    text : "ends with"
  }, {
    op : "en",
    text : "does not end with"
  }, {
    op : "cn",
    text : "contains"
  }, {
    op : "nc",
    text : "does not contain"
  } ],
  matchText : "match",
  rulesText : "rules",
  resetText : "Reset",
  searchText : "Search",
  stringResult : true,
  windowTitle : "Search Rules",
  ajaxSelectOptions : {}
};
(function(a) {
  a.jgrid
      .extend({
        editRow : function(d, u, i, n, o, r, s, c, f) {
          return this.each(function() {
            var b = this, k, l, t = 0, p = null, q = {}, h, g;
            if (b.grid) {
              h = a(b).jqGrid("getInd", d, true);
              if (h !== false)
                if ((a(h).attr("editable") || "0") == "0"
                    && !a(h).hasClass("not-editable-row")) {
                  g = b.p.colModel;
                  a("td", h).each(
                      function(j) {
                        k = g[j].name;
                        var v = b.p.treeGrid === true && k == b.p.ExpandColumn;
                        if (v)
                          l = a("span:first", this).html();
                        else
                          try {
                            l = a.unformat(this, {
                              rowId : d,
                              colModel : g[j]
                            }, j)
                          } catch (m) {
                            l = a(this).html()
                          }
                        if (k != "cb" && k != "subgrid" && k != "rn") {
                          if (b.p.autoencode)
                            l = a.jgrid.htmlDecode(l);
                          q[k] = l;
                          if (g[j].editable === true) {
                            if (p === null)
                              p = j;
                            v ? a("span:first", this).html("") : a(this).html(
                                "");
                            var e = a.extend({}, g[j].editoptions || {}, {
                              id : d + "_" + k,
                              name : k
                            });
                            if (!g[j].edittype)
                              g[j].edittype = "text";
                            e = createEl(g[j].edittype, e, l, true, a.extend(
                                {}, a.jgrid.ajaxOptions, b.p.ajaxSelectOptions
                                    || {}));
                            a(e).addClass("editable");
                            v ? a("span:first", this).append(e) : a(this)
                                .append(e);
                            g[j].edittype == "select"
                                && g[j].editoptions.multiple === true
                                && a.browser.msie && a(e).width(a(e).width());
                            t++
                          }
                        }
                      });
                  if (t > 0) {
                    q.id = d;
                    b.p.savedRow.push(q);
                    a(h).attr("editable", "1");
                    a("td:eq(" + p + ") input", h).focus();
                    u === true && a(h).bind("keydown", function(j) {
                      j.keyCode === 27 && a(b).jqGrid("restoreRow", d, f);
                      if (j.keyCode === 13) {
                        if (j.target.tagName == "TEXTAREA")
                          return true;
                        a(b).jqGrid("saveRow", d, n, o, r, s, c, f);
                        return false
                      }
                      j.stopPropagation()
                    });
                    a.isFunction(i) && i.call(b, d)
                  }
                }
            }
          })
        },
        saveRow : function(d, u, i, n, o, r, s) {
          return this
              .each(function() {
                var c = this, f, b = {}, k = {}, l, t, p, q;
                if (c.grid) {
                  q = a(c).jqGrid("getInd", d, true);
                  if (q !== false) {
                    l = a(q).attr("editable");
                    i = i ? i : c.p.editurl;
                    if (l === "1") {
                      var h;
                      a("td", q)
                          .each(
                              function(m) {
                                h = c.p.colModel[m];
                                f = h.name;
                                if (f != "cb" && f != "subgrid"
                                    && h.editable === true && f != "rn") {
                                  switch (h.edittype) {
                                  case "checkbox":
                                    var e = [ "Yes", "No" ];
                                    if (h.editoptions)
                                      e = h.editoptions.value.split(":");
                                    b[f] = a("input", this).attr("checked") ? e[0]
                                        : e[1];
                                    break;
                                  case "text":
                                  case "password":
                                  case "textarea":
                                  case "button":
                                    b[f] = a("input, textarea", this).val();
                                    break;
                                  case "select":
                                    if (h.editoptions.multiple) {
                                      e = a("select", this);
                                      var x = [];
                                      b[f] = a(e).val();
                                      b[f] = b[f] ? b[f].join(",") : "";
                                      a("select > option:selected", this).each(
                                          function(y, z) {
                                            x[y] = a(z).text()
                                          });
                                      k[f] = x.join(",")
                                    } else {
                                      b[f] = a("select>option:selected", this)
                                          .val();
                                      k[f] = a("select>option:selected", this)
                                          .text()
                                    }
                                    if (h.formatter && h.formatter == "select")
                                      k = {};
                                    break;
                                  case "custom":
                                    try {
                                      if (h.editoptions
                                          && a
                                              .isFunction(h.editoptions.custom_value)) {
                                        b[f] = h.editoptions.custom_value
                                            .call(c, a(".customelement", this),
                                                "get");
                                        if (b[f] === undefined)
                                          throw "e2";
                                      } else
                                        throw "e1";
                                    } catch (w) {
                                      w == "e1"
                                          && info_dialog(
                                              jQuery.jgrid.errors.errcap,
                                              "function 'custom_value' "
                                                  + a.jgrid.edit.msg.nodefined,
                                              jQuery.jgrid.edit.bClose);
                                      w == "e2" ? info_dialog(
                                          jQuery.jgrid.errors.errcap,
                                          "function 'custom_value' "
                                              + a.jgrid.edit.msg.novalue,
                                          jQuery.jgrid.edit.bClose)
                                          : info_dialog(
                                              jQuery.jgrid.errors.errcap,
                                              w.message,
                                              jQuery.jgrid.edit.bClose)
                                    }
                                    break
                                  }
                                  p = checkValues(b[f], m, c);
                                  if (p[0] === false) {
                                    p[1] = b[f] + " " + p[1];
                                    return false
                                  }
                                  if (c.p.autoencode)
                                    b[f] = a.jgrid.htmlEncode(b[f])
                                }
                              });
                      if (p[0] === false)
                        try {
                          var g = findPos(a("#" + a.jgrid.jqID(d), c.grid.bDiv)[0]);
                          info_dialog(a.jgrid.errors.errcap, p[1],
                              a.jgrid.edit.bClose, {
                                left : g[0],
                                top : g[1]
                              })
                        } catch (j) {
                          alert(p[1])
                        }
                      else {
                        if (b) {
                          var v;
                          g = c.p.prmNames;
                          v = g.oper;
                          l = g.id;
                          b[v] = g.editoper;
                          b[l] = d;
                          if (typeof c.p.inlineData == "undefined")
                            c.p.inlineData = {};
                          if (typeof n == "undefined")
                            n = {};
                          b = a.extend({}, b, c.p.inlineData, n)
                        }
                        if (i == "clientArray") {
                          b = a.extend({}, b, k);
                          c.p.autoencode && a.each(b, function(m, e) {
                            b[m] = a.jgrid.htmlDecode(e)
                          });
                          l = a(c).jqGrid("setRowData", d, b);
                          a(q).attr("editable", "0");
                          for (g = 0; g < c.p.savedRow.length; g++)
                            if (c.p.savedRow[g].id == d) {
                              t = g;
                              break
                            }
                          t >= 0 && c.p.savedRow.splice(t, 1);
                          a.isFunction(o) && o.call(c, d, l)
                        } else {
                          a("#lui_" + c.p.id).show();
                          a
                              .ajax(a
                                  .extend(
                                      {
                                        url : i,
                                        data : a
                                            .isFunction(c.p.serializeRowData) ? c.p.serializeRowData
                                            .call(c, b)
                                            : b,
                                        type : "POST",
                                        complete : function(m, e) {
                                          a("#lui_" + c.p.id).hide();
                                          if (e === "success")
                                            if ((a.isFunction(u) ? u.call(c, m)
                                                : true) === true) {
                                              c.p.autoencode
                                                  && a.each(b, function(x, w) {
                                                    b[x] = a.jgrid
                                                        .htmlDecode(w)
                                                  });
                                              b = a.extend({}, b, k);
                                              a(c).jqGrid("setRowData", d, b);
                                              a(q).attr("editable", "0");
                                              for (e = 0; e < c.p.savedRow.length; e++)
                                                if (c.p.savedRow[e].id == d) {
                                                  t = e;
                                                  break
                                                }
                                              t >= 0
                                                  && c.p.savedRow.splice(t, 1);
                                              a.isFunction(o)
                                                  && o.call(c, d, m)
                                            } else {
                                              a.isFunction(r)
                                                  && r.call(c, d, m, e);
                                              a(c).jqGrid("restoreRow", d, s)
                                            }
                                        },
                                        error : function(m, e) {
                                          a("#lui_" + c.p.id).hide();
                                          a.isFunction(r) ? r.call(c, d, m, e)
                                              : alert("Error Row: " + d
                                                  + " Result: " + m.status
                                                  + ":" + m.statusText
                                                  + " Status: " + e);
                                          a(c).jqGrid("restoreRow", d, s)
                                        }
                                      }, a.jgrid.ajaxOptions,
                                      c.p.ajaxRowOptions || {}))
                        }
                        a(q).unbind("keydown")
                      }
                    }
                  }
                }
              })
        },
        restoreRow : function(d, u) {
          return this.each(function() {
            var i = this, n, o, r = {};
            if (i.grid) {
              o = a(i).jqGrid("getInd", d, true);
              if (o !== false) {
                for ( var s = 0; s < i.p.savedRow.length; s++)
                  if (i.p.savedRow[s].id == d) {
                    n = s;
                    break
                  }
                if (n >= 0) {
                  if (a.isFunction(a.fn.datepicker))
                    try {
                      a("input.hasDatepicker", "#" + a.jgrid.jqID(o.id))
                          .datepicker("hide")
                    } catch (c) {
                    }
                  a.each(i.p.colModel, function() {
                    if (this.editable === true && this.name in i.p.savedRow[n])
                      r[this.name] = i.p.savedRow[n][this.name]
                  });
                  a(i).jqGrid("setRowData", d, r);
                  a(o).attr("editable", "0").unbind("keydown");
                  i.p.savedRow.splice(n, 1)
                }
                a.isFunction(u) && u.call(i, d)
              }
            }
          })
        }
      })
})(jQuery);
(function(b) {
  b.jgrid
      .extend({
        editCell : function(d, e, a) {
          return this.each(function() {
            var c = this, h, f, g;
            if (!(!c.grid || c.p.cellEdit !== true)) {
              e = parseInt(e, 10);
              c.p.selrow = c.rows[d].id;
              c.p.knv || b(c).jqGrid("GridNav");
              if (c.p.savedRow.length > 0) {
                if (a === true)
                  if (d == c.p.iRow && e == c.p.iCol)
                    return;
                b(c).jqGrid("saveCell", c.p.savedRow[0].id, c.p.savedRow[0].ic)
              } else
                window.setTimeout(function() {
                  b("#" + c.p.knv).attr("tabindex", "-1").focus()
                }, 0);
              h = c.p.colModel[e].name;
              if (!(h == "subgrid" || h == "cb" || h == "rn")) {
                g = b("td:eq(" + e + ")", c.rows[d]);
                if (c.p.colModel[e].editable === true && a === true
                    && !g.hasClass("not-editable-cell")) {
                  if (parseInt(c.p.iCol, 10) >= 0
                      && parseInt(c.p.iRow, 10) >= 0) {
                    b("td:eq(" + c.p.iCol + ")", c.rows[c.p.iRow]).removeClass(
                        "edit-cell ui-state-highlight");
                    b(c.rows[c.p.iRow]).removeClass(
                        "selected-row ui-state-hover")
                  }
                  b(g).addClass("edit-cell ui-state-highlight");
                  b(c.rows[d]).addClass("selected-row ui-state-hover");
                  try {
                    f = b.unformat(g, {
                      rowId : c.rows[d].id,
                      colModel : c.p.colModel[e]
                    }, e)
                  } catch (k) {
                    f = b(g).html()
                  }
                  if (c.p.autoencode)
                    f = b.jgrid.htmlDecode(f);
                  if (!c.p.colModel[e].edittype)
                    c.p.colModel[e].edittype = "text";
                  c.p.savedRow.push({
                    id : d,
                    ic : e,
                    name : h,
                    v : f
                  });
                  if (b.isFunction(c.p.formatCell)) {
                    var j = c.p.formatCell.call(c, c.rows[d].id, h, f, d, e);
                    if (j !== undefined)
                      f = j
                  }
                  j = b.extend({}, c.p.colModel[e].editoptions || {}, {
                    id : d + "_" + h,
                    name : h
                  });
                  var i = createEl(c.p.colModel[e].edittype, j, f, true, b
                      .extend({}, b.jgrid.ajaxOptions, c.p.ajaxSelectOptions
                          || {}));
                  b.isFunction(c.p.beforeEditCell)
                      && c.p.beforeEditCell.call(c, c.rows[d].id, h, f, d, e);
                  b(g).html("").append(i).attr("tabindex", "0");
                  window.setTimeout(function() {
                    b(i).focus()
                  }, 0);
                  b("input, select, textarea", g).bind(
                      "keydown",
                      function(l) {
                        if (l.keyCode === 27)
                          if (b("input.hasDatepicker", g).length > 0)
                            b(".ui-datepicker").is(":hidden") ? b(c).jqGrid(
                                "restoreCell", d, e) : b("input.hasDatepicker",
                                g).datepicker("hide");
                          else
                            b(c).jqGrid("restoreCell", d, e);
                        l.keyCode === 13 && b(c).jqGrid("saveCell", d, e);
                        if (l.keyCode == 9)
                          if (c.grid.hDiv.loading)
                            return false;
                          else
                            l.shiftKey ? b(c).jqGrid("prevCell", d, e) : b(c)
                                .jqGrid("nextCell", d, e);
                        l.stopPropagation()
                      });
                  b.isFunction(c.p.afterEditCell)
                      && c.p.afterEditCell.call(c, c.rows[d].id, h, f, d, e)
                } else {
                  if (parseInt(c.p.iCol, 10) >= 0
                      && parseInt(c.p.iRow, 10) >= 0) {
                    b("td:eq(" + c.p.iCol + ")", c.rows[c.p.iRow]).removeClass(
                        "edit-cell ui-state-highlight");
                    b(c.rows[c.p.iRow]).removeClass(
                        "selected-row ui-state-hover")
                  }
                  g.addClass("edit-cell ui-state-highlight");
                  b(c.rows[d]).addClass("selected-row ui-state-hover");
                  if (b.isFunction(c.p.onSelectCell)) {
                    f = g.html().replace(/\&#160\;/ig, "");
                    c.p.onSelectCell.call(c, c.rows[d].id, h, f, d, e)
                  }
                }
                c.p.iCol = e;
                c.p.iRow = d
              }
            }
          })
        },
        saveCell : function(d, e) {
          return this
              .each(function() {
                var a = this, c;
                if (!(!a.grid || a.p.cellEdit !== true)) {
                  c = a.p.savedRow.length >= 1 ? 0 : null;
                  if (c !== null) {
                    var h = b("td:eq(" + e + ")", a.rows[d]), f, g, k = a.p.colModel[e], j = k.name, i = b.jgrid
                        .jqID(j);
                    switch (k.edittype) {
                    case "select":
                      if (k.editoptions.multiple) {
                        i = b("#" + d + "_" + i, a.rows[d]);
                        var l = [];
                        if (f = b(i).val())
                          f.join(",");
                        else
                          f = "";
                        b("option:selected", i).each(function(m, p) {
                          l[m] = b(p).text()
                        });
                        g = l.join(",")
                      } else {
                        f = b("#" + d + "_" + i + ">option:selected", a.rows[d])
                            .val();
                        g = b("#" + d + "_" + i + ">option:selected", a.rows[d])
                            .text()
                      }
                      if (k.formatter)
                        g = f;
                      break;
                    case "checkbox":
                      var n = [ "Yes", "No" ];
                      if (k.editoptions)
                        n = k.editoptions.value.split(":");
                      g = f = b("#" + d + "_" + i, a.rows[d]).attr("checked") ? n[0]
                          : n[1];
                      break;
                    case "password":
                    case "text":
                    case "textarea":
                    case "button":
                      g = f = b("#" + d + "_" + i, a.rows[d]).val();
                      break;
                    case "custom":
                      try {
                        if (k.editoptions
                            && b.isFunction(k.editoptions.custom_value)) {
                          f = k.editoptions.custom_value.call(a, b(
                              ".customelement", h), "get");
                          if (f === undefined)
                            throw "e2";
                          else
                            g = f
                        } else
                          throw "e1";
                      } catch (q) {
                        q == "e1"
                            && info_dialog(jQuery.jgrid.errors.errcap,
                                "function 'custom_value' "
                                    + b.jgrid.edit.msg.nodefined,
                                jQuery.jgrid.edit.bClose);
                        q == "e2" ? info_dialog(jQuery.jgrid.errors.errcap,
                            "function 'custom_value' "
                                + b.jgrid.edit.msg.novalue,
                            jQuery.jgrid.edit.bClose) : info_dialog(
                            jQuery.jgrid.errors.errcap, q.message,
                            jQuery.jgrid.edit.bClose)
                      }
                      break
                    }
                    if (g != a.p.savedRow[c].v) {
                      if (b.isFunction(a.p.beforeSaveCell))
                        if (c = a.p.beforeSaveCell.call(a, a.rows[d].id, j, f,
                            d, e))
                          g = f = c;
                      var r = checkValues(f, e, a);
                      if (r[0] === true) {
                        c = {};
                        if (b.isFunction(a.p.beforeSubmitCell))
                          (c = a.p.beforeSubmitCell.call(a, a.rows[d].id, j, f,
                              d, e))
                              || (c = {});
                        b("input.hasDatepicker", h).length > 0
                            && b("input.hasDatepicker", h).datepicker("hide");
                        if (a.p.cellsubmit == "remote")
                          if (a.p.cellurl) {
                            var o = {};
                            if (a.p.autoencode)
                              f = b.jgrid.htmlEncode(f);
                            o[j] = f;
                            n = a.p.prmNames;
                            k = n.id;
                            i = n.oper;
                            o[k] = a.rows[d].id;
                            o[i] = n.editoper;
                            o = b.extend(c, o);
                            b("#lui_" + a.p.id).show();
                            a.grid.hDiv.loading = true;
                            b
                                .ajax(b
                                    .extend(
                                        {
                                          url : a.p.cellurl,
                                          data : b
                                              .isFunction(a.p.serializeCellData) ? a.p.serializeCellData
                                              .call(a, o)
                                              : o,
                                          type : "POST",
                                          complete : function(m, p) {
                                            b("#lui_" + a.p.id).hide();
                                            a.grid.hDiv.loading = false;
                                            if (p == "success")
                                              if (b
                                                  .isFunction(a.p.afterSubmitCell)) {
                                                m = a.p.afterSubmitCell.call(a,
                                                    m, o.id, j, f, d, e);
                                                if (m[0] === true) {
                                                  b(h).empty();
                                                  b(a).jqGrid("setCell",
                                                      a.rows[d].id, e, g,
                                                      false, false, true);
                                                  b(h).addClass("dirty-cell");
                                                  b(a.rows[d]).addClass(
                                                      "edited");
                                                  b
                                                      .isFunction(a.p.afterSaveCell)
                                                      && a.p.afterSaveCell
                                                          .call(a,
                                                              a.rows[d].id, j,
                                                              f, d, e);
                                                  a.p.savedRow.splice(0, 1)
                                                } else {
                                                  info_dialog(
                                                      b.jgrid.errors.errcap,
                                                      m[1], b.jgrid.edit.bClose);
                                                  b(a).jqGrid("restoreCell", d,
                                                      e)
                                                }
                                              } else {
                                                b(h).empty();
                                                b(a).jqGrid("setCell",
                                                    a.rows[d].id, e, g, false,
                                                    false, true);
                                                b(h).addClass("dirty-cell");
                                                b(a.rows[d]).addClass("edited");
                                                b.isFunction(a.p.afterSaveCell)
                                                    && a.p.afterSaveCell.call(
                                                        a, a.rows[d].id, j, f,
                                                        d, e);
                                                a.p.savedRow.splice(0, 1)
                                              }
                                          },
                                          error : function(m, p) {
                                            b("#lui_" + a.p.id).hide();
                                            a.grid.hDiv.loading = false;
                                            b.isFunction(a.p.errorCell) ? a.p.errorCell
                                                .call(a, m, p)
                                                : info_dialog(
                                                    b.jgrid.errors.errcap,
                                                    m.status + " : "
                                                        + m.statusText
                                                        + "<br/>" + p,
                                                    b.jgrid.edit.bClose);
                                            b(a).jqGrid("restoreCell", d, e)
                                          }
                                        }, b.jgrid.ajaxOptions,
                                        a.p.ajaxCellOptions || {}))
                          } else
                            try {
                              info_dialog(b.jgrid.errors.errcap,
                                  b.jgrid.errors.nourl, b.jgrid.edit.bClose);
                              b(a).jqGrid("restoreCell", d, e)
                            } catch (s) {
                            }
                        if (a.p.cellsubmit == "clientArray") {
                          b(h).empty();
                          b(a).jqGrid("setCell", a.rows[d].id, e, g, false,
                              false, true);
                          b(h).addClass("dirty-cell");
                          b(a.rows[d]).addClass("edited");
                          b.isFunction(a.p.afterSaveCell)
                              && a.p.afterSaveCell.call(a, a.rows[d].id, j, f,
                                  d, e);
                          a.p.savedRow.splice(0, 1)
                        }
                      } else
                        try {
                          window.setTimeout(function() {
                            info_dialog(b.jgrid.errors.errcap, f + " " + r[1],
                                b.jgrid.edit.bClose)
                          }, 100);
                          b(a).jqGrid("restoreCell", d, e)
                        } catch (t) {
                        }
                    } else
                      b(a).jqGrid("restoreCell", d, e)
                  }
                  b.browser.opera ? b("#" + a.p.knv).attr("tabindex", "-1")
                      .focus() : window.setTimeout(function() {
                    b("#" + a.p.knv).attr("tabindex", "-1").focus()
                  }, 0)
                }
              })
        },
        restoreCell : function(d, e) {
          return this.each(function() {
            var a = this, c;
            if (!(!a.grid || a.p.cellEdit !== true)) {
              c = a.p.savedRow.length >= 1 ? 0 : null;
              if (c !== null) {
                var h = b("td:eq(" + e + ")", a.rows[d]);
                if (b.isFunction(b.fn.datepicker))
                  try {
                    b("input.hasDatepicker", h).datepicker("hide")
                  } catch (f) {
                  }
                b(h).empty().attr("tabindex", "-1");
                b(a).jqGrid("setCell", a.rows[d].id, e, a.p.savedRow[c].v,
                    false, false, true);
                b.isFunction(a.p.afterRestoreCell)
                    && a.p.afterRestoreCell.call(a, a.rows[d].id,
                        a.p.savedRow[c].v, d, e);
                a.p.savedRow.splice(0, 1)
              }
              window.setTimeout(function() {
                b("#" + a.p.knv).attr("tabindex", "-1").focus()
              }, 0)
            }
          })
        },
        nextCell : function(d, e) {
          return this.each(function() {
            var a = this, c = false;
            if (!(!a.grid || a.p.cellEdit !== true)) {
              for ( var h = e + 1; h < a.p.colModel.length; h++)
                if (a.p.colModel[h].editable === true) {
                  c = h;
                  break
                }
              if (c !== false)
                b(a).jqGrid("editCell", d, c, true);
              else
                a.p.savedRow.length > 0 && b(a).jqGrid("saveCell", d, e)
            }
          })
        },
        prevCell : function(d, e) {
          return this.each(function() {
            var a = this, c = false;
            if (!(!a.grid || a.p.cellEdit !== true)) {
              for ( var h = e - 1; h >= 0; h--)
                if (a.p.colModel[h].editable === true) {
                  c = h;
                  break
                }
              if (c !== false)
                b(a).jqGrid("editCell", d, c, true);
              else
                a.p.savedRow.length > 0 && b(a).jqGrid("saveCell", d, e)
            }
          })
        },
        GridNav : function() {
          return this
              .each(function() {
                function d(g, k, j) {
                  if (j.substr(0, 1) == "v") {
                    var i = b(a.grid.bDiv)[0].clientHeight, l = b(a.grid.bDiv)[0].scrollTop, n = a.rows[g].offsetTop
                        + a.rows[g].clientHeight, q = a.rows[g].offsetTop;
                    if (j == "vd")
                      if (n >= i)
                        b(a.grid.bDiv)[0].scrollTop = b(a.grid.bDiv)[0].scrollTop
                            + a.rows[g].clientHeight;
                    if (j == "vu")
                      if (q < l)
                        b(a.grid.bDiv)[0].scrollTop = b(a.grid.bDiv)[0].scrollTop
                            - a.rows[g].clientHeight
                  }
                  if (j == "h") {
                    j = b(a.grid.bDiv)[0].clientWidth;
                    i = b(a.grid.bDiv)[0].scrollLeft;
                    l = a.rows[g].cells[k].offsetLeft;
                    if (a.rows[g].cells[k].offsetLeft
                        + a.rows[g].cells[k].clientWidth >= j + parseInt(i, 10))
                      b(a.grid.bDiv)[0].scrollLeft = b(a.grid.bDiv)[0].scrollLeft
                          + a.rows[g].cells[k].clientWidth;
                    else if (l < i)
                      b(a.grid.bDiv)[0].scrollLeft = b(a.grid.bDiv)[0].scrollLeft
                          - a.rows[g].cells[k].clientWidth
                  }
                }
                function e(g, k) {
                  var j, i;
                  if (k == "lft") {
                    j = g + 1;
                    for (i = g; i >= 0; i--)
                      if (a.p.colModel[i].hidden !== true) {
                        j = i;
                        break
                      }
                  }
                  if (k == "rgt") {
                    j = g - 1;
                    for (i = g; i < a.p.colModel.length; i++)
                      if (a.p.colModel[i].hidden !== true) {
                        j = i;
                        break
                      }
                  }
                  return j
                }
                var a = this;
                if (!(!a.grid || a.p.cellEdit !== true)) {
                  a.p.knv = a.p.id + "_kn";
                  var c = b("<span style='width:0px;height:0px;background-color:black;' tabindex='0'><span tabindex='-1' style='width:0px;height:0px;background-color:grey' id='"
                      + a.p.knv + "'></span></span>"), h, f;
                  b(c).insertBefore(a.grid.cDiv);
                  b("#" + a.p.knv).focus().keydown(
                      function(g) {
                        f = g.keyCode;
                        if (a.p.direction == "rtl")
                          if (f == 37)
                            f = 39;
                          else if (f == 39)
                            f = 37;
                        switch (f) {
                        case 38:
                          if (a.p.iRow - 1 > 0) {
                            d(a.p.iRow - 1, a.p.iCol, "vu");
                            b(a).jqGrid("editCell", a.p.iRow - 1, a.p.iCol,
                                false)
                          }
                          break;
                        case 40:
                          if (a.p.iRow + 1 <= a.rows.length - 1) {
                            d(a.p.iRow + 1, a.p.iCol, "vd");
                            b(a).jqGrid("editCell", a.p.iRow + 1, a.p.iCol,
                                false)
                          }
                          break;
                        case 37:
                          if (a.p.iCol - 1 >= 0) {
                            h = e(a.p.iCol - 1, "lft");
                            d(a.p.iRow, h, "h");
                            b(a).jqGrid("editCell", a.p.iRow, h, false)
                          }
                          break;
                        case 39:
                          if (a.p.iCol + 1 <= a.p.colModel.length - 1) {
                            h = e(a.p.iCol + 1, "rgt");
                            d(a.p.iRow, h, "h");
                            b(a).jqGrid("editCell", a.p.iRow, h, false)
                          }
                          break;
                        case 13:
                          parseInt(a.p.iCol, 10) >= 0
                              && parseInt(a.p.iRow, 10) >= 0
                              && b(a).jqGrid("editCell", a.p.iRow, a.p.iCol,
                                  true);
                          break
                        }
                        return false
                      })
                }
              })
        },
        getChangedCells : function(d) {
          var e = [];
          d || (d = "all");
          this.each(function() {
            var a = this, c;
            !a.grid || a.p.cellEdit !== true || b(a.rows).each(function(h) {
              var f = {};
              if (b(this).hasClass("edited")) {
                b("td", this).each(function(g) {
                  c = a.p.colModel[g].name;
                  if (c !== "cb" && c !== "subgrid")
                    if (d == "dirty") {
                      if (b(this).hasClass("dirty-cell"))
                        try {
                          f[c] = b.unformat(this, {
                            rowId : a.rows[h].id,
                            colModel : a.p.colModel[g]
                          }, g)
                        } catch (k) {
                          f[c] = b.jgrid.htmlDecode(b(this).html())
                        }
                    } else
                      try {
                        f[c] = b.unformat(this, {
                          rowId : a.rows[h].id,
                          colModel : a.p.colModel[g]
                        }, g)
                      } catch (j) {
                        f[c] = b.jgrid.htmlDecode(b(this).html())
                      }
                });
                f.id = this.id;
                e.push(f)
              }
            })
          });
          return e
        }
      })
})(jQuery);
(function(b) {
  b.fn.jqDrag = function(a) {
    return l(this, a, "d")
  };
  b.fn.jqResize = function(a, e) {
    return l(this, a, "r", e)
  };
  b.jqDnR = {
    dnr : {},
    e : 0,
    drag : function(a) {
      if (c.k == "d")
        d.css({
          left : c.X + a.pageX - c.pX,
          top : c.Y + a.pageY - c.pY
        });
      else {
        d.css({
          width : Math.max(a.pageX - c.pX + c.W, 0),
          height : Math.max(a.pageY - c.pY + c.H, 0)
        });
        M1 && f.css({
          width : Math.max(a.pageX - M1.pX + M1.W, 0),
          height : Math.max(a.pageY - M1.pY + M1.H, 0)
        })
      }
      return false
    },
    stop : function() {
      b(document).unbind("mousemove", i.drag).unbind("mouseup", i.stop)
    }
  };
  var i = b.jqDnR, c = i.dnr, d = i.e, f, l = function(a, e, n, m) {
    return a.each(function() {
      e = e ? b(e, a) : a;
      e.bind("mousedown", {
        e : a,
        k : n
      }, function(g) {
        var j = g.data, h = {};
        d = j.e;
        f = m ? b(m) : false;
        if (d.css("position") != "relative")
          try {
            d.position(h)
          } catch (o) {
          }
        c = {
          X : h.left || k("left") || 0,
          Y : h.top || k("top") || 0,
          W : k("width") || d[0].scrollWidth || 0,
          H : k("height") || d[0].scrollHeight || 0,
          pX : g.pageX,
          pY : g.pageY,
          k : j.k
        };
        M1 = f && j.k != "d" ? {
          X : h.left || f1("left") || 0,
          Y : h.top || f1("top") || 0,
          W : f[0].offsetWidth || f1("width") || 0,
          H : f[0].offsetHeight || f1("height") || 0,
          pX : g.pageX,
          pY : g.pageY,
          k : j.k
        } : false;
        try {
          b("input.hasDatepicker", d[0]).datepicker("hide")
        } catch (p) {
        }
        b(document).mousemove(b.jqDnR.drag).mouseup(b.jqDnR.stop);
        return false
      })
    })
  }, k = function(a) {
    return parseInt(d.css(a)) || false
  };
  f1 = function(a) {
    return parseInt(f.css(a)) || false
  }
})(jQuery);
(function(b) {
  b.jgrid
      .extend({
        setSubGrid : function() {
          return this.each(function() {
            var e = this;
            e.p.colNames.unshift("");
            e.p.colModel.unshift({
              name : "subgrid",
              width : b.browser.safari ? e.p.subGridWidth + e.p.cellLayout
                  : e.p.subGridWidth,
              sortable : false,
              resizable : false,
              hidedlg : true,
              search : false,
              fixed : true
            });
            e = e.p.subGridModel;
            if (e[0]) {
              e[0].align = b.extend([], e[0].align || []);
              for ( var c = 0; c < e[0].name.length; c++)
                e[0].align[c] = e[0].align[c] || "left"
            }
          })
        },
        addSubGridCell : function(e, c) {
          var a = "", n, o;
          this.each(function() {
            a = this.formatCol(e, c);
            n = this.p.gridview;
            o = this.p.id
          });
          return n === false ? '<td role="grid" aria-describedby="'
              + o
              + '_subgrid" class="ui-sgcollapsed sgcollapsed" '
              + a
              + "><a href='javascript:void(0);'><span class='ui-icon ui-icon-plus'></span></a></td>"
              : '<td role="grid" aria-describedby="' + o + '_subgrid" ' + a
                  + "></td>"
        },
        addSubGrid : function(e, c) {
          return this
              .each(function() {
                var a = this;
                if (a.grid) {
                  var n = function(g, j, f) {
                    j = b(
                        "<td align='" + a.p.subGridModel[0].align[f]
                            + "'></td>").html(j);
                    b(g).append(j)
                  }, o = function(g, j) {
                    var f, d, h, i = b("<table cellspacing='0' cellpadding='0' border='0'><tbody></tbody></table>"), k = b("<tr></tr>");
                    for (d = 0; d < a.p.subGridModel[0].name.length; d++) {
                      f = b("<th class='ui-state-default ui-th-subgrid ui-th-column ui-th-"
                          + a.p.direction + "'></th>");
                      b(f).html(a.p.subGridModel[0].name[d]);
                      b(f).width(a.p.subGridModel[0].width[d]);
                      b(k).append(f)
                    }
                    b(i).append(k);
                    if (g) {
                      h = a.p.xmlReader.subgrid;
                      b(h.root + " " + h.row, g)
                          .each(
                              function() {
                                k = b("<tr class='ui-widget-content ui-subtblcell'></tr>");
                                if (h.repeatitems === true)
                                  b(h.cell, this).each(function(q) {
                                    n(k, b(this).text() || "&#160;", q)
                                  });
                                else {
                                  var l = a.p.subGridModel[0].mapping
                                      || a.p.subGridModel[0].name;
                                  if (l)
                                    for (d = 0; d < l.length; d++)
                                      n(k, b(l[d], this).text() || "&#160;", d)
                                }
                                b(i).append(k)
                              })
                    }
                    g = b("table:first", a.grid.bDiv).attr("id") + "_";
                    b("#" + g + j).append(i);
                    a.grid.hDiv.loading = false;
                    b("#load_" + a.p.id).hide();
                    return false
                  }, u = function(g, j) {
                    var f, d, h, i, k = b("<table cellspacing='0' cellpadding='0' border='0'><tbody></tbody></table>"), l = b("<tr></tr>");
                    for (d = 0; d < a.p.subGridModel[0].name.length; d++) {
                      f = b("<th class='ui-state-default ui-th-subgrid ui-th-column ui-th-"
                          + a.p.direction + "'></th>");
                      b(f).html(a.p.subGridModel[0].name[d]);
                      b(f).width(a.p.subGridModel[0].width[d]);
                      b(l).append(f)
                    }
                    b(k).append(l);
                    if (g) {
                      f = a.p.jsonReader.subgrid;
                      g = g[f.root];
                      if (typeof g !== "undefined")
                        for (d = 0; d < g.length; d++) {
                          h = g[d];
                          l = b("<tr class='ui-widget-content ui-subtblcell'></tr>");
                          if (f.repeatitems === true) {
                            if (f.cell)
                              h = h[f.cell];
                            for (i = 0; i < h.length; i++)
                              n(l, h[i] || "&#160;", i)
                          } else {
                            var q = a.p.subGridModel[0].mapping
                                || a.p.subGridModel[0].name;
                            if (q.length)
                              for (i = 0; i < q.length; i++)
                                n(l, h[q[i]] || "&#160;", i)
                          }
                          b(k).append(l)
                        }
                    }
                    d = b("table:first", a.grid.bDiv).attr("id") + "_";
                    b("#" + d + j).append(k);
                    a.grid.hDiv.loading = false;
                    b("#load_" + a.p.id).hide();
                    return false
                  }, x = function(g) {
                    var j, f, d, h;
                    j = b(g).attr("id");
                    f = {
                      nd_ : (new Date).getTime()
                    };
                    f[a.p.prmNames.subgridid] = j;
                    if (!a.p.subGridModel[0])
                      return false;
                    if (a.p.subGridModel[0].params)
                      for (h = 0; h < a.p.subGridModel[0].params.length; h++)
                        for (d = 0; d < a.p.colModel.length; d++)
                          if (a.p.colModel[d].name == a.p.subGridModel[0].params[h])
                            f[a.p.colModel[d].name] = b("td:eq(" + d + ")", g)
                                .text().replace(/\&#160\;/ig, "");
                    if (!a.grid.hDiv.loading) {
                      a.grid.hDiv.loading = true;
                      b("#load_" + a.p.id).show();
                      if (!a.p.subgridtype)
                        a.p.subgridtype = a.p.datatype;
                      if (b.isFunction(a.p.subgridtype))
                        a.p.subgridtype.call(a, f);
                      else
                        a.p.subgridtype = a.p.subgridtype.toLowerCase();
                      switch (a.p.subgridtype) {
                      case "xml":
                      case "json":
                        b.ajax(b.extend({
                          type : a.p.mtype,
                          url : a.p.subGridUrl,
                          dataType : a.p.subgridtype,
                          data : b.isFunction(a.p.serializeSubGridData) ? a.p
                              .serializeSubGridData(a, f) : f,
                          complete : function(i) {
                            a.p.subgridtype == "xml" ? o(i.responseXML, j) : u(
                                b.jgrid.parse(i.responseText), j)
                          }
                        }, b.jgrid.ajaxOptions, a.p.ajaxSubgridOptions || {}));
                        break
                      }
                    }
                    return false
                  }, r, m, s, v, t, w, p;
                  b("td:eq(" + c + ")", e)
                      .click(
                          function() {
                            if (b(this).hasClass("sgcollapsed")) {
                              s = a.p.id;
                              r = b(this).parent();
                              v = c >= 1 ? "<td colspan='" + c
                                  + "'>&#160;</td>" : "";
                              m = b(r).attr("id");
                              p = true;
                              if (b.isFunction(a.p.subGridBeforeExpand))
                                p = a.p.subGridBeforeExpand.call(a,
                                    s + "_" + m, m);
                              if (p === false)
                                return false;
                              t = 0;
                              b.each(a.p.colModel, function() {
                                if (this.hidden === true || this.name == "rn"
                                    || this.name == "cb")
                                  t++
                              });
                              w = "<tr role='row' class='ui-subgrid'>"
                                  + v
                                  + "<td class='ui-widget-content subgrid-cell'><span class='ui-icon ui-icon-carat-1-sw'/></td><td colspan='"
                                  + parseInt(a.p.colNames.length - 1 - t, 10)
                                  + "' class='ui-widget-content subgrid-data'><div id="
                                  + s + "_" + m + " class='tablediv'>";
                              b(this).parent().after(w + "</div></td></tr>");
                              b.isFunction(a.p.subGridRowExpanded) ? a.p.subGridRowExpanded
                                  .call(a, s + "_" + m, m)
                                  : x(r);
                              b(this)
                                  .html(
                                      "<a href='javascript:void(0);'><span class='ui-icon ui-icon-minus'></span></a>")
                                  .removeClass("sgcollapsed").addClass(
                                      "sgexpanded")
                            } else if (b(this).hasClass("sgexpanded")) {
                              p = true;
                              if (b.isFunction(a.p.subGridRowColapsed)) {
                                r = b(this).parent();
                                m = b(r).attr("id");
                                p = a.p.subGridRowColapsed.call(a, s + "_" + m,
                                    m)
                              }
                              if (p === false)
                                return false;
                              b(this).parent().next().remove(".ui-subgrid");
                              b(this)
                                  .html(
                                      "<a href='javascript:void(0);'><span class='ui-icon ui-icon-plus'></span></a>")
                                  .removeClass("sgexpanded").addClass(
                                      "sgcollapsed")
                            }
                            return false
                          });
                  a.subGridXml = function(g, j) {
                    o(g, j)
                  };
                  a.subGridJson = function(g, j) {
                    u(g, j)
                  }
                }
              })
        },
        expandSubGridRow : function(e) {
          return this.each(function() {
            var c = this;
            if (c.grid || e)
              if (c.p.subGrid === true)
                if (c = b(this).jqGrid("getInd", e, true))
                  (c = b("td.sgcollapsed", c)[0]) && b(c).trigger("click")
          })
        },
        collapseSubGridRow : function(e) {
          return this.each(function() {
            var c = this;
            if (c.grid || e)
              if (c.p.subGrid === true)
                if (c = b(this).jqGrid("getInd", e, true))
                  (c = b("td.sgexpanded", c)[0]) && b(c).trigger("click")
          })
        },
        toggleSubGridRow : function(e) {
          return this.each(function() {
            var c = this;
            if (c.grid || e)
              if (c.p.subGrid === true)
                if (c = b(this).jqGrid("getInd", e, true)) {
                  var a = b("td.sgcollapsed", c)[0];
                  if (a)
                    b(a).trigger("click");
                  else
                    (a = b("td.sgexpanded", c)[0]) && b(a).trigger("click")
                }
          })
        }
      })
})(jQuery);
(function(f) {
  f.jgrid
      .extend({
        groupingSetup : function() {
          return this
              .each(function() {
                var b = this, c = b.p.groupingView;
                if (c !== null && (typeof c === "object" || f.isFunction(c)))
                  if (c.groupField.length) {
                    for ( var a = 0; a < c.groupField.length; a++) {
                      c.groupOrder[a] || (c.groupOrder[a] = "asc");
                      c.groupText[a] || (c.groupText[a] = "{0}");
                      if (typeof c.groupColumnShow[a] != "boolean")
                        c.groupColumnShow[a] = true;
                      if (typeof c.groupSummary[a] != "boolean")
                        c.groupSummary[a] = false;
                      c.groupColumnShow[a] === true ? f(b).jqGrid("showCol",
                          c.groupField[a]) : f(b).jqGrid("hideCol",
                          c.groupField[a]);
                      c.sortitems[a] = [];
                      c.sortnames[a] = [];
                      c.summaryval[a] = [];
                      if (c.groupSummary[a]) {
                        c.summary[a] = [];
                        for ( var d = b.p.colModel, e = 0, g = d.length; e < g; e++)
                          d[e].summaryType && c.summary[a].push({
                            nm : d[e].name,
                            st : d[e].summaryType,
                            v : ""
                          })
                      }
                    }
                    b.p.scroll = false;
                    b.p.rownumbers = false;
                    b.p.subGrid = false;
                    b.p.treeGrid = false;
                    b.p.gridview = true
                  } else
                    b.p.grouping = false;
                else
                  b.p.grouping = false
              })
        },
        groupingPrepare : function(b, c, a, d) {
          this
              .each(function() {
                var e = c[0] ? c[0].toString().split(" ").join("") : "", g = this.p.groupingView, j = this;
                if (a.hasOwnProperty(e))
                  a[e].push(b);
                else {
                  a[e] = [];
                  a[e].push(b);
                  g.sortitems[0].push(e);
                  g.sortnames[0].push(f.trim(c[0].toString()));
                  g.summaryval[0][e] = f.extend(true, {}, g.summary[0])
                }
                g.groupSummary[0]
                    && f.each(g.summaryval[0][e], function() {
                      this.v = f.isFunction(this.st) ? this.st.call(j, this.v,
                          this.nm, d) : f(j)
                          .jqGrid("groupingCalculations." + this.st, this.v,
                              this.nm, d)
                    })
              });
          return a
        },
        groupingToggle : function(b) {
          this.each(function() {
            var c = this.p.groupingView, a = b.lastIndexOf("_"), d = b
                .substring(0, a + 1);
            a = parseInt(b.substring(a + 1), 10) + 1;
            var e = c.minusicon, g = c.plusicon;
            if (f("#" + b + " span").hasClass(e)) {
              c.showSummaryOnHide && c.groupSummary[0] ? f("#" + b).nextUntil(
                  ".jqfoot").hide() : f("#" + b).nextUntil("#" + d + String(a))
                  .hide();
              f("#" + b + " span").removeClass(e).addClass(g)
            } else {
              f("#" + b).nextUntil("#" + d + String(a)).show();
              f("#" + b + " span").removeClass(g).addClass(e)
            }
          });
          return false
        },
        groupingRender : function(b, c) {
          return this
              .each(function() {
                var a = this, d = a.p.groupingView, e = "", g = "", j, l = "";
                if (!d.groupDataSorted) {
                  d.sortitems[0].sort();
                  d.sortnames[0].sort();
                  if (d.groupOrder[0].toLowerCase() == "desc") {
                    d.sortitems[0].reverse();
                    d.sortnames[0].reverse()
                  }
                }
                l = d.groupCollapse ? d.plusicon : d.minusicon;
                l += " tree-wrap-" + a.p.direction;
                f
                    .each(
                        d.sortitems[0],
                        function(h, k) {
                          j = a.p.id + "ghead_" + h;
                          g = "<span style='cursor:pointer;' class='ui-icon "
                              + l + "' onclick=\"jQuery('#" + a.p.id
                              + "').jqGrid('groupingToggle','" + j
                              + "');return false;\"></span>";
                          e += '<tr id="'
                              + j
                              + '" role="row" class= "ui-widget-content jqgroup ui-row-'
                              + a.p.direction
                              + '"><td colspan="'
                              + c
                              + '">'
                              + g
                              + f.jgrid.format(d.groupText[0],
                                  d.sortnames[0][h], b[k].length)
                              + "</td></tr>";
                          for (h = 0; h < b[k].length; h++)
                            e += b[k][h].join("");
                          if (d.groupSummary[0]) {
                            h = "";
                            if (d.groupCollapse && !d.showSummaryOnHide)
                              h = ' style="display:none;"';
                            e += "<tr"
                                + h
                                + ' role="row" class="ui-widget-content jqfoot ui-row-'
                                + a.p.direction + '">';
                            h = d.summaryval[0][k];
                            for ( var m = a.p.colModel, n, o = b[k].length, i = 0; i < c; i++) {
                              var p = "<td " + a.formatCol(i, 1, "")
                                  + ">&#160;</td>", q = "{0}";
                              f.each(h, function() {
                                if (this.nm == m[i].name) {
                                  if (m[i].summaryTpl)
                                    q = m[i].summaryTpl;
                                  if (this.st == "avg")
                                    if (this.v && o > 0)
                                      this.v /= o;
                                  try {
                                    n = a.formatter("", this.v, i, this)
                                  } catch (r) {
                                    n = this.v
                                  }
                                  p = "<td " + a.formatCol(i, 1, "") + ">"
                                      + f.jgrid.format(q, n) + "</td>";
                                  return false
                                }
                              });
                              e += p
                            }
                            e += "</tr>"
                          }
                        });
                f("#" + a.p.id + " tbody:first").append(e);
                e = null
              })
        },
        groupingGroupBy : function(b, c) {
          return this.each(function() {
            var a = this;
            if (typeof b == "string")
              b = [ b ];
            var d = a.p.groupingView;
            a.p.grouping = true;
            for ( var e = 0; e < d.groupField.length; e++)
              d.groupColumnShow[e] || f(a).jqGrid("showCol", d.groupField[e]);
            a.p.groupingView = f.extend(a.p.groupingView, c || {});
            d.groupField = b;
            f(a).trigger("reloadGrid")
          })
        },
        groupingRemove : function(b) {
          return this.each(function() {
            var c = this;
            if (typeof b == "undefined")
              b = true;
            c.p.grouping = false;
            b === true ? f("tr.jqgroup, tr.jqfoot",
                "#" + c.p.id + " tbody:first").remove() : f(c).trigger(
                "reloadGrid")
          })
        },
        groupingCalculations : {
          sum : function(b, c, a) {
            return parseFloat(b || 0) + parseFloat(a[c] || 0)
          },
          min : function(b, c, a) {
            if (b === "")
              return parseFloat(a[c] || 0);
            return Math.min(parseFloat(b), parseFloat(a[c] || 0))
          },
          max : function(b, c, a) {
            if (b === "")
              return parseFloat(a[c] || 0);
            return Math.max(parseFloat(b), parseFloat(a[c] || 0))
          },
          count : function(b, c, a) {
            if (b === "")
              b = 0;
            return a.hasOwnProperty(c) ? b + 1 : 0
          },
          avg : function(b, c, a) {
            return parseFloat(b || 0) + parseFloat(a[c] || 0)
          }
        }
      })
})(jQuery);
(function(d) {
  d.jgrid
      .extend({
        setTreeNode : function(b, c) {
          return this
              .each(function() {
                var a = this;
                if (a.grid && a.p.treeGrid) {
                  var f = a.p.expColInd, e = a.p.treeReader.expanded_field, k = a.p.treeReader.leaf_field, j = a.p.treeReader.level_field;
                  c.level = b[j];
                  if (a.p.treeGridModel == "nested") {
                    var i = b[a.p.treeReader.left_field], h = b[a.p.treeReader.right_field];
                    b[k]
                        || (b[k] = parseInt(h, 10) === parseInt(i, 10) + 1 ? "true"
                            : "false")
                  }
                  h = parseInt(b[j], 10);
                  if (a.p.tree_root_level === 0) {
                    i = h + 1;
                    h = h
                  } else {
                    i = h;
                    h = h - 1
                  }
                  i = "<div class='tree-wrap tree-wrap-" + a.p.direction
                      + "' style='width:" + i * 18 + "px;'>";
                  i += "<div style='"
                      + (a.p.direction == "rtl" ? "right:" : "left:") + h * 18
                      + "px;' class='ui-icon ";
                  if (b[k] == "true" || b[k] === true) {
                    i += a.p.treeIcons.leaf + " tree-leaf'";
                    b[k] = true;
                    b[e] = false
                  } else {
                    if (b[e] == "true" || b[e] === true) {
                      i += a.p.treeIcons.minus + " tree-minus treeclick'";
                      b[e] = true
                    } else {
                      i += a.p.treeIcons.plus + " tree-plus treeclick'";
                      b[e] = false
                    }
                    b[k] = false
                  }
                  i += "</div></div>";
                  if (!a.p.loadonce) {
                    b[a.p.localReader.id] = c.id;
                    a.p.data.push(b);
                    a.p._index[c.id] = a.p.data.length - 1
                  }
                  if (parseInt(b[j], 10) !== parseInt(a.p.tree_root_level, 10))
                    d(a).jqGrid("isVisibleNode", b)
                        || d(c).css("display", "none");
                  d("td:eq(" + f + ")", c).wrapInner("<span></span>")
                      .prepend(i);
                  d(".treeclick", c).bind(
                      "click",
                      function(g) {
                        g = d(g.target || g.srcElement, a.rows).closest(
                            "tr.jqgrow")[0].id;
                        g = a.p._index[g];
                        var l = a.p.treeReader.expanded_field;
                        if (!a.p.data[g][a.p.treeReader.leaf_field])
                          if (a.p.data[g][l]) {
                            d(a).jqGrid("collapseRow", a.p.data[g]);
                            d(a).jqGrid("collapseNode", a.p.data[g])
                          } else {
                            d(a).jqGrid("expandRow", a.p.data[g]);
                            d(a).jqGrid("expandNode", a.p.data[g])
                          }
                        return false
                      });
                  a.p.ExpandColClick === true
                      && d("span", c)
                          .css("cursor", "pointer")
                          .bind(
                              "click",
                              function(g) {
                                g = d(g.target || g.srcElement, a.rows)
                                    .closest("tr.jqgrow")[0].id;
                                var l = a.p._index[g], m = a.p.treeReader.expanded_field;
                                if (!a.p.data[l][a.p.treeReader.leaf_field])
                                  if (a.p.data[l][m]) {
                                    d(a).jqGrid("collapseRow", a.p.data[l]);
                                    d(a).jqGrid("collapseNode", a.p.data[l])
                                  } else {
                                    d(a).jqGrid("expandRow", a.p.data[l]);
                                    d(a).jqGrid("expandNode", a.p.data[l])
                                  }
                                d(a).jqGrid("setSelection", g);
                                return false
                              })
                }
              })
        },
        setTreeGrid : function() {
          return this.each(function() {
            var b = this, c = 0;
            if (b.p.treeGrid) {
              b.p.treedatatype || d.extend(b.p, {
                treedatatype : b.p.datatype
              });
              b.p.subGrid = false;
              b.p.altRows = false;
              b.p.pgbuttons = false;
              b.p.pginput = false;
              b.p.multiselect = false;
              b.p.rowList = [];
              b.p.treeIcons = d.extend({
                plus : "ui-icon-triangle-1-"
                    + (b.p.direction == "rtl" ? "w" : "e"),
                minus : "ui-icon-triangle-1-s",
                leaf : "ui-icon-radio-off"
              }, b.p.treeIcons || {});
              if (b.p.treeGridModel == "nested")
                b.p.treeReader = d.extend({
                  level_field : "level",
                  left_field : "lft",
                  right_field : "rgt",
                  leaf_field : "isLeaf",
                  expanded_field : "expanded"
                }, b.p.treeReader);
              else if (b.p.treeGridModel == "adjacency")
                b.p.treeReader = d.extend({
                  level_field : "level",
                  parent_id_field : "parent",
                  leaf_field : "isLeaf",
                  expanded_field : "expanded"
                }, b.p.treeReader);
              for ( var a in b.p.colModel)
                if (b.p.colModel.hasOwnProperty(a)) {
                  if (b.p.colModel[a].name == b.p.ExpandColumn) {
                    b.p.expColInd = c;
                    break
                  }
                  c++
                }
              if (!b.p.expColInd)
                b.p.expColInd = 0;
              d.each(b.p.treeReader, function(f, e) {
                if (e) {
                  b.p.colNames.push(e);
                  b.p.colModel.push({
                    name : e,
                    width : 1,
                    hidden : true,
                    sortable : false,
                    resizable : false,
                    hidedlg : true,
                    editable : true,
                    search : false
                  })
                }
              })
            }
          })
        },
        expandRow : function(b) {
          this
              .each(function() {
                var c = this;
                if (c.grid && c.p.treeGrid) {
                  var a = d(c).jqGrid("getNodeChildren", b), f = c.p.treeReader.expanded_field;
                  d(a).each(function() {
                    var e = d.jgrid.getAccessor(this, c.p.localReader.id);
                    d("#" + e, c.grid.bDiv).css("display", "");
                    this[f] && d(c).jqGrid("expandRow", this)
                  })
                }
              })
        },
        collapseRow : function(b) {
          this
              .each(function() {
                var c = this;
                if (c.grid && c.p.treeGrid) {
                  var a = d(c).jqGrid("getNodeChildren", b), f = c.p.treeReader.expanded_field;
                  d(a).each(function() {
                    var e = d.jgrid.getAccessor(this, c.p.localReader.id);
                    d("#" + e, c.grid.bDiv).css("display", "none");
                    this[f] && d(c).jqGrid("collapseRow", this)
                  })
                }
              })
        },
        getRootNodes : function() {
          var b = [];
          this.each(function() {
            var c = this;
            if (c.grid && c.p.treeGrid)
              switch (c.p.treeGridModel) {
              case "nested":
                var a = c.p.treeReader.level_field;
                d(c.p.data).each(
                    function() {
                      parseInt(this[a], 10) === parseInt(c.p.tree_root_level,
                          10)
                          && b.push(this)
                    });
                break;
              case "adjacency":
                var f = c.p.treeReader.parent_id_field;
                d(c.p.data).each(
                    function() {
                      if (this[f] === null
                          || String(this[f]).toLowerCase() == "null")
                        b.push(this)
                    });
                break
              }
          });
          return b
        },
        getNodeDepth : function(b) {
          var c = null;
          this.each(function() {
            if (this.grid && this.p.treeGrid) {
              var a = this;
              switch (a.p.treeGridModel) {
              case "nested":
                c = parseInt(b[a.p.treeReader.level_field], 10)
                    - parseInt(a.p.tree_root_level, 10);
                break;
              case "adjacency":
                c = d(a).jqGrid("getNodeAncestors", b).length;
                break
              }
            }
          });
          return c
        },
        getNodeParent : function(b) {
          var c = null;
          this
              .each(function() {
                var a = this;
                if (a.grid && a.p.treeGrid)
                  switch (a.p.treeGridModel) {
                  case "nested":
                    var f = a.p.treeReader.left_field, e = a.p.treeReader.right_field, k = a.p.treeReader.level_field, j = parseInt(
                        b[f], 10), i = parseInt(b[e], 10), h = parseInt(b[k],
                        10);
                    d(this.p.data).each(
                        function() {
                          if (parseInt(this[k], 10) === h - 1
                              && parseInt(this[f], 10) < j
                              && parseInt(this[e], 10) > i) {
                            c = this;
                            return false
                          }
                        });
                    break;
                  case "adjacency":
                    var g = a.p.treeReader.parent_id_field, l = a.p.localReader.id;
                    d(this.p.data).each(function() {
                      if (this[l] == b[g]) {
                        c = this;
                        return false
                      }
                    });
                    break
                  }
              });
          return c
        },
        getNodeChildren : function(b) {
          var c = [];
          this
              .each(function() {
                var a = this;
                if (a.grid && a.p.treeGrid)
                  switch (a.p.treeGridModel) {
                  case "nested":
                    var f = a.p.treeReader.left_field, e = a.p.treeReader.right_field, k = a.p.treeReader.level_field, j = parseInt(
                        b[f], 10), i = parseInt(b[e], 10), h = parseInt(b[k],
                        10);
                    d(this.p.data).each(
                        function() {
                          parseInt(this[k], 10) === h + 1
                              && parseInt(this[f], 10) > j
                              && parseInt(this[e], 10) < i && c.push(this)
                        });
                    break;
                  case "adjacency":
                    var g = a.p.treeReader.parent_id_field, l = a.p.localReader.id;
                    d(this.p.data).each(function() {
                      this[g] == b[l] && c.push(this)
                    });
                    break
                  }
              });
          return c
        },
        getFullTreeNode : function(b) {
          var c = [];
          this
              .each(function() {
                var a = this, f;
                if (a.grid && a.p.treeGrid)
                  switch (a.p.treeGridModel) {
                  case "nested":
                    var e = a.p.treeReader.left_field, k = a.p.treeReader.right_field, j = a.p.treeReader.level_field, i = parseInt(
                        b[e], 10), h = parseInt(b[k], 10), g = parseInt(b[j],
                        10);
                    d(this.p.data).each(
                        function() {
                          parseInt(this[j], 10) >= g
                              && parseInt(this[e], 10) >= i
                              && parseInt(this[e], 10) <= h && c.push(this)
                        });
                    break;
                  case "adjacency":
                    c.push(b);
                    var l = a.p.treeReader.parent_id_field, m = a.p.localReader.id;
                    d(this.p.data).each(function(n) {
                      f = c.length;
                      for (n = 0; n < f; n++)
                        if (c[n][m] == this[l]) {
                          c.push(this);
                          break
                        }
                    });
                    break
                  }
              });
          return c
        },
        getNodeAncestors : function(b) {
          var c = [];
          this.each(function() {
            if (this.grid && this.p.treeGrid)
              for ( var a = d(this).jqGrid("getNodeParent", b); a;) {
                c.push(a);
                a = d(this).jqGrid("getNodeParent", a)
              }
          });
          return c
        },
        isVisibleNode : function(b) {
          var c = true;
          this
              .each(function() {
                var a = this;
                if (a.grid && a.p.treeGrid) {
                  var f = d(a).jqGrid("getNodeAncestors", b), e = a.p.treeReader.expanded_field;
                  d(f).each(function() {
                    c = c && this[e];
                    if (!c)
                      return false
                  })
                }
              });
          return c
        },
        isNodeLoaded : function(b) {
          var c;
          this.each(function() {
            var a = this;
            if (a.grid && a.p.treeGrid) {
              var f = a.p.treeReader.leaf_field;
              c = b.loaded !== undefined ? b.loaded : b[f]
                  || d(a).jqGrid("getNodeChildren", b).length > 0 ? true
                  : false
            }
          });
          return c
        },
        expandNode : function(b) {
          return this.each(function() {
            if (this.grid && this.p.treeGrid) {
              var c = this.p.treeReader.expanded_field;
              if (!b[c]) {
                var a = d.jgrid.getAccessor(b, this.p.localReader.id), f = d(
                    "#" + a, this.grid.bDiv)[0], e = this.p._index[a];
                if (d(this).jqGrid("isNodeLoaded", this.p.data[e])) {
                  b[c] = true;
                  d("div.treeclick", f).removeClass(
                      this.p.treeIcons.plus + " tree-plus").addClass(
                      this.p.treeIcons.minus + " tree-minus")
                } else {
                  b[c] = true;
                  d("div.treeclick", f).removeClass(
                      this.p.treeIcons.plus + " tree-plus").addClass(
                      this.p.treeIcons.minus + " tree-minus");
                  this.p.treeANode = f.rowIndex;
                  this.p.datatype = this.p.treedatatype;
                  this.p.treeGridModel == "nested" ? d(this).jqGrid(
                      "setGridParam", {
                        postData : {
                          nodeid : a,
                          n_left : b.lft,
                          n_right : b.rgt,
                          n_level : b.level
                        }
                      }) : d(this).jqGrid("setGridParam", {
                    postData : {
                      nodeid : a,
                      parentid : b.parent_id,
                      n_level : b.level
                    }
                  });
                  d(this).trigger("reloadGrid");
                  this.p.treeGridModel == "nested" ? d(this).jqGrid(
                      "setGridParam", {
                        postData : {
                          nodeid : "",
                          n_left : "",
                          n_right : "",
                          n_level : ""
                        }
                      }) : d(this).jqGrid("setGridParam", {
                    postData : {
                      nodeid : "",
                      parentid : "",
                      n_level : ""
                    }
                  })
                }
              }
            }
          })
        },
        collapseNode : function(b) {
          return this.each(function() {
            if (this.grid && this.p.treeGrid)
              if (b.expanded) {
                b.expanded = false;
                var c = d.jgrid.getAccessor(b, this.p.localReader.id);
                c = d("#" + c, this.grid.bDiv)[0];
                d("div.treeclick", c).removeClass(
                    this.p.treeIcons.minus + " tree-minus").addClass(
                    this.p.treeIcons.plus + " tree-plus")
              }
          })
        },
        SortTree : function(b, c, a, f) {
          return this.each(function() {
            if (this.grid && this.p.treeGrid) {
              var e, k, j, i = [], h = this, g;
              e = d(this).jqGrid("getRootNodes");
              e = d.jgrid.from(e);
              e.orderBy(b, c, a, f);
              g = e.select();
              e = 0;
              for (k = g.length; e < k; e++) {
                j = g[e];
                i.push(j);
                d(this).jqGrid("collectChildrenSortTree", i, j, b, c, a, f)
              }
              d.each(i, function(l) {
                var m = d.jgrid.getAccessor(this, h.p.localReader.id);
                if (l === 0) {
                  l = d("#" + m, h.grid.bDiv);
                  d("td", l).each(function(n) {
                    d(this).css("width", h.grid.headers[n].width + "px")
                  });
                  h.grid.cols = l[0].cells
                }
                d("tbody", h.grid.bDiv).append(d("#" + m, h.grid.bDiv))
              });
              i = g = e = null
            }
          })
        },
        collectChildrenSortTree : function(b, c, a, f, e, k) {
          return this.each(function() {
            if (this.grid && this.p.treeGrid) {
              var j, i, h, g;
              j = d(this).jqGrid("getNodeChildren", c);
              j = d.jgrid.from(j);
              j.orderBy(a, f, e, k);
              g = j.select();
              j = 0;
              for (i = g.length; j < i; j++) {
                h = g[j];
                b.push(h);
                d(this).jqGrid("collectChildrenSortTree", b, h, a, f, e, k)
              }
            }
          })
        },
        setTreeRow : function(b, c) {
          var a = false;
          this.each(function() {
            var f = this;
            if (f.grid && f.p.treeGrid)
              a = d(f).jqGrid("setRowData", b, c)
          });
          return a
        },
        delTreeNode : function(b) {
          return this.each(function() {
            var c = this;
            if (c.grid && c.p.treeGrid) {
              var a = d(c).jqGrid("getInd", b, true);
              if (a) {
                var f = d(c).jqGrid("getNodeChildren", a);
                if (f.length > 0)
                  for ( var e = 0; e < f.length; e++)
                    d(c).jqGrid("delRowData", f[e].id);
                d(c).jqGrid("delRowData", a.id)
              }
            }
          })
        }
      })
})(jQuery);
(function(b) {
  b.jgrid.extend({
    jqGridImport : function(a) {
      a = b.extend({
        imptype : "xml",
        impstring : "",
        impurl : "",
        mtype : "GET",
        impData : {},
        xmlGrid : {
          config : "roots>grid",
          data : "roots>rows"
        },
        jsonGrid : {
          config : "grid",
          data : "data"
        },
        ajaxOptions : {}
      }, a || {});
      return this.each(function() {
        var d = this, c = function(e, g) {
          var f = b(g.xmlGrid.config, e)[0];
          g = b(g.xmlGrid.data, e)[0];
          var k;
          if (xmlJsonClass.xml2json && b.jgrid.parse) {
            f = xmlJsonClass.xml2json(f, " ");
            f = b.jgrid.parse(f);
            for ( var h in f)
              if (f.hasOwnProperty(h))
                k = f[h];
            if (g) {
              h = f.grid.datatype;
              f.grid.datatype = "xmlstring";
              f.grid.datastr = e;
              b(d).jqGrid(k).jqGrid("setGridParam", {
                datatype : h
              })
            } else
              b(d).jqGrid(k)
          } else
            alert("xml2json or parse are not present")
        }, i = function(e, g) {
          if (e && typeof e == "string") {
            var f = b.jgrid.parse(e);
            e = f[g.jsonGrid.config];
            if (g = f[g.jsonGrid.data]) {
              f = e.datatype;
              e.datatype = "jsonstring";
              e.datastr = g;
              b(d).jqGrid(e).jqGrid("setGridParam", {
                datatype : f
              })
            } else
              b(d).jqGrid(e)
          }
        };
        switch (a.imptype) {
        case "xml":
          b.ajax(b.extend({
            url : a.impurl,
            type : a.mtype,
            data : a.impData,
            dataType : "xml",
            complete : function(e, g) {
              if (g == "success") {
                c(e.responseXML, a);
                b.isFunction(a.importComplete) && a.importComplete(e)
              }
            }
          }, a.ajaxOptions));
          break;
        case "xmlstring":
          if (a.impstring && typeof a.impstring == "string") {
            var j = b.jgrid.stringToDoc(a.impstring);
            if (j) {
              c(j, a);
              b.isFunction(a.importComplete) && a.importComplete(j);
              a.impstring = null
            }
            j = null
          }
          break;
        case "json":
          b.ajax(b.extend({
            url : a.impurl,
            type : a.mtype,
            data : a.impData,
            dataType : "json",
            complete : function(e, g) {
              if (g == "success") {
                i(e.responseText, a);
                b.isFunction(a.importComplete) && a.importComplete(e)
              }
            }
          }, a.ajaxOptions));
          break;
        case "jsonstring":
          if (a.impstring && typeof a.impstring == "string") {
            i(a.impstring, a);
            b.isFunction(a.importComplete) && a.importComplete(a.impstring);
            a.impstring = null
          }
          break
        }
      })
    },
    jqGridExport : function(a) {
      a = b.extend({
        exptype : "xmlstring",
        root : "grid",
        ident : "\t"
      }, a || {});
      var d = null;
      this.each(function() {
        if (this.grid) {
          var c = b.extend({}, b(this).jqGrid("getGridParam"));
          if (c.rownumbers) {
            c.colNames.splice(0, 1);
            c.colModel.splice(0, 1)
          }
          if (c.multiselect) {
            c.colNames.splice(0, 1);
            c.colModel.splice(0, 1)
          }
          if (c.subGrid) {
            c.colNames.splice(0, 1);
            c.colModel.splice(0, 1)
          }
          c.knv = null;
          if (c.treeGrid)
            for ( var i in c.treeReader)
              if (c.treeReader.hasOwnProperty(i)) {
                c.colNames.splice(c.colNames.length - 1);
                c.colModel.splice(c.colModel.length - 1)
              }
          switch (a.exptype) {
          case "xmlstring":
            d = "<" + a.root + ">" + xmlJsonClass.json2xml(c, a.ident) + "</"
                + a.root + ">";
            break;
          case "jsonstring":
            d = "{" + xmlJsonClass.toJson(c, a.root, a.ident) + "}";
            if (c.postData.filters !== undefined) {
              d = d.replace(/filters":"/, 'filters":');
              d = d.replace(/}]}"/, "}]}")
            }
            break
          }
        }
      });
      return d
    },
    excelExport : function(a) {
      a = b.extend({
        exptype : "remote",
        url : null,
        oper : "oper",
        tag : "excel",
        exportOptions : {}
      }, a || {});
      return this.each(function() {
        if (this.grid) {
          var d;
          if (a.exptype == "remote") {
            d = b.extend({}, this.p.postData);
            d[a.oper] = a.tag;
            d = jQuery.param(d);
            d = a.url.indexOf("?") != -1 ? a.url + "&" + d : a.url + "?" + d;
            window.location = d
          }
        }
      })
    }
  })
})(jQuery);
var xmlJsonClass = {
  xml2json : function(a, b) {
    if (a.nodeType === 9)
      a = a.documentElement;
    a = this.toJson(this.toObj(this.removeWhite(a)), a.nodeName, "\t");
    return "{\n" + b + (b ? a.replace(/\t/g, b) : a.replace(/\t|\n/g, ""))
        + "\n}"
  },
  json2xml : function(a, b) {
    var g = function(d, c, j) {
      var i = "", k, h;
      if (d instanceof Array)
        if (d.length === 0)
          i += j + "<" + c + ">__EMPTY_ARRAY_</" + c + ">\n";
        else {
          k = 0;
          for (h = d.length; k < h; k += 1) {
            var l = j + g(d[k], c, j + "\t") + "\n";
            i += l
          }
        }
      else if (typeof d === "object") {
        k = false;
        i += j + "<" + c;
        for (h in d)
          if (d.hasOwnProperty(h))
            if (h.charAt(0) === "@")
              i += " " + h.substr(1) + '="' + d[h].toString() + '"';
            else
              k = true;
        i += k ? ">" : "/>";
        if (k) {
          for (h in d)
            if (d.hasOwnProperty(h))
              if (h === "#text")
                i += d[h];
              else if (h === "#cdata")
                i += "<![CDATA[" + d[h] + "]]\>";
              else if (h.charAt(0) !== "@")
                i += g(d[h], h, j + "\t");
          i += (i.charAt(i.length - 1) === "\n" ? j : "") + "</" + c + ">"
        }
      } else
        i += typeof d === "function" ? j + "<" + c + "><![CDATA[" + d
            + "]]\></" + c + ">" : d.toString() === '""'
            || d.toString().length === 0 ? j + "<" + c + ">__EMPTY_STRING_</"
            + c + ">" : j + "<" + c + ">" + d.toString() + "</" + c + ">";
      return i
    }, e = "", f;
    for (f in a)
      if (a.hasOwnProperty(f))
        e += g(a[f], f, "");
    return b ? e.replace(/\t/g, b) : e.replace(/\t|\n/g, "")
  },
  toObj : function(a) {
    var b = {}, g = /function/i;
    if (a.nodeType === 1) {
      if (a.attributes.length) {
        var e;
        for (e = 0; e < a.attributes.length; e += 1)
          b["@" + a.attributes[e].nodeName] = (a.attributes[e].nodeValue || "")
              .toString()
      }
      if (a.firstChild) {
        var f = e = 0, d = false, c;
        for (c = a.firstChild; c; c = c.nextSibling)
          if (c.nodeType === 1)
            d = true;
          else if (c.nodeType === 3 && c.nodeValue.match(/[^ \f\n\r\t\v]/))
            e += 1;
          else if (c.nodeType === 4)
            f += 1;
        if (d)
          if (e < 2 && f < 2) {
            this.removeWhite(a);
            for (c = a.firstChild; c; c = c.nextSibling)
              if (c.nodeType === 3)
                b["#text"] = this.escape(c.nodeValue);
              else if (c.nodeType === 4)
                if (g.test(c.nodeValue))
                  b[c.nodeName] = [ b[c.nodeName], c.nodeValue ];
                else
                  b["#cdata"] = this.escape(c.nodeValue);
              else if (b[c.nodeName])
                if (b[c.nodeName] instanceof Array)
                  b[c.nodeName][b[c.nodeName].length] = this.toObj(c);
                else
                  b[c.nodeName] = [ b[c.nodeName], this.toObj(c) ];
              else
                b[c.nodeName] = this.toObj(c)
          } else if (a.attributes.length)
            b["#text"] = this.escape(this.innerXml(a));
          else
            b = this.escape(this.innerXml(a));
        else if (e)
          if (a.attributes.length)
            b["#text"] = this.escape(this.innerXml(a));
          else {
            b = this.escape(this.innerXml(a));
            if (b === "__EMPTY_ARRAY_")
              b = "[]";
            else if (b === "__EMPTY_STRING_")
              b = ""
          }
        else if (f)
          if (f > 1)
            b = this.escape(this.innerXml(a));
          else
            for (c = a.firstChild; c; c = c.nextSibling)
              if (g.test(a.firstChild.nodeValue)) {
                b = a.firstChild.nodeValue;
                break
              } else
                b["#cdata"] = this.escape(c.nodeValue)
      }
      if (!a.attributes.length && !a.firstChild)
        b = null
    } else if (a.nodeType === 9)
      b = this.toObj(a.documentElement);
    else
      alert("unhandled node type: " + a.nodeType);
    return b
  },
  toJson : function(a, b, g) {
    var e = b ? '"' + b + '"' : "";
    if (a === "[]")
      e += b ? ":[]" : "[]";
    else if (a instanceof Array) {
      var f, d, c = [];
      d = 0;
      for (f = a.length; d < f; d += 1)
        c[d] = this.toJson(a[d], "", g + "\t");
      e += (b ? ":[" : "[")
          + (c.length > 1 ? "\n" + g + "\t" + c.join(",\n" + g + "\t") + "\n"
              + g : c.join("")) + "]"
    } else if (a === null)
      e += (b && ":") + "null";
    else if (typeof a === "object") {
      f = [];
      for (d in a)
        if (a.hasOwnProperty(d))
          f[f.length] = this.toJson(a[d], d, g + "\t");
      e += (b ? ":{" : "{")
          + (f.length > 1 ? "\n" + g + "\t" + f.join(",\n" + g + "\t") + "\n"
              + g : f.join("")) + "}"
    } else if (typeof a === "string") {
      g = /function/i;
      f = a.toString();
      e += /(^-?\d+\.?\d*$)/.test(f) || g.test(f) || f === "false"
          || f === "true" ? (b && ":") + f : (b && ":") + '"' + a + '"'
    } else
      e += (b && ":") + a.toString();
    return e
  },
  innerXml : function(a) {
    var b = "";
    if ("innerHTML" in a)
      b = a.innerHTML;
    else {
      var g = function(e) {
        var f = "", d;
        if (e.nodeType === 1) {
          f += "<" + e.nodeName;
          for (d = 0; d < e.attributes.length; d += 1)
            f += " " + e.attributes[d].nodeName + '="'
                + (e.attributes[d].nodeValue || "").toString() + '"';
          if (e.firstChild) {
            f += ">";
            for (d = e.firstChild; d; d = d.nextSibling)
              f += g(d);
            f += "</" + e.nodeName + ">"
          } else
            f += "/>"
        } else if (e.nodeType === 3)
          f += e.nodeValue;
        else if (e.nodeType === 4)
          f += "<![CDATA[" + e.nodeValue + "]]\>";
        return f
      };
      for (a = a.firstChild; a; a = a.nextSibling)
        b += g(a)
    }
    return b
  },
  escape : function(a) {
    return a.replace(/[\\]/g, "\\\\").replace(/[\"]/g, '\\"').replace(/[\n]/g,
        "\\n").replace(/[\r]/g, "\\r")
  },
  removeWhite : function(a) {
    a.normalize();
    var b;
    for (b = a.firstChild; b;)
      if (b.nodeType === 3)
        if (b.nodeValue.match(/[^ \f\n\r\t\v]/))
          b = b.nextSibling;
        else {
          var g = b.nextSibling;
          a.removeChild(b);
          b = g
        }
      else {
        b.nodeType === 1 && this.removeWhite(b);
        b = b.nextSibling
      }
    return a
  }
};
(function(b) {
  b.jgrid
      .extend({
        setColumns : function(a) {
          a = b.extend({
            top : 0,
            left : 0,
            width : 200,
            height : "auto",
            dataheight : "auto",
            modal : false,
            drag : true,
            beforeShowForm : null,
            afterShowForm : null,
            afterSubmitForm : null,
            closeOnEscape : true,
            emptyrecords: "No records to view",
            ShrinkToFit : True,
            jqModal : false,
            saveicon : [ true, "left", "ui-icon-disk" ],
            closeicon : [ true, "left", "ui-icon-close" ],
            onClose : null,
            colnameview : true,
            closeAfterSubmit : true,
            updateAfterCheck : false,
            recreateForm : false
          }, b.jgrid.col, a || {});
          return this
              .each(function() {
                var c = this;
                if (c.grid) {
                  var j = typeof a.beforeShowForm === "function" ? true : false, k = typeof a.afterShowForm === "function" ? true
                      : false, l = typeof a.afterSubmitForm === "function" ? true
                      : false, e = c.p.id, d = "ColTbl_" + e, f = {
                    themodal : "colmod" + e,
                    modalhead : "colhd" + e,
                    modalcontent : "colcnt" + e,
                    scrollelm : d
                  };
                  a.recreateForm === true && b("#" + f.themodal).html() != null
                      && b("#" + f.themodal).remove();
                  if (b("#" + f.themodal).html() != null) {
                    j && a.beforeShowForm(b("#" + d));
                    viewModal("#" + f.themodal, {
                      gbox : "#gbox_" + e,
                      jqm : a.jqModal,
                      jqM : false,
                      modal : a.modal
                    })
                  } else {
                    var g = isNaN(a.dataheight) ? a.dataheight : a.dataheight
                        + "px";
                    g = "<div id='"
                        + d
                        + "' class='formdata' style='width:100%;overflow:auto;position:relative;height:"
                        + g + ";'>";
                    g += "<table class='ColTable' cellspacing='1' cellpading='2' border='0'><tbody>";
                    for (i = 0; i < this.p.colNames.length; i++)
                      c.p.colModel[i].hidedlg
                          || (g += "<tr><td style='white-space: pre;'><input type='checkbox' style='margin-right:5px;' id='col_"
                              + this.p.colModel[i].name
                              + "' class='cbox' value='T' "
                              + (this.p.colModel[i].hidden === false ? "checked"
                                  : "")
                              + "/><label for='col_"
                              + this.p.colModel[i].name
                              + "'>"
                              + this.p.colNames[i]
                              + (a.colnameview ? " (" + this.p.colModel[i].name
                                  + ")" : "") + "</label></td></tr>");
                    g += "</tbody></table></div>";
                    g += "<table border='0' class='EditTable' id='"
                        + d
                        + "_2'><tbody><tr style='display:block;height:3px;'><td></td></tr><tr><td class='DataTD ui-widget-content'></td></tr><tr><td class='ColButton EditButton'>"
                        + (!a.updateAfterCheck ? "<a href='javascript:void(0)' id='dData' class='fm-button ui-state-default ui-corner-all'>"
                            + a.bSubmit + "</a>"
                            : "")
                        + "&#160;"
                        + ("<a href='javascript:void(0)' id='eData' class='fm-button ui-state-default ui-corner-all'>"
                            + a.bCancel + "</a>")
                        + "</td></tr></tbody></table>";
                    a.gbox = "#gbox_" + e;
                    createModal(f, g, a, "#gview_" + c.p.id, b("#gview_"
                        + c.p.id)[0]);
                    if (a.saveicon[0] == true)
                      b("#dData", "#" + d + "_2").addClass(
                          a.saveicon[1] == "right" ? "fm-button-icon-right"
                              : "fm-button-icon-left")
                          .append(
                              "<span class='ui-icon " + a.saveicon[2]
                                  + "'></span>");
                    if (a.closeicon[0] == true)
                      b("#eData", "#" + d + "_2").addClass(
                          a.closeicon[1] == "right" ? "fm-button-icon-right"
                              : "fm-button-icon-left").append(
                          "<span class='ui-icon " + a.closeicon[2]
                              + "'></span>");
                    a.updateAfterCheck ? b(":input", "#" + d).click(
                        function() {
                          var h = this.id.substr(4);
                          if (h) {
                            this.checked ? b(c).jqGrid("showCol", h) : b(c)
                                .jqGrid("hideCol", h);
                            a.ShrinkToFit === true
                                && b(c).jqGrid("setGridWidth",
                                    c.grid.width - 0.001, true)
                          }
                          return this
                        }) : b("#dData", "#" + d + "_2").click(
                        function() {
                          for (i = 0; i < c.p.colModel.length; i++)
                            if (!c.p.colModel[i].hidedlg) {
                              var h = c.p.colModel[i].name
                                  .replace(/\./g, "\\.");
                              if (b("#col_" + h, "#" + d).attr("checked")) {
                                b(c).jqGrid("showCol", c.p.colModel[i].name);
                                b("#col_" + h, "#" + d).attr("defaultChecked",
                                    true)
                              } else {
                                b(c).jqGrid("hideCol", c.p.colModel[i].name);
                                b("#col_" + h, "#" + d).attr("defaultChecked",
                                    "")
                              }
                            }
                          a.ShrinkToFit === true
                              && b(c).jqGrid("setGridWidth",
                                  c.grid.width - 0.001, true);
                          a.closeAfterSubmit && hideModal("#" + f.themodal, {
                            gb : "#gbox_" + e,
                            jqm : a.jqModal,
                            onClose : a.onClose
                          });
                          l && a.afterSubmitForm(b("#" + d));
                          return false
                        });
                    b("#eData", "#" + d + "_2").click(function() {
                      hideModal("#" + f.themodal, {
                        gb : "#gbox_" + e,
                        jqm : a.jqModal,
                        onClose : a.onClose
                      });
                      return false
                    });
                    b("#dData, #eData", "#" + d + "_2").hover(function() {
                      b(this).addClass("ui-state-hover")
                    }, function() {
                      b(this).removeClass("ui-state-hover")
                    });
                    j && a.beforeShowForm(b("#" + d));
                    viewModal("#" + f.themodal, {
                      gbox : "#gbox_" + e,
                      jqm : a.jqModal,
                      jqM : true,
                      modal : a.modal
                    })
                  }
                  k && a.afterShowForm(b("#" + d))
                }
              })
        }
      })
})(jQuery);
(function(c) {
  c.jgrid
      .extend({
        getPostData : function() {
          var a = this[0];
          if (a.grid)
            return a.p.postData
        },
        setPostData : function(a) {
          var b = this[0];
          if (b.grid)
            if (typeof a === "object")
              b.p.postData = a;
            else
              alert("Error: cannot add a non-object postData value. postData unchanged.")
        },
        appendPostData : function(a) {
          var b = this[0];
          if (b.grid)
            typeof a === "object" ? c.extend(b.p.postData, a)
                : alert("Error: cannot append a non-object postData value. postData unchanged.")
        },
        setPostDataItem : function(a, b) {
          var d = this[0];
          if (d.grid)
            d.p.postData[a] = b
        },
        getPostDataItem : function(a) {
          var b = this[0];
          if (b.grid)
            return b.p.postData[a]
        },
        removePostDataItem : function(a) {
          var b = this[0];
          b.grid && delete b.p.postData[a]
        },
        getUserData : function() {
          var a = this[0];
          if (a.grid)
            return a.p.userData
        },
        getUserDataItem : function(a) {
          var b = this[0];
          if (b.grid)
            return b.p.userData[a]
        }
      })
})(jQuery);
function tableToGrid(n, o) {
  jQuery(n).each(
      function() {
        if (!this.grid) {
          jQuery(this).width("99%");
          var a = jQuery(this).width(), d = jQuery(
              "input[type=checkbox]:first", jQuery(this)), b = jQuery(
              "input[type=radio]:first", jQuery(this));
          d = d.length > 0;
          b = !d && b.length > 0;
          var l = d || b, c = [], g = [];
          jQuery("th", jQuery(this)).each(
              function() {
                if (c.length === 0 && l) {
                  c.push({
                    name : "__selection__",
                    index : "__selection__",
                    width : 0,
                    hidden : true
                  });
                  g.push("__selection__")
                } else {
                  c.push({
                    name : jQuery(this).attr("id")
                        || jQuery.trim(
                            jQuery.jgrid.stripHtml(jQuery(this).html())).split(
                            " ").join("_"),
                    index : jQuery(this).attr("id")
                        || jQuery.trim(
                            jQuery.jgrid.stripHtml(jQuery(this).html())).split(
                            " ").join("_"),
                    width : jQuery(this).width() || 150
                  });
                  g.push(jQuery(this).html())
                }
              });
          var f = [], h = [], i = [];
          jQuery("tbody > tr", jQuery(this)).each(function() {
            var j = {}, e = 0;
            jQuery("td", jQuery(this)).each(function() {
              if (e === 0 && l) {
                var k = jQuery("input", jQuery(this)), m = k.attr("value");
                h.push(m || f.length);
                k.attr("checked") && i.push(m);
                j[c[e].name] = k.attr("value")
              } else
                j[c[e].name] = jQuery(this).html();
              e++
            });
            e > 0 && f.push(j)
          });
          jQuery(this).empty();
          jQuery(this).addClass("scroll");
          jQuery(this).jqGrid(jQuery.extend({
            datatype : "local",
            width : a,
            colNames : g,
            colModel : c,
            multiselect : d
          }, o || {}));
          for (a = 0; a < f.length; a++) {
            b = null;
            if (h.length > 0)
              if ((b = h[a]) && b.replace)
                b = encodeURIComponent(b).replace(/[.\-%]/g, "_");
            if (b === null)
              b = a + 1;
            jQuery(this).jqGrid("addRowData", b, f[a])
          }
          for (a = 0; a < i.length; a++)
            jQuery(this).jqGrid("setSelection", i[a])
        }
      })
};
(function(a) {
  if (a.browser.msie && a.browser.version == 8)
    a.expr[":"].hidden = function(b) {
      return b.offsetWidth === 0 || b.offsetHeight === 0
          || b.style.display == "none"
    };
  a.jgrid._multiselect = false;
  if (a.ui)
    if (a.ui.multiselect) {
      if (a.ui.multiselect.prototype._setSelected) {
        var q = a.ui.multiselect.prototype._setSelected;
        a.ui.multiselect.prototype._setSelected = function(b, j) {
          b = q.call(this, b, j);
          if (j && this.selectedList) {
            var c = this.element;
            this.selectedList.find("li").each(
                function() {
                  a(this).data("optionLink")
                      && a(this).data("optionLink").remove().appendTo(c)
                })
          }
          return b
        }
      }
      if (a.ui.multiselect.prototype.destroy)
        a.ui.multiselect.prototype.destroy = function() {
          this.element.show();
          this.container.remove();
          a.Widget === undefined ? a.widget.prototype.destroy.apply(this,
              arguments) : a.Widget.prototype.destroy.apply(this, arguments)
        };
      a.jgrid._multiselect = true
    }
  a.jgrid
      .extend({
        sortableColumns : function(b) {
          return this.each(function() {
            function j() {
              c.p.disableClick = true
            }
            var c = this, g = {
              tolerance : "pointer",
              axis : "x",
              scrollSensitivity : "1",
              items : ">th:not(:has(#jqgh_cb,#jqgh_rn,#jqgh_subgrid),:hidden)",
              placeholder : {
                element : function(e) {
                  return a(document.createElement(e[0].nodeName)).addClass(
                      e[0].className
                          + " ui-sortable-placeholder ui-state-highlight")
                      .removeClass("ui-sortable-helper")[0]
                },
                update : function(e, h) {
                  h.height(e.currentItem.innerHeight()
                      - parseInt(e.currentItem.css("paddingTop") || 0, 10)
                      - parseInt(e.currentItem.css("paddingBottom") || 0, 10));
                  h.width(e.currentItem.innerWidth()
                      - parseInt(e.currentItem.css("paddingLeft") || 0, 10)
                      - parseInt(e.currentItem.css("paddingRight") || 0, 10))
                }
              },
              update : function(e, h) {
                e = a(h.item).parent();
                e = a(">th", e);
                var i = {};
                a.each(c.p.colModel, function(m) {
                  i[this.name] = m
                });
                var l = [];
                e.each(function() {
                  var m = a(">div", this).get(0).id.replace(/^jqgh_/, "");
                  m in i && l.push(i[m])
                });
                a(c).jqGrid("remapColumns", l, true, true);
                a.isFunction(c.p.sortable.update) && c.p.sortable.update(l);
                setTimeout(function() {
                  c.p.disableClick = false
                }, 50)
              }
            };
            if (c.p.sortable.options)
              a.extend(g, c.p.sortable.options);
            else if (a.isFunction(c.p.sortable))
              c.p.sortable = {
                update : c.p.sortable
              };
            if (g.start) {
              var d = g.start;
              g.start = function(e, h) {
                j();
                d.call(this, e, h)
              }
            } else
              g.start = j;
            if (c.p.sortable.exclude)
              g.items += ":not(" + c.p.sortable.exclude + ")";
            b.sortable(g).data("sortable").floating = true
          })
        },
        columnChooser : function(b) {
          function j(f, k, p) {
            if (k >= 0) {
              var o = f.slice(), r = o.splice(k, Math.max(f.length - k, k));
              if (k > f.length)
                k = f.length;
              o[k] = p;
              return o.concat(r)
            }
          }
          function c(f, k) {
            if (f)
              if (typeof f == "string")
                a.fn[f] && a.fn[f].apply(k, a.makeArray(arguments).slice(2));
              else
                a.isFunction(f) && f.apply(k, a.makeArray(arguments).slice(2))
          }
          var g = this;
          if (!a("#colchooser_" + g[0].p.id).length) {
            var d = a('<div id="colchooser_'
                + g[0].p.id
                + '" style="position:relative;overflow:hidden"><div><select multiple="multiple"></select></div></div>'), e = a(
                "select", d);
            b = a.extend({
              width : 420,
              height : 240,
              classname : null,
              done : function(f) {
                f && g.jqGrid("remapColumns", f, true)
              },
              msel : "multiselect",
              dlog : "dialog",
              dlog_opts : function(f) {
                var k = {};
                k[f.bSubmit] = function() {
                  f.apply_perm();
                  f.cleanup(false)
                };
                k[f.bCancel] = function() {
                  f.cleanup(true)
                };
                return {
                  buttons : k,
                  close : function() {
                    f.cleanup(true)
                  },
                  modal : false,
                  resizable : false,
                  width : f.width + 20
                }
              },
              apply_perm : function() {
                a("option", e).each(
                    function() {
                      this.selected ? g.jqGrid("showCol", h[this.value].name)
                          : g.jqGrid("hideCol", h[this.value].name)
                    });
                var f = [];
                a("option[selected]", e).each(function() {
                  f.push(parseInt(this.value, 10))
                });
                a.each(f, function() {
                  delete l[h[parseInt(this, 10)].name]
                });
                a.each(l, function() {
                  var k = parseInt(this, 10);
                  f = j(f, k, k)
                });
                b.done && b.done.call(g, f)
              },
              cleanup : function(f) {
                c(b.dlog, d, "destroy");
                c(b.msel, e, "destroy");
                d.remove();
                f && b.done && b.done.call(g)
              },
              msel_opts : {}
            }, a.jgrid.col, b || {});
            if (a.ui)
              if (a.ui.multiselect)
                if (b.msel == "multiselect") {
                  if (!a.jgrid._multiselect) {
                    alert("Multiselect plugin loaded after jqGrid. Please load the plugin before the jqGrid!");
                    return
                  }
                  b.msel_opts = a
                      .extend(a.ui.multiselect.defaults, b.msel_opts)
                }
            b.caption && d.attr("title", b.caption);
            if (b.classname) {
              d.addClass(b.classname);
              e.addClass(b.classname)
            }
            if (b.width) {
              a(">div", d).css({
                width : b.width,
                margin : "0 auto"
              });
              e.css("width", b.width)
            }
            if (b.height) {
              a(">div", d).css("height", b.height);
              e.css("height", b.height - 10)
            }
            var h = g.jqGrid("getGridParam", "colModel"), i = g.jqGrid(
                "getGridParam", "colNames"), l = {}, m = [];
            e.empty();
            a.each(h, function(f) {
              l[this.name] = f;
              if (this.hidedlg)
                this.hidden || m.push(f);
              else
                e.append("<option value='" + f + "' "
                    + (this.hidden ? "" : "selected='selected'") + ">" + i[f]
                    + "</option>")
            });
            var n = a.isFunction(b.dlog_opts) ? b.dlog_opts.call(g, b)
                : b.dlog_opts;
            c(b.dlog, d, n);
            n = a.isFunction(b.msel_opts) ? b.msel_opts.call(g, b)
                : b.msel_opts;
            c(b.msel, e, n)
          }
        },
        sortableRows : function(b) {
          return this.each(function() {
            var j = this;
            if (j.grid)
              if (!j.p.treeGrid)
                if (a.fn.sortable) {
                  b = a.extend({
                    cursor : "move",
                    axis : "y",
                    items : ".jqgrow"
                  }, b || {});
                  if (b.start && a.isFunction(b.start)) {
                    b._start_ = b.start;
                    delete b.start
                  } else
                    b._start_ = false;
                  if (b.update && a.isFunction(b.update)) {
                    b._update_ = b.update;
                    delete b.update
                  } else
                    b._update_ = false;
                  b.start = function(c, g) {
                    a(g.item).css("border-width", "0px");
                    a("td", g.item).each(function(h) {
                      this.style.width = j.grid.cols[h].style.width
                    });
                    if (j.p.subGrid) {
                      var d = a(g.item).attr("id");
                      try {
                        a(j).jqGrid("collapseSubGridRow", d)
                      } catch (e) {
                      }
                    }
                    b._start_ && b._start_.apply(this, [ c, g ])
                  };
                  b.update = function(c, g) {
                    a(g.item).css("border-width", "");
                    j.p.rownumbers === true
                        && a("td.jqgrid-rownum", j.rows).each(function(d) {
                          a(this).html(d + 1)
                        });
                    b._update_ && b._update_.apply(this, [ c, g ])
                  };
                  a("tbody:first", j).sortable(b);
                  a("tbody:first", j).disableSelection()
                }
          })
        },
        gridDnD : function(b) {
          return this
              .each(function() {
                function j() {
                  var d = a.data(c, "dnd");
                  a("tr.jqgrow:not(.ui-draggable)", c).draggable(
                      a.isFunction(d.drag) ? d.drag.call(a(c), d) : d.drag)
                }
                var c = this;
                if (c.grid)
                  if (!c.p.treeGrid)
                    if (a.fn.draggable && a.fn.droppable) {
                      a("#jqgrid_dnd").html() === null
                          && a("body")
                              .append(
                                  "<table id='jqgrid_dnd' class='ui-jqgrid-dnd'></table>");
                      if (typeof b == "string" && b == "updateDnD"
                          && c.p.jqgdnd === true)
                        j();
                      else {
                        b = a
                            .extend(
                                {
                                  drag : function(d) {
                                    return a
                                        .extend(
                                            {
                                              start : function(e, h) {
                                                if (c.p.subGrid) {
                                                  var i = a(h.helper)
                                                      .attr("id");
                                                  try {
                                                    a(c)
                                                        .jqGrid(
                                                            "collapseSubGridRow",
                                                            i)
                                                  } catch (l) {
                                                  }
                                                }
                                                for (i = 0; i < a
                                                    .data(c, "dnd").connectWith.length; i++)
                                                  a(
                                                      a.data(c, "dnd").connectWith[i])
                                                      .jqGrid("getGridParam",
                                                          "reccount") == "0"
                                                      && a(
                                                          a.data(c, "dnd").connectWith[i])
                                                          .jqGrid("addRowData",
                                                              "jqg_empty_row",
                                                              {});
                                                h.helper
                                                    .addClass("ui-state-highlight");
                                                a("td", h.helper)
                                                    .each(
                                                        function(m) {
                                                          this.style.width = c.grid.headers[m].width
                                                              + "px"
                                                        });
                                                d.onstart
                                                    && a.isFunction(d.onstart)
                                                    && d.onstart.call(a(c), e,
                                                        h)
                                              },
                                              stop : function(e, h) {
                                                if (h.helper.dropped) {
                                                  var i = a(h.helper)
                                                      .attr("id");
                                                  a(c).jqGrid("delRowData", i)
                                                }
                                                for (i = 0; i < a
                                                    .data(c, "dnd").connectWith.length; i++)
                                                  a(
                                                      a.data(c, "dnd").connectWith[i])
                                                      .jqGrid("delRowData",
                                                          "jqg_empty_row");
                                                d.onstop
                                                    && a.isFunction(d.onstop)
                                                    && d.onstop
                                                        .call(a(c), e, h)
                                              }
                                            }, d.drag_opts || {})
                                  },
                                  drop : function(d) {
                                    return a
                                        .extend(
                                            {
                                              accept : function(e) {
                                                var h = a(e).closest(
                                                    "table.ui-jqgrid-btable");
                                                if (a.data(h[0], "dnd") !== undefined) {
                                                  e = a.data(h[0], "dnd").connectWith;
                                                  return a.inArray("#"
                                                      + this.id, e) != -1 ? true
                                                      : false
                                                }
                                                return e
                                              },
                                              drop : function(e, h) {
                                                var i = a(h.draggable).attr(
                                                    "id");
                                                i = h.draggable.parent()
                                                    .parent().jqGrid(
                                                        "getRowData", i);
                                                if (!d.dropbyname) {
                                                  var l = 0, m = {}, n, f = a(
                                                      "#" + this.id).jqGrid(
                                                      "getGridParam",
                                                      "colModel");
                                                  try {
                                                    for ( var k in i) {
                                                      if (i.hasOwnProperty(k)
                                                          && f[l]) {
                                                        n = f[l].name;
                                                        m[n] = i[k]
                                                      }
                                                      l++
                                                    }
                                                    i = m
                                                  } catch (p) {
                                                  }
                                                }
                                                h.helper.dropped = true;
                                                if (d.beforedrop
                                                    && a
                                                        .isFunction(d.beforedrop)) {
                                                  n = d.beforedrop.call(this,
                                                      e, h, i, a("#" + c.id),
                                                      a(this));
                                                  if (typeof n != "undefined"
                                                      && n !== null
                                                      && typeof n == "object")
                                                    i = n
                                                }
                                                if (h.helper.dropped) {
                                                  var o;
                                                  if (d.autoid)
                                                    if (a.isFunction(d.autoid))
                                                      o = d.autoid
                                                          .call(this, i);
                                                    else {
                                                      o = Math.ceil(Math
                                                          .random() * 1E3);
                                                      o = d.autoidprefix + o
                                                    }
                                                  a("#" + this.id).jqGrid(
                                                      "addRowData", o, i,
                                                      d.droppos)
                                                }
                                                d.ondrop
                                                    && a.isFunction(d.ondrop)
                                                    && d.ondrop.call(this, e,
                                                        h, i)
                                              }
                                            }, d.drop_opts || {})
                                  },
                                  onstart : null,
                                  onstop : null,
                                  beforedrop : null,
                                  ondrop : null,
                                  drop_opts : {
                                    activeClass : "ui-state-active",
                                    hoverClass : "ui-state-hover"
                                  },
                                  drag_opts : {
                                    revert : "invalid",
                                    helper : "clone",
                                    cursor : "move",
                                    appendTo : "#jqgrid_dnd",
                                    zIndex : 5E3
                                  },
                                  dropbyname : false,
                                  droppos : "first",
                                  autoid : true,
                                  autoidprefix : "dnd_"
                                }, b || {});
                        if (b.connectWith) {
                          b.connectWith = b.connectWith.split(",");
                          b.connectWith = a.map(b.connectWith, function(d) {
                            return a.trim(d)
                          });
                          a.data(c, "dnd", b);
                          c.p.reccount != "0" && !c.p.jqgdnd && j();
                          c.p.jqgdnd = true;
                          for ( var g = 0; g < b.connectWith.length; g++)
                            a(b.connectWith[g]).droppable(
                                a.isFunction(b.drop) ? b.drop.call(a(c), b)
                                    : b.drop)
                        }
                      }
                    }
              })
        },
        gridResize : function(b) {
          return this.each(function() {
            var j = this;
            if (j.grid && a.fn.resizable) {
              b = a.extend({}, b || {});
              if (b.alsoResize) {
                b._alsoResize_ = b.alsoResize;
                delete b.alsoResize
              } else
                b._alsoResize_ = false;
              if (b.stop && a.isFunction(b.stop)) {
                b._stop_ = b.stop;
                delete b.stop
              } else
                b._stop_ = false;
              b.stop = function(c, g) {
                a(j).jqGrid("setGridParam", {
                  height : a("#gview_" + j.p.id + " .ui-jqgrid-bdiv").height()
                });
                a(j).jqGrid("setGridWidth", g.size.width, b.shrinkToFit);
                b._stop_ && b._stop_.call(j, c, g)
              };
              b.alsoResize = b._alsoResize_ ? eval("("
                  + ("{'#gview_" + j.p.id + " .ui-jqgrid-bdiv':true,'"
                      + b._alsoResize_ + "':true}") + ")") : a(
                  ".ui-jqgrid-bdiv", "#gview_" + j.p.id);
              delete b._alsoResize_;
              a("#gbox_" + j.p.id).resizable(b)
            }
          })
        }
      })
})(jQuery);
