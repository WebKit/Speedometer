!function(){"use strict";var e,t={4901:function(e,t,o){var d=o(9242),l=o(3396),n=o(4870),i=o(2483);var r={__name:"App",setup(e){return(e,t)=>((0,l.wg)(),(0,l.j4)((0,n.SU)(i.MA)))}};const s={class:"todoapp"},a={class:"main"},u={class:"toggle-all-container"},c=(0,l._)("label",{class:"toggle-all-label",htmlFor:"toggle-all-input"}," Toggle All Input ",-1),p={class:"todo-list"};o(7658);const m={class:"header"},g=(0,l._)("h1",null,"Todos",-1);var h={name:"TodoHeader",emits:["add-todo"]},f=o(89);var T=(0,f.Z)(h,[["render",function(e,t,o,n,i,r){return(0,l.wg)(),(0,l.iD)("header",m,[g,(0,l._)("input",{type:"text",class:"new-todo",autofocus:"",autocomplete:"off",placeholder:"What needs to be done?",onKeyup:t[0]||(t[0]=(0,d.D2)((t=>{e.$emit("add-todo",t.target.value),t.target.value=""}),["enter"]))},null,32)])}]]),v=o(7139);const _={class:"footer"},w={class:"todo-count"},b={class:"filters"};var y={name:"TodoFooter",props:{todos:Array,remaining:Number,route:String,completed:Number},computed:{pluralizedWord(){return 1===this.remaining?"item":"items"}},emits:["delete-completed"]};var k=(0,f.Z)(y,[["render",function(e,t,o,n,i,r){const s=(0,l.up)("router-link");return(0,l.wy)(((0,l.wg)(),(0,l.iD)("footer",_,[(0,l._)("span",w,[(0,l._)("strong",null,(0,v.zw)(o.remaining),1),(0,l.Uk)(" "+(0,v.zw)(r.pluralizedWord)+" left ",1)]),(0,l._)("ul",b,[(0,l._)("li",null,[(0,l.Wm)(s,{to:"/",class:(0,v.C_)({selected:"all"==o.route})},{default:(0,l.w5)((()=>[(0,l.Uk)("All")])),_:1},8,["class"])]),(0,l._)("li",null,[(0,l.Wm)(s,{to:"/active",class:(0,v.C_)({selected:"active"==o.route})},{default:(0,l.w5)((()=>[(0,l.Uk)("Active")])),_:1},8,["class"])]),(0,l._)("li",null,[(0,l.Wm)(s,{to:"/completed",class:(0,v.C_)({selected:"completed"==o.route})},{default:(0,l.w5)((()=>[(0,l.Uk)("Completed")])),_:1},8,["class"])])]),(0,l.wy)((0,l._)("button",{class:"clear-completed",onClick:t[0]||(t[0]=t=>e.$emit("delete-completed"))},"Clear Completed",512),[[d.F8,o.completed]])],512)),[[d.F8,o.todos.length>0]])}]]);const E={class:"view"},C={class:"input-container"},x=(0,l._)("label",{class:"visually-hidden",for:"edit-todo-input"},"Edit Todo Input",-1);var M={name:"TodoItem",props:{todo:{title:String,completed:Boolean,id:Number}},data(){return{editText:"",editing:!1}},methods:{startEdit(){this.editing=!0,(0,l.Y3)((()=>{this.focusEditInput()}))},finishEdit(){this.editing=!1,0===this.editText.trim().length?this.deleteTodo():this.updateTodo()},cancelEdit(){this.editing=!1},focusEditInput(){this.$refs.editInputRef.focus()},deleteTodo(){this.$emit("delete-todo",this.todo)},updateTodo(){this.$emit("edit-todo",this.todo,this.editText),this.editText=""}},computed:{toggleModel:{get(){return this.todo.completed},set(e){this.$emit("toggle-todo",this.todo,e)}},editModel:{get(){return this.todo.title},set(e){this.editText=e}}},emits:["edit-todo","delete-todo","toggle-todo"]};function D(){let e="";for(let t=0;t<32;t++){let o=16*Math.random()|0;8!==t&&12!==t&&16!==t&&20!==t||(e+="-"),e+=(12===t?4:16===t?3&o|8:o).toString(16)}return e}const A=e=>e.filter((e=>!e.completed)),O=e=>e.filter((e=>e.completed));var j={components:{TodoHeader:T,TodoFooter:k,TodoItem:(0,f.Z)(M,[["render",function(e,t,o,n,i,r){return(0,l.wg)(),(0,l.iD)("li",{class:(0,v.C_)({completed:o.todo.completed,editing:i.editing})},[(0,l._)("div",E,[(0,l.wy)((0,l._)("input",{type:"checkbox",class:"toggle","onUpdate:modelValue":t[0]||(t[0]=e=>r.toggleModel=e)},null,512),[[d.e8,r.toggleModel]]),(0,l._)("label",{onDblclick:t[1]||(t[1]=(...e)=>r.startEdit&&r.startEdit(...e))},(0,v.zw)(o.todo.title),33),(0,l._)("button",{class:"destroy",onClick:t[2]||(t[2]=(0,d.iM)(((...e)=>r.deleteTodo&&r.deleteTodo(...e)),["prevent"]))})]),(0,l._)("div",C,[(0,l.wy)((0,l._)("input",{id:"edit-todo-input",ref:"editInputRef",type:"text",class:"edit","onUpdate:modelValue":t[3]||(t[3]=e=>r.editModel=e),onKeyup:t[4]||(t[4]=(0,d.D2)(((...e)=>r.finishEdit&&r.finishEdit(...e)),["enter"])),onBlur:t[5]||(t[5]=(...e)=>r.cancelEdit&&r.cancelEdit(...e))},null,544),[[d.nr,r.editModel]]),x])],2)}]])},data(){return{todos:[]}},methods:{addTodo(e){this.todos.push({completed:!1,title:e,id:D()})},toggleTodo(e,t){e.completed=t},deleteTodo(e){this.todos=this.todos.filter((t=>t!==e))},editTodo(e,t){e&&(e.title=t)},deleteCompleted(){this.todos=this.activeTodos}},computed:{activeTodos(){return A(this.todos)},completedTodos(){return O(this.todos)},filteredTodos(){switch(this.$route.name){case"active":return this.activeTodos;case"completed":return this.completedTodos}return this.todos},route(){return this.$route.name},toggleAllModel:{get(){return 0===this.activeTodos.length},set(e){this.todos.forEach((t=>{t.completed=e}))}}}};var I=(0,f.Z)(j,[["render",function(e,t,o,n,i,r){const m=(0,l.up)("TodoHeader"),g=(0,l.up)("TodoItem"),h=(0,l.up)("TodoFooter");return(0,l.wg)(),(0,l.iD)("section",s,[(0,l.Wm)(m,{onAddTodo:r.addTodo},null,8,["onAddTodo"]),(0,l.wy)((0,l._)("section",a,[(0,l._)("div",u,[(0,l.wy)((0,l._)("input",{type:"checkbox",id:"toggle-all-input",class:"toggle-all","onUpdate:modelValue":t[0]||(t[0]=e=>r.toggleAllModel=e)},null,512),[[d.e8,r.toggleAllModel]]),c]),(0,l._)("ul",p,[((0,l.wg)(!0),(0,l.iD)(l.HY,null,(0,l.Ko)(r.filteredTodos,((e,t,o,d)=>{const n=[e.completed,e.title];if(d&&d.key===e.id&&(0,l.nQ)(d,n))return d;const i=((0,l.wg)(),(0,l.j4)(g,{key:e.id,todo:e,onDeleteTodo:r.deleteTodo,onEditTodo:r.editTodo,onToggleTodo:r.toggleTodo},null,8,["todo","onDeleteTodo","onEditTodo","onToggleTodo"]));return i.memo=n,i}),t,1),128))])],512),[[d.F8,i.todos.length]]),(0,l.Wm)(h,{todos:i.todos,onDeleteCompleted:r.deleteCompleted,remaining:r.activeTodos.length,completed:r.completedTodos.length,route:r.route},null,8,["todos","onDeleteCompleted","remaining","completed","route"])])}]]);var F={__name:"TodoView",setup(e){return(e,t)=>((0,l.wg)(),(0,l.j4)(I))}};var U=(0,i.p7)({history:(0,i.r5)(),routes:[{path:"/",name:"all",component:F},{path:"/active",name:"active",component:F},{path:"/completed",name:"completed",component:F}]});const W=(0,d.ri)(r);W.use(U),W.mount("#app")}},o={};function d(e){var l=o[e];if(void 0!==l)return l.exports;var n=o[e]={exports:{}};return t[e](n,n.exports,d),n.exports}d.m=t,e=[],d.O=function(t,o,l,n){if(!o){var i=1/0;for(u=0;u<e.length;u++){o=e[u][0],l=e[u][1],n=e[u][2];for(var r=!0,s=0;s<o.length;s++)(!1&n||i>=n)&&Object.keys(d.O).every((function(e){return d.O[e](o[s])}))?o.splice(s--,1):(r=!1,n<i&&(i=n));if(r){e.splice(u--,1);var a=l();void 0!==a&&(t=a)}}return t}n=n||0;for(var u=e.length;u>0&&e[u-1][2]>n;u--)e[u]=e[u-1];e[u]=[o,l,n]},d.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return d.d(t,{a:t}),t},d.d=function(e,t){for(var o in t)d.o(t,o)&&!d.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},d.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),d.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},function(){var e={143:0};d.O.j=function(t){return 0===e[t]};var t=function(t,o){var l,n,i=o[0],r=o[1],s=o[2],a=0;if(i.some((function(t){return 0!==e[t]}))){for(l in r)d.o(r,l)&&(d.m[l]=r[l]);if(s)var u=s(d)}for(t&&t(o);a<i.length;a++)n=i[a],d.o(e,n)&&e[n]&&e[n][0](),e[n]=0;return d.O(u)},o=self.webpackChunkvue=self.webpackChunkvue||[];o.forEach(t.bind(null,0)),o.push=t.bind(null,o.push.bind(o))}();var l=d.O(void 0,[998],(function(){return d(4901)}));l=d.O(l)}();
//# sourceMappingURL=app.be714d24.js.map