/* Panel: catálogos y promociones. */
(function (AVI) {
  AVI.loadCatalogs = loadCatalogs;
  AVI.loadPromos = loadPromos;
  const { view } = AVI;

  function loadCatalogs() {
    const sections = [
      ["/servicios/canceles-de-bano/", "Canceles"],
      ["/servicios/ventanas/", "Ventanas"],
      ["/barandales/", "Barandales"],
      ["/servicios/barandales/", "Barandales, servicio"],
      ["/servicios/fachadas-de-cristal/", "Fachadas"],
      ["/servicios/puertas/", "Puertas"],
      ["/servicios/pergolas/", "Pérgolas"],
    ];
    let section = sections[0][0];
    let editing = "";
    let editingImage = "";

    const board = document.createElement("div");
    board.className = "catalog-board";
    const picker = document.createElement("div");
    picker.className = "pick-list catalog-pages";
    const grid = document.createElement("div");
    grid.className = "product-grid";
    const form = document.createElement("form");
    form.className = "product-form";
    form.innerHTML = ""
      + "<h2>Nuevo producto</h2>"
      + "<label>Sección<select name=\"pagina\"></select></label>"
      + "<label>Título<input name=\"titulo\" maxlength=\"120\" required></label>"
      + "<label>Descripción<textarea name=\"descripcion\" maxlength=\"600\" rows=\"3\"></textarea></label>"
      + "<label>Características<textarea name=\"caracteristicas\" maxlength=\"300\" rows=\"2\"></textarea></label>"
      + "<label>Imagen<input name=\"imagen\" type=\"file\" accept=\"image/*\"></label>"
      + "<fieldset><legend>Acción</legend>"
      + "<label><input type=\"radio\" name=\"accion\" value=\"preguntar\" checked> Preguntar</label>"
      + "<label><input type=\"radio\" name=\"accion\" value=\"precio\"> Precio</label>"
      + "<label><input type=\"radio\" name=\"accion\" value=\"color\"> Color</label>"
      + "</fieldset>"
      + "<label data-extra=\"precio\" hidden>Precio<input name=\"precio\" maxlength=\"40\"></label>"
      + "<label data-extra=\"color\" hidden>Color<input name=\"color\" maxlength=\"40\"></label>"
      + "<div class=\"actions\"><button type=\"submit\">Guardar</button><button type=\"button\" class=\"secondary\" data-cancel>Cancelar</button></div>";
    const select = form.querySelector("select");
    sections.forEach(([path, name]) => {
      const option = document.createElement("option");
      option.value = path;
      option.textContent = name;
      select.append(option);
    });
    board.append(picker, grid, form);
    view.replaceChildren(board);

    function paintExtras() {
      const action = new FormData(form).get("accion");
      form.querySelectorAll("[data-extra]").forEach((node) => {
        node.hidden = node.getAttribute("data-extra") !== action;
      });
    }

    form.addEventListener("change", paintExtras);
    form.querySelector("[data-cancel]").addEventListener("click", () => {
      editing = "";
      editingImage = "";
      form.reset();
      form.querySelector("h2").textContent = "Nuevo producto";
      select.value = section;
      paintExtras();
    });

    function csrf() {
      const input = document.querySelector('input[name="csrf"]');
      return input ? input.value : "";
    }

    function saveStore(payload) {
      return fetch("/api/catalogo.php", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.assign({ csrf: csrf() }, payload)),
      }).then((response) => response.json());
    }

    function actionLabel(product) {
      if (product.accion === "precio" && product.precio) return product.precio;
      if (product.accion === "color" && product.color) return product.color;
      return "Preguntar";
    }

    function draw(products) {
      picker.replaceChildren();
      sections.forEach(([path, name]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = name;
        button.setAttribute("aria-pressed", path === section ? "true" : "false");
        button.addEventListener("click", () => {
          section = path;
          select.value = path;
          draw(products);
        });
        picker.append(button);
      });
      grid.replaceChildren();
      products.filter((product) => product.pagina === section).forEach((product) => {
        const card = document.createElement("article");
        card.className = "product-card";
        if (product.imagen) {
          const photo = document.createElement("img");
          photo.src = product.imagen;
          photo.alt = "";
          card.append(photo);
        }
        const title = document.createElement("h3");
        title.textContent = product.titulo;
        const copy = document.createElement("p");
        copy.textContent = product.descripcion;
        const detail = document.createElement("p");
        detail.className = "muted";
        detail.textContent = product.caracteristicas;
        const action = document.createElement("strong");
        action.textContent = actionLabel(product);
        const controls = document.createElement("div");
        controls.className = "actions";
        const edit = document.createElement("button");
        edit.type = "button";
        edit.textContent = "Editar";
        edit.addEventListener("click", () => {
          editing = product.id;
          editingImage = product.imagen || "";
          form.querySelector("h2").textContent = "Editar producto";
          form.elements.pagina.value = product.pagina;
          form.elements.titulo.value = product.titulo;
          form.elements.descripcion.value = product.descripcion;
          form.elements.caracteristicas.value = product.caracteristicas;
          form.elements.precio.value = product.precio || "";
          form.elements.color.value = product.color || "";
          form.querySelector('input[name="accion"][value="' + product.accion + '"]').checked = true;
          paintExtras();
        });
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "secondary";
        remove.textContent = "Eliminar";
        remove.addEventListener("click", () => {
          saveStore({ accion_api: "eliminar", id: product.id }).then(load);
        });
        controls.append(edit, remove);
        card.append(title, copy, detail, action, controls);
        grid.append(card);
      });
      if (!grid.children.length) grid.append(AVI.line("Aún no hay productos en esta sección.", "muted"));
    }

    function load() {
      return fetch("/api/catalogo.php", { cache: "no-store", credentials: "same-origin" })
        .then((response) => response.json())
        .then((data) => draw(data.productos || []));
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const file = form.elements.imagen.files[0];
      const finish = (imagen) => {
        const product = {
          pagina: String(data.get("pagina") || section),
          titulo: String(data.get("titulo") || ""),
          descripcion: String(data.get("descripcion") || ""),
          caracteristicas: String(data.get("caracteristicas") || ""),
          imagen: imagen,
          accion: String(data.get("accion") || "preguntar"),
          precio: String(data.get("precio") || ""),
          color: String(data.get("color") || ""),
        };
        section = product.pagina;
        const payload = editing
          ? { accion_api: "editar", id: editing, producto: product }
          : { accion_api: "crear", producto: product };
        saveStore(payload).then(() => {
          editing = "";
          editingImage = "";
          form.reset();
          form.querySelector("h2").textContent = "Nuevo producto";
          select.value = section;
          paintExtras();
          load();
        });
      };
      if (!file) {
        finish(editingImage);
        return;
      }
      if (file.size > 1400000) {
        form.querySelector("h2").textContent = "La imagen pesa demasiado";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => finish(String(reader.result || ""));
      reader.readAsDataURL(file);
    });

    paintExtras();
    load();
  }
  function loadPromos() {
    const saved = readPromos();
    const wrap = document.createElement("div");
    const form = document.createElement("form");
    form.className = "promo-form";
    form.innerHTML = ""
      + "<label>Nombre<input name=\"nombre\" maxlength=\"80\" required></label>"
      + "<label>Línea<select name=\"linea\"><option>Canceles</option><option>Ventanas</option><option>Barandales</option><option>Fachadas</option><option>Puertas</option><option>Pérgolas</option></select></label>"
      + "<label>Desde<input name=\"desde\" type=\"date\" required></label>"
      + "<label>Hasta<input name=\"hasta\" type=\"date\" required></label>"
      + "<label class=\"full\">Detalle<input name=\"detalle\" maxlength=\"160\" required></label>"
      + "<button class=\"full\" type=\"submit\">Guardar promoción</button>";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      saved.unshift({
        nombre: String(data.get("nombre") || ""),
        linea: String(data.get("linea") || ""),
        desde: String(data.get("desde") || ""),
        hasta: String(data.get("hasta") || ""),
        detalle: String(data.get("detalle") || ""),
      });
      sessionStorage.setItem("avi_promos", JSON.stringify(saved.slice(0, 12)));
      AVI.show();
    });
    wrap.append(form);
    if (!saved.length) {
      wrap.append(AVI.line("Aún no hay promociones en este navegador.", "muted"));
    } else {
      const grid = document.createElement("div");
      grid.className = "promos";
      saved.forEach((promo) => {
        const card = document.createElement("article");
        card.className = "promo";
        const kicker = document.createElement("em");
        kicker.textContent = promo.linea;
        const name = document.createElement("h2");
        name.textContent = promo.nombre;
        const copy = document.createElement("p");
        copy.textContent = promo.detalle;
        const when = document.createElement("p");
        when.className = "muted";
        when.textContent = promo.desde + " → " + promo.hasta;
        card.append(kicker, name, copy, when);
        grid.append(card);
      });
      wrap.append(grid);
    }
    view.replaceChildren(wrap);
  }
  function readPromos() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem("avi_promos") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
})(window.AVI = window.AVI || {});
