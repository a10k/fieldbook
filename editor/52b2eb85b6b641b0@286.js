export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Observable Fieldbook`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`~~~
FILE BASED LOCAL NOTEBOOK
~~~`
)});
  main.define("initial settings", function(){return(
[
]
)});
  main.variable(observer("mutable settings")).define("mutable settings", ["Mutable", "initial settings"], (M, _) => new M(_));
  main.variable(observer("settings")).define("settings", ["mutable settings"], _ => _.generator);
  main.variable(observer("styles")).define("styles", function(){return(
{
  named: { color: "#353535", bg: "#fff493" },
  unnamed: { color: "#353535", bg: "#f0f0f0" },
  imports: { color: "#ffffff", bg: "#c30771" }
}
)});
  main.variable(observer("viewof list")).define("viewof list", ["html","settings","styles","mutable settings","move"], function(html,settings,styles,$0,move)
{
  const dom = html`<div style="max-width:230px;padding:6px;box-sizing:border-box;">
${settings.map((d, i) => {
  let op = 1;
  let strike = "none";
  if (d.hide) {
    op = 0.2;
    strike = "line-through";
  }
  const item = html`
<div data-index="${i}" 
  draggable=true 
  style="text-align:right;cursor:move;margin:4px; padding:2px 6px;font-size: 14px; color:${styles[d.group].color}; background:${styles[d.group].bg}; opacity:${op}; text-decoration:${strike};">${d.name}</div>`;
  item.addEventListener('dblclick', e => {
    settings[i]['hide'] = !settings[i]['hide'];
    $0.value = settings;
  });
  item.addEventListener('dragstart', e => {
    e.dataTransfer.setData('Text/html', e.target.getAttribute('data-index'));
  });
  item.addEventListener('drop', e => {
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
})}
</div>`;
  return dom;
}
);
  main.variable(observer("list")).define("list", ["Generators", "viewof list"], (G, _) => G.input(_));
  main.variable(observer("set")).define("set", ["mutable settings"], function($0){return(
a => {
  $0.value = a;
}
)});
  main.variable(observer("move")).define("move", ["mutable settings"], function($0){return(
(curr, target) => {
  function array_move(arr, old_index, new_index) {
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
}
)});
  return main;
}
