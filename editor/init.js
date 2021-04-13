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

  const save_to_backend = (config, page_name) => {
    try {
      config.meta._NAME = page_name;
      fetch("./snapshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });
    } catch (e) {}
  };
  const save_fun = (config) => {
    save_to_backend(config, page_name);
  };
  const save_snapshot = (ignore_name, config) => {
    save_to_backend(config, page_name);
  };
  fieldbook(page_name, page_config, save_fun, save_snapshot, false);
}
init();
