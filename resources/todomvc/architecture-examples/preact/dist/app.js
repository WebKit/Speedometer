!function(){"use strict";var e,t,n,o,l,i,r,_={},s=[],u=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function c(e,t){for(var n in t)e[n]=t[n];return e}function a(e){var t=e.parentNode;t&&t.removeChild(e)}function d(t,n,o){var l,i,r,_={};for(r in n)"key"==r?l=n[r]:"ref"==r?i=n[r]:_[r]=n[r];if(arguments.length>2&&(_.children=arguments.length>3?e.call(arguments,2):o),"function"==typeof t&&null!=t.defaultProps)for(r in t.defaultProps)void 0===_[r]&&(_[r]=t.defaultProps[r]);return p(t,_,l,i,null)}function p(e,o,l,i,r){var _={type:e,props:o,key:l,ref:i,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==r?++n:r};return null==r&&null!=t.vnode&&t.vnode(_),_}function h(e){return e.children}function f(e,t){this.props=e,this.context=t}function m(e,t){if(null==t)return e.__?m(e.__,e.__.__k.indexOf(e)+1):null;for(var n;t<e.__k.length;t++)if(null!=(n=e.__k[t])&&null!=n.__e)return n.__e;return"function"==typeof e.type?m(e):null}function v(e){var t,n;if(null!=(e=e.__)&&null!=e.__c){for(e.__e=e.__c.base=null,t=0;t<e.__k.length;t++)if(null!=(n=e.__k[t])&&null!=n.__e){e.__e=e.__c.base=n.__e;break}return v(e)}}function g(e){(!e.__d&&(e.__d=!0)&&o.push(e)&&!y.__r++||l!==t.debounceRendering)&&((l=t.debounceRendering)||i)(y)}function y(){var e,t,n,l,i,_,s,u;for(o.sort(r);e=o.shift();)e.__d&&(t=o.length,l=void 0,i=void 0,s=(_=(n=e).__v).__e,(u=n.__P)&&(l=[],(i=c({},_)).__v=_.__v+1,D(u,_,i,n.__n,void 0!==u.ownerSVGElement,null!=_.__h?[s]:null,l,null==s?m(_):s,_.__h),I(l,_),_.__e!=s&&v(_)),o.length>t&&o.sort(r));y.__r=0}function b(e,t,n,o,l,i,r,u,c,a){var d,f,v,g,y,b,x,C=o&&o.__k||s,E=C.length;for(n.__k=[],d=0;d<t.length;d++)if(null!=(g=n.__k[d]=null==(g=t[d])||"boolean"==typeof g||"function"==typeof g?null:"string"==typeof g||"number"==typeof g||"bigint"==typeof g?p(null,g,null,null,g):Array.isArray(g)?p(h,{children:g},null,null,null):g.__b>0?p(g.type,g.props,g.key,g.ref?g.ref:null,g.__v):g)){if(g.__=n,g.__b=n.__b+1,null===(v=C[d])||v&&g.key==v.key&&g.type===v.type)C[d]=void 0;else for(f=0;f<E;f++){if((v=C[f])&&g.key==v.key&&g.type===v.type){C[f]=void 0;break}v=null}D(e,g,v=v||_,l,i,r,u,c,a),y=g.__e,(f=g.ref)&&v.ref!=f&&(x||(x=[]),v.ref&&x.push(v.ref,null,g),x.push(f,g.__c||y,g)),null!=y?(null==b&&(b=y),"function"==typeof g.type&&g.__k===v.__k?g.__d=c=k(g,c,e):c=S(e,g,v,C,y,c),"function"==typeof n.type&&(n.__d=c)):c&&v.__e==c&&c.parentNode!=e&&(c=m(v))}for(n.__e=b,d=E;d--;)null!=C[d]&&("function"==typeof n.type&&null!=C[d].__e&&C[d].__e==n.__d&&(n.__d=w(o).nextSibling),N(C[d],C[d]));if(x)for(d=0;d<x.length;d++)A(x[d],x[++d],x[++d])}function k(e,t,n){for(var o,l=e.__k,i=0;l&&i<l.length;i++)(o=l[i])&&(o.__=e,t="function"==typeof o.type?k(o,t,n):S(n,o,o,l,o.__e,t));return t}function S(e,t,n,o,l,i){var r,_,s;if(void 0!==t.__d)r=t.__d,t.__d=void 0;else if(null==n||l!=i||null==l.parentNode)e:if(null==i||i.parentNode!==e)e.appendChild(l),r=null;else{for(_=i,s=0;(_=_.nextSibling)&&s<o.length;s+=1)if(_==l)break e;e.insertBefore(l,i),r=i}return void 0!==r?r:l.nextSibling}function w(e){var t,n,o;if(null==e.type||"string"==typeof e.type)return e.__e;if(e.__k)for(t=e.__k.length-1;t>=0;t--)if((n=e.__k[t])&&(o=w(n)))return o;return null}function x(e,t,n){"-"===t[0]?e.setProperty(t,null==n?"":n):e[t]=null==n?"":"number"!=typeof n||u.test(t)?n:n+"px"}function C(e,t,n,o,l){var i;e:if("style"===t)if("string"==typeof n)e.style.cssText=n;else{if("string"==typeof o&&(e.style.cssText=o=""),o)for(t in o)n&&t in n||x(e.style,t,"");if(n)for(t in n)o&&n[t]===o[t]||x(e.style,t,n[t])}else if("o"===t[0]&&"n"===t[1])i=t!==(t=t.replace(/Capture$/,"")),t=t.toLowerCase()in e?t.toLowerCase().slice(2):t.slice(2),e.l||(e.l={}),e.l[t+i]=n,n?o||e.addEventListener(t,i?T:E,i):e.removeEventListener(t,i?T:E,i);else if("dangerouslySetInnerHTML"!==t){if(l)t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if("width"!==t&&"height"!==t&&"href"!==t&&"list"!==t&&"form"!==t&&"tabIndex"!==t&&"download"!==t&&t in e)try{e[t]=null==n?"":n;break e}catch(e){}"function"==typeof n||(null==n||!1===n&&-1==t.indexOf("-")?e.removeAttribute(t):e.setAttribute(t,n))}}function E(e){return this.l[e.type+!1](t.event?t.event(e):e)}function T(e){return this.l[e.type+!0](t.event?t.event(e):e)}function D(e,n,o,l,i,r,_,s,u){var a,d,p,m,v,g,y,k,S,w,x,C,E,T,D,I=n.type;if(void 0!==n.constructor)return null;null!=o.__h&&(u=o.__h,s=n.__e=o.__e,n.__h=null,r=[s]),(a=t.__b)&&a(n);try{e:if("function"==typeof I){if(k=n.props,S=(a=I.contextType)&&l[a.__c],w=a?S?S.props.value:a.__:l,o.__c?y=(d=n.__c=o.__c).__=d.__E:("prototype"in I&&I.prototype.render?n.__c=d=new I(k,w):(n.__c=d=new f(k,w),d.constructor=I,d.render=U),S&&S.sub(d),d.props=k,d.state||(d.state={}),d.context=w,d.__n=l,p=d.__d=!0,d.__h=[],d._sb=[]),null==d.__s&&(d.__s=d.state),null!=I.getDerivedStateFromProps&&(d.__s==d.state&&(d.__s=c({},d.__s)),c(d.__s,I.getDerivedStateFromProps(k,d.__s))),m=d.props,v=d.state,d.__v=n,p)null==I.getDerivedStateFromProps&&null!=d.componentWillMount&&d.componentWillMount(),null!=d.componentDidMount&&d.__h.push(d.componentDidMount);else{if(null==I.getDerivedStateFromProps&&k!==m&&null!=d.componentWillReceiveProps&&d.componentWillReceiveProps(k,w),!d.__e&&null!=d.shouldComponentUpdate&&!1===d.shouldComponentUpdate(k,d.__s,w)||n.__v===o.__v){for(n.__v!==o.__v&&(d.props=k,d.state=d.__s,d.__d=!1),d.__e=!1,n.__e=o.__e,n.__k=o.__k,n.__k.forEach((function(e){e&&(e.__=n)})),x=0;x<d._sb.length;x++)d.__h.push(d._sb[x]);d._sb=[],d.__h.length&&_.push(d);break e}null!=d.componentWillUpdate&&d.componentWillUpdate(k,d.__s,w),null!=d.componentDidUpdate&&d.__h.push((function(){d.componentDidUpdate(m,v,g)}))}if(d.context=w,d.props=k,d.__P=e,C=t.__r,E=0,"prototype"in I&&I.prototype.render){for(d.state=d.__s,d.__d=!1,C&&C(n),a=d.render(d.props,d.state,d.context),T=0;T<d._sb.length;T++)d.__h.push(d._sb[T]);d._sb=[]}else do{d.__d=!1,C&&C(n),a=d.render(d.props,d.state,d.context),d.state=d.__s}while(d.__d&&++E<25);d.state=d.__s,null!=d.getChildContext&&(l=c(c({},l),d.getChildContext())),p||null==d.getSnapshotBeforeUpdate||(g=d.getSnapshotBeforeUpdate(m,v)),D=null!=a&&a.type===h&&null==a.key?a.props.children:a,b(e,Array.isArray(D)?D:[D],n,o,l,i,r,_,s,u),d.base=n.__e,n.__h=null,d.__h.length&&_.push(d),y&&(d.__E=d.__=null),d.__e=!1}else null==r&&n.__v===o.__v?(n.__k=o.__k,n.__e=o.__e):n.__e=P(o.__e,n,o,l,i,r,_,u);(a=t.diffed)&&a(n)}catch(e){n.__v=null,(u||null!=r)&&(n.__e=s,n.__h=!!u,r[r.indexOf(s)]=null),t.__e(e,n,o)}}function I(e,n){t.__c&&t.__c(n,e),e.some((function(n){try{e=n.__h,n.__h=[],e.some((function(e){e.call(n)}))}catch(e){t.__e(e,n.__v)}}))}function P(t,n,o,l,i,r,s,u){var c,d,p,h=o.props,f=n.props,v=n.type,g=0;if("svg"===v&&(i=!0),null!=r)for(;g<r.length;g++)if((c=r[g])&&"setAttribute"in c==!!v&&(v?c.localName===v:3===c.nodeType)){t=c,r[g]=null;break}if(null==t){if(null===v)return document.createTextNode(f);t=i?document.createElementNS("http://www.w3.org/2000/svg",v):document.createElement(v,f.is&&f),r=null,u=!1}if(null===v)h===f||u&&t.data===f||(t.data=f);else{if(r=r&&e.call(t.childNodes),d=(h=o.props||_).dangerouslySetInnerHTML,p=f.dangerouslySetInnerHTML,!u){if(null!=r)for(h={},g=0;g<t.attributes.length;g++)h[t.attributes[g].name]=t.attributes[g].value;(p||d)&&(p&&(d&&p.__html==d.__html||p.__html===t.innerHTML)||(t.innerHTML=p&&p.__html||""))}if(function(e,t,n,o,l){var i;for(i in n)"children"===i||"key"===i||i in t||C(e,i,null,n[i],o);for(i in t)l&&"function"!=typeof t[i]||"children"===i||"key"===i||"value"===i||"checked"===i||n[i]===t[i]||C(e,i,t[i],n[i],o)}(t,f,h,i,u),p)n.__k=[];else if(g=n.props.children,b(t,Array.isArray(g)?g:[g],n,o,l,i&&"foreignObject"!==v,r,s,r?r[0]:o.__k&&m(o,0),u),null!=r)for(g=r.length;g--;)null!=r[g]&&a(r[g]);u||("value"in f&&void 0!==(g=f.value)&&(g!==t.value||"progress"===v&&!g||"option"===v&&g!==h.value)&&C(t,"value",g,h.value,!1),"checked"in f&&void 0!==(g=f.checked)&&g!==t.checked&&C(t,"checked",g,h.checked,!1))}return t}function A(e,n,o){try{"function"==typeof e?e(n):e.current=n}catch(e){t.__e(e,o)}}function N(e,n,o){var l,i;if(t.unmount&&t.unmount(e),(l=e.ref)&&(l.current&&l.current!==e.__e||A(l,null,n)),null!=(l=e.__c)){if(l.componentWillUnmount)try{l.componentWillUnmount()}catch(e){t.__e(e,n)}l.base=l.__P=null,e.__c=void 0}if(l=e.__k)for(i=0;i<l.length;i++)l[i]&&N(l[i],n,o||"function"!=typeof e.type);o||null==e.__e||a(e.__e),e.__=e.__e=e.__d=void 0}function U(e,t,n){return this.constructor(e,n)}function R(e,t,n){return(t=function(e){var t=function(e,t){if("object"!=typeof e||null===e)return e;var n=e[Symbol.toPrimitive];if(void 0!==n){var o=n.call(e,t||"default");if("object"!=typeof o)return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:String(t)}(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}e=s.slice,t={__e:function(e,t,n,o){for(var l,i,r;t=t.__;)if((l=t.__c)&&!l.__)try{if((i=l.constructor)&&null!=i.getDerivedStateFromError&&(l.setState(i.getDerivedStateFromError(e)),r=l.__d),null!=l.componentDidCatch&&(l.componentDidCatch(e,o||{}),r=l.__d),r)return l.__E=l}catch(t){e=t}throw e}},n=0,f.prototype.setState=function(e,t){var n;n=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=c({},this.state),"function"==typeof e&&(e=e(c({},n),this.props)),e&&c(n,e),null!=e&&this.__v&&(t&&this._sb.push(t),g(this))},f.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),g(this))},f.prototype.render=h,o=[],i="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,r=function(e,t){return e.__v.__b-t.__v.__b},y.__r=0;var L,M=(function(e,t){e.exports=function(e,t,n,o,l){for(t=t.split?t.split("."):t,o=0;o<t.length;o++)e=e?e[t[o]]:l;return e===l?n:e}}(L={path:void 0,exports:{},require:function(e,t){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}()}}),L.exports);function W(e,t,n){var o=t.split("."),l=e.__lsc||(e.__lsc={});return l[t+n]||(l[t+n]=function(t){for(var l=t&&t.target||this,i={},r=i,_="string"==typeof n?M(t,n):l&&l.nodeName?l.type.match(/^che|rad/)?l.checked:l.value:t,s=0;s<o.length-1;s++)r=r[o[s]]||(r[o[s]]=!s&&e.state[o[s]]||{});r[o[s]]=_,e.setState(i)})}function j(){let e="";for(let t=0;t<32;t++){let n=16*Math.random()|0;8!==t&&12!==t&&16!==t&&20!==t||(e+="-"),e+=(12===t?4:16===t?3&n|8:n).toString(16)}return e}var F,O={},H={get exports(){return O},set exports(e){O=e}};function K(e){let{nowShowing:t,count:n,completedCount:o,onClearCompleted:l}=e;return d("footer",{class:"footer"},d("span",{class:"todo-count"},d("strong",null,n)," ",function(e,t){return 1===e?t:`${t}s`}(n,"item")," left"),d("ul",{class:"filters"},d("li",null,d("a",{href:"#/",class:O({selected:"all"===t})},"All"))," ",d("li",null,d("a",{href:"#/active",class:O({selected:"active"===t})},"Active"))," ",d("li",null,d("a",{href:"#/completed",class:O({selected:"completed"===t})},"Completed"))),o>0&&d("button",{class:"clear-completed",onClick:l},"Clear completed"))}
/*!
  	Copyright (c) 2018 Jed Watson.
  	Licensed under the MIT License (MIT), see
  	http://jedwatson.github.io/classnames
  */
F=H,function(){var e={}.hasOwnProperty;function t(){for(var n=[],o=0;o<arguments.length;o++){var l=arguments[o];if(l){var i=typeof l;if("string"===i||"number"===i)n.push(l);else if(Array.isArray(l)){if(l.length){var r=t.apply(null,l);r&&n.push(r)}}else if("object"===i){if(l.toString!==Object.prototype.toString&&!l.toString.toString().includes("[native code]")){n.push(l.toString());continue}for(var _ in l)e.call(l,_)&&l[_]&&n.push(_)}}}return n.join(" ")}F.exports?(t.default=t,F.exports=t):window.classNames=t}();class q extends f{constructor(){super(...arguments),R(this,"handleSubmit",(()=>{let{onSave:e,onRemove:t,todo:n}=this.props,o=this.state.editText.trim();o?(e(n,o),this.setState({editText:o})):t(n)})),R(this,"handleEdit",(()=>{let{onEdit:e,todo:t}=this.props;e(t),this.setState({editText:t.title})})),R(this,"toggle",(e=>{let{onToggle:t,todo:n}=this.props;t(n),e.preventDefault()})),R(this,"handleKeyDown",(e=>{if(27===e.which){let{todo:e}=this.props;this.setState({editText:e.title}),this.props.onCancel(e)}else 13===e.which&&this.handleSubmit()})),R(this,"handleDestroy",(()=>{this.props.onRemove(this.props.todo)}))}componentDidUpdate(){let e=this.base&&this.base.querySelector(".edit");e&&e.focus()}render(e,t){let{todo:{title:n,completed:o},editing:l}=e,{editText:i}=t;return d("li",{class:O({completed:o,editing:l})},d("div",{class:"view"},d("input",{class:"toggle",type:"checkbox",checked:o,onChange:this.toggle}),d("label",{onDblClick:this.handleEdit},n),d("button",{class:"destroy",onClick:this.handleDestroy})),l&&d("input",{class:"edit",value:i,onBlur:this.handleSubmit,onInput:this.linkState("editText"),onKeyDown:this.handleKeyDown}))}}const B={all:e=>!0,active:e=>!e.completed,completed:e=>e.completed};!function(n,o,l){var i,r,s;t.__&&t.__(n,o),r=(i="function"==typeof l)?null:l&&l.__k||o.__k,s=[],D(o,n=(!i&&l||o).__k=d(h,null,[n]),r||_,_,void 0!==o.ownerSVGElement,!i&&l?[l]:r?null:o.firstChild?e.call(o.childNodes):null,s,!i&&l?l:r?r.__e:o.firstChild,i),I(s,n)}(d(class extends f{constructor(){super(),R(this,"handleNewTodoKeyDown",(e=>{if("Enter"!==e.key&&"ENTER"!==e.key)return;e.preventDefault();let t=e.target.value.trim();t&&(this.model.addItem(t),this.setState({newTodo:""}))})),R(this,"toggleAll",(e=>{let t=e.target.checked;this.model.toggleAll(t)})),R(this,"clearCompleted",(()=>{this.model.clearCompleted()})),R(this,"toggleItem",(e=>{this.model.toggleItem(e)})),R(this,"removeItem",(e=>{this.model.removeItem(e)})),R(this,"updateItem",((e,t)=>{this.model.updateItem(e,t),this.stopEdit()})),R(this,"startEdit",(e=>{this.setState({editing:e.id})})),R(this,"stopEdit",(()=>{this.setState({editing:null})})),this.model=function(e){let t=[];const n=[e];function o(){n.forEach((e=>e()))}return{addItem:function(e){t=t.concat({id:j(),title:e,completed:!1}),o()},toggleAll:function(e){t=t.map((t=>({...t,completed:e}))),o()},toggleItem:function(e){t=t.map((t=>t!==e?t:{...t,completed:!t.completed})),o()},removeItem:function(e){t=t.filter((t=>t!==e)),o()},updateItem:function(e,n){t=t.map((t=>t!==e?t:{...t,title:n})),o()},clearCompleted:function(){t=t.filter((e=>!e.completed)),o()},getTodos:function(){return[...t]}}}((()=>this.setState({}))),addEventListener("hashchange",this.handleRoute.bind(this)),this.handleRoute()}handleRoute(){let e=String(location.hash||"").split("/").pop();B[e]||(e="all"),this.setState({nowShowing:e})}render(e,t){let{nowShowing:n,newTodo:o,editing:l}=t,i=this.model.getTodos(),r=i.filter(B[n]),_=i.reduce(((e,t)=>e+(t.completed?0:1)),0),s=i.length-_;return d("div",null,d("header",{class:"header"},d("h1",null,"todos"),d("input",{class:"new-todo",placeholder:"What needs to be done?",value:o,onKeyDown:this.handleNewTodoKeyDown,onInput:W(this,"newTodo"),autoFocus:!0})),i.length?d("section",{class:"main"},d("input",{class:"toggle-all",type:"checkbox",onChange:this.toggleAll,checked:0===_}),d("ul",{class:"todo-list"},r.map((e=>d(q,{key:e.id,todo:e,onToggle:this.toggleItem,onRemove:this.removeItem,onEdit:this.startEdit,editing:l===e.id,onSave:this.updateItem,onCancel:this.stopEdit}))))):null,_||s?d(K,{count:_,completedCount:s,nowShowing:n,onClearCompleted:this.clearCompleted}):null)}},null),document.querySelector(".todoapp"))}();
//# sourceMappingURL=app.js.map
