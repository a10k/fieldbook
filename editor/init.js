function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getPath() {
  var p = window.location.pathname.replace(/^.*\//, "");
  return convertToValidFilename(p);
}

function convertToValidFilename(string) {
  return string.replace(/[\/|\\:*?"<>]/g, " ");
}

//On first load!
async function init() {
  //const page_name = getParameterByName("fieldbook") || "fieldbook";
  const page_name = getPath() || "fieldbook";
  document.title = page_name;
  const demo = (await import("./demo-fieldbook.js")).default;
  const page_config = await fetch(`./${page_name}/raw.json`)
    .then((d) => d.json())
    .catch((d) => demo);
  const save_fun = (config) => {};
  const save_snapshot = (n, jsn) => {
    try {
      jsn.meta._NAME = n;
      fetch("./snapshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsn),
      });
    } catch (e) {}
  };
  fieldbook(page_name, page_config, save_fun, save_snapshot, false);
}
init();
