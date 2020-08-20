setup();

async function setup() {
  var main = document.querySelector("main");
  let path = location.pathname;

  if (path.endsWith(".ui/ui.html")) return;

  if (path.endsWith("/")) {
    path += "index.html";
  }

  if (path.endsWith(".html")) {
    let html = await beaker.hyperdrive
      .readFile(path)
      .catch((e) => `<h1>404 not found<h1>`);
    main.innerHTML = html;
  }
}
