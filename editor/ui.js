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
  main.variable(observer("viewof list")).define("viewof list", ["settings","active_cell_index","styles","html","del","set_active_cell_index","mutable settings","mutable active_cell_index","move","is_dev","eye_close","hero","info","downloadObjectAsJson","localStorage","current_book","set_eye_close","mutable eye_close","mutable scroll_offset"], function*(settings,active_cell_index,styles,html,del,set_active_cell_index,$0,$1,move,is_dev,eye_close,hero,info,downloadObjectAsJson,localStorage,current_book,set_eye_close,$2,$3)
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
  height: ${is_dev ? '400px' : 'calc(100vh - 108px)'};
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
  ${info}
</div>`;
  dom.querySelector("#fieldbook-sidebar-svg").addEventListener('click', () => {
    downloadObjectAsJson(
      JSON.parse(localStorage.getItem(current_book)),
      current_book
    );
  });
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
  main.variable(observer("downloadObjectAsJson")).define("downloadObjectAsJson", function(){return(
function downloadObjectAsJson(exportObj, exportName) {
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj, null, 2));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
)});
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

<!-- fielbook -->
<symbol id="fielbook-offline" fill="none" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
 <path d="M30.087 6c14.032 0 25.476 11.084 26.06 24.972a16.692 16.692 0 0 0-5.014-2.813c-.17-.92-.4-1.817-.683-2.69h-7.356c.082.626.15 1.262.21 1.907a16.602 16.602 0 0 0-4.586 1.322 44.93 44.93 0 0 0-.339-3.229H21.794a47.282 47.282 0 0 0-.454 6.618c0 2.31.158 4.532.454 6.619h7.94a16.65 16.65 0 0 0-.82 4.68h-6.172c.881 3.253 3.48 10.108 7.345 10.108.552 0 1.076-.14 1.574-.389a16.859 16.859 0 0 0 4.26 4.414 26.196 26.196 0 0 1-5.834.655C15.68 58.174 4 46.494 4 32.087 4 17.682 15.68 6 30.087 6zm7.362 42.755L50.44 35.762a9.428 9.428 0 0 0-4.84-1.328 9.478 9.478 0 0 0-9.481 9.48c0 1.769.485 3.424 1.329 4.841zm16.302-9.683L40.757 52.064a9.434 9.434 0 0 0 4.843 1.329 9.477 9.477 0 0 0 9.478-9.48c0-1.77-.484-3.424-1.327-4.84zm-8.15-9.319c7.818 0 14.159 6.34 14.159 14.16s-6.34 14.16-14.16 14.16-14.16-6.34-14.16-14.16 6.34-14.16 14.16-14.16zM9.722 38.706h7.356a51.66 51.66 0 0 1-.42-6.619c0-2.286.146-4.504.42-6.618H9.724a21.362 21.362 0 0 0-1.044 6.618c0 2.31.366 4.535 1.043 6.619zm8.207 4.68h-6.028a21.48 21.48 0 0 0 9.041 8.061c-1.395-2.495-2.351-5.29-3.013-8.06zM11.902 20.79h6.028c.66-2.77 1.618-5.572 3.013-8.063a21.472 21.472 0 0 0-9.041 8.063zm10.84 0h14.689c-.88-3.254-3.48-10.11-7.344-10.11-3.865 0-6.464 6.856-7.345 10.11zm19.5 0h6.03a21.484 21.484 0 0 0-9.042-8.063c1.395 2.494 2.351 5.29 3.013 8.063z" fill="#333"/>
 </symbol>
<!-- fielbook -->
<symbol id="fielbook-online" fill="none" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
 <path d="M30.087 6c14.032 0 25.476 11.084 26.06 24.972a16.692 16.692 0 0 0-5.014-2.813c-.17-.92-.4-1.817-.683-2.69h-7.356c.082.626.15 1.262.21 1.907a16.602 16.602 0 0 0-4.586 1.322 44.93 44.93 0 0 0-.339-3.229H21.794a47.282 47.282 0 0 0-.454 6.618c0 2.31.158 4.532.454 6.619h7.94a16.65 16.65 0 0 0-.82 4.68h-6.172c.881 3.253 3.48 10.108 7.345 10.108.552 0 1.076-.14 1.574-.389a16.859 16.859 0 0 0 4.26 4.414 26.196 26.196 0 0 1-5.834.655C15.68 58.174 4 46.494 4 32.087 4 17.682 15.68 6 30.087 6zm7.362 42.755L50.44 35.762a9.428 9.428 0 0 0-4.84-1.328 9.478 9.478 0 0 0-9.481 9.48c0 1.769.485 3.424 1.329 4.841zm16.302-9.683L40.757 52.064a9.434 9.434 0 0 0 4.843 1.329 9.477 9.477 0 0 0 9.478-9.48c0-1.77-.484-3.424-1.327-4.84zm-8.15-9.319c7.818 0 14.159 6.34 14.159 14.16s-6.34 14.16-14.16 14.16-14.16-6.34-14.16-14.16 6.34-14.16 14.16-14.16zM9.722 38.706h7.356a51.66 51.66 0 0 1-.42-6.619c0-2.286.146-4.504.42-6.618H9.724a21.362 21.362 0 0 0-1.044 6.618c0 2.31.366 4.535 1.043 6.619zm8.207 4.68h-6.028a21.48 21.48 0 0 0 9.041 8.061c-1.395-2.495-2.351-5.29-3.013-8.06zM11.902 20.79h6.028c.66-2.77 1.618-5.572 3.013-8.063a21.472 21.472 0 0 0-9.041 8.063zm10.84 0h14.689c-.88-3.254-3.48-10.11-7.344-10.11-3.865 0-6.464 6.856-7.345 10.11zm19.5 0h6.03a21.484 21.484 0 0 0-9.042-8.063c1.395 2.494 2.351 5.29 3.013 8.063z" fill="#bcbcbc"/>
 </symbol>
</svg>
`
)});
  main.variable(observer("info")).define("info", function(){return(
`
<svg id="fieldbook-info" width="134" height="39" viewBox="0 0 134 39" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.66719 30.8288C8.94953 30.8288 9.21169 30.7829 9.45369 30.6913C9.69936 30.5959 9.92853 30.4731 10.1412 30.3228L10.6472 31.0103C10.3905 31.2229 10.0825 31.3953 9.72319 31.5273C9.36753 31.6556 9.01003 31.7198 8.65069 31.7198C8.06769 31.7198 7.56903 31.5951 7.15469 31.3458C6.74403 31.0964 6.43053 30.7463 6.21419 30.2953C5.99786 29.8443 5.88969 29.3163 5.88969 28.7113C5.88969 28.1246 5.99786 27.6021 6.21419 27.1438C6.43419 26.6818 6.75136 26.3169 7.16569 26.0493C7.58003 25.7816 8.08053 25.6478 8.66719 25.6478C9.42253 25.6478 10.0789 25.8751 10.6362 26.3298L10.1357 27.0173C9.64803 26.6799 9.16036 26.5113 8.67269 26.5113C8.18869 26.5113 7.79269 26.6909 7.48469 27.0503C7.17669 27.4096 7.02269 27.9633 7.02269 28.7113C7.02269 29.4629 7.17669 30.0038 7.48469 30.3338C7.79636 30.6638 8.19053 30.8288 8.66719 30.8288ZM17.2759 31.2853C17.0706 31.4173 16.8231 31.5218 16.5334 31.5988C16.2474 31.6794 15.9577 31.7198 15.6644 31.7198C15.0191 31.7198 14.5241 31.5511 14.1794 31.2138C13.8384 30.8764 13.6679 30.4383 13.6679 29.8993V26.5773H12.3534V25.7853H13.6679V24.4763L14.7239 24.3498V25.7853H16.7039L16.5829 26.5773H14.7239V29.8883C14.7239 30.2073 14.8046 30.4474 14.9659 30.6088C15.1309 30.7701 15.4041 30.8508 15.7854 30.8508C15.9981 30.8508 16.1942 30.8269 16.3739 30.7793C16.5572 30.7279 16.7259 30.6601 16.8799 30.5758L17.2759 31.2853ZM19.2186 31.5823V30.8013H20.0986V26.5663H19.2186V25.7853H20.9071L21.0996 27.1438C21.3196 26.6634 21.5891 26.2949 21.9081 26.0383C22.2308 25.7779 22.6488 25.6478 23.1621 25.6478C23.3308 25.6478 23.4793 25.6606 23.6076 25.6863C23.7396 25.7119 23.8734 25.7449 24.0091 25.7853L23.8441 27.8203H23.0301V26.6103H23.0246C22.1556 26.6103 21.5323 27.2318 21.1546 28.4748V30.8013H22.3316V31.5823H19.2186ZM28.1408 23.4533V30.0863C28.1408 30.3649 28.227 30.5629 28.3993 30.6803C28.5716 30.7939 28.7935 30.8508 29.0648 30.8508C29.2371 30.8508 29.4003 30.8343 29.5543 30.8013C29.712 30.7646 29.866 30.7151 30.0163 30.6528L30.2913 31.4063C30.13 31.4906 29.9283 31.5639 29.6863 31.6263C29.4443 31.6886 29.1711 31.7198 28.8668 31.7198C28.3205 31.7198 27.886 31.5676 27.5633 31.2633C27.2443 30.9589 27.0848 30.5409 27.0848 30.0093V24.2563H25.3193V23.4533H28.1408ZM35.072 25.9613V28.1668H37.2445V29.0358H35.072V31.2248H34.115V29.0358H31.9645V28.1668H34.115V25.9613H35.072ZM40.9802 30.8783C41.4019 30.8783 41.7337 30.8013 41.9757 30.6473C42.2214 30.4933 42.3442 30.2843 42.3442 30.0203C42.3442 29.8516 42.3112 29.7086 42.2452 29.5913C42.1829 29.4703 42.0509 29.3603 41.8492 29.2613C41.6512 29.1586 41.3505 29.0559 40.9472 28.9533C40.5512 28.8543 40.2065 28.7388 39.9132 28.6068C39.6235 28.4748 39.398 28.3024 39.2367 28.0898C39.079 27.8771 39.0002 27.6021 39.0002 27.2648C39.0002 26.7734 39.2055 26.3811 39.6162 26.0878C40.0269 25.7944 40.5714 25.6478 41.2497 25.6478C41.7264 25.6478 42.1407 25.7119 42.4927 25.8403C42.8447 25.9649 43.1454 26.1189 43.3947 26.3023L42.9437 26.9898C42.72 26.8431 42.4744 26.7221 42.2067 26.6268C41.9427 26.5278 41.631 26.4783 41.2717 26.4783C40.8427 26.4783 40.5365 26.5443 40.3532 26.6763C40.1735 26.8046 40.0837 26.9751 40.0837 27.1878C40.0837 27.3491 40.1277 27.4829 40.2157 27.5893C40.3074 27.6919 40.4632 27.7873 40.6832 27.8753C40.9032 27.9596 41.2075 28.0549 41.5962 28.1613C41.9739 28.2639 42.3039 28.3849 42.5862 28.5243C42.8685 28.6636 43.0867 28.8469 43.2407 29.0743C43.3984 29.2979 43.4772 29.5931 43.4772 29.9598C43.4772 30.3741 43.358 30.7114 43.1197 30.9718C42.8814 31.2284 42.5715 31.4173 42.1902 31.5383C41.8125 31.6593 41.4092 31.7198 40.9802 31.7198C40.4522 31.7198 39.9975 31.6428 39.6162 31.4888C39.2385 31.3348 38.9214 31.1459 38.6647 30.9223L39.2477 30.2513C39.4714 30.4383 39.7299 30.5904 40.0232 30.7078C40.3202 30.8214 40.6392 30.8783 40.9802 30.8783Z" fill="#C4C4C4"/>
<path d="M68.5323 30.8288C68.8146 30.8288 69.0768 30.7829 69.3188 30.6913C69.5645 30.5959 69.7936 30.4731 70.0063 30.3228L70.5123 31.0103C70.2556 31.2229 69.9476 31.3953 69.5883 31.5273C69.2326 31.6556 68.8751 31.7198 68.5158 31.7198C67.9328 31.7198 67.4341 31.5951 67.0198 31.3458C66.6091 31.0964 66.2956 30.7463 66.0793 30.2953C65.863 29.8443 65.7548 29.3163 65.7548 28.7113C65.7548 28.1246 65.863 27.6021 66.0793 27.1438C66.2993 26.6818 66.6165 26.3169 67.0308 26.0493C67.4451 25.7816 67.9456 25.6478 68.5323 25.6478C69.2876 25.6478 69.944 25.8751 70.5013 26.3298L70.0008 27.0173C69.5131 26.6799 69.0255 26.5113 68.5378 26.5113C68.0538 26.5113 67.6578 26.6909 67.3498 27.0503C67.0418 27.4096 66.8878 27.9633 66.8878 28.7113C66.8878 29.4629 67.0418 30.0038 67.3498 30.3338C67.6615 30.6638 68.0556 30.8288 68.5323 30.8288ZM77.141 31.2853C76.9357 31.4173 76.6882 31.5218 76.3985 31.5988C76.1125 31.6794 75.8228 31.7198 75.5295 31.7198C74.8842 31.7198 74.3892 31.5511 74.0445 31.2138C73.7035 30.8764 73.533 30.4383 73.533 29.8993V26.5773H72.2185V25.7853H73.533V24.4763L74.589 24.3498V25.7853H76.569L76.448 26.5773H74.589V29.8883C74.589 30.2073 74.6697 30.4474 74.831 30.6088C74.996 30.7701 75.2692 30.8508 75.6505 30.8508C75.8632 30.8508 76.0593 30.8269 76.239 30.7793C76.4223 30.7279 76.591 30.6601 76.745 30.5758L77.141 31.2853ZM79.0837 31.5823V30.8013H79.9637V26.5663H79.0837V25.7853H80.7722L80.9647 27.1438C81.1847 26.6634 81.4542 26.2949 81.7732 26.0383C82.0959 25.7779 82.5139 25.6478 83.0272 25.6478C83.1959 25.6478 83.3444 25.6606 83.4727 25.6863C83.6047 25.7119 83.7385 25.7449 83.8742 25.7853L83.7092 27.8203H82.8952V26.6103H82.8897C82.0207 26.6103 81.3974 27.2318 81.0197 28.4748V30.8013H82.1967V31.5823H79.0837ZM88.0059 23.4533V30.0863C88.0059 30.3649 88.0921 30.5629 88.2644 30.6803C88.4367 30.7939 88.6586 30.8508 88.9299 30.8508C89.1022 30.8508 89.2654 30.8343 89.4194 30.8013C89.5771 30.7646 89.7311 30.7151 89.8814 30.6528L90.1564 31.4063C89.9951 31.4906 89.7934 31.5639 89.5514 31.6263C89.3094 31.6886 89.0362 31.7198 88.7319 31.7198C88.1856 31.7198 87.7511 31.5676 87.4284 31.2633C87.1094 30.9589 86.9499 30.5409 86.9499 30.0093V24.2563H85.1844V23.4533H88.0059ZM94.9371 25.9613V28.1668H97.1096V29.0358H94.9371V31.2248H93.9801V29.0358H91.8296V28.1668H93.9801V25.9613H94.9371ZM103.749 25.7853L101.725 31.6153C101.586 32.0259 101.406 32.3963 101.186 32.7263C100.966 33.0599 100.682 33.3313 100.334 33.5403C99.9892 33.7493 99.5547 33.8794 99.0303 33.9308L98.8818 33.1113C99.2778 33.0489 99.5913 32.9536 99.8223 32.8253C100.057 32.6969 100.24 32.5301 100.372 32.3248C100.508 32.1194 100.629 31.8719 100.735 31.5823H100.378L98.3813 25.7853H99.5088L101.087 30.8123L102.66 25.7853H103.749ZM105.742 32.7318L104.895 32.3523L109.592 22.6668L110.428 23.0683L105.742 32.7318ZM113.063 25.7853V29.8663C113.063 30.2329 113.137 30.4969 113.283 30.6583C113.434 30.8159 113.665 30.8948 113.976 30.8948C114.27 30.8948 114.55 30.8086 114.818 30.6363C115.089 30.4639 115.3 30.2586 115.45 30.0203V25.7853H116.506V31.5823H115.599L115.522 30.8178C115.298 31.1111 115.019 31.3348 114.686 31.4888C114.356 31.6428 114.02 31.7198 113.679 31.7198C113.118 31.7198 112.698 31.5676 112.42 31.2633C112.145 30.9589 112.007 30.5373 112.007 29.9983V25.7853H113.063ZM118.933 32.7318L118.086 32.3523L122.783 22.6668L123.619 23.0683L118.933 32.7318ZM127.448 23.0133C127.668 23.0133 127.844 23.0811 127.976 23.2168C128.112 23.3524 128.18 23.5174 128.18 23.7118C128.18 23.9134 128.112 24.0839 127.976 24.2233C127.844 24.3589 127.668 24.4268 127.448 24.4268C127.232 24.4268 127.056 24.3589 126.92 24.2233C126.788 24.0839 126.722 23.9134 126.722 23.7118C126.722 23.5174 126.788 23.3524 126.92 23.2168C127.056 23.0811 127.232 23.0133 127.448 23.0133ZM128.235 25.7853V30.7793H129.846V31.5823H125.413V30.7793H127.179V26.5883H125.468V25.7853H128.235Z" fill="#C4C4C4"/>
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
