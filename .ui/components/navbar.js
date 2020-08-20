const navbar = document.getElementById("navbar");

(async function () {
  let navItems = await beaker.hyperdrive.readFile("/.ui/navbar.json");
  navItems = JSON.parse(navItems);

  navItems.forEach(addNavItem);
})();

function addNavItem(item) {
  let li = document.createElement("li");
  let a = document.createElement("a");
  let text = document.createTextNode(item.name);

  navbar.append(li);
  li.append(a);
  a.append(text);

  a.href = item.href;
}
