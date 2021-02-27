export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Observable Fieldbook`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`~~~
LOCAL NOTEBOOK
~~~`
)});
  main.define("initial settings", function(){return(
[
  { group: "imports", name: "inputs", handle: "imports_inputs" },
  { group: "unnamed", name: "demo", handle: "unnamed_demo" },
  { group: "unnamed", name: "table", handle: "unnamed_table" },
  { group: "unnamed", name: "something", handle: "unnamed_something" },
  { group: "named", name: "bg", handle: "named_bg" },
  { group: "named", name: "color", handle: "named_color" },
  { group: "named", name: "Comp", handle: "named_Comp" },
  { group: "named", name: "d3", handle: "named_d3" },
  { group: "named", name: "data", handle: "named_data" },
  { group: "named", name: "history", handle: "named_history" },
  { group: "named", name: "htm", handle: "named_htm" },
  { group: "named", name: "Preact", handle: "named_Preact" },
  { group: "named", name: "Render", handle: "named_Render" },
  { group: "named", name: "requires", handle: "named_requires" },
  { group: "named", name: "Resp", handle: "named_Resp" },
  { group: "named", name: "route", handle: "named_route" },
  { group: "named", name: "Router", handle: "named_Router" },
  { group: "named", name: "simple", handle: "named_simple" },
  { group: "named", name: "time", handle: "named_time" }
]
)});
  main.variable(observer("mutable settings")).define("mutable settings", ["Mutable", "initial settings"], (M, _) => new M(_));
  main.variable(observer("settings")).define("settings", ["mutable settings"], _ => _.generator);
  main.variable(observer("styles")).define("styles", function(){return(
{
  named: { color: "#287AE3" },
  unnamed: { color: "#404852" },
  imports: { color: "#32A897" }
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
  main.variable(observer("viewof list")).define("viewof list", ["settings","active_cell_index","styles","html","del","mutable active_cell_index","mutable settings","move","is_dev","eye_close","hero","info","mutable eye_close","eye_toggle","mutable scroll_offset"], function*(settings,active_cell_index,styles,html,del,$0,$1,move,is_dev,eye_close,hero,info,$2,eye_toggle,$3)
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
    };padding:6px 9px;font-size: 16px; color: ${
      styles[d.group].color
    }; opacity:${op};">
<svg class="fieldbook-sidebar-item-svg" width="17px" height="17px">
 <use xlink:href="#${d.group}" xmlns:xlink="http://www.w3.org/1999/xlink"></use>
</svg>
${d.name}
<svg class="fieldbook-sidebar-item-trash" width="17px" height="17px">
 <use xlink:href="#trash" xmlns:xlink="http://www.w3.org/1999/xlink"></use>
</svg>
</div>`;
    item
      .querySelector(".fieldbook-sidebar-item-trash")
      .addEventListener('click', e => {
        del(i);
        e.preventDefault();
        e.stopPropagation();
      });
    item.addEventListener('click', e => {
      $0.value = i;
    });
    item.addEventListener('dblclick', e => {
      settings[i]['hide'] = !settings[i]['hide'];
      $1.value = settings;
    });
    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('Text/html', e.target.getAttribute('data-index'));
    });
    item.addEventListener('drop', e => {
      $0.value = e.target.getAttribute('data-index');
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
  max-width:230px;
  padding:6px;
  box-sizing:border-box;
  background: #F3F5F7;
}
#fieldbook-sidebar-content{
  height: ${is_dev ? '400px' : 'calc(100vh - 184px)'};
  overflow-y:auto;
}
/*hack for the scrollbar on leftside for cell list*/
#fieldbook-sidebar-content {
  direction: rtl;
}
#fieldbook-sidebar-content * {
  direction: ltr;
}
.fieldbook-sidebar-item{

}
#fieldbook-eye-toggle{
  position: absolute;
  width: 47px;
  height: 32px;
  background: #fff;
  left: 0px;
  top: 8px;
  border-radius: 0px 24px 24px 0px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding-right: 5px;
  align-items: center;
  box-sizing: border-box;
  z-index:111111111;
}
.fieldbook-sidebar-active-item{
  
}
.fieldbook-sidebar-item-svg{
  cursor:move;
  display:inline-block;
  transform:translate(0,2px);
  margin-right:3px;
}
.fieldbook-sidebar-item-trash{
  cursor:pointer;
  display:none;
  float:right;
  transform:translate(0,2px);
  margin-left:3px;
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
  background-color: #8fb9f6;
}
</style>
<div id="fieldbook-sidebar-wrapper"">
  <div id="fieldbook-eye-toggle">
    <svg class="fieldbook-eye-toggle-icon" width="18px" height="18px">
     <use xlink:href="#${
       eye_close ? 'eyeoff' : 'eyeon'
     }" xmlns:xlink="http://www.w3.org/1999/xlink"></use>
    </svg>
  </div>
  ${hero}
  <div id="fieldbook-sidebar-content">
    ${list_items}
  </div>
  ${info}
</div>`;
  var toggle_button = dom.querySelector("#fieldbook-eye-toggle");
  toggle_button.addEventListener('click', e => {
    $2.value = !$2.value;
    eye_toggle();
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
  main.variable(observer("viewof editor_header")).define("viewof editor_header", ["active_cell_index","settings","html","styles"], function(active_cell_index,settings,html,styles)
{
  if (active_cell_index !== null) {
    let d = settings[active_cell_index];
    const box = html`<div id="fieldbook-current-cell" style="pointer-events:none;font-weight: ${
      d.group == "named" ? 600 : 300
    };padding:6px 9px;font-size: 16px; color: ${styles[d.group].color}; ">
  <svg class="fieldbook-sidebar-item-svg" width="17px" height="17px">
 <use xlink:href="#${d.group}" xmlns:xlink="http://www.w3.org/1999/xlink"></use>
</svg>
${d.name}
</div>`;

    return box;
  } else {
    return html``;
  }
}
);
  main.variable(observer("editor_header")).define("editor_header", ["Generators", "viewof editor_header"], (G, _) => G.input(_));
  main.variable(observer("hero")).define("hero", function(){return(
`<svg id="fieldbook-sidebar-svg" width="230" height="120" preserveAspectRatio="xMinYMid meet" viewBox="0 0 230 120" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M112.374 21.8012C132.921 21.8012 149.679 38.0308 150.534 58.3671C148.365 56.5984 145.886 55.194 143.192 54.2478C142.943 52.9024 142.606 51.5878 142.191 50.3099H131.421C131.54 51.2265 131.641 52.1572 131.727 53.102C129.365 53.4268 127.11 54.0889 125.013 55.0379C124.9 53.4169 124.734 51.8381 124.516 50.3099H100.231C99.7981 53.3635 99.5661 56.6167 99.5661 60.0007C99.5661 63.3833 99.7981 66.6365 100.231 69.6915H111.856C111.146 71.858 110.729 74.1594 110.656 76.5452H101.62C102.909 81.3084 106.715 91.3464 112.374 91.3464C113.182 91.3464 113.95 91.1398 114.679 90.777C116.345 93.2936 118.463 95.4882 120.917 97.2399C118.17 97.867 115.311 98.1988 112.374 98.1988C91.2798 98.1988 74.1757 81.0947 74.1757 60.0007C74.1757 38.9067 91.2798 21.8012 112.374 21.8012ZM123.154 84.407L142.179 65.381C140.104 64.1453 137.681 63.4367 135.09 63.4367C127.422 63.4367 121.208 69.6493 121.208 77.3171C121.208 79.9081 121.918 82.3319 123.154 84.407ZM147.025 70.2285L127.999 89.2517C130.074 90.4874 132.499 91.1974 135.09 91.1974C142.756 91.1974 148.969 84.9848 148.969 77.3171C148.969 74.726 148.261 72.3022 147.025 70.2285ZM135.09 56.583C146.54 56.583 155.824 65.8661 155.824 77.3171C155.824 88.7666 146.54 98.0511 135.09 98.0511C123.641 98.0511 114.356 88.7666 114.356 77.3171C114.356 65.8661 123.641 56.583 135.09 56.583ZM82.5562 69.6915H93.3268C92.9261 66.5957 92.7124 63.3467 92.7124 60.0007C92.7124 56.6533 92.9261 53.4043 93.3268 50.3099H82.5576C81.5651 53.3621 81.028 56.6181 81.028 60.0007C81.028 63.3833 81.5651 66.6407 82.5562 69.6915ZM94.5738 76.5452H85.7462C88.9291 81.6599 93.5348 85.7721 98.9855 88.3491C96.9427 84.6952 95.5424 80.6026 94.5738 76.5452ZM85.7462 43.4576H94.5738C95.5396 39.4016 96.9427 35.2992 98.9855 31.6509C93.5348 34.2265 88.9291 38.3415 85.7462 43.4576ZM101.62 43.4576H123.127C121.84 38.693 118.032 28.655 112.374 28.655C106.715 28.655 102.909 38.693 101.62 43.4576ZM130.174 43.4576H139.001C135.817 38.3401 131.213 34.2293 125.762 31.6509C127.805 35.3034 129.205 39.3988 130.174 43.4576Z" fill="#E5E5E5"/>



<!-- named -->
<symbol id="named" fill="none" viewBox="0 0 16 16"  xmlns="http://www.w3.org/2000/svg">
 <path d="M7.249.99h0l.006-.012A.793.793 0 0 1 7.999.5c.335 0 .618.184.747.465h0l.002.005 1.764 3.746.113.239.261.042 3.896.62h0l.013.003a.775.775 0 0 1 .449.226h0l.007.007a.825.825 0 0 1 .012 1.17h0l-.003.003-2.87 2.93-.176.181.04.25.678 4.145a.966.966 0 0 1-.104.55.832.832 0 0 1-1.12.317l-3.467-1.92L8 13.345l-.242.133-3.47 1.902-.01.006-.011.007a.805.805 0 0 1-.519.086.837.837 0 0 1-.683-.959l.678-4.153.04-.248-.175-.18L.746 6.994a.906.906 0 0 1-.238-.465.846.846 0 0 1 .705-.95l3.894-.583.264-.039.114-.241L7.249.99z" fill="#5D9CF5" stroke="#287AE3"/>
 </symbol>

<!--import -->
<symbol id="imports" fill="none" viewBox="0 0 16 16"  xmlns="http://www.w3.org/2000/svg">
 <path d="M4.872 12.701a5.598 5.598 0 0 0 6.228.011 5.689 5.689 0 0 0 2.51-4.17 5.644 5.644 0 0 0-6.077-6.17 5.64 5.64 0 0 0-3.02 1.183l4.61 4.612V5.519h1.354v4.288a.677.677 0 0 1-.677.678H5.513V9.13h2.654L2.58 3.528l.478-.478a6.995 6.995 0 1 1 8.8 10.786A6.994 6.994 0 0 1 1 8.002h1.354A5.626 5.626 0 0 0 4.872 12.7z" fill="#32A897"/>
 </symbol>

<!-- note-->
<symbol id="unnamed" fill="none" viewBox="0 0 16 16"  xmlns="http://www.w3.org/2000/svg">
 <path d="M9.36667 5.66667L9.36667 2.43333L2.43333 2.43333L2.43333 13.5667L13.5667 13.5667L13.5667 6.63333L10.3333 6.63333C10.077 6.63333 9.83108 6.53149 9.6498 6.3502C9.46851 6.16892 9.36667 5.92304 9.36667 5.66667Z" fill="#F2D024" stroke="#C9BA7B"/>
<path d="M14.9693 5.51467L14.6248 5.61715L14.5667 5.64308L14.5667 5.65281L14.5687 5.65482L14.9693 5.51467Z" fill="#F2D024" stroke="#C9BA7B"/>
 </symbol>

<!-- trash -->
<symbol id="trash" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
 <path d="M9.772 4.425V3H6.077v1.425H3v.77h.92l.656 8.536h6.722l.655-8.537H13v-.769H9.772zm-.757-.668v.655H6.846v-.655h2.17zM5.27 12.95l-.593-7.768h6.495l-.606 7.768H5.27z" fill="currentColor"/>
 <path d="M8.309 6.291h-.77v5.587h.77V6.29zM8.953 11.86l.768.041.304-5.59-.768-.042-.304 5.59zM5.823 6.31l.303 5.591.768-.042-.303-5.59-.768.041z" fill="currentColor"/>
 </symbol>

<!-- eye close -->
<symbol id="eyeoff" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
 <path d="M14.646 8.094c-1.556 1.916-4.01 3.048-6.645 3.048-2.637 0-5.092-1.133-6.648-3.048H.293l.087.12c1.698 2.329 4.547 3.719 7.62 3.719 3.074 0 5.923-1.39 7.62-3.72l.088-.12h-1.062z" fill="#404852"/>
 <path d="M7.67 11.88v2.026h.814v-2.025H7.67zM10.823 11.357l.953 2.033.749-.288-.953-2.032-.749.287zM13.488 10.07l1.49 1.726.64-.454-1.49-1.726-.64.453zM4.517 11.059l-.855 2.126.765.252.854-2.126-.764-.252zM1.994 9.673l-1.5 1.738.642.454 1.5-1.738-.642-.454z" fill="#404852"/>
 </symbol>

<!-- eye open -->
<symbol id="eyeon" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
 <g fill="#404852">
 <path d="M8 3.89C3.618 3.89.148 7.724.002 7.887a.271.271 0 0 0 0 .367c.146.163 3.616 3.995 7.998 3.995s7.852-3.832 7.998-3.995a.271.271 0 0 0 0-.367C15.852 7.723 12.382 3.891 8 3.891zm0 7.774c-3.545 0-6.575-2.837-7.32-3.595.744-.757 3.77-3.594 7.32-3.594 3.545 0 6.575 2.838 7.32 3.595-.744.757-3.77 3.594-7.32 3.594z"/>
 <path d="M8 5.136c-1.787 0-3.24 1.316-3.24 2.934 0 1.617 1.453 2.934 3.24 2.934 1.787 0 3.241-1.317 3.241-2.934 0-1.618-1.454-2.934-3.241-2.934zm0 5.283c-1.431 0-2.595-1.054-2.595-2.35C5.405 6.775 6.569 5.72 8 5.72c1.431 0 2.596 1.054 2.596 2.35 0 1.295-1.165 2.35-2.596 2.35z"/>
 <path d="M8 6.864c-.734 0-1.331.541-1.331 1.206 0 .664.597 1.205 1.331 1.205s1.331-.54 1.331-1.205S8.734 6.864 8 6.864zM8 8.69c-.378 0-.686-.278-.686-.62 0-.343.308-.621.686-.621.378 0 .686.278.686.62 0 .343-.308.621-.686.621z"/>
 </g>
 </symbol>

</svg>
`
)});
  main.variable(observer("info")).define("info", function(){return(
`<svg id="fieldbook-info" width="133" height="39" viewBox="0 0 133 39" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.73732 23.3815H11.6542C11.6756 23.3815 11.6962 23.39 11.7113 23.4051C11.7265 23.4203 11.735 23.4408 11.735 23.4623V26.4189C11.735 26.4404 11.7265 26.4609 11.7113 26.4761C11.6962 26.4912 11.6756 26.4997 11.6542 26.4997H9.73734C9.7159 26.4997 9.69534 26.4912 9.68017 26.4761C9.66501 26.4609 9.65649 26.4403 9.65649 26.4189V23.4623C9.65649 23.4517 9.65858 23.4412 9.66265 23.4314C9.66671 23.4216 9.67266 23.4126 9.68017 23.4051C9.68767 23.3976 9.69658 23.3917 9.70639 23.3876C9.71619 23.3836 9.7267 23.3815 9.73732 23.3815Z" fill="#C4C4C4"/>
<path d="M15.0576 22.1287C14.8937 21.9648 14.6714 21.8727 14.4396 21.8727H2.31316C2.08138 21.8727 1.85909 21.9648 1.69519 22.1287C1.53129 22.2925 1.43921 22.5148 1.43921 22.7466V37.3569C1.43921 37.5887 1.53129 37.811 1.69519 37.9749C1.85908 38.1388 2.08138 38.2308 2.31316 38.2308H16.9234C17.1552 38.2308 17.3775 38.1388 17.5414 37.9749C17.7053 37.811 17.7974 37.5887 17.7974 37.3569V25.2304C17.7974 25.1157 17.7748 25.002 17.7308 24.896C17.6869 24.79 17.6225 24.6936 17.5414 24.6125L15.0576 22.1287ZM6.26487 22.9514C6.26487 22.9052 6.27397 22.8595 6.29164 22.8168C6.30932 22.7741 6.33522 22.7354 6.36788 22.7027C6.40053 22.67 6.4393 22.6441 6.48197 22.6265C6.52463 22.6088 6.57036 22.5997 6.61654 22.5997H12.62C12.6662 22.5997 12.7119 22.6088 12.7546 22.6265C12.7973 22.6441 12.8361 22.67 12.8687 22.7027C12.9014 22.7354 12.9273 22.7741 12.9449 22.8168C12.9626 22.8595 12.9717 22.9052 12.9717 22.9514V26.9298C12.9717 26.976 12.9626 27.0217 12.9449 27.0644C12.9273 27.1071 12.9014 27.1458 12.8687 27.1785C12.8361 27.2111 12.7973 27.237 12.7546 27.2547C12.712 27.2724 12.6662 27.2815 12.62 27.2815H6.61654C6.57036 27.2815 6.52463 27.2724 6.48197 27.2547C6.4393 27.237 6.40053 27.2111 6.36788 27.1785C6.33522 27.1458 6.30932 27.1071 6.29164 27.0644C6.27397 27.0217 6.26487 26.976 6.26487 26.9298V22.9514ZM15.664 35.8372C15.664 35.9585 15.6158 36.0748 15.53 36.1606C15.4442 36.2464 15.3279 36.2946 15.2066 36.2946H4.03001C3.90869 36.2946 3.79235 36.2464 3.70656 36.1606C3.62078 36.0748 3.57259 35.9585 3.57259 35.8372V29.7382C3.57259 29.6782 3.58443 29.6187 3.60741 29.5632C3.6304 29.5077 3.66409 29.4573 3.70657 29.4148C3.74904 29.3723 3.79947 29.3386 3.85496 29.3156C3.91046 29.2926 3.96994 29.2808 4.03001 29.2808H15.2066C15.2666 29.2808 15.3261 29.2926 15.3816 29.3156C15.4371 29.3386 15.4875 29.3723 15.53 29.4148C15.5725 29.4573 15.6062 29.5077 15.6292 29.5632C15.6522 29.6187 15.664 29.6782 15.664 29.7382V35.8372Z" fill="#C4C4C4"/>
<path d="M12.9377 31.2691H6.29879C6.19032 31.2691 6.08631 31.3122 6.00961 31.3889C5.93292 31.4656 5.88983 31.5696 5.88983 31.6781C5.88983 31.7865 5.93292 31.8905 6.00961 31.9672C6.08631 32.0439 6.19032 32.087 6.29879 32.087H12.9377C13.0462 32.087 13.1502 32.0439 13.2269 31.9672C13.3036 31.8905 13.3467 31.7865 13.3467 31.6781C13.3467 31.5696 13.3036 31.4656 13.2269 31.3889C13.1502 31.3122 13.0462 31.2691 12.9377 31.2691Z" fill="#C4C4C4"/>
<path d="M12.9377 33.4882H6.29879C6.19032 33.4882 6.08631 33.5313 6.00961 33.608C5.93292 33.6847 5.88983 33.7887 5.88983 33.8972C5.88983 34.0056 5.93292 34.1097 6.00961 34.1863C6.08631 34.263 6.19032 34.3061 6.29879 34.3061H12.9377C13.0462 34.3061 13.1502 34.263 13.2269 34.1863C13.3036 34.1097 13.3467 34.0056 13.3467 33.8972C13.3467 33.7887 13.3036 33.6847 13.2269 33.608C13.1502 33.5313 13.0462 33.4882 12.9377 33.4882Z" fill="#C4C4C4"/>
<path d="M3.12185 12.2665C2.54985 12.2665 2.08185 12.0672 1.71785 11.6685C1.35385 11.2612 1.17185 10.6502 1.17185 9.83553C1.17185 9.28953 1.26718 8.77387 1.45785 8.28853C1.64852 7.79453 1.90418 7.3612 2.22485 6.98853C2.54552 6.6072 2.90518 6.3082 3.30385 6.09153C3.70252 5.87487 4.10552 5.76653 4.51285 5.76653C4.91152 5.76653 5.22785 5.85753 5.46185 6.03953C5.69585 6.21287 5.84752 6.4382 5.91685 6.71553C5.89085 6.8802 5.82152 6.9972 5.70885 7.06653C5.60485 7.13587 5.49218 7.17053 5.37085 7.17053C5.23218 7.17053 5.09785 7.1272 4.96785 7.04053C4.84652 6.9452 4.72518 6.83253 4.60385 6.70253L4.21385 6.26053C3.84118 6.39053 3.49885 6.62453 3.18685 6.96253C2.87485 7.30053 2.62352 7.70787 2.43285 8.18453C2.24218 8.65253 2.14685 9.1552 2.14685 9.69253C2.14685 10.2559 2.28118 10.6762 2.54985 10.9535C2.81852 11.2309 3.16518 11.3695 3.58985 11.3695C3.93652 11.3695 4.23985 11.2655 4.49985 11.0575C4.76852 10.8495 4.99385 10.6372 5.17585 10.4205L5.47485 10.6545C5.21485 11.1052 4.86818 11.4865 4.43485 11.7985C4.00152 12.1105 3.56385 12.2665 3.12185 12.2665ZM7.06379 10.6545L7.93479 6.57253H6.60879L6.69979 6.05253L8.10379 5.92253L8.71479 4.18053H9.37779L9.00079 5.93553H10.6518L10.5478 6.63753L8.87079 6.58553L8.07779 10.3165C7.99979 10.6632 7.96079 10.9145 7.96079 11.0705C7.96079 11.1659 7.99113 11.2395 8.05179 11.2915C8.12113 11.3435 8.19479 11.3695 8.27279 11.3695C8.60213 11.3695 9.02679 11.0575 9.54679 10.4335L9.87179 10.6805C9.68979 10.9405 9.48179 11.1919 9.24779 11.4345C9.01379 11.6772 8.76246 11.8765 8.49379 12.0325C8.22513 12.1885 7.94346 12.2665 7.64879 12.2665C7.45813 12.2665 7.28913 12.2102 7.14179 12.0975C7.00313 11.9849 6.93379 11.8202 6.93379 11.6035C6.93379 11.5082 6.94246 11.3955 6.95979 11.2655C6.97713 11.1269 7.01179 10.9232 7.06379 10.6545ZM11.0936 12.0975L12.1986 6.88453L10.9116 6.80653L10.9636 6.42953L13.1086 5.76653L13.2776 5.89653L12.9916 7.63853C13.1823 7.3092 13.3816 7.00587 13.5896 6.72853C13.8063 6.44253 14.0316 6.21287 14.2656 6.03953C14.4996 5.85753 14.7293 5.76653 14.9546 5.76653C15.1366 5.76653 15.3056 5.79687 15.4616 5.85753C15.6176 5.90953 15.7389 6.0092 15.8256 6.15653C15.8169 6.3732 15.7519 6.55087 15.6306 6.68953C15.5179 6.81953 15.3533 6.88453 15.1366 6.88453C15.0239 6.88453 14.8983 6.8542 14.7596 6.79353C14.6296 6.7242 14.4996 6.64187 14.3696 6.54653C14.0576 6.80653 13.7716 7.1142 13.5116 7.46953C13.2516 7.82487 13.0046 8.2322 12.7706 8.69153L12.6146 9.36753C12.5193 9.8182 12.4283 10.2732 12.3416 10.7325C12.2636 11.1832 12.1813 11.6382 12.0946 12.0975L11.2236 12.2015L11.0936 12.0975ZM16.7468 12.2665C16.5474 12.2665 16.3741 12.2059 16.2268 12.0845C16.0881 11.9545 16.0188 11.7639 16.0188 11.5125C16.0188 11.4172 16.0274 11.3045 16.0448 11.1745C16.0708 11.0445 16.1011 10.8669 16.1358 10.6415L17.0718 5.89653C17.1498 5.5152 17.2234 5.13387 17.2928 4.75253C17.3621 4.36253 17.4271 3.97253 17.4878 3.58253L16.2658 3.50453L16.3178 3.12753L18.5538 2.47753L18.6968 2.58153L17.1368 10.3165C17.0588 10.6632 17.0198 10.9145 17.0198 11.0705C17.0198 11.1659 17.0501 11.2395 17.1108 11.2915C17.1801 11.3435 17.2581 11.3695 17.3448 11.3695C17.4834 11.3695 17.6568 11.2872 17.8648 11.1225C18.0814 10.9579 18.3198 10.7282 18.5798 10.4335L18.8788 10.6805C18.6968 10.9319 18.4974 11.1832 18.2808 11.4345C18.0728 11.6772 17.8431 11.8765 17.5918 12.0325C17.3404 12.1885 17.0588 12.2665 16.7468 12.2665ZM21.9766 10.9015V8.15853H19.4546V7.46953H21.9766V4.77853H22.7176V7.46953H25.2266V8.15853H22.7176V10.9015H21.9766ZM29.8582 10.4205C29.8582 10.9579 29.6545 11.3999 29.2472 11.7465C28.8485 12.0932 28.3198 12.2665 27.6612 12.2665C27.1585 12.2665 26.7728 12.1495 26.5042 11.9155C26.2442 11.6815 26.0925 11.3695 26.0492 10.9795C26.0838 10.8669 26.1445 10.7802 26.2312 10.7195C26.3265 10.6502 26.4262 10.6155 26.5302 10.6155C26.7208 10.6155 26.8595 10.6675 26.9462 10.7715C27.0415 10.8669 27.1108 11.0055 27.1542 11.1875L27.2972 11.7465C27.3232 11.7552 27.3492 11.7595 27.3752 11.7595C27.4098 11.7595 27.4445 11.7595 27.4792 11.7595C27.9298 11.7595 28.2808 11.6599 28.5322 11.4605C28.7835 11.2612 28.9092 10.9925 28.9092 10.6545C28.9092 10.4465 28.8615 10.2472 28.7662 10.0565C28.6708 9.86587 28.4368 9.6362 28.0642 9.36753C27.7435 9.1162 27.4705 8.86053 27.2452 8.60053C27.0285 8.33187 26.9202 7.99387 26.9202 7.58653C26.9202 7.24853 27.0068 6.94087 27.1802 6.66353C27.3535 6.3862 27.5918 6.16953 27.8952 6.01353C28.2072 5.84887 28.5712 5.76653 28.9872 5.76653C29.3685 5.76653 29.6978 5.8532 29.9752 6.02653C30.2525 6.1912 30.4388 6.48587 30.5342 6.91053C30.4562 7.1532 30.2915 7.27453 30.0402 7.27453C29.7368 7.27453 29.5158 7.07087 29.3772 6.66353L29.2602 6.28653C29.2342 6.27787 29.2038 6.27353 29.1692 6.27353C29.1432 6.27353 29.1128 6.27353 29.0782 6.27353C28.6275 6.27353 28.3068 6.37753 28.1162 6.58553C27.9342 6.79353 27.8432 7.04487 27.8432 7.33953C27.8432 7.6082 27.9082 7.83353 28.0382 8.01553C28.1768 8.18887 28.4325 8.4142 28.8052 8.69153C29.1952 8.9862 29.4682 9.25487 29.6242 9.49753C29.7802 9.73153 29.8582 10.0392 29.8582 10.4205Z" fill="#C4C4C4"/>
<path d="M69.987 12.2665C69.415 12.2665 68.947 12.0672 68.583 11.6685C68.219 11.2612 68.037 10.6502 68.037 9.83553C68.037 9.28953 68.1323 8.77387 68.323 8.28853C68.5136 7.79453 68.7693 7.3612 69.09 6.98853C69.4106 6.6072 69.7703 6.3082 70.169 6.09153C70.5676 5.87487 70.9706 5.76653 71.378 5.76653C71.7766 5.76653 72.093 5.85753 72.327 6.03953C72.561 6.21287 72.7126 6.4382 72.782 6.71553C72.756 6.8802 72.6866 6.9972 72.574 7.06653C72.47 7.13587 72.3573 7.17053 72.236 7.17053C72.0973 7.17053 71.963 7.1272 71.833 7.04053C71.7116 6.9452 71.5903 6.83253 71.469 6.70253L71.079 6.26053C70.7063 6.39053 70.364 6.62453 70.052 6.96253C69.74 7.30053 69.4886 7.70787 69.298 8.18453C69.1073 8.65253 69.012 9.1552 69.012 9.69253C69.012 10.2559 69.1463 10.6762 69.415 10.9535C69.6836 11.2309 70.0303 11.3695 70.455 11.3695C70.8016 11.3695 71.105 11.2655 71.365 11.0575C71.6336 10.8495 71.859 10.6372 72.041 10.4205L72.34 10.6545C72.08 11.1052 71.7333 11.4865 71.3 11.7985C70.8666 12.1105 70.429 12.2665 69.987 12.2665ZM73.9289 10.6545L74.7999 6.57253H73.4739L73.5649 6.05253L74.9689 5.92253L75.5799 4.18053H76.2429L75.8659 5.93553H77.5169L77.4129 6.63753L75.7359 6.58553L74.9429 10.3165C74.8649 10.6632 74.8259 10.9145 74.8259 11.0705C74.8259 11.1659 74.8562 11.2395 74.9169 11.2915C74.9862 11.3435 75.0599 11.3695 75.1379 11.3695C75.4672 11.3695 75.8919 11.0575 76.4119 10.4335L76.7369 10.6805C76.5549 10.9405 76.3469 11.1919 76.1129 11.4345C75.8789 11.6772 75.6276 11.8765 75.3589 12.0325C75.0902 12.1885 74.8086 12.2665 74.5139 12.2665C74.3232 12.2665 74.1542 12.2102 74.0069 12.0975C73.8682 11.9849 73.7989 11.8202 73.7989 11.6035C73.7989 11.5082 73.8076 11.3955 73.8249 11.2655C73.8422 11.1269 73.8769 10.9232 73.9289 10.6545ZM77.9587 12.0975L79.0637 6.88453L77.7767 6.80653L77.8287 6.42953L79.9737 5.76653L80.1427 5.89653L79.8567 7.63853C80.0474 7.3092 80.2467 7.00587 80.4547 6.72853C80.6714 6.44253 80.8967 6.21287 81.1307 6.03953C81.3647 5.85753 81.5944 5.76653 81.8197 5.76653C82.0017 5.76653 82.1707 5.79687 82.3267 5.85753C82.4827 5.90953 82.604 6.0092 82.6907 6.15653C82.682 6.3732 82.617 6.55087 82.4957 6.68953C82.383 6.81953 82.2184 6.88453 82.0017 6.88453C81.889 6.88453 81.7634 6.8542 81.6247 6.79353C81.4947 6.7242 81.3647 6.64187 81.2347 6.54653C80.9227 6.80653 80.6367 7.1142 80.3767 7.46953C80.1167 7.82487 79.8697 8.2322 79.6357 8.69153L79.4797 9.36753C79.3844 9.8182 79.2934 10.2732 79.2067 10.7325C79.1287 11.1832 79.0464 11.6382 78.9597 12.0975L78.0887 12.2015L77.9587 12.0975ZM83.6119 12.2665C83.4125 12.2665 83.2392 12.2059 83.0919 12.0845C82.9532 11.9545 82.8839 11.7639 82.8839 11.5125C82.8839 11.4172 82.8925 11.3045 82.9099 11.1745C82.9359 11.0445 82.9662 10.8669 83.0009 10.6415L83.9369 5.89653C84.0149 5.5152 84.0885 5.13387 84.1579 4.75253C84.2272 4.36253 84.2922 3.97253 84.3529 3.58253L83.1309 3.50453L83.1829 3.12753L85.4189 2.47753L85.5619 2.58153L84.0019 10.3165C83.9239 10.6632 83.8849 10.9145 83.8849 11.0705C83.8849 11.1659 83.9152 11.2395 83.9759 11.2915C84.0452 11.3435 84.1232 11.3695 84.2099 11.3695C84.3485 11.3695 84.5219 11.2872 84.7299 11.1225C84.9465 10.9579 85.1849 10.7282 85.4449 10.4335L85.7439 10.6805C85.5619 10.9319 85.3625 11.1832 85.1459 11.4345C84.9379 11.6772 84.7082 11.8765 84.4569 12.0325C84.2055 12.1885 83.9239 12.2665 83.6119 12.2665ZM88.8417 10.9015V8.15853H86.3197V7.46953H88.8417V4.77853H89.5827V7.46953H92.0917V8.15853H89.5827V10.9015H88.8417ZM91.3803 14.4635C91.415 14.2729 91.4973 14.1255 91.6273 14.0215C91.7486 13.9262 91.9003 13.8785 92.0823 13.8785C92.273 13.8785 92.4463 13.9175 92.6023 13.9955C92.767 14.0822 92.9446 14.1949 93.1353 14.3335L93.1743 14.3595C93.599 14.0909 93.989 13.7745 94.3443 13.4105C94.4656 13.2892 94.5826 13.1635 94.6953 13.0335C94.808 12.9035 94.9206 12.7692 95.0333 12.6305C94.9986 12.1192 94.9553 11.6642 94.9033 11.2655C94.86 10.8582 94.808 10.4379 94.7473 10.0045C94.6953 9.5712 94.6303 9.06853 94.5523 8.49653C94.4916 7.94187 94.4353 7.53887 94.3833 7.28753C94.34 7.02753 94.2923 6.85853 94.2403 6.78053C94.1883 6.70253 94.1233 6.66353 94.0453 6.66353C93.9326 6.66353 93.8156 6.71987 93.6943 6.83253C93.5816 6.93653 93.4083 7.1662 93.1743 7.52153L92.8753 7.31353C93.1353 6.75887 93.4083 6.36453 93.6943 6.13053C93.9803 5.88787 94.2576 5.76653 94.5263 5.76653C94.691 5.76653 94.8296 5.80987 94.9423 5.89653C95.0636 5.9832 95.1633 6.1522 95.2413 6.40353C95.328 6.6462 95.3973 7.0102 95.4493 7.49553C95.5273 8.24953 95.588 8.9602 95.6313 9.62753C95.6833 10.2949 95.7223 10.9319 95.7483 11.5385C96.0516 10.9839 96.3073 10.4942 96.5153 10.0695C96.732 9.64487 96.9183 9.22887 97.0743 8.82153C97.239 8.40553 97.3906 7.95053 97.5293 7.45653C97.6766 6.95387 97.798 6.57687 97.8933 6.32553C97.9973 6.0742 98.097 5.9052 98.1923 5.81853C98.2876 5.73187 98.396 5.68853 98.5173 5.68853C98.6646 5.68853 98.7816 5.73187 98.8683 5.81853C98.955 5.89653 98.9983 6.00053 98.9983 6.13053C98.9983 6.2952 98.9766 6.44687 98.9333 6.58553C98.89 6.7242 98.8033 6.92353 98.6733 7.18353C98.5346 7.46087 98.3873 7.7512 98.2313 8.05453C98.084 8.3492 97.8846 8.71753 97.6333 9.15953C97.3906 9.5842 97.1263 10.0479 96.8403 10.5505C96.563 11.0445 96.2466 11.5602 95.8913 12.0975C95.7266 12.3489 95.549 12.6089 95.3583 12.8775C95.1676 13.1549 94.938 13.4409 94.6693 13.7355C94.2446 14.1949 93.8373 14.5545 93.4473 14.8145C93.066 15.0832 92.6846 15.2175 92.3033 15.2175C92.0173 15.2175 91.7963 15.1439 91.6403 14.9965C91.4843 14.8579 91.3976 14.6802 91.3803 14.4635ZM97.4719 14.1775L103.257 2.86753H104.089L98.2909 14.1775H97.4719ZM108.009 12.2665C107.836 12.2665 107.676 12.2102 107.528 12.0975C107.39 11.9849 107.32 11.8159 107.32 11.5905C107.32 11.5039 107.325 11.4042 107.333 11.2915C107.351 11.1702 107.381 11.0012 107.424 10.7845C106.922 11.2439 106.462 11.6079 106.046 11.8765C105.63 12.1365 105.223 12.2665 104.824 12.2665C104.582 12.2665 104.369 12.1972 104.187 12.0585C104.014 11.9199 103.927 11.6729 103.927 11.3175C103.927 11.0749 103.958 10.8062 104.018 10.5115C104.088 10.2082 104.148 9.93087 104.2 9.67953L104.798 6.87153L103.511 6.80653L103.563 6.41653L105.825 5.76653L105.994 5.89653L105.175 9.57553C105.115 9.8442 105.067 10.0825 105.032 10.2905C104.998 10.4899 104.98 10.6632 104.98 10.8105C104.98 11.1832 105.145 11.3695 105.474 11.3695C105.752 11.3695 106.042 11.2829 106.345 11.1095C106.649 10.9275 107.047 10.6415 107.541 10.2515L107.892 8.52253C107.979 8.10653 108.061 7.69053 108.139 7.27453C108.226 6.85853 108.3 6.44253 108.36 6.02653L109.205 5.76653L109.374 5.89653L108.451 10.3425C108.417 10.5072 108.386 10.6545 108.36 10.7845C108.343 10.9145 108.334 11.0142 108.334 11.0835C108.334 11.1702 108.365 11.2395 108.425 11.2915C108.486 11.3435 108.555 11.3695 108.633 11.3695C108.807 11.3695 108.997 11.2915 109.205 11.1355C109.413 10.9795 109.652 10.7455 109.92 10.4335L110.232 10.6805C110.033 10.9405 109.821 11.1919 109.595 11.4345C109.37 11.6772 109.127 11.8765 108.867 12.0325C108.607 12.1885 108.321 12.2665 108.009 12.2665ZM109.19 14.1775L114.975 2.86753H115.807L110.009 14.1775H109.19ZM115.795 11.6035C115.795 11.5082 115.804 11.3955 115.821 11.2655C115.838 11.1269 115.877 10.9232 115.938 10.6545L116.718 6.88453L115.431 6.80653L115.483 6.42953L117.693 5.76653L117.862 5.89653L116.939 10.3425C116.904 10.5072 116.874 10.6545 116.848 10.7845C116.831 10.9145 116.822 11.0142 116.822 11.0835C116.822 11.1702 116.852 11.2395 116.913 11.2915C116.974 11.3435 117.039 11.3695 117.108 11.3695C117.42 11.3695 117.836 11.0575 118.356 10.4335L118.681 10.6805C118.49 10.9405 118.282 11.1919 118.057 11.4345C117.84 11.6772 117.602 11.8765 117.342 12.0325C117.091 12.1885 116.809 12.2665 116.497 12.2665C116.324 12.2665 116.163 12.2102 116.016 12.0975C115.869 11.9849 115.795 11.8202 115.795 11.6035ZM117.706 3.99853C117.498 3.99853 117.329 3.93353 117.199 3.80353C117.069 3.66487 117.004 3.4742 117.004 3.23153C117.004 3.01487 117.082 2.82853 117.238 2.67253C117.394 2.50787 117.572 2.42553 117.771 2.42553C117.979 2.42553 118.148 2.49487 118.278 2.63353C118.408 2.76353 118.473 2.94553 118.473 3.17953C118.473 3.38753 118.395 3.5782 118.239 3.75153C118.083 3.9162 117.905 3.99853 117.706 3.99853Z" fill="#C4C4C4"/>
<path d="M107.846 26.7777L107.842 26.7666L107.84 26.7606C107.84 26.7597 107.839 26.7589 107.838 26.758L107.829 26.7482L103.045 21.9642C103.045 21.9642 103.045 21.9641 103.044 21.964C103.037 21.9571 103.028 21.9532 103.018 21.953L92.8864 21.953C92.8775 21.953 92.869 21.9565 92.8628 21.9628C92.8565 21.969 92.853 21.9775 92.853 21.9863L92.853 36.9197C92.853 36.9285 92.8565 36.937 92.8628 36.9432C92.869 36.9495 92.8775 36.953 92.8864 36.953L107.82 36.953C107.829 36.953 107.837 36.9495 107.843 36.9432C107.85 36.937 107.853 36.9285 107.853 36.9197L107.853 26.8358C107.851 26.8215 107.849 26.8054 107.848 26.7877L107.847 26.7844C107.847 26.7821 107.847 26.7799 107.846 26.7777ZM103.053 23.2739L103.053 22.0667L103.907 22.9203L106.886 25.8994L107.739 26.753L106.532 26.753L103.553 26.753L103.053 26.753L103.053 26.253L103.053 23.2739ZM102.486 22.0197L102.986 22.0197L102.986 22.5197L102.986 26.7863C102.986 26.7952 102.99 26.8037 102.996 26.8099C103.002 26.8162 103.011 26.8197 103.02 26.8197L107.286 26.8197L107.786 26.8197L107.786 27.3197L107.786 36.3863L107.786 36.8863L107.286 36.8863L93.4197 36.8863L92.9197 36.8863L92.9197 36.3863L92.9197 22.5197L92.9197 22.0197L93.4197 22.0197L102.486 22.0197ZM103.02 27.8197C102.746 27.8197 102.483 27.7108 102.289 27.517C102.095 27.3232 101.986 27.0604 101.986 26.7863L101.986 23.0197L93.9197 23.0197L93.9197 35.8863L106.786 35.8863L106.786 27.8197L103.02 27.8197Z" fill="#F3F5F7" stroke="#C4C4C4"/>
<path d="M107.846 26.7777L107.842 26.7666L107.84 26.7606C107.84 26.7597 107.839 26.7589 107.838 26.758L107.829 26.7482L103.045 21.9642C103.045 21.9642 103.045 21.9641 103.044 21.964C103.037 21.9571 103.028 21.9532 103.018 21.953L92.8864 21.953C92.8775 21.953 92.869 21.9565 92.8628 21.9628C92.8565 21.969 92.853 21.9775 92.853 21.9863L92.853 36.9197C92.853 36.9285 92.8565 36.937 92.8628 36.9432C92.869 36.9495 92.8775 36.953 92.8864 36.953L107.82 36.953C107.829 36.953 107.837 36.9495 107.843 36.9432C107.85 36.937 107.853 36.9285 107.853 36.9197L107.853 26.8358C107.851 26.8215 107.849 26.8054 107.848 26.7877L107.847 26.7844C107.847 26.7821 107.847 26.7799 107.846 26.7777ZM102.486 22.0197L102.986 22.0197L102.986 22.5197L102.986 26.7863C102.986 26.7952 102.99 26.8037 102.996 26.8099C103.002 26.8162 103.011 26.8197 103.02 26.8197L107.286 26.8197L107.786 26.8197L107.786 27.3197L107.786 36.3863L107.786 36.8863L107.286 36.8863L93.4197 36.8863L92.9197 36.8863L92.9197 36.3863L92.9197 22.5197L92.9197 22.0197L93.4197 22.0197L102.486 22.0197ZM103.053 23.2739L103.053 22.0667L103.907 22.9203L106.886 25.8994L107.739 26.753L106.532 26.753L103.553 26.753L103.053 26.753L103.053 26.253L103.053 23.2739Z" fill="#F3F5F7" stroke="#C4C4C4"/>
<path d="M75.3339 22.2048C74.8597 22.2048 74.4382 22.4686 74.245 22.9082L72.6468 26.2845L69.1166 26.8121C68.4492 26.9176 68.0101 27.5331 68.0979 28.1837C68.1331 28.4299 68.256 28.6585 68.4316 28.8519L71.031 31.5249L70.4163 35.288C70.3109 35.9387 70.75 36.5717 71.4174 36.6772C71.6808 36.7124 71.9618 36.6772 72.1901 36.5366L75.3339 34.8132L78.4777 36.5542C79.0572 36.8707 79.7949 36.6597 80.111 36.0794C80.234 35.8332 80.2867 35.5694 80.2515 35.3056L79.6368 31.5424L82.2361 28.8871C82.7104 28.4123 82.6928 27.6386 82.2186 27.1814C82.043 27.0055 81.8146 26.8824 81.5512 26.8473L78.021 26.2845L76.4228 22.8906C76.2296 22.4686 75.8081 22.2048 75.3339 22.2048Z" fill="#E5E5E5" stroke="#C4C4C4" stroke-width="2"/>
<path d="M121.673 34.6763C122.696 35.3636 123.9 35.7317 125.132 35.7339C126.364 35.7361 127.568 35.3724 128.593 34.6888C129.372 34.1707 130.026 33.4863 130.508 32.6849C130.99 31.8835 131.288 30.985 131.382 30.0544C131.5 28.8327 131.258 27.603 130.684 26.5179C130.111 25.4327 129.231 24.5398 128.155 23.9499C127.079 23.3601 125.853 23.0991 124.63 23.1995C123.407 23.2999 122.24 23.7571 121.275 24.5146L126.397 29.6381V26.6964H127.901V31.4613C127.901 31.6608 127.822 31.8522 127.681 31.9933C127.54 32.1343 127.349 32.2136 127.149 32.2136H122.386V30.7089H125.334L119.126 24.4845L119.658 23.9528C120.426 23.1841 121.347 22.585 122.361 22.1944C123.376 21.8038 124.46 21.6303 125.546 21.685C126.631 21.7398 127.693 22.0217 128.663 22.5124C129.633 23.0032 130.489 23.6919 131.176 24.5341C131.863 25.3763 132.366 26.3533 132.652 27.402C132.939 28.4507 133.002 29.5478 132.838 30.6224C132.674 31.6971 132.286 32.7253 131.7 33.6409C131.114 34.5564 130.343 35.3389 129.436 35.9377C128.265 36.7139 126.905 37.1579 125.501 37.2226C124.098 37.2873 122.703 36.9702 121.465 36.3052C120.228 35.6401 119.193 34.6519 118.472 33.4457C117.751 32.2395 117.371 30.8603 117.371 29.455H118.875C118.874 30.4889 119.128 31.5071 119.617 32.4183C120.105 33.3296 120.812 34.1054 121.673 34.6763Z" fill="#C4C4C4"/>
</svg>
`
)});
  main.variable(observer("eye_toggle")).define("eye_toggle", function(){return(
() => {}
)});
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
  console.log(curr);
}
)});
  main.variable(observer("is_dev")).define("is_dev", function(){return(
window.location.href.match(/worker/) ? true : false
)});
  return main;
}
