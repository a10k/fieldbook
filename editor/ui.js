export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Fieldbook`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`~~~
LOCAL NOTEBOOK
~~~`
)});
  main.define("initial settings", function(){return(
[]
)});
  main.variable(observer("mutable settings")).define("mutable settings", ["Mutable", "initial settings"], (M, _) => new M(_));
  main.variable(observer("settings")).define("settings", ["mutable settings"], _ => _.generator);
  main.variable(observer("styles")).define("styles", function(){return(
{
  named: { color: "black", icon: d => d.icon || "🌷" },
  unnamed: { color: "gray", icon: d => "&nbsp;&nbsp;" },
  imports: { color: "hotpink", icon: d => "&nbsp;&nbsp;" }
}
)});
  main.define("initial eye_close", function(){return(
false
)});
  main.variable(observer("mutable eye_close")).define("mutable eye_close", ["Mutable", "initial eye_close"], (M, _) => new M(_));
  main.variable(observer("eye_close")).define("eye_close", ["mutable eye_close"], _ => _.generator);
  main.define("initial scroll_offset", function(){return(
0
)});
  main.variable(observer("mutable scroll_offset")).define("mutable scroll_offset", ["Mutable", "initial scroll_offset"], (M, _) => new M(_));
  main.variable(observer("scroll_offset")).define("scroll_offset", ["mutable scroll_offset"], _ => _.generator);
  main.define("initial active_cell_index", function(){return(
null
)});
  main.variable(observer("mutable active_cell_index")).define("mutable active_cell_index", ["Mutable", "initial active_cell_index"], (M, _) => new M(_));
  main.variable(observer("active_cell_index")).define("active_cell_index", ["mutable active_cell_index"], _ => _.generator);
  main.variable(observer("viewof list")).define("viewof list", ["settings","active_cell_index","styles","html","del","set_active_cell_index","mutable settings","mutable active_cell_index","move","is_dev","eye_close","hero","set_eye_close","mutable eye_close","mutable scroll_offset"], function*(settings,active_cell_index,styles,html,del,set_active_cell_index,$0,$1,move,is_dev,eye_close,hero,set_eye_close,$2,$3)
{
  let list_items = settings.map((d, i) => {
    let op = 1;
    if (d.hide) {
      op = 0.2;
    }
    let bg = i == active_cell_index ? styles[d.group].color + "25" : "";
    const item = html`
<div data-index="${i}" 
  class="fieldbook-sidebar-item ${
    i == active_cell_index ? "fieldbook-sidebar-active-item" : ""
  }"
  draggable=true 
  style="background: ${bg};font-weight: ${
      d.group == "named" ? 600 : 300
    };padding:6px 9px;font-size: 13.7px; color: ${
      styles[d.group].color
    }; opacity:${op};">
<span class="fieldbook-sidebar-item-svg">${styles[d.group].icon(d)}</span>
${d.name}
<span class="fieldbook-sidebar-item-trash">🗑️</span>
</div>`;
    item
      .querySelector(".fieldbook-sidebar-item-trash")
      .addEventListener('click', e => {
        del(i);
        e.preventDefault();
        e.stopPropagation();
      });
    item.addEventListener('click', e => {
      set_active_cell_index(i);
    });
    item.addEventListener('contextmenu', e => {
      settings[i]['hide'] = !settings[i]['hide'];
      $0.value = settings;
      e.preventDefault();
    });
    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('Text/html', e.target.getAttribute('data-index'));
    });
    item.addEventListener('drop', e => {
      $1.value = e.target.getAttribute('data-index');
      move(
        e.dataTransfer.getData("text/html"),
        e.target.getAttribute('data-index')
      );
    });
    item.addEventListener('dragenter', e => {
      e.preventDefault();
    });
    item.addEventListener('dragover', e => {
      e.preventDefault();
    });
    return item;
  });

  const dom = html`
<style>
#fieldbook-sidebar-wrapper{
  font-family: menlo,consolas,monospace;
  max-width:230px;
  padding:6px;
  box-sizing:border-box;
  background: #FFF;
}
#fieldbook-sidebar-content{
  height: ${is_dev ? '400px' : 'calc(100vh - 58px)'};
  overflow-y:auto;
}
/*hack for the scrollbar on leftside for cell list*/
#fieldbook-sidebar-content {
  direction: rtl;
}
#fieldbook-sidebar-content * {
  direction: ltr;
}
#fieldbook-eye-toggle{
  position: absolute;
  width: 55px;
  height: 32px;
  background: ${eye_close ? "#fff" : "transparent"};
  left: 0px;
  top: 8px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding-right: 5px;
  align-items: center;
  box-sizing: border-box;
  z-index:111111111;
}
.fieldbook-sidebar-active-item{
  background:rgba(0,0,0,0.12);
}
.fieldbook-sidebar-item-svg{
  cursor:move;
  display:inline-block;
  margin-right:3px;
}
.fieldbook-sidebar-item-trash{
  cursor:pointer;
  display:none;
  float:right;
  transform:translate(0,2px);
  margin-left:3px;
}
.fieldbook-sidebar-item{
}
.fieldbook-sidebar-item:hover{
 background:rgba(0,0,0,0.05);
}
.fieldbook-sidebar-item:hover .fieldbook-sidebar-item-trash{
    display:inline-block;
}
#fieldbook-sidebar-wrapper *::-webkit-scrollbar-track {
  background-color: #f3f5f7;
}

#fieldbook-sidebar-wrapper *::-webkit-scrollbar {
  width: 4px;
  height: 4px;
  background-color: #f3f5f7;
}

#fieldbook-sidebar-wrapper *::-webkit-scrollbar-thumb {
  border-radius: 2px;
  background-color: #C4C4C4;
}
</style>
<div id="fieldbook-sidebar-wrapper"">
  <div id="fieldbook-eye-toggle">
    <span class="fieldbook-eye-toggle-icon">${eye_close ? '🌠' : '🌈'}</span>
  </div>
  ${hero}
  <div id="fieldbook-sidebar-content">
    ${list_items}
  </div>
</div>`;
  var toggle_button = dom.querySelector("#fieldbook-eye-toggle");
  toggle_button.addEventListener('click', e => {
    set_eye_close(!$2.value);
  });
  var scrollable = dom.querySelector("#fieldbook-sidebar-content");
  scrollable.addEventListener('scroll', e => {
    $3.value = scrollable.scrollTop;
  });
  yield dom;
  scrollable.scrollTop = $3.value;
}
);
  main.variable(observer("list")).define("list", ["Generators", "viewof list"], (G, _) => G.input(_));
  main.variable(observer("viewof editor_header")).define("viewof editor_header", ["active_cell_index","settings","html","styles","set_active_cell_index"], function(active_cell_index,settings,html,styles,set_active_cell_index)
{
  if (active_cell_index !== null) {
    let d = settings[active_cell_index];
    const box = html`<div id="fieldbook-current-cell" style="font-weight: ${
      d.group == "named" ? 600 : 300
    };padding:6px 9px;font-size: 16px; color: ${styles[d.group].color}; ">
<span style="cursor:pointer;">
 <span class="fieldbook-sidebar-item-svg">${styles[d.group].icon(d)}</span>
${d.name}
</span>
</div>`;
    box.querySelector('span').addEventListener('click', e => {
      set_active_cell_index(active_cell_index);
    });

    return box;
  } else {
    return html``;
  }
}
);
  main.variable(observer("editor_header")).define("editor_header", ["Generators", "viewof editor_header"], (G, _) => G.input(_));
  main.variable(observer("hero")).define("hero", ["current_book"], function(current_book){return(
`<svg id="fieldbook-sidebar-svg" width="230" height="40" viewBox="0 0 230 40" fill="none" xmlns="http://www.w3.org/2000/svg">
 <text x="36" y="26" fill="#bcbcbc" font-size="20" text-anchor="start" font-family="monospace">${current_book}</text>
</svg>
`
)});
  main.variable(observer("current_book")).define("current_book", ["getParameterByName"], function(getParameterByName){return(
getParameterByName('fieldbook') || "fieldbook"
)});
  main.variable(observer("getParameterByName")).define("getParameterByName", function(){return(
function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
)});
  main.variable(observer("eye_toggle")).define("eye_toggle", function(){return(
() => {}
)});
  main.variable(observer("set_eye_close")).define("set_eye_close", ["mutable eye_close","eye_toggle"], function($0,eye_toggle){return(
v => {
  $0.value = v;
  eye_toggle(v);
}
)});
  main.variable(observer("set")).define("set", ["mutable settings"], function($0){return(
a => {
  $0.value = a;
}
)});
  main.variable(observer("set_active_cell_index")).define("set_active_cell_index", ["mutable active_cell_index"], function($0){return(
n => {
  if ($0.value === n) {
    $0.value = null;
  } else {
    $0.value = n;
  }
}
)});
  main.variable(observer("move")).define("move", ["mutable settings"], function($0){return(
(curr, target) => {
  function array_move(arr, old_index, new_index) {
    old_index = old_index.replace(/<\.*\>/, "");
    new_index = new_index.replace(/<\.*\>/, "");
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
  }
  $0.value = array_move($0.value, curr, target);
}
)});
  main.variable(observer("del")).define("del", function(){return(
curr => {
  //handled in override when imported
  console.log(curr);
}
)});
  main.variable(observer("is_dev")).define("is_dev", function(){return(
window.location.href.match(/worker/) ? true : false
)});
  return main;
}
