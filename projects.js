setTimeout(async () => {
  const projects = document.getElementById("projects");

  if (!projects) return;

  let projectDrives = await beaker.hyperdrive.readFile("/projects.json");
  projectDrives = JSON.parse(projectDrives);

  projectDrives.forEach(addProject);
}, 50);

async function addProject(drive) {
  let driveInfo = await beaker.hyperdrive.getInfo(drive);

  let card = document.createElement("div");
  let title = document.createElement("h2");
  let a = document.createElement("a");
  let desc = document.createElement("div");
  
  card.className = "card";
  a.href = drive;

  a.innerText = driveInfo.title;
  desc.innerText = driveInfo.description;

  projects.append(card);
  card.append(title);
  title.append(a);
  card.append(desc);
}
