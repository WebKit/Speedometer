import { createScope } from 'octane/signals';

// The composer's state: one signal scope, as the reference chat app's
// composer controller is, with its draft, the inputs it measures or mirrors,
// and the state derived from them, under the reference's names. The textarea
// is bound to draft$; the composer's parts read the derived signals as they
// render, so a keystroke re-renders the parts whose state it changes, and
// never the app.

const DRAFT_KEY = 'chat-stream/composerDraft/v1';

function readDraft(): string {
	try {
		return localStorage.getItem(DRAFT_KEY) ?? '';
	} catch {
		return '';
	}
}

export const composer = createScope({ scopeKey: 'composer' });

// Inputs: the draft (restored from the last session), whether the textarea
// is focused, whether a reply is streaming, and what the composer's
// ResizeObservers measure.
export const draft$ = composer.signal$('draft', readDraft());
export const focused$ = composer.signal$('text-editor-focused', false);
export const streaming$ = composer.signal$('streaming', false);
export const measuredExpanded$ = composer.signal$('measurement-expanded', false);
export const frameHeight$ = composer.signal$('frame-height', null as number | null);

export const hasText$ = composer.derived$('has-draft-text', () => draft$.get().trim().length > 0);

// The layout is rebuilt whenever the draft changes. It expands once the text
// wraps (as measured) or has a line break, and collapses when the draft is
// emptied.
export const layout$ = composer.derived$('layout', () => {
	const hasText = hasText$.get();
	const expanded = hasText && (measuredExpanded$.get() || draft$.get().includes('\n'));
	return { hasText, expanded, singleRow: !expanded, focused: focused$.get(), busy: streaming$.get() };
});

export const controls$ = composer.derived$('presentation-controls', () => {
	const layout = layout$.get();
	return {
		placeholder: layout.busy ? 'Wait for the reply to finish' : 'Ask anything',
		hint: layout.expanded ? 'Shift+Enter for a new line' : 'Enter to send, Shift+Enter for a new line',
	};
});

export const submitInputs$ = composer.derived$('submit-inputs', () => ({ hasText: hasText$.get(), busy: streaming$.get() }));
export const canSubmit$ = composer.derived$('can-submit', () => {
	const inputs = submitInputs$.get();
	return inputs.hasText && !inputs.busy;
});
export const actionVisibility$ = composer.derived$('action-visibility', () => ({
	showSend: layout$.get().hasText,
	sendDisabled: !canSubmit$.get(),
}));

// Saves the draft 250 ms after the last change, and at least once a second
// while it keeps changing, as the reference does.
class DraftSaver {
	pending: string | null = null;
	debounce: ReturnType<typeof setTimeout> | undefined;
	maxWait: ReturnType<typeof setTimeout> | undefined;
	schedule(draft: string) {
		this.pending = draft;
		clearTimeout(this.debounce);
		this.debounce = setTimeout(() => this.flush(), 250);
		this.maxWait ??= setTimeout(() => this.flush(), 1000);
	}
	flush() {
		clearTimeout(this.debounce);
		clearTimeout(this.maxWait);
		this.debounce = this.maxWait = undefined;
		if (this.pending === null) return;
		try {
			if (this.pending === '') localStorage.removeItem(DRAFT_KEY);
			else localStorage.setItem(DRAFT_KEY, this.pending);
		} catch {}
		this.pending = null;
	}
}
export const draftSaver = new DraftSaver();

draft$.subscribe(() => {
	const draft = draft$.get();
	draftSaver.schedule(draft);
	if (draft === '') measuredExpanded$.set(false);
});
window.addEventListener('pagehide', () => draftSaver.flush());
