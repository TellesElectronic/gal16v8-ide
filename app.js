/* ============================================
   GAL16V8 IDE — Truth Table to CUPL Generator
   ============================================ */

(function () {
  "use strict";

  // ---- GAL16V8 DIP-20 Pin Map ----
  // Physical pin layout for the chip diagram
  const PIN_LAYOUT = {
    left:  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    right: [20, 19, 18, 17, 16, 15, 14, 13, 12, 11]
  };

  // Fixed pins
  const FIXED_PINS = { 10: "GND", 20: "VCC" };

  // Presets
  const PRESETS = {
    "3in_4out": {
      label: "3 Entradas / 4 Salidas",
      pins: {
        1: { name: "A", type: "input" },
        2: { name: "B", type: "input" },
        3: { name: "C", type: "input" },
        12: { name: "Y3", type: "output" },
        13: { name: "Y2", type: "output" },
        14: { name: "Y1", type: "output" },
        15: { name: "Y0", type: "output" }
      }
    },
    "4in_4out": {
      label: "4 Entradas / 4 Salidas",
      pins: {
        1: { name: "A", type: "input" },
        2: { name: "B", type: "input" },
        3: { name: "C", type: "input" },
        4: { name: "D", type: "input" },
        12: { name: "Y3", type: "output" },
        13: { name: "Y2", type: "output" },
        14: { name: "Y1", type: "output" },
        15: { name: "Y0", type: "output" }
      }
    },
    "4in_8out": {
      label: "4 Entradas / 8 Salidas",
      pins: {
        1: { name: "A", type: "input" },
        2: { name: "B", type: "input" },
        3: { name: "C", type: "input" },
        4: { name: "D", type: "input" },
        12: { name: "Y7", type: "output" },
        13: { name: "Y6", type: "output" },
        14: { name: "Y5", type: "output" },
        15: { name: "Y4", type: "output" },
        16: { name: "Y3", type: "output" },
        17: { name: "Y2", type: "output" },
        18: { name: "Y1", type: "output" },
        19: { name: "Y0", type: "output" }
      }
    },
    "8in_8out": {
      label: "8 Entradas / 8 Salidas",
      pins: {
        1: { name: "A", type: "input" },
        2: { name: "B", type: "input" },
        3: { name: "C", type: "input" },
        4: { name: "D", type: "input" },
        5: { name: "E", type: "input" },
        6: { name: "F", type: "input" },
        7: { name: "G", type: "input" },
        8: { name: "H", type: "input" },
        12: { name: "Y7", type: "output" },
        13: { name: "Y6", type: "output" },
        14: { name: "Y5", type: "output" },
        15: { name: "Y4", type: "output" },
        16: { name: "Y3", type: "output" },
        17: { name: "Y2", type: "output" },
        18: { name: "Y1", type: "output" },
        19: { name: "Y0", type: "output" }
      }
    },
    "decoder_2to4": {
      label: "Decodificador 2:4",
      pins: {
        1: { name: "A", type: "input" },
        2: { name: "B", type: "input" },
        3: { name: "EN", type: "input" },
        15: { name: "Y0", type: "output" },
        16: { name: "Y1", type: "output" },
        17: { name: "Y2", type: "output" },
        18: { name: "Y3", type: "output" }
      }
    },
    "mux_4to1": {
      label: "MUX 4:1",
      pins: {
        1: { name: "S0", type: "input" },
        2: { name: "S1", type: "input" },
        3: { name: "D0", type: "input" },
        4: { name: "D1", type: "input" },
        5: { name: "D2", type: "input" },
        6: { name: "D3", type: "input" },
        15: { name: "Y", type: "output" }
      }
    }
  };

  // State
  let pinConfig = {};  // { pinNum: { name, type } }  — only configured pins
  let truthTableData = []; // Array of rows, each row is array of output values

  // ---- Init ----
  function init() {
    loadPreset("3in_4out");
    setHeaderDate();
    bindEvents();
    initThemeToggle();
  }

  function setHeaderDate() {
    var now = new Date();
    var d = String(now.getDate()).padStart(2, "0");
    var m = String(now.getMonth() + 1).padStart(2, "0");
    var y = now.getFullYear();
    document.getElementById("headerDate").value = d + "/" + m + "/" + y;
  }

  function loadPreset(presetKey) {
    var preset = PRESETS[presetKey];
    if (!preset) return;

    pinConfig = {};
    for (var pin in preset.pins) {
      pinConfig[pin] = { name: preset.pins[pin].name, type: preset.pins[pin].type };
    }

    truthTableData = [];
    renderAll();
  }

  function renderAll() {
    renderChipDiagram();
    renderPinList();
    rebuildTruthTable();
  }

  // ---- Theme Toggle ----
  function initThemeToggle() {
    var toggle = document.querySelector("[data-theme-toggle]");
    var root = document.documentElement;
    var theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    root.setAttribute("data-theme", theme);

    if (toggle) {
      updateToggleIcon(toggle, theme);
      toggle.addEventListener("click", function () {
        theme = theme === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", theme);
        updateToggleIcon(toggle, theme);
      });
    }
  }

  function updateToggleIcon(btn, theme) {
    btn.innerHTML = theme === "dark"
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    btn.setAttribute("aria-label", "Cambiar a modo " + (theme === "dark" ? "claro" : "oscuro"));
  }

  // ---- Chip Diagram ----
  function renderChipDiagram() {
    var container = document.getElementById("chipDiagram");
    var html = "";

    // Left side pins (1-10)
    for (var i = 0; i < PIN_LAYOUT.left.length; i++) {
      var pin = PIN_LAYOUT.left[i];
      var cfg = getPinDisplay(pin);
      html += '<div class="chip-pin chip-pin-left ' + cfg.cssClass + '" style="grid-row:' + (i + 1) + '">';
      html += '<span class="chip-pin-name">' + esc(cfg.name) + '</span>';
      html += '<span class="chip-pin-num">' + pin + '</span>';
      html += '<span class="chip-pin-bar"></span>';
      html += "</div>";
    }

    // Chip body
    html += '<div class="chip-body" style="grid-row:1/span 10; grid-column:2">';
    html += '<div class="chip-body-label">GAL16V8</div>';
    html += "</div>";

    // Right side pins (20 down to 11)
    for (var j = 0; j < PIN_LAYOUT.right.length; j++) {
      var rpin = PIN_LAYOUT.right[j];
      var rcfg = getPinDisplay(rpin);
      html += '<div class="chip-pin chip-pin-right ' + rcfg.cssClass + '" style="grid-row:' + (j + 1) + '">';
      html += '<span class="chip-pin-bar"></span>';
      html += '<span class="chip-pin-num">' + rpin + '</span>';
      html += '<span class="chip-pin-name">' + esc(rcfg.name) + '</span>';
      html += "</div>";
    }

    container.innerHTML = html;
  }

  function getPinDisplay(pin) {
    if (FIXED_PINS[pin]) {
      return {
        name: FIXED_PINS[pin],
        cssClass: pin === 10 ? "pin-type-gnd" : "pin-type-vcc"
      };
    }
    if (pinConfig[pin]) {
      return {
        name: pinConfig[pin].name,
        cssClass: pinConfig[pin].type === "output" ? "pin-type-output" : "pin-type-input"
      };
    }
    return { name: "NC", cssClass: "pin-type-nc" };
  }

  // ---- Pin List ----
  function renderPinList() {
    var container = document.getElementById("pinList");
    var html = "";

    // List all configurable pins (1-9, 11-19)
    var allPins = [1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,19];

    for (var i = 0; i < allPins.length; i++) {
      var pin = allPins[i];
      var cfg = pinConfig[pin];
      var isActive = !!cfg;
      var name = cfg ? cfg.name : "";
      var type = cfg ? cfg.type : "none";

      html += '<div class="pin-row' + (isActive ? " pin-active" : "") + '" data-pin-row="' + pin + '">';
      html += '<span class="pin-row-num">Pin ' + pin + "</span>";
      html += '<input type="text" data-pin="' + pin + '" data-field="name" value="' + esc(name) + '" placeholder="NC">';
      html += '<select data-pin="' + pin + '" data-field="type">';
      html += '<option value="none"' + (type === "none" ? " selected" : "") + '>No usar</option>';
      html += '<option value="input"' + (type === "input" ? " selected" : "") + ">Entrada</option>";
      html += '<option value="output"' + (type === "output" ? " selected" : "") + ">Salida</option>";
      html += "</select>";
      html += "</div>";
    }

    container.innerHTML = html;
  }

  // ---- Truth Table ----
  function getInputPins() {
    var pins = [];
    var allPins = [1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,19];
    for (var i = 0; i < allPins.length; i++) {
      var p = allPins[i];
      if (pinConfig[p] && pinConfig[p].type === "input") {
        pins.push({ pin: p, name: pinConfig[p].name });
      }
    }
    return pins;
  }

  function getOutputPins() {
    var pins = [];
    var allPins = [1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,19];
    for (var i = 0; i < allPins.length; i++) {
      var p = allPins[i];
      if (pinConfig[p] && pinConfig[p].type === "output") {
        pins.push({ pin: p, name: pinConfig[p].name });
      }
    }
    return pins;
  }

  function rebuildTruthTable() {
    var inputs = getInputPins();
    var outputs = getOutputPins();
    var numInputs = inputs.length;
    var numOutputs = outputs.length;

    // Cap at 8 inputs
    var effectiveInputs = numInputs > 8 ? 8 : numInputs;
    var numRows = effectiveInputs > 0 ? Math.pow(2, effectiveInputs) : 0;

    if (numRows === 0 || numOutputs === 0) {
      document.getElementById("truthTable").innerHTML =
        '<tbody><tr><td style="padding:2rem;color:var(--color-text-muted);text-align:center">Configura al menos 1 entrada y 1 salida para ver la tabla</td></tr></tbody>';
      updateStatus(effectiveInputs, numOutputs, 0);
      truthTableData = [];
      return;
    }

    // Preserve existing output data if possible
    var oldData = truthTableData;
    truthTableData = [];

    for (var r = 0; r < numRows; r++) {
      var row = [];
      for (var o = 0; o < numOutputs; o++) {
        if (oldData[r] && oldData[r][o] !== undefined) {
          row.push(oldData[r][o]);
        } else {
          row.push("0");
        }
      }
      truthTableData.push(row);
    }

    renderTruthTable(inputs.slice(0, effectiveInputs), outputs, numRows);
    updateStatus(effectiveInputs, numOutputs, numRows);
  }

  function renderTruthTable(inputs, outputs, numRows) {
    var table = document.getElementById("truthTable");
    var html = "<thead><tr>";
    html += '<th class="row-number">#</th>';

    for (var i = 0; i < inputs.length; i++) {
      html += '<th class="col-input">' + esc(inputs[i].name) + "</th>";
    }

    html += '<th class="col-separator"></th>';

    for (var o = 0; o < outputs.length; o++) {
      html += '<th class="col-output">' + esc(outputs[o].name) + "</th>";
    }
    html += "</tr></thead><tbody>";

    for (var r = 0; r < numRows; r++) {
      html += "<tr>";
      html += '<td class="row-number">' + r + "</td>";

      // Input values (MSB first)
      for (var bi = inputs.length - 1; bi >= 0; bi--) {
        var bit = (r >> bi) & 1;
        html += '<td class="cell-input">' + bit + "</td>";
      }

      html += '<td class="col-separator"></td>';

      // Output values (clickable)
      for (var oi = 0; oi < outputs.length; oi++) {
        var val = truthTableData[r] ? (truthTableData[r][oi] || "0") : "0";
        html += '<td class="cell-output" data-row="' + r + '" data-col="' + oi + '" data-val="' + val + '">' + val + "</td>";
      }
      html += "</tr>";
    }
    html += "</tbody>";
    table.innerHTML = html;
  }

  function cycleOutputValue(td) {
    var row = parseInt(td.dataset.row);
    var col = parseInt(td.dataset.col);
    var current = td.dataset.val;
    var next;
    if (current === "0") next = "1";
    else if (current === "1") next = "X";
    else next = "0";

    td.dataset.val = next;
    td.textContent = next;
    if (truthTableData[row]) {
      truthTableData[row][col] = next;
    }
  }

  function fillOutputs(val) {
    var outputs = getOutputPins();
    var inputs = getInputPins();
    var effectiveInputs = Math.min(inputs.length, 8);
    var numRows = Math.pow(2, effectiveInputs);

    for (var r = 0; r < numRows; r++) {
      for (var o = 0; o < outputs.length; o++) {
        if (truthTableData[r]) truthTableData[r][o] = val;
      }
    }
    rebuildTruthTable();
  }

  function updateStatus(inputs, outputs, rows) {
    document.getElementById("statusInputs").textContent = "Entradas: " + inputs;
    document.getElementById("statusOutputs").textContent = "Salidas: " + outputs;
    document.getElementById("statusRows").textContent = "Filas: " + rows;
  }

  // ---- Quine-McCluskey Minimization ----
  function countOnes(n) {
    var count = 0;
    while (n > 0) {
      count += n & 1;
      n >>= 1;
    }
    return count;
  }

  function combine(a, b) {
    var diff = a.value ^ b.value;
    if (countOnes(diff) !== 1) return null;
    // Merge minterms sets
    var merged = a.minterms.slice();
    for (var i = 0; i < b.minterms.length; i++) {
      if (merged.indexOf(b.minterms[i]) === -1) merged.push(b.minterms[i]);
    }
    return {
      value: a.value & b.value,
      mask: a.mask | diff,
      minterms: merged
    };
  }

  function quineMcCluskey(minterms, dontCares, numVars) {
    if (minterms.length === 0) return [];

    var allTerms = minterms.concat(dontCares);

    // Initialize implicants
    var implicants = [];
    for (var t = 0; t < allTerms.length; t++) {
      implicants.push({ value: allTerms[t], mask: 0, minterms: [allTerms[t]], used: false });
    }

    var primeImplicants = [];

    while (implicants.length > 0) {
      // Group by number of ones (considering mask)
      var groups = {};
      for (var i = 0; i < implicants.length; i++) {
        var imp = implicants[i];
        var maskedVal = imp.value & ~imp.mask;
        var ones = countOnes(maskedVal);
        if (!groups[ones]) groups[ones] = [];
        groups[ones].push(imp);
      }

      var newImplicants = [];
      var usedSet = {};

      var groupKeys = Object.keys(groups).map(Number).sort(function (a, b) { return a - b; });

      for (var g = 0; g < groupKeys.length - 1; g++) {
        var g1 = groups[groupKeys[g]] || [];
        var g2 = groups[groupKeys[g + 1]] || [];

        for (var ai = 0; ai < g1.length; ai++) {
          for (var bi = 0; bi < g2.length; bi++) {
            if (g1[ai].mask !== g2[bi].mask) continue;
            var combined = combine(g1[ai], g2[bi]);
            if (combined) {
              var key = combined.value + "|" + combined.mask;
              if (!usedSet[key]) {
                usedSet[key] = true;
                newImplicants.push(combined);
              }
              g1[ai].used = true;
              g2[bi].used = true;
            }
          }
        }
      }

      // Collect unused as prime implicants
      for (var pi = 0; pi < implicants.length; pi++) {
        if (!implicants[pi].used) {
          primeImplicants.push(implicants[pi]);
        }
      }

      implicants = [];
      for (var ni = 0; ni < newImplicants.length; ni++) {
        implicants.push({
          value: newImplicants[ni].value,
          mask: newImplicants[ni].mask,
          minterms: newImplicants[ni].minterms,
          used: false
        });
      }
    }

    // Find essential prime implicants
    var covered = {};
    var selected = [];

    for (var mi = 0; mi < minterms.length; mi++) {
      var mt = minterms[mi];
      var covering = [];
      for (var pj = 0; pj < primeImplicants.length; pj++) {
        if (primeImplicants[pj].minterms.indexOf(mt) !== -1) {
          covering.push(pj);
        }
      }
      if (covering.length === 1) {
        var idx = covering[0];
        if (selected.indexOf(idx) === -1) {
          selected.push(idx);
          var ms = primeImplicants[idx].minterms;
          for (var ci = 0; ci < ms.length; ci++) covered[ms[ci]] = true;
        }
      }
    }

    // Cover remaining greedily
    for (var mi2 = 0; mi2 < minterms.length; mi2++) {
      var mt2 = minterms[mi2];
      if (covered[mt2]) continue;
      var bestIdx = -1;
      var bestCount = -1;
      for (var pj2 = 0; pj2 < primeImplicants.length; pj2++) {
        if (selected.indexOf(pj2) !== -1) continue;
        if (primeImplicants[pj2].minterms.indexOf(mt2) === -1) continue;
        var uncovCount = 0;
        for (var uc = 0; uc < primeImplicants[pj2].minterms.length; uc++) {
          if (!covered[primeImplicants[pj2].minterms[uc]]) uncovCount++;
        }
        if (uncovCount > bestCount) {
          bestCount = uncovCount;
          bestIdx = pj2;
        }
      }
      if (bestIdx !== -1) {
        selected.push(bestIdx);
        var bms = primeImplicants[bestIdx].minterms;
        for (var bci = 0; bci < bms.length; bci++) covered[bms[bci]] = true;
      }
    }

    var result = [];
    for (var si = 0; si < selected.length; si++) {
      result.push(primeImplicants[selected[si]]);
    }
    return result;
  }

  function implicantToExpression(imp, inputNames, numVars) {
    var terms = [];
    for (var i = numVars - 1; i >= 0; i--) {
      if ((imp.mask >> i) & 1) continue; // don't care bit
      if ((imp.value >> i) & 1) {
        terms.push(inputNames[numVars - 1 - i]);
      } else {
        terms.push("!" + inputNames[numVars - 1 - i]);
      }
    }
    return terms.length > 0 ? terms.join(" & ") : "'b'1";
  }

  // ---- CUPL Code Generation ----
  function generateCUPL() {
    var inputs = getInputPins();
    var outputs = getOutputPins();
    var effectiveInputs = inputs.slice(0, 8);

    if (effectiveInputs.length === 0 || outputs.length === 0) {
      showToast("Configura al menos 1 entrada y 1 salida");
      return;
    }

    var numVars = effectiveInputs.length;
    var numRows = Math.pow(2, numVars);
    var inputNames = [];
    for (var n = 0; n < effectiveInputs.length; n++) {
      inputNames.push(effectiveInputs[n].name);
    }

    var equations = [];
    var equationStrings = [];

    for (var o = 0; o < outputs.length; o++) {
      var minterms = [];
      var dontCares = [];

      for (var r = 0; r < numRows; r++) {
        var val = truthTableData[r] ? truthTableData[r][o] : "0";
        if (val === "1") minterms.push(r);
        else if (val === "X") dontCares.push(r);
      }

      if (minterms.length === 0) {
        equations.push({ output: outputs[o], expr: "'b'0", minterms: [], dontCares: [] });
        equationStrings.push(outputs[o].name + " = 'b'0;");
        continue;
      }

      if (minterms.length + dontCares.length === numRows) {
        equations.push({ output: outputs[o], expr: "'b'1", minterms: minterms, dontCares: dontCares });
        equationStrings.push(outputs[o].name + " = 'b'1;");
        continue;
      }

      var primes = quineMcCluskey(minterms, dontCares, numVars);
      var terms = [];
      for (var tp = 0; tp < primes.length; tp++) {
        terms.push(implicantToExpression(primes[tp], inputNames, numVars));
      }
      var expr = terms.join("\n    # ");
      equations.push({ output: outputs[o], expr: expr, minterms: minterms, dontCares: dontCares });
      equationStrings.push(outputs[o].name + " = " + terms.join(" # ") + ";");
    }

    // Build CUPL code
    var header = buildHeader();
    var pinDecl = buildPinDeclarations(effectiveInputs, outputs);
    var eqns = buildEquations(equations);

    var code = header + "\n" + pinDecl + "\n" + eqns;

    displayCode(code);
    displayEquations(equationStrings);
    showToast("Codigo CUPL generado correctamente");
  }

  function buildHeader() {
    var name = document.getElementById("headerName").value || "UNTITLED";
    var partno = document.getElementById("headerPartno").value || "00";
    var date = document.getElementById("headerDate").value || "";
    var rev = document.getElementById("headerRevision").value || "01";
    var designer = document.getElementById("headerDesigner").value || "";
    var company = document.getElementById("headerCompany").value || "";
    var assembly = document.getElementById("headerAssembly").value || "00";
    var location = document.getElementById("headerLocation").value || "00";

    return "Name     " + name + " ;\n" +
           "PartNo   " + partno + " ;\n" +
           "Date     " + date + " ;\n" +
           "Revision " + rev + " ;\n" +
           "Designer " + designer + " ;\n" +
           "Company  " + company + " ;\n" +
           "Assembly " + assembly + " ;\n" +
           "Location " + location + " ;\n" +
           "Device   g16v8 ;\n";
  }

  function buildPinDeclarations(inputs, outputs) {
    var code = "\n/* ============ Pin Declarations ============ */\n";

    for (var i = 0; i < inputs.length; i++) {
      var padPin = String(inputs[i].pin).padStart(2, " ");
      code += "Pin " + padPin + " = " + inputs[i].name + " ;";
      code += padRight("", 12 - inputs[i].name.length) + "/* Input  */\n";
    }

    code += "\n";

    for (var o = 0; o < outputs.length; o++) {
      var padPinO = String(outputs[o].pin).padStart(2, " ");
      code += "Pin " + padPinO + " = " + outputs[o].name + " ;";
      code += padRight("", 12 - outputs[o].name.length) + "/* Output */\n";
    }

    return code;
  }

  function padRight(str, len) {
    var pad = "";
    for (var i = 0; i < len; i++) pad += " ";
    return str + pad;
  }

  function buildEquations(equations) {
    var code = "\n/* =========== Logic Equations ============= */\n";

    for (var i = 0; i < equations.length; i++) {
      var eq = equations[i];
      if (eq.expr.indexOf("\n") !== -1) {
        code += eq.output.name + " = " + eq.expr + " ;\n\n";
      } else {
        code += eq.output.name + " = " + eq.expr + " ;\n";
      }
    }

    return code;
  }

  // ---- Code Display ----
  function displayCode(code) {
    var codeEl = document.getElementById("codeOutput");
    var lineNumEl = document.getElementById("lineNumbers");

    var highlighted = highlightCUPL(code);
    codeEl.innerHTML = highlighted;

    var lines = code.split("\n");
    var nums = "";
    for (var i = 1; i <= lines.length; i++) {
      nums += i + "\n";
    }
    lineNumEl.textContent = nums;
  }

  function highlightCUPL(code) {
    var lines = code.split("\n");
    var result = [];
    var inComment = false;

    for (var li = 0; li < lines.length; li++) {
      var line = lines[li];
      // Escape HTML but preserve & for CUPL operators
      var safe = line.replace(/</g, "&lt;").replace(/>/g, "&gt;");

      // Track block comments
      if (inComment || safe.indexOf("/*") !== -1) {
        safe = '<span class="syn-comment">' + safe + '</span>';
        if (safe.indexOf("*/") !== -1) { inComment = false; }
        else { inComment = true; }
      } else {
        // Keywords at word boundaries
        var keywords = ["Name", "PartNo", "Date", "Revision", "Designer", "Company", "Assembly", "Location", "Device", "Pin", "Field", "Node"];
        for (var k = 0; k < keywords.length; k++) {
          safe = safe.replace(new RegExp("\\b(" + keywords[k] + ")\\b", "g"), '<span class="syn-keyword">$1</span>');
        }

        // Device names
        safe = safe.replace(/\b(g16v8|g22v10|p16l8|p16r8)\b/gi, '<span class="syn-type">$1</span>');

        // CUPL operators: & # !
        safe = safe.replace(/&/g, '<span class="syn-operator">&amp;</span>');
        safe = safe.replace(/([#!])/g, '<span class="syn-operator">$1</span>');

        // Numbers
        safe = safe.replace(/\b(\d+)\b/g, '<span class="syn-number">$1</span>');
      }

      result.push(safe);
    }

    return result.join("\n");
  }

  function displayEquations(eqStrings) {
    var el = document.getElementById("equationsOutput");
    if (eqStrings.length === 0) {
      el.textContent = "/* No hay ecuaciones */";
      return;
    }
    el.textContent = eqStrings.join("\n");
  }

  // ---- Export ----
  function exportPLD() {
    var code = getPlainCode();
    if (!code || code.indexOf("Configura") !== -1) {
      showToast("Genera el codigo primero");
      return;
    }

    var name = document.getElementById("headerName").value || "UNTITLED";
    var blob = new Blob([code], { type: "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name + ".PLD";
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("Archivo " + name + ".PLD exportado");
  }

  function copyCode() {
    var code = getPlainCode();
    if (!code || code.indexOf("Configura") !== -1) {
      showToast("Genera el codigo primero");
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(function () {
        showToast("Codigo copiado al portapapeles");
      }).catch(function () {
        fallbackCopy(code);
      });
    } else {
      fallbackCopy(code);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;left:-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast("Codigo copiado al portapapeles");
    } catch (e) {
      showToast("No se pudo copiar");
    }
    document.body.removeChild(ta);
  }

  function getPlainCode() {
    var el = document.getElementById("codeOutput");
    return el.textContent || el.innerText;
  }

  // ---- Toast ----
  var toastTimeout;
  function showToast(msg) {
    var toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("visible");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
      toast.classList.remove("visible");
    }, 2500);
  }

  // ---- Event Binding ----
  function bindEvents() {
    // Preset selector
    var presetSelect = document.getElementById("presetSelect");
    if (presetSelect) {
      presetSelect.addEventListener("change", function () {
        if (this.value) loadPreset(this.value);
      });
    }

    // Pin name changes
    document.getElementById("pinList").addEventListener("input", function (e) {
      var pin = e.target.dataset.pin;
      var field = e.target.dataset.field;
      if (!pin || !field) return;

      if (field === "name") {
        var cleaned = e.target.value.replace(/[^a-zA-Z0-9_]/g, "");
        if (pinConfig[pin]) {
          pinConfig[pin].name = cleaned || ("P" + pin);
          e.target.value = pinConfig[pin].name;
        } else if (cleaned) {
          // Auto-assign as input if a name is typed and no type set
          pinConfig[pin] = { name: cleaned, type: "input" };
          // Update the type dropdown
          var typeSelect = document.querySelector('select[data-pin="' + pin + '"]');
          if (typeSelect) typeSelect.value = "input";
        }
        renderChipDiagram();
      }
    });

    // Pin type changes
    document.getElementById("pinList").addEventListener("change", function (e) {
      var pin = e.target.dataset.pin;
      var field = e.target.dataset.field;
      if (!pin || field !== "type") return;

      var newType = e.target.value;
      if (newType === "none") {
        delete pinConfig[pin];
        var nameInput = document.querySelector('input[data-pin="' + pin + '"]');
        if (nameInput) nameInput.value = "";
      } else {
        if (!pinConfig[pin]) {
          // Auto-generate a name
          var autoName = newType === "input" ? "I" + pin : "Y" + pin;
          pinConfig[pin] = { name: autoName, type: newType };
          var nameInp = document.querySelector('input[data-pin="' + pin + '"]');
          if (nameInp) nameInp.value = autoName;
        } else {
          pinConfig[pin].type = newType;
        }
      }
      renderChipDiagram();
      rebuildTruthTable();
    });

    // Truth table clicks
    document.getElementById("truthTable").addEventListener("click", function (e) {
      var td = e.target.closest("td.cell-output");
      if (td) cycleOutputValue(td);
    });

    // Fill buttons
    document.getElementById("btnFillZeros").addEventListener("click", function () { fillOutputs("0"); });
    document.getElementById("btnFillOnes").addEventListener("click", function () { fillOutputs("1"); });
    document.getElementById("btnFillDontCare").addEventListener("click", function () { fillOutputs("X"); });

    // Generate
    document.getElementById("btnGenerate").addEventListener("click", generateCUPL);

    // Copy
    document.getElementById("btnCopy").addEventListener("click", copyCode);

    // Export
    document.getElementById("btnExport").addEventListener("click", exportPLD);

    // Keyboard shortcut
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "g") {
        e.preventDefault();
        generateCUPL();
      }
    });
  }

  // ---- Utility ----
  function esc(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Start ----
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
