var app = (function () {
    'use strict';

    function noop() { }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        text.data = data;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    /* src/App.svelte generated by Svelte v3.58.0 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[17] = list;
    	child_ctx[18] = i;
    	return child_ctx;
    }

    // (78:0) {#if items.length > 0}
    function create_if_block(ctx) {
    	let section;
    	let input;
    	let input_checked_value;
    	let t0;
    	let label;
    	let t2;
    	let ul0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t3;
    	let footer;
    	let span;
    	let strong;
    	let t4;
    	let t5;
    	let t6_value = (/*numActive*/ ctx[4] === 1 ? "item" : "items") + "";
    	let t6;
    	let t7;
    	let t8;
    	let ul1;
    	let li0;
    	let a0;
    	let t9;
    	let a0_class_value;
    	let t10;
    	let li1;
    	let a1;
    	let t11;
    	let a1_class_value;
    	let t12;
    	let li2;
    	let a2;
    	let t13;
    	let a2_class_value;
    	let t14;
    	let mounted;
    	let dispose;
    	let each_value = /*filtered*/ ctx[5];
    	const get_key = ctx => /*item*/ ctx[16].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	let if_block = /*numCompleted*/ ctx[3] && create_if_block_1(ctx);

    	return {
    		c() {
    			section = element("section");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			label.textContent = "Mark all as complete";
    			t2 = space();
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			footer = element("footer");
    			span = element("span");
    			strong = element("strong");
    			t4 = text(/*numActive*/ ctx[4]);
    			t5 = space();
    			t6 = text(t6_value);
    			t7 = text(" left");
    			t8 = space();
    			ul1 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			t9 = text("All");
    			t10 = space();
    			li1 = element("li");
    			a1 = element("a");
    			t11 = text("Active");
    			t12 = space();
    			li2 = element("li");
    			a2 = element("a");
    			t13 = text("Completed");
    			t14 = space();
    			if (if_block) if_block.c();
    			attr(input, "id", "toggle-all");
    			attr(input, "class", "toggle-all");
    			attr(input, "type", "checkbox");
    			input.checked = input_checked_value = /*numCompleted*/ ctx[3] === /*items*/ ctx[1].length;
    			attr(label, "for", "toggle-all");
    			attr(ul0, "class", "todo-list");
    			attr(span, "class", "todo-count");
    			attr(a0, "class", a0_class_value = /*currentFilter*/ ctx[0] === "all" ? "selected" : "");
    			attr(a0, "href", "#/");
    			attr(a1, "class", a1_class_value = /*currentFilter*/ ctx[0] === "active" ? "selected" : "");
    			attr(a1, "href", "#/active");

    			attr(a2, "class", a2_class_value = /*currentFilter*/ ctx[0] === "completed"
    			? "selected"
    			: "");

    			attr(a2, "href", "#/completed");
    			attr(ul1, "class", "filters");
    			attr(footer, "class", "footer");
    			attr(section, "class", "main");
    		},
    		m(target, anchor) {
    			insert(target, section, anchor);
    			append(section, input);
    			append(section, t0);
    			append(section, label);
    			append(section, t2);
    			append(section, ul0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul0, null);
    				}
    			}

    			append(section, t3);
    			append(section, footer);
    			append(footer, span);
    			append(span, strong);
    			append(strong, t4);
    			append(span, t5);
    			append(span, t6);
    			append(span, t7);
    			append(footer, t8);
    			append(footer, ul1);
    			append(ul1, li0);
    			append(li0, a0);
    			append(a0, t9);
    			append(ul1, t10);
    			append(ul1, li1);
    			append(li1, a1);
    			append(a1, t11);
    			append(ul1, t12);
    			append(ul1, li2);
    			append(li2, a2);
    			append(a2, t13);
    			append(footer, t14);
    			if (if_block) if_block.m(footer, null);

    			if (!mounted) {
    				dispose = listen(input, "change", /*toggleAll*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*numCompleted, items*/ 10 && input_checked_value !== (input_checked_value = /*numCompleted*/ ctx[3] === /*items*/ ctx[1].length)) {
    				input.checked = input_checked_value;
    			}

    			if (dirty & /*filtered, editing, handleEdit, submit, remove*/ 3236) {
    				each_value = /*filtered*/ ctx[5];
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul0, destroy_block, create_each_block, null, get_each_context);
    			}

    			if (dirty & /*numActive*/ 16) set_data(t4, /*numActive*/ ctx[4]);
    			if (dirty & /*numActive*/ 16 && t6_value !== (t6_value = (/*numActive*/ ctx[4] === 1 ? "item" : "items") + "")) set_data(t6, t6_value);

    			if (dirty & /*currentFilter*/ 1 && a0_class_value !== (a0_class_value = /*currentFilter*/ ctx[0] === "all" ? "selected" : "")) {
    				attr(a0, "class", a0_class_value);
    			}

    			if (dirty & /*currentFilter*/ 1 && a1_class_value !== (a1_class_value = /*currentFilter*/ ctx[0] === "active" ? "selected" : "")) {
    				attr(a1, "class", a1_class_value);
    			}

    			if (dirty & /*currentFilter*/ 1 && a2_class_value !== (a2_class_value = /*currentFilter*/ ctx[0] === "completed"
    			? "selected"
    			: "")) {
    				attr(a2, "class", a2_class_value);
    			}

    			if (/*numCompleted*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(footer, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (93:20) {#if editing === index}
    function create_if_block_2(ctx) {
    	let input;
    	let input_value_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			input = element("input");
    			input.value = input_value_value = /*item*/ ctx[16].description;
    			attr(input, "id", "edit");
    			attr(input, "class", "edit");
    			input.autofocus = true;
    		},
    		m(target, anchor) {
    			insert(target, input, anchor);
    			input.focus();

    			if (!mounted) {
    				dispose = [
    					listen(input, "keydown", /*handleEdit*/ ctx[10]),
    					listen(input, "blur", /*submit*/ ctx[11])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*filtered*/ 32 && input_value_value !== (input_value_value = /*item*/ ctx[16].description) && input.value !== input_value_value) {
    				input.value = input_value_value;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (84:12) {#each filtered as item, index (item.id)}
    function create_each_block(key_1, ctx) {
    	let li;
    	let div;
    	let input;
    	let t0;
    	let label;
    	let t1_value = /*item*/ ctx[16].description + "";
    	let t1;
    	let t2;
    	let button;
    	let t3;
    	let t4;
    	let li_class_value;
    	let mounted;
    	let dispose;

    	function input_change_handler() {
    		/*input_change_handler*/ ctx[12].call(input, /*each_value*/ ctx[17], /*index*/ ctx[18]);
    	}

    	function dblclick_handler() {
    		return /*dblclick_handler*/ ctx[13](/*index*/ ctx[18]);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[14](/*index*/ ctx[18]);
    	}

    	let if_block = /*editing*/ ctx[2] === /*index*/ ctx[18] && create_if_block_2(ctx);

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			li = element("li");
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text(t1_value);
    			t2 = space();
    			button = element("button");
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			attr(input, "class", "toggle");
    			attr(input, "type", "checkbox");
    			attr(button, "class", "destroy");
    			attr(div, "class", "view");

    			attr(li, "class", li_class_value = "" + ((/*item*/ ctx[16].completed ? 'completed' : '') + " " + (/*editing*/ ctx[2] === /*index*/ ctx[18]
    			? 'editing'
    			: '')));

    			this.first = li;
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			append(li, div);
    			append(div, input);
    			input.checked = /*item*/ ctx[16].completed;
    			append(div, t0);
    			append(div, label);
    			append(label, t1);
    			append(div, t2);
    			append(div, button);
    			append(li, t3);
    			if (if_block) if_block.m(li, null);
    			append(li, t4);

    			if (!mounted) {
    				dispose = [
    					listen(input, "change", input_change_handler),
    					listen(label, "dblclick", dblclick_handler),
    					listen(button, "click", click_handler)
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*filtered*/ 32) {
    				input.checked = /*item*/ ctx[16].completed;
    			}

    			if (dirty & /*filtered*/ 32 && t1_value !== (t1_value = /*item*/ ctx[16].description + "")) set_data(t1, t1_value);

    			if (/*editing*/ ctx[2] === /*index*/ ctx[18]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(li, t4);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*filtered, editing*/ 36 && li_class_value !== (li_class_value = "" + ((/*item*/ ctx[16].completed ? 'completed' : '') + " " + (/*editing*/ ctx[2] === /*index*/ ctx[18]
    			? 'editing'
    			: '')))) {
    				attr(li, "class", li_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (113:12) {#if numCompleted}
    function create_if_block_1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			button.textContent = "Clear completed";
    			attr(button, "class", "clear-completed");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = listen(button, "click", /*clearCompleted*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment(ctx) {
    	let header;
    	let h1;
    	let t1;
    	let input;
    	let t2;
    	let if_block_anchor;
    	let mounted;
    	let dispose;
    	let if_block = /*items*/ ctx[1].length > 0 && create_if_block(ctx);

    	return {
    		c() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "todos";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr(input, "class", "new-todo");
    			attr(input, "placeholder", "What needs to be done?");
    			input.autofocus = true;
    			attr(header, "class", "header");
    		},
    		m(target, anchor) {
    			insert(target, header, anchor);
    			append(header, h1);
    			append(header, t1);
    			append(header, input);
    			insert(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			input.focus();

    			if (!mounted) {
    				dispose = listen(input, "keydown", /*createNew*/ ctx[9]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (/*items*/ ctx[1].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(header);
    			if (detaching) detach(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function uuid() {
    	return ("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx").replace(/[xy]/g, function (c) {
    		var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 0x3 | 0x8;
    		return v.toString(16);
    	});
    }

    function instance($$self, $$props, $$invalidate) {
    	let filtered;
    	let numActive;
    	let numCompleted;
    	let currentFilter = "all";
    	let items = [];
    	let editing = null;

    	function updateView() {
    		$$invalidate(0, currentFilter = "all");

    		if (window.location.hash === "#/active") {
    			$$invalidate(0, currentFilter = "active");
    		} else if (window.location.hash === "#/completed") {
    			$$invalidate(0, currentFilter = "completed");
    		}
    	}

    	function clearCompleted() {
    		$$invalidate(1, items = items.filter(item => !item.completed));
    	}

    	function remove(index) {
    		$$invalidate(1, items = items.slice(0, index).concat(items.slice(index + 1)));
    	}

    	function toggleAll(event) {
    		$$invalidate(1, items = items.map(item => ({
    			id: item.id,
    			description: item.description,
    			completed: event.target.checked
    		})));
    	}

    	function createNew(event) {
    		if (event.key === "Enter") {
    			$$invalidate(1, items = items.concat({
    				id: uuid(),
    				description: event.target.value,
    				completed: false
    			}));

    			event.target.value = "";
    		}
    	}

    	function handleEdit(event) {
    		if (event.key === "Enter") event.target.blur(); else if (event.key === "Escape") $$invalidate(2, editing = null);
    	}

    	function submit(event) {
    		$$invalidate(1, items[editing].description = event.target.value, items);
    		$$invalidate(2, editing = null);
    	}

    	window.addEventListener("hashchange", updateView);
    	updateView();

    	function input_change_handler(each_value, index) {
    		each_value[index].completed = this.checked;
    		(($$invalidate(5, filtered), $$invalidate(0, currentFilter)), $$invalidate(1, items));
    	}

    	const dblclick_handler = index => $$invalidate(2, editing = index);
    	const click_handler = index => remove(index);

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*currentFilter, items*/ 3) {
    			$$invalidate(5, filtered = currentFilter === "all"
    			? items
    			: currentFilter === "completed"
    				? items.filter(item => item.completed)
    				: items.filter(item => !item.completed));
    		}

    		if ($$self.$$.dirty & /*items*/ 2) {
    			$$invalidate(4, numActive = items.filter(item => !item.completed).length);
    		}

    		if ($$self.$$.dirty & /*items*/ 2) {
    			$$invalidate(3, numCompleted = items.filter(item => item.completed).length);
    		}
    	};

    	return [
    		currentFilter,
    		items,
    		editing,
    		numCompleted,
    		numActive,
    		filtered,
    		clearCompleted,
    		remove,
    		toggleAll,
    		createNew,
    		handleEdit,
    		submit,
    		input_change_handler,
    		dblclick_handler,
    		click_handler
    	];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, {});
    	}
    }

    const app = new App({
        target: document.querySelector(".todoapp"),
    });

    return app;

})();
//# sourceMappingURL=app.js.map
