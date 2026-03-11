let chart;

function markdownToHTML(md) {
  
  if (!md) return '';
  
  return md
    .replace(/^### (.*$)/gim, '<h3 style="color:#ff9800">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color:#ff9800">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color:#ffc107">$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
    .replace(/\*(.*)\*/gim, '<i>$1</i>')
    .replace(/!\[([^\]]*)\]\((.*?)\)/gim, '<img src="$2" style="width:100%;border-radius:12px;">')
    .replace(/\[([^\]]+)\]\((.*?)\)/gim, '<a href="$2" target="_blank" style="color:#ff9800">$1</a>')
    .replace(/^- (.*$)/gm, '• $1<br>')
    .replace(/\n/g, '<br>');
}

async function generate() {
  
  let query = document.getElementById("query").value;
  
  let search = await fetch("https://api.modrinth.com/v2/search?query=" + query + "&limit=5");
  let sdata = await search.json();
  
  let mod = sdata.hits[0];
  
  let project = await fetch("https://api.modrinth.com/v2/project/" + mod.project_id);
  let pdata = await project.json();
  
  let versions = await fetch("https://api.modrinth.com/v2/project/" + mod.project_id + "/version");
  let vdata = await versions.json();
  
  let ver = vdata[0];
  
  let version = ver.version_number;
  let mcver = ver.game_versions.join(", ");
  let loaders = ver.loaders.join(", ");
  let size = (ver.files[0].size / 1024 / 1024).toFixed(2) + " MB";
  let download = ver.files[0].url;
  
  let downloads = pdata.downloads;
  
  let title = pdata.title + " Minecraft Mod Download";
  
  document.getElementById("title").innerText = title;
  document.getElementById("image").innerText = pdata.icon_url;
  
  let seoTitle = `Download ${pdata.title} Minecraft Mod (${mcver}) - Free`;
  let metaDesc = `Download ${pdata.title} Minecraft mod. Supports ${loaders}. Latest version ${version}.`;
  let keywords = `minecraft mod, ${pdata.title.toLowerCase()}, minecraft download`;
  
  document.getElementById("seoTitle").innerText = seoTitle;
  document.getElementById("metaDesc").innerText = metaDesc;
  document.getElementById("keywords").innerText = keywords;
  
  let relatedHTML = "";
  
  sdata.hits.forEach(m => {
    relatedHTML += `
<div class="related-card">
<img src="${m.icon_url}">
<div>${m.title}</div>
</div>
`;
  });
  
  document.getElementById("relatedMods").innerHTML = relatedHTML;
  
  let history = [downloads * 0.3, downloads * 0.5, downloads * 0.7, downloads * 0.9, downloads];
  
  if (chart) chart.destroy();
  
  chart = new Chart(document.getElementById("downloadChart"), {
    type: "line",
    data: {
      labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Today"],
      datasets: [{
        label: "Downloads",
        data: history,
        borderColor: "#ffc107",
        backgroundColor: "rgba(255,193,7,0.2)",
        fill: true
      }]
    },
    options: { responsive: true }
  });
  
  let html = `

<div style="max-width:900px;margin:auto;font-family:Segoe UI;color:white">

<img src="${pdata.icon_url}" style="width:100%;border-radius:12px">

<h1 style="color:#ffc107">${pdata.title}</h1>

<p>${pdata.description}</p>

<div style="background:#1b1b1b;padding:16px;border-radius:12px">

${markdownToHTML(pdata.body)}

</div>

<h2 style="color:#ff9800">File Info</h2>

<ul>

<li>Version: ${version}</li>
<li>Minecraft: ${mcver}</li>
<li>Loader: ${loaders}</li>
<li>File Size: ${size}</li>

</ul>

<div style="text-align:center;margin-top:30px">

<a href="${download}" style="
padding:18px 35px;
background:linear-gradient(135deg,#ffc107,#ff9800);
color:black;
font-weight:bold;
border-radius:14px;
text-decoration:none;
font-size:20px;
box-shadow:0 0 20px #ffc107;
">

Download ${pdata.title}

</a>

</div>

</div>

`;
  
  document.getElementById("code").value = html;
  document.getElementById("preview").innerHTML = html;
  
}

function copyText(id) {
  navigator.clipboard.writeText(document.getElementById(id).innerText);
  alert("Copied");
}

function copyCode() {
  let t = document.getElementById("code");
  t.select();
  document.execCommand("copy");
  alert("HTML Copied");
}