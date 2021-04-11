//On first load!
async function init() {
  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
  const page_name = getParameterByName("fieldbook") || "fieldbook";
  const demo = JSON.stringify((await import("./demo-fieldbook.js")).default);
  const empty = '{"settings":[],"meta":{}}';
  const page_config = JSON.parse(
    page_name == "fieldbook"
      ? localStorage.getItem(page_name) || demo
      : localStorage.getItem(page_name) || empty
  );
  const save_fun = (config) => {
    localStorage.setItem(page_name, JSON.stringify(config));
  };
  fieldbook(page_name, page_config, save_fun, false);
}
init();
