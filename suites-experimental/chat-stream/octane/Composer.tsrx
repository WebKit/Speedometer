import { createContext, flushSync, memo, useCallback, useContext, useLayoutEffect, useRef } from 'octane';
import 'octane/signals';
import {
	actionVisibility$,
	canSubmit$,
	controls$,
	draft$,
	draftSaver,
	focused$,
	frameHeight$,
	layout$,
	measuredExpanded$,
	streaming$,
} from './composer-state.tsrx';

// The composer is its own module, as on the reference chat app: only the
// modules that read signals as they render import octane/signals, which
// makes the renderer track the signal reads of every component in them.
// The composer works the way the reference chat app's does:
// - It owns the draft, so a keystroke re-renders only the composer, not the
//   app and its transcript.
// - The textarea sizes itself to its content in CSS (field-sizing), up to
//   eight lines; script reads no layout while typing.
// - Its send button shows once the draft has text.
// - A ResizeObserver on the textarea expands the composer (the textarea over
//   a row of actions) once the text wraps; it collapses when the draft is
//   emptied.
// - A frame animates its height to the content's, which a ResizeObserver
//   measures, and a ResizeObserver on the footer publishes the composer's
//   height to the app (--composer-height), which the transcript pads its end
//   by, since the composer overlays it.
// - The draft is saved to localStorage, debounced, and restored on load.
// - Its state is a signal scope (composer-state.tsrx), as the reference's is:
//   the textarea is bound to draft$, and each of the composer's parts reads
//   the derived signals it shows as it renders, so a keystroke re-renders the
//   parts whose state it changes, and never the app.
const LINE_HEIGHT = 24;

// How the composer's parts submit a prompt.
const SubmitContext = createContext<() => void>(() => {});

export const Composer = memo(function Composer(props: { streaming: boolean; onSend: (text: string) => void }) @{
	const footer = useRef<HTMLElement | null>(null);
	const submit = useCallback(() => {
		if (!canSubmit$.get()) return;
		props.onSend(draft$.get().trim());
		draft$.set('');
	});
	useLayoutEffect(() => streaming$.set(props.streaming));
	useLayoutEffect(() => {
		const root = footer.current!;
		const app = root.closest('.app') as HTMLElement;
		const textarea = root.querySelector('.prompt')!;
		const content = root.querySelector('.composer-content')!;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const height = entry.contentRect.height;
				// Once the text wraps, the composer stays expanded until it is
				// emptied.
				if (entry.target === textarea) {
					if (height > LINE_HEIGHT) measuredExpanded$.set(true);
				} else if (entry.target === content) frameHeight$.set(Math.ceil(height));
				else app.style.setProperty('--composer-height', entry.borderBoxSize[0].blockSize + 'px');
			}
		});
		observer.observe(textarea);
		observer.observe(content);
		observer.observe(root);
		return () => observer.disconnect();
	}, []);

	// Benchmark hooks. flushComposer settles the deferred work a burst of
	// typing leaves (the pending draft save and the height transition), as the
	// timers and frames after it would. resetComposer empties the composer and
	// forgets the saved draft.
	(window as any).flushComposer = () => {
		draftSaver.flush();
		for (const animation of footer.current!.getAnimations({ subtree: true })) animation.finish();
	};
	(window as any).resetComposer = () => {
		flushSync(() => draft$.set(''));
		draftSaver.flush();
		for (const animation of footer.current!.getAnimations({ subtree: true })) animation.finish();
	};

	<SubmitContext value={submit}>
		<footer class="composer" ref={footer}>
			<ComposerForm />
			<ComposerHint />
		</footer>
	</SubmitContext>
});

// The composer's parts. Each reads the signals it shows as it renders and
// composes its classes from them.
const ComposerForm = memo(function ComposerForm() @{
	const submit = useContext(SubmitContext);
	const layout = layout$.get();
	<form
		class={['composer-box', layout.focused && 'focused', layout.busy && 'busy']}
		data-has-text={layout.hasText ? '' : undefined}
		data-expanded={layout.expanded ? '' : undefined}
		onSubmit={(event: Event) => {
			event.preventDefault();
			submit();
		}}
	>
		<ComposerFrame />
	</form>
});

const ComposerFrame = memo(function ComposerFrame() @{
	const height = frameHeight$.get();
	<div class="composer-frame" style={height === null ? undefined : { '--frame-height': height + 'px' }}>
		<ComposerContent />
	</div>
});

const ComposerContent = memo(function ComposerContent() @{
	const layout = layout$.get();
	<div class={['composer-content', layout.singleRow ? 'single-row' : 'stacked']}>
		<ComposerInput />
		<ComposerActions />
	</div>
});

const ComposerInput = memo(function ComposerInput() @{
	const submit = useContext(SubmitContext);
	const controls = controls$.get();
	<textarea
		class="prompt"
		rows={1}
		placeholder={controls.placeholder}
		value={draft$}
		onFocus={() => focused$.set(true)}
		onBlur={() => focused$.set(false)}
		onKeyDown={(event: KeyboardEvent) => {
			if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();
				submit();
			}
		}}
	/>
});

const ComposerActions = memo(function ComposerActions() @{
	const layout = layout$.get();
	<div class={['composer-actions', layout.expanded && 'row']}>
		<SendButton />
	</div>
});

const SendButton = memo(function SendButton() @{
	const visibility = actionVisibility$.get();
	<button type="submit" class={['send', visibility.showSend && 'visible']} disabled={visibility.sendDisabled}>
		Send
	</button>
});

const ComposerHint = memo(function ComposerHint() @{
	const controls = controls$.get();
	<div class="composer-hint">{controls.hint as string}</div>
});
